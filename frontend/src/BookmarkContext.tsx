import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';

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
    error: string | null;
    clearError: () => void;
}

export const BookmarkContext = createContext<BookmarkContextType>({
    bookmarks: [],
    pendingReferences: [],
    addBookmark: async () => {},
    removeBookmark: async () => {},
    isBookmarked: () => false,
    isPending: () => false,
    refreshBookmarks: async () => {},
    error: null,
    clearError: () => {},
});

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [pendingReferences, setPendingReferences] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useContext(AuthContext);

    const clearError = () => setError(null);

    const refreshBookmarks = async () => {
        if (!isAuthenticated) {
            setBookmarks([]);
            return;
        }

        try {
            const response = await fetch('/api/bookmarks/', {
                credentials: 'include'
            });
            if (response.ok) {
                const text = await response.text();
                if (text) {
                    setBookmarks(JSON.parse(text));
                } else {
                    setBookmarks([]);
                }
            } else {
                setError('Failed to fetch bookmarks from server.');
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
            setError('Network error: Could not reach the server.');
        }
    };

    useEffect(() => {
        refreshBookmarks();
    }, [isAuthenticated]);

    const addBookmark = async (sport: string, fullReference: string, articleId?: number) => {
        if (!isAuthenticated || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch('/api/bookmarks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sport, fullReference, articleId }),
                credentials: 'include'
            });

            if (response.ok) {
                setBookmarks(prev => [...prev, { sport, fullReference, articleId }]);
            } else {
                setError(`Failed to add bookmark: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to add bookmark', error);
            setError('Network error: Could not add bookmark.');
        } finally {
            setPendingReferences(prev => prev.filter(ref => ref !== fullReference));
        }
    };

    const removeBookmark = async (sport: string, fullReference: string) => {
        if (!isAuthenticated || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch('/api/bookmarks/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sport, fullReference }),
                credentials: 'include'
            });

            if (response.ok || response.status === 204) {
                setBookmarks(prev => prev.filter(b => b.fullReference !== fullReference || b.sport !== sport));
            } else {
                setError(`Failed to remove bookmark: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to remove bookmark', error);
            setError('Network error: Could not remove bookmark.');
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
            refreshBookmarks,
            error,
            clearError
        }}>
            {children}
        </BookmarkContext.Provider>
    );
};
