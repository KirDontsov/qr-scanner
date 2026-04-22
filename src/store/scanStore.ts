import { create } from 'zustand';

export interface ScanRecord {
  id: string;
  qrData: string;
  scannedAt: string;
  deviceId: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
}

interface ScanStore {
  scans: ScanRecord[];
  currentScan: ScanRecord | null;
  pendingCount: number;
  isScanning: boolean;
  
  setCurrentScan: (scan: ScanRecord | null) => void;
  addScan: (scan: ScanRecord) => void;
  markAsSent: (id: string) => void;
  markAsFailed: (id: string) => void;
  setScanning: (scanning: boolean) => void;
  clearCurrentScan: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  scans: [],
  currentScan: null,
  pendingCount: 0,
  isScanning: false,

  setCurrentScan: (scan) => set({ currentScan: scan }),

  addScan: (scan) => set((state) => ({
    scans: [...state.scans, scan],
    pendingCount: state.pendingCount + 1,
    currentScan: scan,
  })),

  markAsSent: (id) => set((state) => ({
    scans: state.scans.map((s) => 
      s.id === id ? { ...s, status: 'sent' as const } : s
    ),
    pendingCount: state.scans.filter((s) => s.status === 'pending' && s.id !== id).length,
  })),

  markAsFailed: (id) => set((state) => ({
    scans: state.scans.map((s) => 
      s.id === id ? { ...s, status: 'failed' as const, retryCount: s.retryCount + 1 } : s
    ),
  })),

  setScanning: (isScanning) => set({ isScanning }),

  clearCurrentScan: () => set({ currentScan: null }),
}));