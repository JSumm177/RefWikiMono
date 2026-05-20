import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import type { AuthRequest, AuthResponse } from './api-types';

const LoginPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sso' | 'credentials'>('sso');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Premium dynamic loading states
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');

    const navigate = useNavigate();
    const { login, loginWithProvider } = useContext(AuthContext);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLocalLoading(true);
        setLoadingStatus('Verifying credentials...');

        const requestBody: AuthRequest = { email, password };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Platform': 'web'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                login();
                navigate('/');
            } else {
                const data: AuthResponse = await response.json();
                setError(data.error || 'Login failed');
                setIsLocalLoading(false);
            }
        } catch (err) {
            setError('Network error');
            setIsLocalLoading(false);
        }
    };

    const handleSsoLogin = async (provider: 'google' | 'apple') => {
        setError('');
        setIsLocalLoading(true);
        setLoadingStatus(`Connecting securely to ${provider === 'google' ? 'Google' : 'Apple'}...`);

        try {
            await loginWithProvider(provider);
            navigate('/');
        } catch (err) {
            setError(`Unable to connect using ${provider === 'google' ? 'Google' : 'Apple'}.`);
            setIsLocalLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="form-card form-card-relative" style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
                
                {/* Premium Active Loader Overlay */}
                {isLocalLoading && (
                    <div className="auth-loading-overlay">
                        <div className="spinner"></div>
                        <p className="auth-loading-status micro-pulse">{loadingStatus}</p>
                    </div>
                )}

                {/* Brand Elevation */}
                <h2 className="header-logo" style={{ fontSize: '2.5rem', marginBottom: '8px', textAlign: 'center', width: '100%' }}>
                    RefWiki
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
                    Access the ultimate game officiating database
                </p>

                {/* Tab selector */}
                <div className="login-tab-container">
                    <button 
                        type="button"
                        onClick={() => { setError(''); setActiveTab('sso'); }}
                        className={`login-tab ${activeTab === 'sso' ? 'active' : ''}`}
                    >
                        Single Sign-On
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setError(''); setActiveTab('credentials'); }}
                        className={`login-tab ${activeTab === 'credentials' ? 'active' : ''}`}
                    >
                        Credentials
                    </button>
                </div>

                {/* Dynamic Error State */}
                {error && (
                    <div style={{
                        color: 'var(--c5)',
                        backgroundColor: 'oklch(from var(--c5) l c h / 0.08)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid oklch(from var(--c5) l c h / 0.15)',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'center',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {error}
                    </div>
                )}

                {/* SSO Content View */}
                {activeTab === 'sso' && (
                    <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
                        <div className="sso-buttons-container">
                            
                            {/* Google Sign In */}
                            <button 
                                type="button" 
                                onClick={() => handleSsoLogin('google')}
                                className="sso-button sso-google"
                            >
                                <svg viewBox="0 0 24 24" className="sso-icon" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                </svg>
                                Google
                            </button>

                            {/* Apple Sign In */}
                            <button 
                                type="button" 
                                onClick={() => handleSsoLogin('apple')}
                                className="sso-button sso-apple"
                            >
                                <svg viewBox="0 0 24 24" className="sso-icon" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.72-1.16 1.86-1.02 2.97 1.12.09 2.27-.61 2.97-1.42z"/>
                                </svg>
                                Apple
                            </button>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            Fastest access using your preferred external secure identity key. No extra passwords required.
                        </p>
                    </div>
                )}

                {/* Standard credentials login form */}
                {activeTab === 'credentials' && (
                    <form onSubmit={handleLogin} style={{ animation: 'fadeIn 0.25s ease-out' }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-input-field"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-input-field"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            Login
                        </button>
                    </form>
                )}

                {/* Footer Switcher */}
                <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/register')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline'
                        }}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
