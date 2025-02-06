import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, Paper, Typography, TextField, Button, Alert, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { authService } from '../services/auth';
import { useColorMode } from '../contexts/ColorModeContext';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useColorMode();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await authService.register(formData);
            if (response.access) {
                // Force a small delay to ensure token is set
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 100);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 
                    Object.values(err.response?.data || {}).flat().join(', ') ||
                    'Registration failed');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center' 
            }}>
                <IconButton 
                    onClick={() => navigate('/')}
                    sx={{ position: 'absolute', top: 20, left: 20 }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Paper 
                    elevation={mode === 'dark' ? 2 : 1}
                    sx={{ 
                        p: 4, 
                        backgroundColor: mode === 'dark' ? 'background.paper' : 'background.default'
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Create Account
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="password2"
                            type="password"
                            value={formData.password2}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                        >
                            Register
                        </Button>
                    </form>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            Already have an account?{' '}
                            <Link 
                                to="/login"
                                style={{ 
                                    color: mode === 'dark' ? '#90caf9' : '#1976d2',
                                    textDecoration: 'none'
                                }}
                            >
                                Login
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register; 