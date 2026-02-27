import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { getProfile } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import ResponseBox from '../components/ResponseBox';
import TokenInspector from '../components/TokenInspector';

export default function ProfileScreen({ navigation }) {
  const { token, setTokenDirect, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    if (!token) {
      setError('No token found. Please login first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await getProfile(token);
      setResponse(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setResponse(null);
    setError(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.endpoint}>GET /api/user/profile</Text>

      <TouchableOpacity style={styles.button} onPress={handleFetch} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Fetch Profile</Text>}
      </TouchableOpacity>

      <ResponseBox response={response} error={error} />

      <TokenInspector token={token} onTokenChange={setTokenDirect} />

      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Admin')} style={styles.link}>
          <Text style={styles.linkText}>Admin Dashboard →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#f8f9fb',
    flexGrow: 1,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  endpoint: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    marginBottom: 24,
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: '#3d9970',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  link: {},
  linkText: { color: '#4361ee', fontSize: 14 },
  logoutBtn: {
    backgroundColor: '#e63946',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
