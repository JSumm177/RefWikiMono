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

const CommunityFeed: React.FC = () => {
    const [calls, setCalls] = useState<CommunityCallDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCommunity = async () => {
        try {
            const response = await fetch('/api/calls/community');
            if (response.ok) {
                setCalls(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch community feed', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunity();
    }, []);

    const handleVote = async (callId: number, rating: number) => {
        try {
            const response = await fetch(`/api/calls/${callId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ controversyLevel: rating }),
                credentials: 'include'
            });
            if (response.ok) {
                fetchCommunity(); // Refresh to show new averages
            }
        } catch (error) {
            console.error('Failed to vote', error);
        }
    };

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Community Feed...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Community Consensus</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {calls.map(call => (
                    <div key={call.id} style={{
                        backgroundColor: 'var(--bg)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        borderLeft: `8px solid ${getControversyColor(call.averageRating!)}`,
                        textAlign: 'left'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>{call.penaltyName}</h3>
                                <div style={{ color: 'var(--text)', fontSize: '0.9em' }}>
                                    {call.sport} • {call.team} • {call.ruleReference}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: getControversyColor(call.averageRating!) }}>
                                    {call.averageRating?.toFixed(1)}
                                </div>
                                <div style={{ fontSize: '0.8em', color: '#666' }}>{call.voteCount} votes</div>
                            </div>
                        </div>

                        <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontStyle: 'italic' }}>
                            "{call.notes}" — <strong>{call.userName}</strong>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '10px' }}>How would you rate this call?</div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <button
                                        key={lvl}
                                        onClick={() => handleVote(call.id!, lvl)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '20px',
                                            border: `1px solid ${getControversyColor(lvl)}`,
                                            backgroundColor: 'transparent',
                                            color: getControversyColor(lvl),
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = getControversyColor(lvl);
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = getControversyColor(lvl);
                                        }}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityFeed;
