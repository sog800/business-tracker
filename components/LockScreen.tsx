import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getBusiness, setBusinessPassword, verifyBusinessPassword, verifySecurityAnswer } from '../services/businessService';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const business = getBusiness();
  const id = business?.id;

  function tryUnlock() {
    if (!id) return onUnlock();
    if (verifyBusinessPassword(id, password)) {
      onUnlock();
    } else {
      Alert.alert('Incorrect password', 'Please try again or reset password in Settings.');
    }
  }

  // Security question flow
  const [showQuestion, setShowQuestion] = useState(false);
  const [answer, setAnswer] = useState('');

  function trySecurityAnswer() {
    if (!id) return;
    if (verifySecurityAnswer(id, answer)) {
      // clear password so user can login without entering it
      setBusinessPassword(id, null);
      onUnlock();
    } else {
      Alert.alert('Incorrect answer', 'The answer does not match.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter App Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={tryUnlock}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => router.push('/settings')}>
        <Text style={styles.linkText}>Open Settings</Text>
      </TouchableOpacity>

      {business?.securityQuestion ? (
        <>
          <TouchableOpacity style={[styles.button, { marginTop: 12, backgroundColor: '#4CAF50' }]} onPress={() => setShowQuestion(true)}>
            <Text style={styles.buttonText}>Reset via security question</Text>
          </TouchableOpacity>

          {/* simple inline modal */}
          {showQuestion && (
            <View style={{ marginTop: 12, width: '100%' }}>
              <Text style={{ marginBottom: 6 }}>{business.securityQuestion}</Text>
              <TextInput value={answer} onChangeText={setAnswer} style={styles.input} placeholder="Answer" />
              <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={trySecurityAnswer}>
                <Text style={styles.buttonText}>Submit Answer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.link, { marginTop: 8 }]} onPress={() => setShowQuestion(false)}>
                <Text style={styles.linkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '700' },
  link: { marginTop: 12 },
  linkText: { color: '#007AFF' },
});
