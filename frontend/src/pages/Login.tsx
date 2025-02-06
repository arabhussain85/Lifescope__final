import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Box, Paper, Typography, TextField, Button, Alert, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { authService } from '../services/auth';
import { useColorMode } from '../contexts/ColorModeContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode } = useColorMode();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await authService.login(formData);
            if (response.access) {
                // Force a small delay to ensure token is set
                setTimeout(() => {
                    const from = (location.state as any)?.from?.pathname || '/dashboard';
                    navigate(from, { replace: true });
                }, 100);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
                        Welcome Back
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoFocus
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
                        <Button 
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                        >
                            Login
                        </Button>
                    </form>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            Don't have an account?{' '}
                            <Link 
                                to="/register"
                                style={{ 
                                    color: mode === 'dark' ? '#90caf9' : '#1976d2',
                                    textDecoration: 'none'
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 