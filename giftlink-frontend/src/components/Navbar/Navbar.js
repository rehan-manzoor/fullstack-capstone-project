import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AuthContext';

export default function Navbar() {
    const { isLoggedIn, setIsLoggedIn, userName, setUserName } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('email');
        setIsLoggedIn(false);
        setUserName('');
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className="navbar-brand" to="/">🎁 GiftLink</Link>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
                {/* Task 1: Add links to Home and Gifts below */}
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/app/search">Search</Link>
                    </li>
                </ul>

                <ul className="navbar-nav ms-auto">
                    {isLoggedIn ? (
                        <>
                            <li className="nav-item">
                                <span className="nav-link text-muted">Hi, {userName}</span>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/app/profile">Profile</Link>
                            </li>
                            <li className="nav-item">
                                <button
                                    className="nav-link logout-btn btn btn-link"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link login-btn" to="/app/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/app/register">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
