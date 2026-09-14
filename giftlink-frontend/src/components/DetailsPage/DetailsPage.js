import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';
import './DetailsPage.css';

function DetailsPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [gift, setGift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const { isLoggedIn } = useAppContext();

    useEffect(() => {
        const authenticationToken = sessionStorage.getItem('auth-token');
        if (!authenticationToken) {
            // Task 1: Check for authentication and redirect
            navigate('/app/login');
            return;
        }

        // get the gift to be rendered on the details page
        const fetchGift = async () => {
            try {
                // Task 2: Fetch gift details
                const response = await fetch(`${urlConfig.backendUrl}/api/gifts/${productId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setGift(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`${urlConfig.backendUrl}/api/comments/${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setComments(data);
                }
            } catch (err) {
                console.warn('Could not load comments:', err.message);
            }
        };

        fetchGift();
        fetchComments();

        // Task 3: Scroll to top on component mount
        window.scrollTo(0, 0);

    }, [productId, navigate]);


    const handleBackClick = () => {
        // Task 4: Handle back click
        navigate(-1);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setCommentLoading(true);
        setCommentError(null);
        try {
            const authToken = sessionStorage.getItem('auth-token');
            const response = await fetch(`${urlConfig.backendUrl}/api/comments/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ comment: newComment }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to post comment');
            }

            const addedComment = await response.json();
            setComments((prev) => [...prev, addedComment]);
            setNewComment('');
        } catch (err) {
            setCommentError(err.message);
        } finally {
            setCommentLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Loading gift details...</p>
        </div>
    );
    if (error) return <div className="container mt-5"><div className="alert alert-danger">Error: {error}</div></div>;
    if (!gift) return <div className="container mt-5"><div className="alert alert-warning">Gift not found.</div></div>;

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-3" onClick={handleBackClick}>← Back</button>
            <div className="card product-details-card">
                <div className="card-header text-white">
                    <h2 className="details-title">{gift.name}</h2>
                </div>
                <div className="card-body">
                    <div className="image-placeholder-large">
                        {gift.image ? (
                            // Task 5: Display gift image
                            <img
                                src={gift.image}
                                alt={gift.name}
                                className="product-image-large"
                            />
                        ) : (
                            <div className="no-image-available-large">No Image Available</div>
                        )}
                    </div>

                    {/* Task 6: Display gift details */}
                    <p><strong>Category:</strong> {gift.category}</p>
                    <p><strong>Condition:</strong> {gift.condition}</p>
                    <p><strong>Date Added:</strong> {formatDate(gift.date_added)}</p>
                    <p><strong>Age (Years):</strong> {gift.age_years}</p>
                    <p><strong>Description:</strong> {gift.description}</p>
                </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section mt-4">
                <h3 className="mb-3">Comments</h3>

                {/* Task 7: Render comments section using map */}
                {comments.length === 0 ? (
                    <p className="text-muted">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={comment._id || index} className="card mb-3">
                            <div className="card-body">
                                <p className="comment-author"><strong>{comment.author}:</strong></p>
                                <p className="comment-text">{comment.comment}</p>
                                {comment.sentiment && (
                                    <small className={`badge ${comment.sentiment === 'positive' ? 'bg-success' : comment.sentiment === 'negative' ? 'bg-danger' : 'bg-secondary'}`}>
                                        {comment.sentiment}
                                    </small>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Add a comment */}
                {isLoggedIn ? (
                    <form onSubmit={handleCommentSubmit} className="mt-3">
                        <div className="mb-3">
                            <label htmlFor="new-comment" className="form-label">Add a Comment</label>
                            <textarea
                                id="new-comment"
                                className="form-control"
                                rows={3}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                required
                            />
                        </div>
                        {commentError && <div className="alert alert-danger">{commentError}</div>}
                        <button type="submit" className="btn btn-primary" disabled={commentLoading}>
                            {commentLoading ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>
                ) : (
                    <div className="alert alert-info mt-3">
                        Please <a href="/app/login">log in</a> to post a comment.
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailsPage;
