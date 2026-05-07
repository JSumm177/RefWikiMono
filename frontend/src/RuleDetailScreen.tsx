import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRuleByReference, getRuleByFullReference } from './utils/search';
import type { SearchableRule } from './utils/search';
import { BookmarkContext } from './BookmarkContext';
import relations from './assets/rule_relations.json';

const RuleDetailScreen: React.FC = () => {
    const { ruleId, sectionId, articleId } = useParams<{ ruleId: string; sectionId: string; articleId: string }>();
    const navigate = useNavigate();
    const [rule, setRule] = useState<SearchableRule | undefined>();
    const { isBookmarked, isPending, addBookmark, removeBookmark } = useContext(BookmarkContext);

    useEffect(() => {
        if (ruleId && sectionId && articleId) {
            const result = getRuleByReference(
                parseInt(ruleId, 10),
                parseInt(sectionId, 10),
                parseInt(articleId, 10)
            );
            setRule(result);
        }
    }, [ruleId, sectionId, articleId]);

    if (!rule) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Rule not found.</div>;
    }

    const key = `${rule.ruleId}-${rule.sectionId}-${rule.articleId}`;
    const relatedRefs = (relations as any)[key] || [];

    const bookmarked = isBookmarked(rule.fullReference);
    const pending = isPending(rule.fullReference);

    const toggleBookmark = () => {
        if (pending) return;
        if (bookmarked) {
            removeBookmark(rule.fullReference);
        } else {
            addBookmark(rule.fullReference);
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

            <h2 style={{ color: 'var(--text)', marginBottom: '20px' }}>{rule.sectionTitle}</h2>
            <p style={{ fontSize: '1.1em', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-h)' }}>
                {rule.articleText}
            </p>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <h3>Related Rules</h3>
                {relatedRefs.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No related rules found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {relatedRefs.map((ref: string) => {
                            const r = getRuleByFullReference(ref);
                            if (!r) return null;
                            return (
                                <Link
                                    key={ref}
                                    to={`/rule/${r.ruleId}/${r.sectionId}/${r.articleId}`}
                                    style={{ color: '#007BFF', textDecoration: 'none' }}
                                >
                                    • {ref}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RuleDetailScreen;
