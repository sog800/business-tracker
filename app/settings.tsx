import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBusiness, getReminderTime, setBusinessPassword, setReminderTime, setSecurityQuestionAnswer, updateBusiness } from '../services/businessService';
import { scheduleDailyReminder } from '../services/notificationService';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [password, setPassword] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [reminderTime, setReminderTimeState] = useState('20:00');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  
  // Track initial values for unsaved changes detection
  const [initialName, setInitialName] = useState('');
  const [initialLogoUri, setInitialLogoUri] = useState('');
  const [initialQuestion, setInitialQuestion] = useState('');
  const [initialAnswer, setInitialAnswer] = useState('');
  const [initialReminderTime, setInitialReminderTime] = useState('20:00');

  const hasUnsavedChanges = () => {
    return (
      name !== initialName ||
      logoUri !== initialLogoUri ||
      question !== initialQuestion ||
      answer !== initialAnswer ||
      reminderTime !== initialReminderTime ||
      password !== ''
    );
  };

  useEffect(() => {
    const b = getBusiness();
    if (b) {
      setName(b.name || '');
      setInitialName(b.name || '');
      setLogoUri(b.logoUri || '');
      setInitialLogoUri(b.logoUri || '');
      setQuestion((b as any).securityQuestion || '');
      setInitialQuestion((b as any).securityQuestion || '');
      setAnswer((b as any).securityAnswer || '');
      setInitialAnswer((b as any).securityAnswer || '');
      const time = getReminderTime(b.id);
      setReminderTimeState(time);
      setInitialReminderTime(time);
    }
  }, []);

  function handleBackPress() {
    if (hasUnsavedChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. What would you like to do?',
        [
          {
            text: 'Save and Exit',
            onPress: () => {
              save();
              router.back();
            },
          },
          {
            text: 'Exit without Saving',
            style: 'destructive',
            onPress: () => router.back(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return true; // Prevent default back action
    } else {
      router.back();
      return true; // Prevent default back action
    }
  }

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );
      return () => backHandler.remove();
    }, [hasUnsavedChanges])
  );

  function save() {
    const b = getBusiness();
    if (!b) {
      Alert.alert('No business', 'Please create a business first.');
      return;
    }
    updateBusiness(b.id, name, logoUri || undefined);
    setSecurityQuestionAnswer(b.id, question || null, answer || null);
    if (password) {
      setBusinessPassword(b.id, password);
    }
    // Update initial values after saving
    setInitialName(name);
    setInitialLogoUri(logoUri);
    setInitialQuestion(question);
    setInitialAnswer(answer);
    setInitialReminderTime(reminderTime);
    setPassword(''); // Clear password field after saving
    Alert.alert('Saved', 'Settings updated');
  }

  // Password modal flow
  function openPasswordModal() {
    setPasswordInput('');
    setPasswordConfirm('');
    setPasswordModalVisible(true);
  }

  function savePasswordFromModal() {
    if (!passwordInput) return Alert.alert('Missing', 'Please enter a password');
    if (passwordInput !== passwordConfirm) return Alert.alert('Mismatch', 'Passwords do not match');
    const b = getBusiness();
    if (!b) return Alert.alert('No business', 'Create a business first');
    setBusinessPassword(b.id, passwordInput);
    setPasswordModalVisible(false);
    // after setting password, prompt for recovery question
    setQuestionModalVisible(true);
  }

  function saveQuestionFromModal() {
    const b = getBusiness();
    if (!b) return Alert.alert('No business', 'Create a business first');
    if (!question || !answer) return Alert.alert('Missing', 'Please provide both question and answer');
    setSecurityQuestionAnswer(b.id, question, answer);
    setQuestionModalVisible(false);
    Alert.alert('Saved', 'Recovery question saved');
  }

  async function pickLogo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is required to pick an image.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setLogoUri(res.assets[0].uri);
    }
  }

  function enableSecurityQuestion() {
    const b = getBusiness();
    if (!b) return Alert.alert('No business', 'Create business first');
    if (!question || !answer) return Alert.alert('Missing fields', 'Please provide both question and answer');
    // set QA and remove password so user can login without entering a password
    setSecurityQuestionAnswer(b.id, question, answer);
    setBusinessPassword(b.id, null);
    Alert.alert('Security question enabled', 'Password removed — you can now open the app without a password. Use the security question to reset password later.');
  }

  function disableSecurityQuestion() {
    const b = getBusiness();
    if (!b) return;
    setSecurityQuestionAnswer(b.id, null, null);
    Alert.alert('Security question disabled', 'Security question removed. You can set a password again.');
  }

  async function updateReminderTime(time: string) {
    const b = getBusiness();
    if (!b) return;
    setReminderTime(b.id, time);
    setReminderTimeState(time);
    await scheduleDailyReminder(time);
    Alert.alert('Reminder Updated', `Daily reminder set for ${time}`);
  }

  function handleTimeChange(text: string) {
    // Format: HH:MM
    const cleaned = text.replace(/[^0-9:]/g, '');
    if (cleaned.length <= 5) {
      setReminderTimeState(cleaned);
    }
  }

  function saveReminderTime() {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(reminderTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 20:00)');
      return;
    }
    updateReminderTime(reminderTime);
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={{ flex: 1 }}>
        {/* Header with back button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <TouchableOpacity onPress={handleBackPress}>
            <Text style={{ fontSize: 18, color: '#007AFF' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.header, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>Settings</Text>
          <View style={{ width: 30 }} />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

        <Text style={styles.label}>Business Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#888" />

        <Text style={styles.label}>Logo</Text>
        {logoUri ? <Image source={{ uri: logoUri }} style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 8 }} /> : null}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#666' }]} onPress={pickLogo}>
          <Text style={styles.buttonText}>{logoUri ? 'Change Logo' : 'Pick Logo'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Password</Text>
        <TouchableOpacity style={[styles.button, { marginTop: 6 }]} onPress={openPasswordModal}>
          <Text style={styles.buttonText}>{password ? 'Change Password' : 'Set Password'}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 18 }]}>Security Question</Text>
        <TextInput style={styles.input} value={question} onChangeText={setQuestion} placeholder="e.g. What is your street name?" placeholderTextColor="#888" />
        <TextInput style={styles.input} value={answer} onChangeText={setAnswer} placeholder="Answer" placeholderTextColor="#888" secureTextEntry />
        <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={() => {
          const b = getBusiness();
          if (!b) return Alert.alert('No business', 'Create business first');
          if (!question || !answer) return Alert.alert('Missing', 'Please provide both question and answer');
          setSecurityQuestionAnswer(b.id, question, answer);
          Alert.alert('Saved', 'Security question saved');
        }}>
          <Text style={styles.buttonText}>Save Security Question</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 18 }]}>Daily Reminder</Text>
        <Text style={styles.helperText}>Get notified to track your business daily</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            value={reminderTime} 
            onChangeText={handleTimeChange} 
            placeholder="HH:MM (e.g., 20:00)" 
            placeholderTextColor="#888"
            maxLength={5}
          />
          <TouchableOpacity style={[styles.button, { marginTop: 0, paddingHorizontal: 16 }]} onPress={saveReminderTime}>
            <Text style={styles.buttonText}>Set</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, { marginBottom: 30 }]} onPress={save}>
          <Text style={styles.buttonText}>Save All Changes</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Password modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <View style={{ width: '90%', backgroundColor: '#1e1e1e', padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8, color: '#ffffff' }}>Set Password</Text>
            <TextInput placeholder="Password" placeholderTextColor="#888" secureTextEntry value={passwordInput} onChangeText={setPasswordInput} style={[styles.input, { marginTop: 8 }]} />
            <TextInput placeholder="Confirm Password" placeholderTextColor="#888" secureTextEntry value={passwordConfirm} onChangeText={setPasswordConfirm} style={styles.input} />
            <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={savePasswordFromModal}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.link, { marginTop: 8 }]} onPress={() => setPasswordModalVisible(false)}><Text style={{ color: '#007AFF' }}>Cancel</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Question modal (auto-open after password) */}
      <Modal visible={questionModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <View style={{ width: '90%', backgroundColor: '#1e1e1e', padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8, color: '#ffffff' }}>Add Recovery Question</Text>
            <TextInput placeholder="Question" placeholderTextColor="#888" value={question} onChangeText={setQuestion} style={[styles.input, { marginTop: 8 }]} />
            <TextInput placeholder="Answer" placeholderTextColor="#888" secureTextEntry value={answer} onChangeText={setAnswer} style={styles.input} />
            <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={saveQuestionFromModal}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.link, { marginTop: 8 }]} onPress={() => setQuestionModalVisible(false)}><Text style={{ color: '#007AFF' }}>Cancel</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#ffffff' },
  label: { fontSize: 13, color: '#aaaaaa', marginTop: 12 },
  helperText: { fontSize: 11, color: '#888', marginTop: 2, fontStyle: 'italic' },
  input: { backgroundColor: '#1e1e1e', color: '#ffffff', padding: 10, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  secondary: { backgroundColor: '#4CAF50' },
  buttonText: { color: 'white', fontWeight: '700' },
  link: { alignItems: 'center' },
});
