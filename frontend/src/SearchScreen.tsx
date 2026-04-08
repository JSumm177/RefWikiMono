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
                placeholder="Search rules (e.g., Holding)"
                value={query}
                onChange={handleSearch}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    marginBottom: '20px',
                    boxSizing: 'border-box'
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.map(item => (
                    <div key={`${item.ruleId}-${item.sectionId}-${item.articleId}`} style={{
                        backgroundColor: '#f9f9f9',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ margin: '0 0 5px 0' }}>{item.ruleTitle} - {item.sectionTitle}</h3>
                        <div style={{ color: '#555', marginBottom: '5px' }}>{item.fullReference}</div>
                        <div style={{ color: '#333', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.articleText}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchScreen;
