import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Container,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Task,
    AddTask,
    Group,
    Person,
    Logout,
    GridView,
    CalendarToday,
} from '@mui/icons-material';
import { authService } from '../services/auth';
import ThemeSwitcher from './ThemeSwitcher';

const drawerWidth = 280;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Tasks', icon: <Task />, path: '/tasks' },
        { text: 'Weekly Planner', icon: <CalendarToday />, path: '/weekly' },
        { text: 'Roles', icon: <Group />, path: '/roles' },
        { text: 'Profile', icon: <Person />, path: '/profile' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    LifeScope
                </Typography>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                            cursor: 'pointer',
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            ...(location.pathname === item.path && {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                            }),
                        }}
                    >
                        <ListItemIcon sx={{ 
                            color: location.pathname === item.path ? 'inherit' : 'primary.main' 
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem 
                    onClick={handleLogout} 
                    sx={{ 
                        cursor: 'pointer',
                        borderRadius: 1,
                        mx: 1,
                        mb: 1,
                        '&:hover': {
                            backgroundColor: 'error.main',
                            color: 'error.contrastText',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: 'error.main' }}>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{ 
                    width: { sm: `calc(100% - ${drawerWidth}px)` }, 
                    ml: { sm: `${drawerWidth}px` },
                    backdropFilter: 'blur(6px)',
                    backgroundColor: 'background.default',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            flexGrow: 1,
                            color: 'text.primary',
                            fontWeight: 600
                        }}
                    >
                        {menuItems.find(item => item.path === location.pathname)?.text || 'LifeScope'}
                    </Typography>
                    <ThemeSwitcher />
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            backgroundColor: 'background.default',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            backgroundColor: 'background.default',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px',
                    backgroundColor: 'background.default',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="lg">
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

export default Layout; 