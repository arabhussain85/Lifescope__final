import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Alert,
    CircularProgress,
    Tooltip,
    Chip,
    LinearProgress,
    Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { taskService } from '../services/api';
import { Role, TaskAnalytics } from '../types/task';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const RoleList: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
    const theme = useTheme();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const [rolesResponse, analyticsResponse] = await Promise.all([
                taskService.getRoles(),
                taskService.getAnalytics()
            ]);
            setRoles(rolesResponse.data);
            setAnalytics(analyticsResponse.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenDialog = (role?: Role) => {
        if (role) {
            setSelectedRole(role);
            setFormData({ name: role.name, description: role.description });
        } else {
            setSelectedRole(null);
            setFormData({ name: '', description: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRole(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async () => {
        try {
            if (selectedRole) {
                await taskService.updateRole(selectedRole.id, formData);
                setSuccessMessage('Role updated successfully');
            } else {
                await taskService.createRole(formData);
                setSuccessMessage('Role created successfully');
            }
            handleCloseDialog();
            fetchRoles();
        } catch (err) {
            console.error('Error saving role:', err);
            setError('Failed to save role');
        }
    };

    const handleDelete = async (roleId: number) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await taskService.deleteRole(roleId);
                setSuccessMessage('Role deleted successfully');
                fetchRoles();
            } catch (err) {
                console.error('Error deleting role:', err);
                setError('Failed to delete role');
            }
        }
    };

    const handleRoleClick = (roleId: number) => {
        navigate(`/tasks?role=${roleId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header section */}
            <Box sx={{ 
                mb: { xs: 3, sm: 4 }, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', sm: 'center' } 
            }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                        fontWeight: 'bold'
                    }}
                >
                    Roles
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedRole(null);
                        setFormData({ name: '', description: '' });
                        setOpenDialog(true);
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    Add Role
                </Button>
            </Box>

            {/* Role Cards */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {roles.map((role) => (
                    <Grid item xs={12} sm={6} md={4} key={role.id}>
                        <Paper
                            sx={{
                                p: { xs: 2, sm: 3 },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                background: theme.palette.mode === 'dark' 
                                    ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                mb: 2
                            }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        wordBreak: 'break-word',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                    }}
                                >
                                    {role.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(role)}
                                        sx={{ 
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.04)'
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(role.id)}
                                        sx={{ 
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255,0,0,0.05)'
                                                : 'rgba(255,0,0,0.04)'
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                    flexGrow: 1,
                                    wordBreak: 'break-word',
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                {role.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

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

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selectedRole ? 'Edit Role' : 'New Role'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Role Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedRole ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RoleList;