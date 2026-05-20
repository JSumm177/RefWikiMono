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
        <header className="main-header">
            <div className="header-logo-container">
                <h2 className="header-logo">RefWiki</h2>
                <span className="header-logo-badge">Beta</span>
            </div>
            <nav className="header-nav">
                <Link to="/" className="nav-link">Live Log</Link>
                <Link to="/search" className="nav-link">Search</Link>
                <Link to="/community" className="nav-link">Community</Link>
                <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <Link to="/log-call" className="nav-link">Log Call</Link>
                <button
                    onClick={handleLogout}
                    className="btn-logout">
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default Header;
