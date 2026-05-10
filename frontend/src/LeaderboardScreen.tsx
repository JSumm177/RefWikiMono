import React, { useState, useEffect } from 'react';
import type { CommunityCallDto } from './api-types';

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

const LeaderboardScreen: React.FC = () => {
    const [calls, setCalls] = useState<CommunityCallDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/leaderboard/');
                if (response.ok) {
                    setCalls(await response.json());
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Leaderboard...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>🔥 Hall of Shame</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                Most controversial calls as voted by the community
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {calls.map((call, index) => (
                    <div key={call.id} style={{
                        backgroundColor: 'var(--bg)',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        textAlign: 'left'
                    }}>
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

                {calls.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No controversial calls yet. Start voting in the Community feed!
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardScreen;
