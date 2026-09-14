import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';

function MainPage() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Task 1: Write async fetch operation
        const fetchGifts = async () => {
            try {
                const response = await fetch(`${urlConfig.backendUrl}/api/gifts`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setGifts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGifts();
    }, []);

    // Task 2: Navigate to details page
    const goToDetailsPage = (productId) => {
        navigate(`/app/gift/${productId}`);
    };

    // Task 3: Format timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getConditionClass = (condition) => {
        return condition === "New" ? "list-group-item-success" : "list-group-item-warning";
    };

    if (loading) return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading gifts...</p>
        </div>
    );

    if (error) return (
        <div className="container mt-5">
            <div className="alert alert-danger">Error: {error}</div>
        </div>
    );

    return (
        <div className="container mt-5">
            <h1 className="mb-4 text-center">Available Gifts</h1>
            {gifts.length === 0 ? (
                <div className="alert alert-info text-center">
                    No gifts available right now. Check back soon!
                </div>
            ) : (
                <div className="row">
                    {gifts.map((gift) => (
                        <div key={gift._id || gift.id} className="col-md-4 mb-4">
                            <div className="card product-card h-100">

                                {/* Task 4: Display gift image or placeholder */}
                                <div className="image-placeholder">
                                    {gift.image ? (
                                        <img
                                            src={gift.image}
                                            alt={gift.name}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="no-image-available">No Image Available</div>
                                    )}
                                </div>

                                <div className="card-body d-flex flex-column">

                                    {/* Task 5: Display gift name */}
                                    <h5 className="card-title custom-card-title">{gift.name}</h5>

                                    <p className={`card-text ${getConditionClass(gift.condition)}`}>
                                        {gift.condition}
                                    </p>

                                    {/* Task 6: Display date added */}
                                    <p className="card-text text-muted date-added mt-auto">
                                        <small>Posted: {formatDate(gift.date_added)}</small>
                                    </p>

                                    <button
                                        onClick={() => goToDetailsPage(gift._id || gift.id)}
                                        className="btn btn-primary mt-2"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MainPage;
