import React, { useState, useEffect } from 'react';
import './App.css';
import ManageChildren from './ManageChildren'; // Import the ManageChildren component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
    const [children, setChildren] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [snack, setSnack] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch the list of children
    const fetchChildren = async () => {
        try {
            const response = await fetch('/api/children');
            const data = await response.json();
            setChildren(data);
        } catch (error) {
            console.error('Error fetching children:', error);
        }
    };

    useEffect(() => {
        fetchChildren(); // Fetch children when the component mounts
    }, []);

    // Handle generating a snack
    const handleGetSnack = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/get_snack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ children: selectedChildren }),
            });

            const data = await response.json();
            if (data && data.snack) {
                setSnack(data.snack);
            }
        } catch (error) {
            setError('Error generating snack. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Router>
            <div className="App">
                <h1 className="header">Kid Snack Generator</h1>
                <Routes>
                    {/* Route for managing children */}
                    <Route path="/admin" element={<ManageChildren fetchChildren={fetchChildren} />} />

                    {/* Route for selecting children and getting a snack */}
                    <Route
                        path="/"
                        element={
                            <div>
                                <div className="form-container">
                                    <label htmlFor="children">Select Children:</label>
                                    <select
                                        id="children"
                                        multiple
                                        value={selectedChildren}
                                        onChange={(e) =>
                                            setSelectedChildren([...e.target.selectedOptions].map((option) => option.value))
                                        }
                                    >
                                        {children.map((child) => (
                                            <option key={child.id} value={child.id}>
                                                {child.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={handleGetSnack} disabled={loading}>
                                        {loading ? 'Generating...' : 'Get a Snack'}
                                    </button>
                                    {error && <div className="error">{error}</div>}
                                </div>

                                {snack && (
                                    <div className="snack-card snack-result">
                                        <h2>Suggested Snack:</h2>
                                        <p>{snack}</p>
                                    </div>
                                )}
                            </div>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;