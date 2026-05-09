import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './utils/api';

interface Bookmark {
    sport: string;
    fullReference: string;
    articleId?: number;
}

interface BookmarkContextType {
    bookmarks: Bookmark[];
    pendingReferences: string[];
    addBookmark: (sport: string, fullReference: string, articleId?: number) => Promise<void>;
    removeBookmark: (sport: string, fullReference: string) => Promise<void>;
    isBookmarked: (sport: string, fullReference: string) => boolean;
    isPending: (fullReference: string) => boolean;
    refreshBookmarks: () => Promise<void>;
}

export const BookmarkContext = createContext<BookmarkContextType>({
    bookmarks: [],
    pendingReferences: [],
    addBookmark: async () => {},
    removeBookmark: async () => {},
    isBookmarked: () => false,
    isPending: () => false,
    refreshBookmarks: async () => {},
});

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [pendingReferences, setPendingReferences] = useState<string[]>([]);
    const { userToken } = useContext(AuthContext);

    const refreshBookmarks = async () => {
        if (!userToken) {
            setBookmarks([]);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/bookmarks/`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            if (response.ok) {
                const text = await response.text();
                if (text) {
                    setBookmarks(JSON.parse(text));
                } else {
                    setBookmarks([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
        }
    };

    useEffect(() => {
        refreshBookmarks();
    }, [userToken]);

    const addBookmark = async (sport: string, fullReference: string, articleId?: number) => {
        if (!userToken || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookmarks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ sport, fullReference, articleId }),
            });

            if (response.ok) {
                setBookmarks(prev => [...prev, { sport, fullReference, articleId }]);
            }
        } catch (error) {
            console.error('Failed to add bookmark', error);
        } finally {
            setPendingReferences(prev => prev.filter(ref => ref !== fullReference));
        }
    };

    const removeBookmark = async (sport: string, fullReference: string) => {
        if (!userToken || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookmarks/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ sport, fullReference }),
            });

            if (response.ok || response.status === 204) {
                setBookmarks(prev => prev.filter(b => b.fullReference !== fullReference || b.sport !== sport));
            }
        } catch (error) {
            console.error('Failed to remove bookmark', error);
        } finally {
            setPendingReferences(prev => prev.filter(ref => ref !== fullReference));
        }
    };

    const isBookmarked = (sport: string, fullReference: string) => {
        return bookmarks.some(b => b.fullReference === fullReference && b.sport === sport);
    };

    const isPending = (fullReference: string) => {
        return pendingReferences.includes(fullReference);
    };

    return (
        <BookmarkContext.Provider value={{
            bookmarks,
            pendingReferences,
            addBookmark,
            removeBookmark,
            isBookmarked,
            isPending,
            refreshBookmarks
        }}>
            {children}
        </BookmarkContext.Provider>
    );
};
