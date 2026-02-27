import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ResponseBox({ response, error }) {
  if (!response && !error) return null;

  return (
    <View style={[styles.container, error ? styles.errorBox : styles.successBox]}>
      <Text style={styles.label}>{error ? 'Error' : 'Response'}</Text>
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        <Text style={styles.text}>
          {error ? error : JSON.stringify(response, null, 2)}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 10,
    padding: 12,
    maxHeight: 220,
  },
  successBox: {
    backgroundColor: '#e6f4ea',
    borderColor: '#34a853',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#fce8e6',
    borderColor: '#ea4335',
    borderWidth: 1,
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: { maxHeight: 160 },
  text: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#222',
  },
});
