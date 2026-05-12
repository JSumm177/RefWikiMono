import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { API_BASE_URL } from './utils/api';
import { AuthContext } from './AuthContext';

interface Profile {
  displayName: string;
  homeTeams: Record<string, string>;
  roleType: string;
  reputationScore: number;
  bio: string;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { userToken, signOut } = useContext(AuthContext);
  const sports = ['NFL', 'NCAA', 'NBA', 'MLB', 'NHL', 'MLS'];

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (isLoading) return <ActivityIndicator size="large" color="#007BFF" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Ref Identity</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isEditing ? (
        <View style={styles.card}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{profile?.displayName}</Text>

          <Text style={styles.label}>Community Role</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{profile?.roleType}</Text>
          </View>

          <Text style={styles.label}>Home Teams</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sports.map(sport => (
              <View key={sport} style={styles.sportBadge}>
                <Text style={styles.sportText}>{sport}: {profile?.homeTeams[sport] || '—'}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Reputation</Text>
          <Text style={styles.repValue}>⭐ {profile?.reputationScore}</Text>

          <Text style={styles.label}>Bio</Text>
          <Text style={styles.bioValue}>{profile?.bio || 'No bio shared.'}</Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={editData.displayName}
            onChangeText={(val) => setEditData({ ...editData, displayName: val })}
          />

          <Text style={styles.label}>Home Teams</Text>
          {sports.map(sport => (
            <View key={sport} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 10, color: '#666' }}>{sport}</Text>
              <TextInput
                style={[styles.input, { paddingVertical: 8 }]}
                value={editData.homeTeams?.[sport] || ''}
                onChangeText={(val) => setEditData({
                  ...editData,
                  homeTeams: { ...editData.homeTeams, [sport]: val }
                })}
              />
            </View>
          ))}

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editData.bio}
            onChangeText={(val) => setEditData({ ...editData, bio: val })}
            multiline
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editBtn: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  cancelBtn: {
    color: '#999',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 5,
    marginTop: 15,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  repValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  bioValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  badge: {
    backgroundColor: '#aa3bff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sportBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sportText: {
    fontSize: 12,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
    padding: 15,
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: 'bold',
  }
});

export default ProfileScreen;
