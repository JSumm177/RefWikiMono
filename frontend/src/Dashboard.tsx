import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CallHistoryContext } from './CallHistoryContext';
import { BookmarkContext } from './BookmarkContext';

const getControversyColor = (level: number) => {
    switch (level) {
        case 1: return '#4CAF50';
        case 2: return '#8BC34A';
        case 3: return '#FFC107';
        case 4: return '#FF9800';
        case 5: return '#F44336';
        default: return '#ccc';
    }
};

const Dashboard: React.FC = () => {
    const { calls } = useContext(CallHistoryContext);
    const { bookmarks, removeBookmark, isPending } = useContext(BookmarkContext);
    const navigate = useNavigate();

    const handleNavigateToRule = (b: { sport: string, fullReference: string, articleId?: number }) => {
        if (b.articleId) {
            navigate(`/rule/${b.articleId}`);
        } else {
            // Fallback for older bookmarks: navigate to search with the reference
            navigate(`/search?q=${encodeURIComponent(b.fullReference)}&sport=${b.sport}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h2>Starred Rules</h2>
                {bookmarks.length === 0 ? (
                    <p style={{ color: '#666' }}>You haven't starred any rules yet. Search and click the ★ icon to save them here!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {bookmarks.map(b => {
                            const pending = isPending(b.fullReference);
                            return (
                                <div key={`${b.sport}-${b.fullReference}`} style={{
                                    backgroundColor: '#fff8e1',
                                    padding: '12px 15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ffe082',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span
                                        style={{ flex: 1, cursor: 'pointer', textAlign: 'left' }}
                                        onClick={() => handleNavigateToRule(b)}
                                    >
                                        <strong>{b.sport.toUpperCase()}</strong>: {b.fullReference}
                                    </span>
                                    <button
                                        onClick={() => removeBookmark(b.sport, b.fullReference)}
                                        disabled={pending}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: pending ? 'not-allowed' : 'pointer',
                                            fontSize: '24px',
                                            color: '#FFC107',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: '40px'
                                        }}
                                    >
                                        {pending ? (
                                            <div className="spinner-small" style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '2px solid #ccc',
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

            <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '30px' }} />

            <h2>Live Call Log</h2>
            {calls.length === 0 ? (
                <p>No calls logged yet. Head to Log Call!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {calls.map(item => (
                        <div key={item.id} style={{
                            backgroundColor: '#f9f9f9',
                            padding: '15px',
                            borderRadius: '8px',
                            borderLeft: `6px solid ${getControversyColor(item.controversyLevel)}`,
                            borderTop: '1px solid #eee',
                            borderRight: '1px solid #eee',
                            borderBottom: '1px solid #eee',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <h3 style={{ margin: 0 }}>{item.penaltyName}</h3>
                                <span style={{
                                    backgroundColor: '#eee',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {item.sport} {item.team ? `• ${item.team}` : ''}
                                </span>
                            </div>
                            <div style={{ color: '#555', marginBottom: '5px' }}>{item.ruleReference}</div>
                            <div style={{ color: '#333', marginBottom: '10px' }}>{item.notes}</div>
                            <div style={{ fontSize: '0.8em', color: '#999', textAlign: 'right' }}>
                                {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
