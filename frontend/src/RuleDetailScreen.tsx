import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRuleById } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';

const RuleDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [rule, setRule] = useState<SearchableRule | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            getRuleById(parseInt(id, 10)).then(result => {
                setRule(result);
                setIsLoading(false);
            });
        }
    }, [id]);

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading rule...</div>;
    }

    if (!rule) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Rule not found.</div>;
    }

    const bookmarked = isBookmarked(rule.sport, rule.fullReference);
    const pending = isPending(rule.fullReference);

    const toggleBookmark = () => {
        if (pending) return;
        if (bookmarked) {
            removeBookmark(rule.sport, rule.fullReference);
        } else {
            addBookmark(rule.sport, rule.fullReference, rule.id);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '20px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    color: 'var(--text-h)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                ← Back
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h1 style={{ margin: 0 }}>{rule.ruleTitle}</h1>
                <button
                    onClick={toggleBookmark}
                    disabled={pending}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '32px',
                        cursor: pending ? 'not-allowed' : 'pointer',
                        color: bookmarked ? '#FFC107' : '#ccc',
                    }}
                >
                    {pending ? '...' : (bookmarked ? '★' : '☆')}
                </button>
            </div>

            <h2 style={{ color: 'var(--text)', marginBottom: '20px' }}>{rule.sectionTitle} ({rule.sport})</h2>
            <p style={{ fontSize: '1.1em', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-h)' }}>
                {rule.articleText}
            </p>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <h3>Related Rules</h3>
                <p style={{ color: '#666', fontStyle: 'italic' }}>Note: Search the new database to find more rules!</p>
            </div>
        </div>
    );
};

export default RuleDetailScreen;
