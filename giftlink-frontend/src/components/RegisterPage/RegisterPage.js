import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';

function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setIsLoggedIn, setUserName } = useAppContext();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed.');
            }

            // Store auth info
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
                            <h2 className="card-title text-center mb-4">📝 Create Account</h2>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleRegister}>
                                <div className="mb-3">
                                    <label htmlFor="reg-name" className="form-label">Full Name</label>
                                    <input
                                        id="reg-name"
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="reg-email" className="form-label">Email address</label>
                                    <input
                                        id="reg-email"
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
                                    <label htmlFor="reg-password" className="form-label">Password</label>
                                    <input
                                        id="reg-password"
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="At least 6 characters"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="reg-confirm-password" className="form-label">Confirm Password</label>
                                    <input
                                        id="reg-confirm-password"
                                        type="password"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Repeat your password"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Register'}
                                </button>
                            </form>

                            <hr />
                            <p className="text-center mb-0">
                                Already have an account?{' '}
                                <Link to="/app/login">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
