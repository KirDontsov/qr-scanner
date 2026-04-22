import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { View, StyleSheet, Text } from 'react-native';
import { LandingScreen } from './src/screens/LandingScreen';
import { QRScanner } from './src/components/QRScanner';
import { ScanConfirm } from './src/components/ScanConfirm';
import { useScanStore, ScanRecord } from './src/store/scanStore';
import { sendScanToServer, saveToOfflineQueue, syncOfflineQueue } from './src/services/sender';

type Screen = 'landing' | 'scanning' | 'confirm';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { addScan, markAsSent, markAsFailed, setScanning, clearCurrentScan, currentScan, setCurrentScan } = useScanStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
      if (state.isConnected) {
        syncOfflineQueue().then((synced) => {
          if (synced > 0) {
            Alert.alert('Synced', `${synced} scans synced from offline queue`);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleScanComplete = useCallback((scan: ScanRecord) => {
    setCurrentScan(scan);
    setScanning(false);
    setScreen('confirm');
  }, [setCurrentScan, setScanning]);

  const handleConfirm = async () => {
    if (!currentScan) return;

    setIsSending(true);
    const success = await sendScanToServer(currentScan);

    if (success) {
      markAsSent(currentScan.id);
      Alert.alert('Success', 'Scan sent to server');
    } else if (isOnline) {
      markAsFailed(currentScan.id);
      Alert.alert('Failed', 'Failed to send. Will retry automatically.');
    } else {
      await saveToOfflineQueue(currentScan);
      addScan(currentScan);
      Alert.alert('Offline', 'Saved to offline queue');
    }

    setIsSending(false);
    setScreen('scanning');
    clearCurrentScan();
  };

  const handleCancel = () => {
    clearCurrentScan();
    setScreen('scanning');
  };

  const startScanning = () => {
    setScanning(true);
    setScreen('scanning');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {screen === 'landing' && (
        <LandingScreen onStartScanning={startScanning} />
      )}

      {screen === 'scanning' && (
        <QRScanner onScanComplete={handleScanComplete} />
      )}

      {screen === 'confirm' && currentScan && (
        <ScanConfirm
          qrData={currentScan.qrData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isSending}
        />
      )}

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline mode</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: '600',
  },
});