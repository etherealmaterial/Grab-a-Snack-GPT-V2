import React, { useState, useEffect } from 'react';
import './ManageChildren.css';

const ManageChildren = ({ fetchChildren }) => {
    const [children, setChildren] = useState([]);
    const [childName, setChildName] = useState('');
    const [childExclusions, setChildExclusions] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchChildren(); // Use the prop function to fetch children
    }, [fetchChildren]);

    const handleAddChild = async () => {
        if (!childName) {
            setError('Child name is required');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: childName, exclusions: childExclusions }),
            });

            if (!response.ok) throw new Error('Failed to add child');

            setSuccess('Child added successfully');
            fetchChildren(); // Refresh the list using prop function
            setChildName('');
            setChildExclusions('');
        } catch (err) {
            setError('Error adding child. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChild = async (id) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`/api/children/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete child');

            setSuccess('Child deleted successfully');
            fetchChildren(); // Refresh the list using prop function
        } catch (err) {
            setError('Error deleting child. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateChild = async (id, name, exclusions) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`/api/children/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, exclusions }),
            });

            if (!response.ok) throw new Error('Failed to update child');

            setSuccess('Child updated successfully');
            fetchChildren(); // Refresh the list using prop function
        } catch (err) {
            setError('Error updating child. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manage-children">
            <h2>Manage Children</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <div className="form-container">
                <input
                    type="text"
                    placeholder="Child Name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Ingredient Exclusions (comma-separated)"
                    value={childExclusions}
                    onChange={(e) => setChildExclusions(e.target.value)}
                />
                <button onClick={handleAddChild} disabled={loading}>
                    {loading ? 'Saving...' : 'Add Child'}
                </button>
            </div>
            <div className="children-list">
                {children.map((child) => (
                    <div key={child.id} className="child-item">
                        <div>
                            <strong>{child.name}</strong> - {child.exclusions || 'No exclusions'}
                        </div>
                        <div>
                            <button onClick={() => handleDeleteChild(child.id)}>Delete</button>
                            <button onClick={() => handleUpdateChild(child.id, child.name, child.exclusions)}>
                                Update
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageChildren;