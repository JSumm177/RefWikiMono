import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';

interface BookmarkContextType {
    bookmarks: string[];
    pendingReferences: string[];
    addBookmark: (fullReference: string) => Promise<void>;
    removeBookmark: (fullReference: string) => Promise<void>;
    isBookmarked: (fullReference: string) => boolean;
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
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [pendingReferences, setPendingReferences] = useState<string[]>([]);
    const { isAuthenticated } = useContext(AuthContext);

    const refreshBookmarks = async () => {
        if (!isAuthenticated) {
            setBookmarks([]);
            return;
        }

        try {
            const response = await fetch('/api/bookmarks/', {
                credentials: 'include' // Ensure cookies are sent
            });
            if (response.ok) {
                const data = await response.json();
                setBookmarks(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
        }
    };

    useEffect(() => {
        refreshBookmarks();
    }, [isAuthenticated]);

    const addBookmark = async (fullReference: string) => {
        if (!isAuthenticated || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch('/api/bookmarks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullReference }),
                credentials: 'include'
            });

            if (response.ok) {
                setBookmarks(prev => [...prev, fullReference]);
            }
        } catch (error) {
            console.error('Failed to add bookmark', error);
        } finally {
            setPendingReferences(prev => prev.filter(ref => ref !== fullReference));
        }
    };

    const removeBookmark = async (fullReference: string) => {
        if (!isAuthenticated || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch('/api/bookmarks/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullReference }),
                credentials: 'include'
            });

            if (response.ok || response.status === 204) {
                setBookmarks(prev => prev.filter(ref => ref !== fullReference));
            }
        } catch (error) {
            console.error('Failed to remove bookmark', error);
        } finally {
            setPendingReferences(prev => prev.filter(ref => ref !== fullReference));
        }
    };

    const isBookmarked = (fullReference: string) => {
        return bookmarks.includes(fullReference);
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
