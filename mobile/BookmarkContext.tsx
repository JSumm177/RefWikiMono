import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './utils/api';

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
                const data = await response.json();
                setBookmarks(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
        }
    };

    useEffect(() => {
        refreshBookmarks();
    }, [userToken]);

    const addBookmark = async (fullReference: string) => {
        if (!userToken || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookmarks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ fullReference }),
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
        if (!userToken || pendingReferences.includes(fullReference)) return;

        setPendingReferences(prev => [...prev, fullReference]);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookmarks/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ fullReference }),
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
