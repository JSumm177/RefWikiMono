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
        <div className="form-container" style={{ maxWidth: '800px', padding: '32px 20px' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-h)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    Rulebook Search
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                    Instantly browse and search across major sports rulebooks
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '140px' }}>
                    <select
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        className="form-input-field"
                        style={{
                            cursor: 'pointer',
                            appearance: 'none',
                            paddingRight: '32px',
                        }}
                    >
                        <option value="NFL">NFL</option>
                        <option value="NCAA">NCAA</option>
                        <option value="NBA">NBA</option>
                        <option value="MLB">MLB</option>
                        <option value="NHL">NHL</option>
                        <option value="MLS">MLS (Soccer)</option>
                    </select>
                    <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                        fontSize: '0.8rem'
                    }}>▼</span>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder={`Search ${sport} rules by title, section, or keyword...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="form-input-field"
                        style={{ paddingLeft: '40px' }}
                    />
                    <span style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        pointerEvents: 'none'
                    }}>🔍</span>
                </div>
            </div>

            {isSearching && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {results.map(item => {
                    const bookmarked = isBookmarked(item.sport, item.fullReference);
                    const pending = isPending(item.fullReference);

                    return (
                        <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => navigate(`/rule/${item.id}`)}
                                >
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-h)', transition: 'color 0.2s' }} className="rule-title-hover">
                                        {item.ruleTitle} - {item.sectionTitle}
                                    </h3>
                                    <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {item.sport} • {item.fullReference}
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleBookmark(item)}
                                    disabled={pending}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '22px',
                                        cursor: pending ? 'not-allowed' : 'pointer',
                                        color: bookmarked ? 'oklch(78% 0.16 85)' : 'var(--text-muted)',
                                        padding: '4px',
                                        marginLeft: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '36px',
                                        transition: 'color 0.2s, transform 0.1s'
                                    }}
                                    className="bookmark-star-btn"
                                >
                                    {pending ? (
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
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
                            <div style={{ color: 'var(--text-h)', fontSize: '0.95rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.articleText}
                            </div>
                        </div>
                    );
                })}
                {!isSearching && query.length > 2 && results.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No rules found matching "{query}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchScreen;
