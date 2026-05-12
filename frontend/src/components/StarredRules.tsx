import React from 'react';

interface StarredRulesProps {
    bookmarks: string[];
    isPending: (ref: string) => boolean;
    removeBookmark: (ref: string) => void;
    onNavigateToRule: (ref: string) => void;
}

const StarredRules: React.FC<StarredRulesProps> = ({
    bookmarks,
    isPending,
    removeBookmark,
    onNavigateToRule,
}) => {
    return (
        <div style={{ marginBottom: '40px' }}>
            <h2>Starred Rules</h2>
            {bookmarks.length === 0 ? (
                <p style={{ color: '#666' }}>You haven't starred any rules yet. Search and click the ★ icon to save them here!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bookmarks.map(ref => {
                        const pending = isPending(ref);
                        return (
                            <div key={ref} style={{
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
                                    onClick={() => onNavigateToRule(ref)}
                                >
                                    {ref}
                                </span>
                                <button
                                    onClick={() => removeBookmark(ref)}
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
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default StarredRules;
