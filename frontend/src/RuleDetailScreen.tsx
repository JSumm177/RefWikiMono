import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRuleById } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';
import type { CommunityCallDto } from './api-types';

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
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' }}>
                <div className="spinner" />
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading rulebook data...</div>
            </div>
        );
    }

    if (!rule) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <div style={{ color: 'var(--text-h)', fontSize: '1.2rem', fontWeight: 700 }}>Rule not found</div>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        );
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
        <div className="form-container" style={{ maxWidth: '900px', padding: '32px 20px', textAlign: 'left' }}>
            <button className="btn-back" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
                ← Back to results
            </button>

            <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                            {rule.sport} • {rule.fullReference}
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '2.2rem',
                            fontWeight: 800,
                            lineHeight: '1.25',
                            color: 'var(--text-h)'
                        }}>
                            {rule.ruleTitle}
                        </h1>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600, margin: '8px 0 0 0' }}>
                            {rule.sectionTitle}
                        </h3>
                    </div>
                    <button
                        onClick={toggleBookmark}
                        disabled={pending}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '32px',
                            cursor: pending ? 'not-allowed' : 'pointer',
                            color: bookmarked ? 'oklch(78% 0.16 85)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '48px',
                            transition: 'color 0.2s, transform 0.1s'
                        }}
                        className="bookmark-star-btn"
                    >
                        {pending ? (
                            <div style={{
                                width: '22px',
                                height: '22px',
                                border: '2px solid var(--border)',
                                borderTop: '2px solid var(--accent)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite'
                            }} />
                        ) : (
                            bookmarked ? '★' : '☆'
                        )}
                    </button>
                </div>

                <div style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.75',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text)',
                    backgroundColor: 'var(--bg-input)',
                    padding: '24px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                }}>
                    {rule.articleText}
                </div>
            </div>

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-h)', marginBottom: '20px' }}>Community Consensus (This Rule)</h3>
                {controversialCalls.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No controversial calls logged for this rule yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {controversialCalls.map(call => {
                            const roundedRating = Math.min(5, Math.max(1, Math.round(call.averageRating || 3)));
                            return (
                                <div
                                    key={call.id}
                                    className={`glass-card c-border-${roundedRating}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px 20px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/call/${call.id}`)}
                                >
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-h)' }}>
                                            {call.penaltyName} ({call.team})
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Published by <strong style={{ color: 'var(--text)' }}>{call.userName}</strong>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.4rem', color: `var(--c${roundedRating})` }}>
                                            {call.averageRating?.toFixed(1)}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
                                            CONSENSUS
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-h)', marginBottom: '8px' }}>Related Rules</h3>
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Use the main search panel to explore more rulebooks!</p>
            </div>
        </div>
    );
};

export default RuleDetailScreen;
