import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRuleById } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';
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

const RuleDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [rule, setRule] = useState<SearchableRule | undefined>();
    const [controversialCalls, setControversialCalls] = useState<CommunityCallDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            getRuleById(parseInt(id, 10)).then(async result => {
                setRule(result);
                if (result) {
                    // Fetch controversial calls for this specific rule
                    try {
                        const response = await fetch(`/api/leaderboard/?ruleRef=${encodeURIComponent(result.fullReference)}`);
                        if (response.ok) {
                            setControversialCalls(await response.json());
                        }
                    } catch (e) {
                        console.error("Failed to fetch rule leaderboard", e);
                    }
                }
                setIsLoading(false);
            });
        }
    }, [id]);

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading rule...</div>;
    }

    if (!rule) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Rule not found.</div>;
    }

    const bookmarked = isBookmarked(rule.sport, rule.fullReference);
    const pending = isPending(rule.fullReference);

    const toggleBookmark = () => {
        if (pending) return;
        if (bookmarked) {
            removeBookmark(rule.sport, rule.fullReference);
        } else {
            addBookmark(rule.sport, rule.fullReference, rule.id);
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
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
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                ← Back to results
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '42px',
                    lineHeight: '1.2',
                    flex: 1,
                    wordBreak: 'break-word'
                }}>
                    {rule.ruleTitle}
                </h1>
                <button
                    onClick={toggleBookmark}
                    disabled={pending}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '40px',
                        cursor: pending ? 'not-allowed' : 'pointer',
                        color: bookmarked ? '#FFC107' : '#ccc',
                        marginTop: '5px'
                    }}
                >
                    {pending ? '...' : (bookmarked ? '★' : '☆')}
                </button>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: 'var(--accent)', margin: '0 0 5px 0' }}>{rule.sectionTitle}</h2>
                <div style={{ color: 'var(--text)', fontWeight: 'bold' }}>{rule.sport} • {rule.fullReference}</div>
            </div>

            <div style={{
                fontSize: '1.2em',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                color: 'var(--text-h)',
                backgroundColor: 'var(--code-bg)',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid var(--border)'
            }}>
                {rule.articleText}
            </div>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <h3>Community Hall of Shame (This Rule)</h3>
                {controversialCalls.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No controversial calls logged for this rule yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {controversialCalls.map(call => (
                            <div key={call.id} style={{
                                backgroundColor: 'var(--bg)',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                borderLeft: `6px solid ${getControversyColor(call.averageRating!)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{call.penaltyName} ({call.team})</div>
                                    <div style={{ fontSize: '0.8em', color: '#666' }}>Published by {call.userName}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: getControversyColor(call.averageRating!) }}>
                                        {call.averageRating?.toFixed(1)}
                                    </div>
                                    <div style={{ fontSize: '0.6em', color: '#999' }}>RATING</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <h3>Related Rules</h3>
                <p style={{ color: '#666', fontStyle: 'italic' }}>Note: Search the new database to find more rules!</p>
            </div>
        </div>
    );
};

export default RuleDetailScreen;
