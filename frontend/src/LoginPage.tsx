import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import type { AuthRequest, AuthResponse } from './api-types';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="form-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="form-card" style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
                <h2 className="form-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>RefWiki</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                    Log in to collaborate on game rules
                </p>

                {error && (
                    <div style={{
                        color: 'var(--c5)',
                        backgroundColor: 'oklch(from var(--c5) l c h / 0.1)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid oklch(from var(--c5) l c h / 0.2)',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
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

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
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
