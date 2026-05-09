import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';

const SearchScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const [sport, setSport] = useState('nfl');
    const [results, setResults] = useState<SearchableRule[]>([]);
    const navigate = useNavigate();
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    const performSearch = (q: string, s: string) => {
        if (q.length > 2) {
            setResults(searchRules(s as any, q));
        } else {
            setResults([]);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);
        performSearch(text, sport);
    };

    const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSport = e.target.value;
        setSport(newSport);
        performSearch(query, newSport);
    };

    const toggleBookmark = (item: SearchableRule) => {
        if (isPending(item.fullReference)) return;

        if (isBookmarked(item.sport, item.fullReference)) {
            removeBookmark(item.sport, item.fullReference);
        } else {
            addBookmark(item.sport, item.fullReference);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <select
                    value={sport}
                    onChange={handleSportChange}
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
                    <option value="nfl">NFL</option>
                    <option value="ncaa">NCAA</option>
                    <option value="nba">NBA</option>
                    <option value="mlb">MLB</option>
                    <option value="nhl">NHL</option>
                    <option value="soccer">Soccer</option>
                </select>
                <input
                    type="text"
                    name="search"
                    autoComplete="on"
                    placeholder={`Search ${sport.toUpperCase()} rules...`}
                    value={query}
                    onChange={handleSearch}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.map(item => {
                    const bookmarked = isBookmarked(item.sport, item.fullReference);
                    const pending = isPending(item.fullReference);

                    return (
                        <div key={`${item.sport}-${item.ruleId}-${item.sectionId}-${item.articleId}`} style={{
                            backgroundColor: 'var(--bg)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => navigate(`/rule/${item.sport}/${item.ruleId}/${item.sectionId}/${item.articleId}`)}
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
