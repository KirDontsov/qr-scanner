import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LandingScreenProps {
  onStartScanning: () => void;
}

export function LandingScreen({ onStartScanning }: LandingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>QR Scanner</Text>
        <Text style={styles.subtitle}>
          Scan QR codes and send data to your server
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureText}>• Point camera at QR code</Text>
          <Text style={styles.featureText}>• Confirm before sending</Text>
          <Text style={styles.featureText}>• Works offline</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onStartScanning}>
          <Text style={styles.buttonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  features: {
    marginBottom: 40,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});