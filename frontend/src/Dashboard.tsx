import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CallHistoryContext } from './CallHistoryContext';
import { BookmarkContext } from './BookmarkContext';

const Dashboard: React.FC = () => {
    const { calls } = useContext(CallHistoryContext);
    const { bookmarks, removeBookmark, isPending } = useContext(BookmarkContext);
    const navigate = useNavigate();

    const handleNavigateToRule = (b: { sport: string, fullReference: string, articleId?: number }) => {
        if (b.articleId) {
            navigate(`/rule/${b.articleId}`);
        } else {
            navigate(`/search?q=${encodeURIComponent(b.fullReference)}&sport=${b.sport}`);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-section">
                <h2>★ Starred Rules</h2>
                {bookmarks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        You haven't starred any rules yet. Search and click the ★ icon to save them here!
                    </p>
                ) : (
                    <div className="starred-rules-list">
                        {bookmarks.map(b => {
                            const pending = isPending(b.fullReference);
                            return (
                                <div key={`${b.sport}-${b.fullReference}`} className="starred-card">
                                    <div
                                        className="starred-card-content"
                                        onClick={() => handleNavigateToRule(b)}
                                    >
                                        <span className="sport-badge">{b.sport}</span>
                                        <span className="starred-card-reference">{b.fullReference}</span>
                                    </div>
                                    <button
                                        onClick={() => removeBookmark(b.sport, b.fullReference)}
                                        disabled={pending}
                                        className="unstar-button"
                                        aria-label="Remove star"
                                    >
                                        {pending ? (
                                            <div className="spinner-small" style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '2px solid var(--border)',
                                                borderTop: '2px solid #FFC107',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                        ) : (
                                            '★'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="dashboard-section">
                <h2>📣 Live Call Log</h2>
                {calls.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No calls logged yet. Head to "Log Call" to publish a live call!
                    </p>
                ) : (
                    <div className="call-list">
                        {calls.map(item => (
                            <div
                                key={item.id}
                                className={`call-card c-border-${item.controversyLevel} ${item.isPublic ? 'interactive' : ''}`}
                                onClick={() => {
                                    if (item.isPublic) navigate(`/call/${item.id}`);
                                }}
                            >
                                <div className="call-card-header">
                                    <h3 className="call-card-title">
                                        {item.penaltyName}
                                        {item.isPublic && (
                                            <span className="header-logo-badge" style={{ fontSize: '0.65rem' }}>
                                                Public
                                            </span>
                                        )}
                                    </h3>
                                    <span className="call-card-badge">
                                        {item.sport} {item.team ? `• ${item.team}` : ''}
                                    </span>
                                </div>
                                <div className="call-card-reference">{item.ruleReference}</div>
                                <div className="call-card-notes">{item.notes}</div>
                                <div className="call-card-footer">
                                    <div className="consensus-tag">
                                        <span className="consensus-tag-label">Controversy:</span>
                                        <span className={`c-badge c-badge-${item.controversyLevel}`}>
                                            Level {item.controversyLevel}
                                        </span>
                                    </div>
                                    <span>
                                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
