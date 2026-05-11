import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const CallDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [call, setCall] = useState<CommunityCallDto | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    const fetchCall = async () => {
        try {
            const response = await fetch(`/api/calls/${id}`);
            if (response.ok) {
                setCall(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch call details', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCall();
    }, [id]);

    const handleVote = async (rating: number) => {
        if (!call) return;
        try {
            const response = await fetch(`/api/calls/${call.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ controversyLevel: rating }),
                credentials: 'include'
            });
            if (response.ok) {
                fetchCall(); // Refresh data
            }
        } catch (error) {
            console.error('Failed to vote', error);
        }
    };

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading call details...</div>;
    if (!call) return <div style={{ padding: '20px', textAlign: 'center' }}>Call not found.</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '30px',
                    background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                ← Back
            </button>

            <div style={{
                backgroundColor: 'var(--bg)',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                borderLeft: `12px solid ${getControversyColor(call.averageRating!)}`,
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>{call.penaltyName}</h1>
                        <h3 style={{ margin: 0, color: 'var(--accent)' }}>{call.team} ({call.sport})</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: getControversyColor(call.averageRating!) }}>
                            {call.averageRating?.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.8em', color: '#999' }}>COMMUNITY RATING</div>
                    </div>
                </div>

                <div style={{ margin: '30px 0', padding: '20px', backgroundColor: 'var(--code-bg)', borderRadius: '8px', fontSize: '1.2em' }}>
                    <strong>Reference:</strong> {call.ruleReference}
                    <div style={{ marginTop: '15px', fontStyle: 'italic' }}>
                        "{call.notes}"
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#666', textAlign: 'right' }}>
                        — Shared by <strong>{call.userName}</strong>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <h4 style={{ marginBottom: '15px' }}>Cast your vote on the controversy level:</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => handleVote(lvl)}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: `2px solid ${getControversyColor(lvl)}`,
                                    backgroundColor: 'transparent',
                                    color: getControversyColor(lvl),
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                    transition: 'all 0.2s'
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
                    <p style={{ marginTop: '15px', fontSize: '0.8em', color: '#999' }}>
                        Total votes: {call.voteCount}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CallDetailScreen;
