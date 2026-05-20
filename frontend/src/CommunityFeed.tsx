import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CommunityCallDto } from './api-types';

const getControversyVariable = (level: number) => {
    switch (Math.round(level)) {
        case 1: return 'var(--c1)';
        case 2: return 'var(--c2)';
        case 3: return 'var(--c3)';
        case 4: return 'var(--c4)';
        case 5: return 'var(--c5)';
        default: return 'var(--text-muted)';
    }
};

const CommunityFeed: React.FC = () => {
    const [calls, setCalls] = useState<CommunityCallDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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
                fetchCommunity();
            }
        } catch (error) {
            console.error('Failed to vote', error);
        }
    };

    if (isLoading) {
        return (
            <div className="spinner-container">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="feed-container">
            <h2 className="feed-title">Community Consensus</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {calls.map(call => {
                    const roundedRating = Math.round(call.averageRating || 1);
                    const colorVar = getControversyVariable(call.averageRating || 1);
                    
                    return (
                        <div
                            key={call.id}
                            className={`community-card c-border-${roundedRating}`}
                        >
                            <div className="community-card-header">
                                <div
                                    className="community-card-info"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/call/${call.id}`)}
                                >
                                    <h3>{call.penaltyName}</h3>
                                    <div className="community-card-meta">
                                        {call.sport} • {call.team} • {call.ruleReference}
                                    </div>
                                </div>
                                <div className="community-card-score-container">
                                    <div
                                        className="community-card-score"
                                        style={{
                                            backgroundColor: `oklch(from ${colorVar} l c h / 0.1)`,
                                            color: colorVar,
                                            border: `1px solid oklch(from ${colorVar} l c h / 0.25)`
                                        }}
                                    >
                                        {call.averageRating?.toFixed(1) || '1.0'}
                                    </div>
                                    <span className="community-card-votes">
                                        {call.voteCount} {call.voteCount === 1 ? 'vote' : 'votes'}
                                    </span>
                                </div>
                            </div>

                            <div className="community-quote">
                                "{call.notes}" —
                                <strong className="community-quote-author">{call.userName}</strong>
                                <span className={`user-role-badge ${call.userRole === 'OFFICIAL' ? 'official' : ''}`}>
                                    {call.userRole}
                                </span>
                            </div>

                            <div className="vote-section">
                                <div className="vote-section-title">How would you rate this call?</div>
                                <div className="vote-pill-container">
                                    {[1, 2, 3, 4, 5].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => handleVote(call.id!, lvl)}
                                            className={`vote-pill pill-${lvl}`}
                                            aria-label={`Rate controversy ${lvl}`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommunityFeed;
