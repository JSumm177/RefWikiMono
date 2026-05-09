import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';

const SearchScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const [sport, setSport] = useState('NFL');
    const [results, setResults] = useState<SearchableRule[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    const performSearch = useCallback(async (q: string, s: string) => {
        if (q.length > 2) {
            setIsSearching(true);
            const data = await searchRules(s, q);
            setResults(data);
            setIsSearching(false);
        } else {
            setResults([]);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query, sport);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, sport, performSearch]);

    const toggleBookmark = (item: SearchableRule) => {
        if (isPending(item.fullReference)) return;

        if (isBookmarked(item.sport, item.fullReference)) {
            removeBookmark(item.sport, item.fullReference);
        } else {
            addBookmark(item.sport, item.fullReference, item.id);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    style={{
                        padding: '12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text-h)',
                        cursor: 'pointer'
                    }}
                >
                    <option value="NFL">NFL</option>
                    <option value="NCAA">NCAA</option>
                    <option value="NBA">NBA</option>
                    <option value="MLB">MLB</option>
                    <option value="NHL">NHL</option>
                    <option value="Soccer">Soccer</option>
                </select>
                <input
                    type="text"
                    placeholder={`Search ${sport} rules...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text-h)',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {isSearching && <div style={{ textAlign: 'center', marginBottom: '10px' }}>Searching...</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.map(item => {
                    const bookmarked = isBookmarked(item.sport, item.fullReference);
                    const pending = isPending(item.fullReference);

                    return (
                        <div key={item.id} style={{
                            backgroundColor: 'var(--bg)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => navigate(`/rule/${item.id}`)}
                                >
                                    <h3 style={{ margin: '0 0 5px 0' }}>{item.ruleTitle} - {item.sectionTitle}</h3>
                                    <div style={{ color: 'var(--text)', marginBottom: '5px' }}>{item.fullReference}</div>
                                </div>
                                <button
                                    onClick={() => toggleBookmark(item)}
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
                                        minWidth: '40px'
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
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SearchScreen;
