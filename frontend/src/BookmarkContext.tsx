import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';

interface Bookmark {
    sport: string;
    fullReference: string;
}

interface BookmarkContextType {
    bookmarks: Bookmark[];
    pendingReferences: string[];
    addBookmark: (sport: string, fullReference: string) => Promise<void>;
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
    const { isAuthenticated } = useContext(AuthContext);

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
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
        }
    };

    useEffect(() => {
        refreshBookmarks();
    }, [isAuthenticated]);

    const addBookmark = async (sport: string, fullReference: string) => {
        if (!isAuthenticated || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch('/api/bookmarks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sport, fullReference }),
                credentials: 'include'
            });

            if (response.ok) {
                setBookmarks(prev => [...prev, { sport, fullReference }]);
            }
        } catch (error) {
            console.error('Failed to add bookmark', error);
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
