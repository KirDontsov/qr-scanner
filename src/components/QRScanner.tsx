import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as AV from 'expo-av';
import { useScanStore, ScanRecord } from '../store/scanStore';

interface QRScannerProps {
  onScanComplete: (scan: ScanRecord) => void;
  enabled?: boolean;
}

export function QRScanner({ onScanComplete, enabled = true }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const soundRef = useRef<AV.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setScanning } = useScanStore();

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const playSuccessSound = () => {
    try {
      AV.Audio.Sound.createAsync(
        require('../../assets/success.mp3'),
        { shouldPlay: true }
      ).then(({ sound }) => {
        soundRef.current = sound;
      });
    } catch {
      Vibration.vibrate(200);
    }
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isScanned || !enabled) return;

    setIsScanned(true);
    setScanning(false);
    playSuccessSound();

    const scan: ScanRecord = {
      id: Date.now().toString(),
      qrData: result.data,
      scannedAt: new Date().toISOString(),
      deviceId: 'iPhone',
      status: 'pending',
      retryCount: 0,
    };

    onScanComplete(scan);

    timerRef.current = setTimeout(() => setIsScanned(false), 2000);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required</Text>
        <Text style={styles.subtext}>Please grant camera access to scan QR codes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});