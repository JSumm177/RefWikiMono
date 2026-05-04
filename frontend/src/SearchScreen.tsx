import React, { useState } from 'react';
import { searchRules } from './utils/search';
import type { SearchableRule } from './utils/search';

const SearchScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchableRule[]>([]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);
        if (text.length > 2) {
            setResults(searchRules(text));
        } else {
            setResults([]);
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
                {results.map(item => (
                    <div key={`${item.ruleId}-${item.sectionId}-${item.articleId}`} style={{
                        backgroundColor: 'var(--bg)',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ margin: '0 0 5px 0' }}>{item.ruleTitle} - {item.sectionTitle}</h3>
                        <div style={{ color: 'var(--text)', marginBottom: '5px' }}>{item.fullReference}</div>
                        <div style={{ color: 'var(--text-h)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.articleText}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchScreen;
