import React, { useState } from 'react';
import './ManageChildren.css';

const ManageChildren = ({ fetchChildren, children }) => {
    const [selectedChild, setSelectedChild] = useState(null);
    const [newName, setNewName] = useState('');
    const [newExclusions, setNewExclusions] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChildSelect = (child) => {
        setSelectedChild(child);
        setNewName(child.name);
        setNewExclusions(child.exclusions);
    };

    const handleUpdateChild = async () => {
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/update_child', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    child_id: selectedChild.id,
                    name: newName,
                    exclusions: newExclusions,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess('Child updated successfully!');
                fetchChildren(); // Refresh the list of children after update
            } else {
                throw new Error(data.error || 'Failed to update child');
            }
        } catch (error) {
            setError(error.message || 'Error updating child. Please try again.');
        }
    };

    return (
        <div>
            <h2>Manage Children</h2>
            {children.map((child) => (
                <div key={child.id}>
                    <button onClick={() => handleChildSelect(child)}>
                        Edit {child.name}
                    </button>
                </div>
            ))}

            {selectedChild && (
                <div>
                    <h3>Edit Child</h3>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Child's Name"
                    />
                    <textarea
                        value={newExclusions}
                        onChange={(e) => setNewExclusions(e.target.value)}
                        placeholder="Exclusions (comma separated)"
                    />
                    <button onClick={handleUpdateChild}>Update</button>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                </div>
            )}
        </div>
    );
};

export default ManageChildren;