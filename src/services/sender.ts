import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import CONFIG from '../config/env';
import { ScanRecord } from '../store/scanStore';

const QUEUE_FILE = FileSystem.documentDirectory + 'scan_queue.json';

export async function sendScanToServer(scan: ScanRecord): Promise<boolean> {
  try {
    const payload = {
      qr_data: scan.qrData,
      scanned_at: scan.scannedAt,
      device_id: CONFIG.DEVICE_ID,
    };

    await axios.post(`${CONFIG.API_URL}/scan`, payload, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    return true;
  } catch (error) {
    console.error('Failed to send scan:', error);
    return false;
  }
}

export async function saveToOfflineQueue(scan: ScanRecord): Promise<void> {
  try {
    const existing = await loadOfflineQueue();
    const updated = [...existing, scan];
    await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to offline queue:', error);
  }
}

export async function loadOfflineQueue(): Promise<ScanRecord[]> {
  try {
    const data = await FileSystem.readAsStringAsync(QUEUE_FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function clearOfflineQueue(): Promise<void> {
  try {
    await FileSystem.deleteAsync(QUEUE_FILE, { idempotent: true });
  } catch (error) {
    console.error('Failed to clear offline queue:', error);
  }
}

export async function syncOfflineQueue(): Promise<number> {
  const queued = await loadOfflineQueue();
  const failed: ScanRecord[] = [];

  for (const scan of queued) {
    const success = await sendScanToServer(scan);
    if (!success) {
      failed.push(scan);
    }
  }

  if (failed.length > 0) {
    await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(failed));
  } else {
    await clearOfflineQueue();
  }

  return queued.length - failed.length;
}