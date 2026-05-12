import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CallHistoryContext } from './CallHistoryContext';
import { BookmarkContext } from './BookmarkContext';
import { getRuleByFullReference } from './utils/search';
import StarredRules from './components/StarredRules';
import CallLog from './components/CallLog';

const Dashboard: React.FC = () => {
    const { calls } = useContext(CallHistoryContext);
    const { bookmarks, removeBookmark, isPending } = useContext(BookmarkContext);
    const navigate = useNavigate();

    const handleNavigateToRule = (ref: string) => {
        const rule = getRuleByFullReference(ref);
        if (rule) {
            navigate(`/rule/${rule.ruleId}/${rule.sectionId}/${rule.articleId}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <StarredRules
                bookmarks={bookmarks}
                isPending={isPending}
                removeBookmark={removeBookmark}
                onNavigateToRule={handleNavigateToRule}
            />

            <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '30px' }} />

            <CallLog calls={calls} />
        </div>
    );
};

export default Dashboard;
