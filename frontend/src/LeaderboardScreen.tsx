import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CommunityCallDto, UserAccuracyDto } from './api-types';

const getControversyColor = (level: number) => {
    switch (Math.round(level)) {
        case 1: return '#4CAF50';
        case 2: return '#8BC34A';
        case 3: return '#FFC107';
        case 4: return '#FF9800';
        case 5: return '#F44336';
        default: return '#ccc';
    }
};

const getAccuracyColor = (rate: number) => {
    if (rate >= 90) return '#4CAF50';
    if (rate >= 75) return '#8BC34A';
    if (rate >= 60) return '#FFC107';
    return '#F44336';
};

const LeaderboardScreen: React.FC = () => {
    const [calls, setCalls] = useState<CommunityCallDto[]>([]);
    const [accuracyList, setAccuracyList] = useState<UserAccuracyDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'shame' | 'accuracy'>('shame');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboards = async () => {
            setIsLoading(true);
            try {
                const [shameRes, accRes] = await Promise.all([
                    fetch('/api/leaderboard/'),
                    fetch('/api/leaderboard/accuracy')
                ]);

                if (shameRes.ok) setCalls(await shameRes.json());
                if (accRes.ok) setAccuracyList(await accRes.json());
            } catch (error) {
                console.error('Failed to fetch leaderboards', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboards();
    }, []);

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Leaderboards...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => setTab('shame')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: tab === 'shame' ? 'var(--accent)' : '#eee',
                        color: tab === 'shame' ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🔥 Hall of Shame
                </button>
                <button
                    onClick={() => setTab('accuracy')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: tab === 'accuracy' ? 'var(--accent)' : '#eee',
                        color: tab === 'accuracy' ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🎯 Accuracy Kings
                </button>
            </div>

            {tab === 'shame' ? (
                <>
                    <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>🔥 Hall of Shame</h1>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                        Most controversial calls as voted by the community
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {calls.map((call, index) => (
                            <div
                                key={call.id}
                                onClick={() => navigate(`/call/${call.id}`)}
                                style={{
                                    backgroundColor: 'var(--bg)',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#999',
                                    minWidth: '40px',
                                    textAlign: 'center'
                                }}>
                                    #{index + 1}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{call.penaltyName}</h3>
                                    <div style={{ color: 'var(--text)', fontSize: '0.9em' }}>
                                        {call.sport} • {call.team} • {call.ruleReference}
                                    </div>
                                    <div style={{ marginTop: '5px', fontSize: '0.85em', color: '#888' }}>
                                        Published by <strong>{call.userName}</strong>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: getControversyColor(call.averageRating!)
                                    }}>
                                        {call.averageRating?.toFixed(1)}
                                    </div>
                                    <div style={{ fontSize: '0.7em', color: '#999', textTransform: 'uppercase' }}>
                                        Rating
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>🎯 Accuracy Kings</h1>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                        Users whose opinions most closely match the community consensus
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {accuracyList.map((user, index) => (
                            <div
                                key={user.userId}
                                style={{
                                    backgroundColor: 'var(--bg)',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: index < 3 ? '#FFD700' : '#999',
                                    minWidth: '40px',
                                    textAlign: 'center'
                                }}>
                                    #{index + 1}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0' }}>{user.userName}</h3>
                                    <span style={{
                                        fontSize: '0.7em',
                                        padding: '2px 8px',
                                        backgroundColor: 'var(--accent)',
                                        color: '#fff',
                                        borderRadius: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.roleType}
                                    </span>
                                    <div style={{ marginTop: '5px', fontSize: '0.85em', color: '#888' }}>
                                        {user.totalActions} opinions shared
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: getAccuracyColor(user.accuracyRate!)
                                    }}>
                                        {user.accuracyRate?.toFixed(1)}%
                                    </div>
                                    <div style={{ fontSize: '0.7em', color: '#999', textTransform: 'uppercase' }}>
                                        Accuracy
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {(tab === 'shame' ? calls : accuracyList).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Nothing to show yet. Be the first to share an opinion!
                </div>
            )}
        </div>
    );
};

export default LeaderboardScreen;
