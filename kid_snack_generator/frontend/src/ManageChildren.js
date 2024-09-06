import React, { useState, useEffect } from 'react';

const ManageChildren = ({ fetchChildren, children }) => {
    const [selectedChild, setSelectedChild] = useState(null);
    const [childName, setChildName] = useState('');
    const [exclusions, setExclusions] = useState('');
    const [snacks, setSnacks] = useState([]);

    useEffect(() => {
        if (selectedChild) fetchSnacks(selectedChild);
    }, [selectedChild]);

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

    const handleAddChild = async () => {
        try {
            const response = await fetch('/api/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: childName, exclusions }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Child added successfully');
                fetchChildren();
                setChildName('');
                setExclusions('');
            } else {
                console.error('Error adding child:', data.error);
            }
        } catch (error) {
            console.error('Error adding child:', error);
        }
    };

    const handleUpdateChild = async () => {
        if (!selectedChild) return alert('No child selected for update.');

        try {
            const response = await fetch(`/api/children/${selectedChild}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: childName, exclusions }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Child updated successfully');
                fetchChildren();
            } else {
                console.error('Error updating child:', data.error);
            }
        } catch (error) {
            console.error('Error updating child:', error);
        }
    };

    const handleDeleteChild = async () => {
        if (!selectedChild) return alert('No child selected for deletion.');

        try {
            const response = await fetch(`/api/children/${selectedChild}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                alert('Child deleted successfully');
                fetchChildren();
                setSelectedChild(null);
                setChildName('');
                setExclusions('');
            } else {
                console.error('Error deleting child:', data.error);
            }
        } catch (error) {
            console.error('Error deleting child:', error);
        }
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

    return (
        <div className="admin-container">
            <h2>Manage Children</h2>
            <div className="child-select">
                <select className="child-dropdown" onChange={(e) => handleSelectChild(e.target.value)}>
                    <option value="">Select a child</option>
                    {children.map((child) => (
                        <option key={child.id} value={child.id}>
                            {child.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Child Name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                />
                <input
                    type="text"
                    className="input-field"
                    placeholder="Exclusions"
                    value={exclusions}
                    onChange={(e) => setExclusions(e.target.value)}
                />
            </div>

            <div className="button-group">
                <button className="action-button add-button" onClick={handleAddChild}>Add Child</button>
                <button className="action-button update-button" onClick={handleUpdateChild}>Update Child</button>
                <button className="action-button delete-button" onClick={handleDeleteChild}>Delete Child</button>
            </div>

            {selectedChild && (
                <div className="snacks-section">
                    <h3>Saved Snacks</h3>
                    <div className="snack-card-container">
                        {snacks.length > 0 ? (
                            snacks.map((snack) => (
                                <div key={snack.id} className="snack-card-wrapper">
                                    <div className="snack-card">
                                        <button className="delete-button" onClick={() => handleDeleteSnack(snack.id)}>X</button>
                                        <img src={snack.image_url} alt="Snack" className="snack-image" />
                                        <p>{snack.snack}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No snacks saved for this child.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageChildren;