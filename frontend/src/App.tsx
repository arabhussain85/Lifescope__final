import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';
import { ColorModeProvider, useColorMode } from './contexts/ColorModeContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import RoleList from './pages/RoleList';
import Profile from './pages/Profile';
import WeeklyTasks from './pages/WeeklyTasks';

const AppContent = () => {
    const { mode } = useColorMode();
    const theme = React.useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Direct Routes without PrivateRoute */}
                        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                        <Route path="/tasks" element={<Layout><TaskList /></Layout>} />
                        <Route path="/tasks/new" element={<Layout><TaskForm /></Layout>} />
                        <Route path="/tasks/:id" element={<Layout><TaskForm /></Layout>} />
                        <Route path="/roles" element={<Layout><RoleList /></Layout>} />
                        <Route path="/profile" element={<Layout><Profile /></Layout>} />
                        <Route path="/weekly" element={<Layout><WeeklyTasks /></Layout>} />

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

const App: React.FC = () => {
    return (
        <ColorModeProvider>
            <AppContent />
        </ColorModeProvider>
    );
};

export default App;
