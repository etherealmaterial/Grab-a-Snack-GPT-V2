import React, { useState, useEffect } from 'react';
import './App.css';
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
        setIsSnackSaved(false);  // Reset the saved state
        setDoNotShowAgain(false); // Reset the do not show again state
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
        e.stopPropagation(); // Prevent triggering other click events
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
        e.stopPropagation(); // Prevent triggering other click events
        // Implement the delete snack logic
        alert('Snack deleted'); // Placeholder alert; replace with delete logic
    };

    // Handle "do not show again"
    const handleDoNotShowAgain = () => {
        setDoNotShowAgain(true);
        // Add logic to save this preference in the backend if needed
    };

    return (
        <Router>
            <div className="App">
                <h1 className="header">Kid Snack Generator</h1>
                <Routes>
                    <Route
                        path="/admin"
                        element={<ManageChildren fetchChildren={fetchChildren} children={children} />}
                    />

                    <Route
                        path="/"
                        element={
                            <div className="mx-auto">
                                <div className="form-container mx-auto">
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

                                {snack && !doNotShowAgain && (
                                    <div className="snack-card-wrapper mx-auto">
                                        <div className={`snack-card ${snackExists ? 'highlight-snack' : ''}`} onClick={handleSaveSnack}>
                                            <button className="delete-button" onClick={handleDeleteSnack}>X</button>
                                            <img src={image} alt="Snack" className="snack-image" />
                                            <h2>Suggested Snack:</h2>
                                            <p>{snack}</p>
                                            {snackExists && <p>People are loving this snack! Check it out in your saved snacks.</p>}
                                            <button className="save-snack-button" onClick={(e) => handleSaveSnack(e)}>Save Snack</button>
                                            <button className="do-not-show-button" onClick={handleDoNotShowAgain}>Do Not Show Again</button>
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