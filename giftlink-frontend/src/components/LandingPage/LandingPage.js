import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="container text-center mt-5">
            <div className="py-5">
                <h1 className="display-3 fw-bold">🎁 GiftLink</h1>

                <h3 className="mt-3">
                    Give what you don't need. Find what you do.
                </h3>

                <p className="lead mt-4">
                    GiftLink connects people who want to give away useful
                    household items with people who can give those items
                    a new home.
                </p>

                <button
                    className="btn btn-primary btn-lg mt-4"
                    onClick={() => navigate("/app")}
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}

export default LandingPage;