import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function formatCountdown(seconds) {
  if (seconds <= 0) return 'EXPIRED';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function getProgressColor(fraction) {
  if (fraction > 0.5) return '#34a853';
  if (fraction > 0.2) return '#fbbc04';
  return '#ea4335';
}

export default function TokenInspector({ token, onTokenChange }) {
  const originalToken = useRef(null);
  const [payload, setPayload] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(1);
  const [tampered, setTampered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedToken, setEditedToken] = useState('');

  useEffect(() => {
    if (!token) {
      setPayload(null);
      originalToken.current = null;
      setTampered(false);
      return;
    }
    const decoded = decodeJwtPayload(token);
    setPayload(decoded);
    if (decoded?.exp && decoded?.iat) {
      setTotal(decoded.exp - decoded.iat);
    }
    // First time seeing a valid JWT from login/register — store as original
    if (!originalToken.current && decoded) {
      originalToken.current = token;
    }
    setTampered(originalToken.current != null && token !== originalToken.current);
  }, [token]);

  useEffect(() => {
    if (!payload?.exp) { setRemaining(0); return; }
    const tick = () => {
      const left = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
      setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [payload]);

  const fraction = total > 0 ? remaining / total : 0;
  const expired = remaining <= 0 && payload?.exp;

  const statusLabel = tampered ? 'TAMPERED' : expired ? 'EXPIRED' : 'VALID';
  const statusColor = tampered ? '#ff6b00' : expired ? '#ea4335' : '#34a853';

  const handleCorrupt = useCallback(() => {
    if (!token) return;
    const corrupted = token.slice(0, -10) + 'TAMPERED!!';
    onTokenChange(corrupted);
    Alert.alert('Signature Corrupted', 'Last 10 characters replaced with garbage. The server will reject this token because the signature no longer matches.');
  }, [token, onTokenChange]);

  const handleSwapRole = useCallback(() => {
    if (!token || !payload) return;
    const parts = token.split('.');
    if (parts.length !== 3) return;
    const newRole = payload.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    const modified = { ...payload, role: newRole };
    const encoded = btoa(JSON.stringify(modified))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const tampered = `${parts[0]}.${encoded}.${parts[2]}`;
    onTokenChange(tampered);
    Alert.alert('Role Swapped', `Payload changed to ${newRole}. The signature is now invalid — the server will reject this.`);
  }, [token, payload, onTokenChange]);

  const handleClearToken = useCallback(() => {
    onTokenChange(null);
    Alert.alert('Token Cleared', 'Token removed. Protected endpoints will return 403.');
  }, [onTokenChange]);

  const handleRestore = useCallback(() => {
    if (originalToken.current) {
      onTokenChange(originalToken.current);
      Alert.alert('Token Restored', 'Original token restored. API calls should work again.');
    }
  }, [onTokenChange]);

  const handleSaveEdit = useCallback(() => {
    if (editedToken.trim()) {
      onTokenChange(editedToken.trim());
    }
    setEditMode(false);
  }, [editedToken, onTokenChange]);

  if (!token) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.header}>
        <Text style={styles.headerTitle}>Token Inspector</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
          {!tampered && (
            <Text style={styles.headerTimer}>
              {expired ? 'EXPIRED' : formatCountdown(remaining)}
            </Text>
          )}
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* Tamper warning banner */}
          {tampered && (
            <View style={styles.tamperBanner}>
              <Text style={styles.tamperBannerTitle}>TOKEN MODIFIED</Text>
              <Text style={styles.tamperBannerText}>
                This token has been tampered with. The server will reject it because the signature no longer matches the payload. The countdown below is meaningless — even if it hasn't "expired", the server won't accept it.
              </Text>
              <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                <Text style={styles.restoreBtnText}>Restore Original Token</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Countdown bar */}
          <Text style={styles.sectionLabel}>Time Remaining</Text>
          <View style={styles.barBg}>
            <View style={[
              styles.barFill,
              {
                width: tampered ? '100%' : `${fraction * 100}%`,
                backgroundColor: tampered ? '#ff6b00' : getProgressColor(fraction),
              },
            ]} />
          </View>
          <Text style={[styles.timerLarge, tampered && styles.timerTampered]}>
            {tampered ? 'INVALID' : formatCountdown(remaining)}
          </Text>
          {!tampered && payload?.exp && (
            <Text style={styles.expiry}>
              Expires: {new Date(payload.exp * 1000).toLocaleString()}
            </Text>
          )}

          {/* Decoded payload */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Decoded Payload</Text>
          <View style={[styles.payloadBox, tampered && styles.payloadBoxTampered]}>
            <Text style={[styles.payloadText, tampered && styles.payloadTextTampered]}>
              {payload ? JSON.stringify(payload, null, 2) : 'Could not decode token (malformed)'}
            </Text>
          </View>

          {/* Tamper controls */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Tamper Controls</Text>

          <View style={styles.tamperRow}>
            <TouchableOpacity style={[styles.tamperBtn, styles.tamperCorrupt]} onPress={handleCorrupt}>
              <Text style={styles.tamperBtnText}>Corrupt Signature</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tamperBtn, styles.tamperRole]} onPress={handleSwapRole}>
              <Text style={styles.tamperBtnText}>Swap Role</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tamperRow}>
            <TouchableOpacity style={[styles.tamperBtn, styles.tamperClear]} onPress={handleClearToken}>
              <Text style={styles.tamperBtnText}>Clear Token</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tamperBtn, styles.tamperEdit]}
              onPress={() => { setEditedToken(token); setEditMode(!editMode); }}
            >
              <Text style={styles.tamperBtnText}>{editMode ? 'Cancel Edit' : 'Edit Raw Token'}</Text>
            </TouchableOpacity>
          </View>

          {tampered && (
            <TouchableOpacity style={styles.restoreBtnFull} onPress={handleRestore}>
              <Text style={styles.restoreBtnFullText}>Restore Original Token</Text>
            </TouchableOpacity>
          )}

          {editMode && (
            <View style={styles.editSection}>
              <TextInput
                style={styles.editInput}
                value={editedToken}
                onChangeText={setEditedToken}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Save Token</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTimer: {
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  chevron: {
    color: '#888',
    fontSize: 12,
  },
  body: {
    padding: 14,
    paddingTop: 0,
  },
  tamperBanner: {
    backgroundColor: '#4a1a00',
    borderColor: '#ff6b00',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tamperBannerTitle: {
    color: '#ff6b00',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tamperBannerText: {
    color: '#ffb380',
    fontSize: 12,
    lineHeight: 18,
  },
  restoreBtn: {
    backgroundColor: '#34a853',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  restoreBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionLabel: {
    color: '#8892b0',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  barBg: {
    height: 8,
    backgroundColor: '#2d2d4e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerLarge: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 8,
  },
  timerTampered: {
    color: '#ff6b00',
  },
  expiry: {
    color: '#8892b0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  payloadBox: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 10,
  },
  payloadBoxTampered: {
    borderColor: '#ff6b00',
    borderWidth: 1,
  },
  payloadText: {
    color: '#64ffda',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  payloadTextTampered: {
    color: '#ff6b00',
  },
  tamperRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tamperBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tamperBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  tamperCorrupt: { backgroundColor: '#e63946' },
  tamperRole: { backgroundColor: '#7b2cbf' },
  tamperClear: { backgroundColor: '#6c757d' },
  tamperEdit: { backgroundColor: '#4361ee' },
  restoreBtnFull: {
    backgroundColor: '#34a853',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  restoreBtnFullText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  editSection: {
    marginTop: 4,
  },
  editInput: {
    backgroundColor: '#16213e',
    color: '#64ffda',
    fontFamily: 'monospace',
    fontSize: 12,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#34a853',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
