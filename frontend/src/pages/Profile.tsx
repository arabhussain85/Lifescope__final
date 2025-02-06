import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Avatar
} from '@mui/material';
import { User } from '../types/task';
import { taskService } from '../services/api';

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await taskService.getUserProfile();
            setUser(response.data);
            setFormData(prev => ({
                ...prev,
                username: response.data.username,
                email: response.data.email
            }));
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.new_password && formData.new_password !== formData.confirm_password) {
                setError('New passwords do not match');
                return;
            }

            const updateData = {
                username: formData.username,
                email: formData.email,
                ...(formData.new_password && {
                    current_password: formData.current_password,
                    new_password: formData.new_password
                })
            };

            await taskService.updateUserProfile(updateData);
            setSuccessMessage('Profile updated successfully');
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));
            
            // Refresh user data
            fetchUserProfile();
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.detail || 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>Profile</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{ 
                            width: 100, 
                            height: 100, 
                            mr: 3,
                            bgcolor: 'primary.main',
                            fontSize: '2rem'
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5">{user?.username}</Typography>
                        <Typography color="textSecondary">{user?.email}</Typography>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        margin="normal"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        margin="normal"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Change Password</Typography>
                    <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        margin="normal"
                        value={formData.current_password}
                        onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        margin="normal"
                        value={formData.new_password}
                        onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        margin="normal"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    />

                    <Box sx={{ mt: 4 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                        >
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Profile; 