import React from 'react';
import { AppBar, Toolbar, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

interface LandingNavProps {
  darkMode: boolean;
  handleThemeToggle: () => void;
}

const LandingNav: React.FC<LandingNavProps> = ({ darkMode, handleThemeToggle }) => {
  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0}
      sx={{ 
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}
            >
              LifeScope
            </Button>
          </Link>
        </Box>
        <ThemeSwitcher />
        <Box sx={{ ml: 2 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" sx={{ mr: 1 }}>
              Login
            </Button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="contained">
              Sign Up
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default LandingNav; 