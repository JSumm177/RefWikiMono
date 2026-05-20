import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CommunityCallDto, CommentDto } from './api-types';

const CallDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [call, setCall] = useState<CommunityCallDto | undefined>();
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCommenting, setIsCommenting] = useState(false);

    const fetchCall = async () => {
        try {
            const response = await fetch(`/api/calls/${id}`);
            if (response.ok) {
                setCall(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch call details', error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/comments/${id}`);
            if (response.ok) {
                setComments(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([fetchCall(), fetchComments()]);
            setIsLoading(false);
        };
        loadAll();
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

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsCommenting(true);
        try {
            const response = await fetch(`/api/comments/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment }),
                credentials: 'include'
            });
            if (response.ok) {
                setNewComment('');
                fetchComments();
                fetchCall(); // Refresh comment count
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setIsCommenting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' }}>
                <div className="spinner" />
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading call details...</div>
            </div>
        );
    }

    if (!call) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <div style={{ color: 'var(--text-h)', fontSize: '1.2rem', fontWeight: 700 }}>Call details not found</div>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        );
    }

    const roundedRating = Math.min(5, Math.max(1, Math.round(call.averageRating || 3)));

    return (
        <div className="form-container" style={{ maxWidth: '800px', padding: '32px 20px', textAlign: 'left' }}>
            <button className="btn-back" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
                ← Back
            </button>

            <div className={`glass-card c-border-${roundedRating}`} style={{ padding: '32px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-h)', lineHeight: '1.2' }}>
                            {call.penaltyName}
                        </h1>
                        <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600 }}>
                            {call.team} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '1rem' }}>({call.sport})</span>
                        </h3>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontSize: '2.8rem', fontWeight: 800, color: `var(--c${roundedRating})`, lineHeight: '1' }}>
                            {call.averageRating?.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '4px' }}>
                            COMMUNITY RATING
                        </div>
                    </div>
                </div>

                <div style={{
                    margin: '28px 0',
                    padding: '20px',
                    backgroundColor: 'var(--bg-input)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    fontSize: '1.1rem',
                    lineHeight: '1.6'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Rule Reference
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)' }}>
                            {call.ruleReference}
                        </span>
                    </div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-h)', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                        "{call.notes}"
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        — Shared by <strong style={{ color: 'var(--text)' }}>{call.userName}</strong>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Cast your vote on controversy level:
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {[1, 2, 3, 4, 5].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => handleVote(lvl)}
                                className={`vote-pill pill-${lvl}`}
                                style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🗳️</span>
                        <span>Total community votes: <strong>{call.voteCount}</strong></span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-h)', marginBottom: '24px' }}>
                    Discussion <span style={{ color: 'var(--accent)', fontSize: '1.3rem', fontWeight: 'bold' }}>({call.commentCount})</span>
                </h2>

                <form onSubmit={handleSubmitComment} style={{ marginBottom: '32px' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add to the consensus discussion..."
                        className="form-input-field"
                        style={{
                            minHeight: '120px',
                            marginBottom: '14px',
                            fontSize: '1rem',
                            resize: 'vertical',
                            lineHeight: '1.5'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isCommenting || !newComment.trim()}
                        className="btn-primary"
                        style={{
                            width: 'auto',
                            padding: '10px 24px',
                            fontSize: '0.95rem'
                        }}
                    >
                        {isCommenting ? 'Posting comment...' : 'Post Comment'}
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {comments.map(comment => (
                        <div key={comment.id} className="glass-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '0.95rem' }}>{comment.userName}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(comment.createdAt!).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ lineHeight: '1.6', color: 'var(--text-h)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{comment.text}</div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                            No comments yet. Start the conversation!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallDetailScreen;
