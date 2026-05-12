import React, { useState, useEffect } from 'react';
import type { ProfileDto } from './api-types';

const ProfileScreen: React.FC = () => {
    const [profile, setProfile] = useState<ProfileDto | undefined>();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<ProfileDto>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const sports = ['NFL', 'NCAA', 'NBA', 'MLB', 'NHL', 'MLS'];

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile/');
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch('/api/profile/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
                credentials: 'include'
            });
            if (response.ok) {
                setProfile(await response.json());
                setIsEditing(false);
                setMessage('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update profile', error);
            setMessage('Error updating profile.');
        }
    };

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading profile...</div>;
    if (!profile) return <div style={{ padding: '20px', textAlign: 'center' }}>Error loading profile.</div>;

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-h)',
        marginBottom: '15px',
        fontSize: '16px'
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{
                backgroundColor: 'var(--bg)',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '32px' }}>Your Profile</h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--accent-bg)',
                                border: '1px solid var(--accent-border)',
                                color: 'var(--accent)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {message && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                {!isEditing ? (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8em', color: '#999', fontWeight: 'bold' }}>DISPLAY NAME</label>
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{profile.displayName}</div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8em', color: '#999', fontWeight: 'bold' }}>ROLE</label>
                            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold', marginTop: '5px' }}>
                                {profile.roleType}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8em', color: '#999', fontWeight: 'bold' }}>HOME TEAMS</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '5px' }}>
                                {sports.map(sport => (
                                    <div key={sport} style={{ padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.9em' }}>
                                        <strong>{sport}:</strong> {profile.homeTeams[sport] || '—'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8em', color: '#999', fontWeight: 'bold' }}>REPUTATION</label>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#FFC107' }}>⭐ {profile.reputationScore}</div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8em', color: '#999', fontWeight: 'bold' }}>BIO</label>
                            <div style={{ marginTop: '5px', lineHeight: '1.5' }}>{profile.bio || 'No bio yet.'}</div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Display Name</label>
                        <input
                            style={inputStyle}
                            value={editData.displayName || ''}
                            onChange={e => setEditData({...editData, displayName: e.target.value})}
                        />

                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Home Teams by Sport</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                            {sports.map(sport => (
                                <div key={sport}>
                                    <label style={{ fontSize: '0.7em', color: '#666' }}>{sport}</label>
                                    <input
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                        value={editData.homeTeams?.[sport] || ''}
                                        onChange={e => setEditData({
                                            ...editData,
                                            homeTeams: { ...editData.homeTeams, [sport]: e.target.value }
                                        })}
                                    />
                                </div>
                            ))}
                        </div>

                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Role</label>
                        <select
                            style={inputStyle}
                            value={editData.roleType || 'FAN'}
                            onChange={e => setEditData({...editData, roleType: e.target.value})}
                        >
                            <option value="FAN">Fan</option>
                            <option value="PLAYER">Player</option>
                            <option value="COACH">Coach</option>
                            <option value="CERTIFIED OFFICIAL">Certified Official</option>
                        </select>

                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Bio</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px' }}
                            value={editData.bio || ''}
                            onChange={e => setEditData({...editData, bio: e.target.value})}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#007BFF',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={{
                                    padding: '12px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileScreen;
