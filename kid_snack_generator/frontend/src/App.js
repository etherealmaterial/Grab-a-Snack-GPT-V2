import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import ManageChildren from './ManageChildren';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
    const [children, setChildren] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [snack, setSnack] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSnackSaved, setIsSnackSaved] = useState(false);
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);
    const [snackExists, setSnackExists] = useState(false);

    // Fetch the list of children
    const fetchChildren = async () => {
        try {
            const response = await fetch('/api/children');
            if (response.ok) {
                const data = await response.json();
                setChildren(data);
            } else {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            setError('Error fetching children.');
        }
    };

    useEffect(() => {
        fetchChildren(); // Fetch children when the component mounts
    }, []);

    // Handle generating a snack
    const handleGetSnack = async () => {
        setLoading(true);
        setError('');
        setSnack('');
        setImage('');
        setIsSnackSaved(false);
        setDoNotShowAgain(false);
        try {
            const response = await fetch('/get_snack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ children: selectedChildren }),
            });

            const data = await response.json();
            if (response.ok && data.snack) {
                setSnack(data.snack);
                setImage(data.image_url);
                setSnackExists(data.exists); // Check if snack already exists
            } else {
                throw new Error(data.error || 'Failed to generate snack');
            }
        } catch (error) {
            setError(error.message || 'Error generating snack. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle saving a snack
    const handleSaveSnack = async (e) => {
        e.stopPropagation();
        if (isSnackSaved) return; // Prevent duplicate saves

        try {
            const response = await fetch('/save_snack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    child_id: selectedChildren[0], // Assuming you are saving for the first selected child
                    snack: snack,
                    image_url: image,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setIsSnackSaved(true); // Mark as saved
            } else {
                console.error('Error saving snack:', data.error);
            }
        } catch (error) {
            console.error('Error saving snack:', error);
        }
    };

    // Handle deleting a snack
    const handleDeleteSnack = async (e) => {
        e.stopPropagation();
        alert('Snack deleted'); // Placeholder alert; replace with delete logic
    };

    // Handle "do not show again"
    const handleDoNotShowAgain = () => {
        setDoNotShowAgain(true);
        // Add logic to save this preference in the backend if needed
    };

    return (
        <Router>
            <div className="App container">
                <h1 className="header text-center">Kid Snack Generator</h1>
                <Routes>
                    <Route
                        path="/admin"
                        element={<ManageChildren fetchChildren={fetchChildren} children={children} />}
                    />

                    <Route
                        path="/"
                        element={
                            <div>
                                <div className="form-container mb-4">
                                    <label htmlFor="children">Select Children:</label>
                                    <select
                                        id="children"
                                        className="form-select"
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
                                    <button onClick={handleGetSnack} className="btn btn-success w-100 mt-3" disabled={loading}>
                                        {loading ? 'Generating...' : 'Get a Snack'}
                                    </button>
                                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                                </div>

                                {snack && !doNotShowAgain && (
                                    <div className="card mb-4 position-relative">
                                        <div className="card-body">
                                            <button className="btn-close position-absolute top-0 end-0" aria-label="Close" onClick={handleDeleteSnack}></button>
                                            <img src={image} alt="Snack" className="card-img-top rounded mb-3" />
                                            <h2 className="card-title">Suggested Snack:</h2>
                                            <p className="card-text">{snack}</p>
                                            {snackExists && <p className="text-muted">People are loving this snack! Check it out in your saved snacks.</p>}
                                            <button className="btn btn-success w-100 mb-2" onClick={handleSaveSnack}>Save Snack</button>
                                            <button className="btn btn-warning w-100" onClick={handleDoNotShowAgain}>Do Not Show Again</button>
                                        </div>
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