import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Header: React.FC = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#fff'
        }}>
            <div>
                <h2 style={{ margin: 0 }}>RefWiki</h2>
            </div>
            <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Live Log</Link>
                <Link to="/search" style={{ color: '#fff', textDecoration: 'none' }}>Search</Link>
                <Link to="/log-call" style={{ color: '#fff', textDecoration: 'none' }}>Log Call</Link>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default Header;
