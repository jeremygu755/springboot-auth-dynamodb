import React, { useState } from 'react';
import {
  Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { getAdminDashboard } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import ResponseBox from '../components/ResponseBox';

export default function AdminScreen({ navigation }) {
  const { token } = useAuth();
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
      const data = await getAdminDashboard(token);
      setResponse(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.endpoint}>GET /api/admin/dashboard</Text>

      <Text style={styles.note}>
        Requires a valid JWT token with ADMIN role. Unauthorized users will receive a 403 error.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleFetch} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Fetch Dashboard</Text>}
      </TouchableOpacity>

      <ResponseBox response={response} error={error} />

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.link}>
        <Text style={styles.linkText}>← Back to Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#f8f9fb',
    flexGrow: 1,
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
    marginBottom: 16,
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  note: {
    fontSize: 13,
    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    lineHeight: 19,
  },
  button: {
    backgroundColor: '#e63946',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#4361ee', fontSize: 14 },
});
