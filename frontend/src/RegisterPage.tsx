import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthRequest, AuthResponse } from './api-types';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const requestBody: AuthRequest = { email, password };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data: AuthResponse = await response.json();

            if (response.ok) {
                setSuccess('Registration successful. You can now login.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="form-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="form-card" style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
                <h2 className="form-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>RefWiki</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                    Create an account to join the community
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

                {success && (
                    <div style={{
                        color: 'oklch(0.68 0.16 142)',
                        backgroundColor: 'oklch(0.68 0.16 142 / 0.1)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid oklch(0.68 0.16 142 / 0.2)',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input-field"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input-field"
                            placeholder="••••••••"
                        />
                        <small style={{ display: 'block', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                            Must be 8+ characters with a letter, number, and special character (e.g. !@#).
                        </small>
                    </div>
                    <button type="submit" className="btn-primary">
                        Register
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
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
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
