import React from 'react';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
            }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h2" component="h1" gutterBottom>
                            Manage Your Tasks Effectively
                        </Typography>
                        <Typography variant="h5" color="textSecondary" paragraph>
                            Organize, prioritize, and track your tasks with our powerful task management system.
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{ mr: 2 }}
                            >
                                Login
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                size="large"
                                onClick={() => navigate('/register')}
                            >
                                Sign Up
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Add an illustration or image here */}
                        <img 
                            src="/task-management.svg" 
                            alt="Task Management" 
                            style={{ width: '100%', maxWidth: 500 }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default LandingPage; 