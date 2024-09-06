import React, { useState, useEffect } from 'react';

const ManageChildren = ({ fetchChildren, children }) => {
    const [selectedChild, setSelectedChild] = useState(null);
    const [childName, setChildName] = useState('');
    const [exclusions, setExclusions] = useState('');
    const [snacks, setSnacks] = useState([]);

    const fetchSnacks = async (childId) => {
        try {
            const response = await fetch(`/get_snacks/${childId}`);
            const data = await response.json();
            if (response.ok) {
                setSnacks(data);
            } else {
                console.error('Error fetching snacks:', data.error);
            }
        } catch (error) {
            console.error('Error fetching snacks:', error);
        }
    };

    const handleSelectChild = (childId) => {
        setSelectedChild(childId);
        const child = children.find((c) => c.id === parseInt(childId));
        setChildName(child ? child.name : '');
        setExclusions(child ? child.exclusions : '');
        fetchSnacks(childId);
    };

    const handleDeleteSnack = async (snackId) => {
        try {
            const response = await fetch(`/delete_snack/${snackId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                alert('Snack deleted successfully');
                fetchSnacks(selectedChild);
            } else {
                console.error('Error deleting snack:', data.error);
            }
        } catch (error) {
            console.error('Error deleting snack:', error);
        }
    };

    // Other child management functions...

    return (
        <div>
            <h2>Manage Children</h2>
            <select onChange={(e) => handleSelectChild(e.target.value)}>
                <option value="">Select a child</option>
                {children.map((child) => (
                    <option key={child.id} value={child.id}>
                        {child.name}
                    </option>
                ))}
            </select>

            {/* Child management section... */}

            {selectedChild && (
                <div>
                    <h3>Saved Snacks</h3>
                    {snacks.length > 0 ? (
                        snacks.map((snack) => (
                            <div key={snack.id} className="snack-card">
                                <button className="delete-button" onClick={() => handleDeleteSnack(snack.id)}>X</button>
                                <img src={snack.image_url} alt="Snack" className="snack-image" />
                                <p>{snack.snack}</p>
                            </div>
                        ))
                    ) : (
                        <p>No snacks saved for this child.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageChildren;