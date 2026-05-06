import React, { useState, useContext } from 'react';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';

const SearchScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchableRule[]>([]);
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);
        if (text.length > 2) {
            setResults(searchRules(text));
        } else {
            setResults([]);
        }
    };

    const toggleBookmark = (fullReference: string) => {
        if (isPending(fullReference)) return;

        if (isBookmarked(fullReference)) {
            removeBookmark(fullReference);
        } else {
            addBookmark(fullReference);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <input
                type="text"
                name="search"
                autoComplete="on"
                placeholder="Search rules (e.g., Holding)"
                value={query}
                onChange={handleSearch}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text-h)',
                    marginBottom: '20px',
                    boxSizing: 'border-box'
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.map(item => {
                    const bookmarked = isBookmarked(item.fullReference);
                    const pending = isPending(item.fullReference);

                    return (
                        <div key={`${item.ruleId}-${item.sectionId}-${item.articleId}`} style={{
                            backgroundColor: 'var(--bg)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{item.ruleTitle} - {item.sectionTitle}</h3>
                                    <div style={{ color: 'var(--text)', marginBottom: '5px' }}>{item.fullReference}</div>
                                </div>
                                <button
                                    onClick={() => toggleBookmark(item.fullReference)}
                                    disabled={pending}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: pending ? 'not-allowed' : 'pointer',
                                        color: bookmarked ? '#FFC107' : '#ccc',
                                        padding: '5px',
                                        marginLeft: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '40px',
                                        zIndex: 10 // Ensure it's on top
                                    }}
                                >
                                    {pending ? (
                                        <div className="spinner-small" style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #ccc',
                                            borderTop: '2px solid #FFC107',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    ) : (
                                        bookmarked ? '★' : '☆'
                                    )}
                                </button>
                            </div>
                            <div style={{ color: 'var(--text-h)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.articleText}
                            </div>
                            {/* Simple CSS for the spinner animation if not already present */}
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchScreen;
