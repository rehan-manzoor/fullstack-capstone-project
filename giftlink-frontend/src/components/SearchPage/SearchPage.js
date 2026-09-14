import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';
import './SearchPage.css';

function SearchPage() {

    // Task 1: Define state variables for the search query, age range, and search results.
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [ageRange, setAgeRange] = useState(10);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    useEffect(() => {
        // fetch all products on initial load
        const fetchProducts = async () => {
            try {
                let url = `${urlConfig.backendUrl}/api/gifts`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`);
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);


    // Task 2. Fetch search results from the API based on user inputs.
    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('name', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedCondition) params.append('condition', selectedCondition);
            if (ageRange) params.append('age_years', ageRange);

            const url = `${urlConfig.backendUrl}/api/search?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const goToDetailsPage = (productId) => {
        // Task 6. Enable navigation to the details page of a selected gift.
        navigate(`/app/gift/${productId}`);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <h1 className="mb-4 text-center">Search Gifts</h1>

                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>
                        <div className="d-flex flex-column gap-2">
                            {/* Task 3: Dynamically generate category and condition dropdown options. */}
                            <div>
                                <label htmlFor="category-select" className="form-label">Category</label>
                                <select
                                    id="category-select"
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="condition-select" className="form-label">Condition</label>
                                <select
                                    id="condition-select"
                                    className="form-select"
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                >
                                    <option value="">All Conditions</option>
                                    {conditions.map((cond) => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Task 4: Implement an age range slider and display the selected value. */}
                            <div>
                                <label htmlFor="age-range" className="form-label">
                                    Max Age: <strong>{ageRange} year{ageRange !== 1 ? 's' : ''}</strong>
                                </label>
                                <input
                                    id="age-range"
                                    type="range"
                                    className="form-range"
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Task 7: Add text input field for search criteria */}
                    <div className="mb-3">
                        <label htmlFor="search-input" className="form-label">Search by name</label>
                        <input
                            id="search-input"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Lamp, Chair, Desk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Task 8: Implement search button with onClick event to trigger search */}
                    <button
                        className="btn btn-primary w-100 mb-4"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : '🔍 Search'}
                    </button>

                    {/* Task 5: Display search results and handle empty results with a message. */}
                    {hasSearched && searchResults.length === 0 && !loading && (
                        <div className="alert alert-warning text-center">
                            No gifts found matching your criteria. Try adjusting the filters.
                        </div>
                    )}

                    <div className="row">
                        {searchResults.map((gift) => (
                            <div key={gift._id || gift.id} className="col-md-6 mb-3">
                                <div className="card h-100 product-card">
                                    {gift.image && (
                                        <img
                                            src={gift.image}
                                            alt={gift.name}
                                            className="card-img-top"
                                            style={{ height: '160px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{gift.name}</h5>
                                        <p className="card-text text-muted mb-1">
                                            <small>Category: {gift.category}</small>
                                        </p>
                                        <p className="card-text text-muted mb-2">
                                            <small>Condition: {gift.condition} | Age: {gift.age_years} yrs</small>
                                        </p>
                                        <button
                                            className="btn btn-primary mt-auto"
                                            onClick={() => goToDetailsPage(gift._id || gift.id)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
