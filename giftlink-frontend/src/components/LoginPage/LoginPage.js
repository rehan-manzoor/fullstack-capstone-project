import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setIsLoggedIn, setUserName } = useAppContext();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed.');
            }

            // Store auth info in sessionStorage
            sessionStorage.setItem('auth-token', data.authToken);
            sessionStorage.setItem('name', data.userName);
            sessionStorage.setItem('email', data.userEmail);

            // Update global auth state
            setIsLoggedIn(true);
            setUserName(data.userName);

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">🔐 Login to GiftLink</h2>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label htmlFor="login-email" className="form-label">Email address</label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="login-password" className="form-label">Password</label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <hr />
                            <p className="text-center mb-0">
                                Don't have an account?{' '}
                                <Link to="/app/register">Register here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
