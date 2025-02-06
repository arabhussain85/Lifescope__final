import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
    Box,
} from '@mui/material';
import { Dashboard as QuadrantIcon } from '@mui/icons-material';
import { taskService } from '../services/api';
import { Task, Role, TaskCategory } from '../types/task';

const TaskForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const initialDate = location.state?.initialDate;
    const [roles, setRoles] = useState<Role[]>([]);
    const [categories, setCategories] = useState<TaskCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'not_started',
        priority: '2',
        quadrant: '',
        role: '',
        due_date: initialDate ? new Date(initialDate).toISOString().slice(0, 16) : '',
        estimated_hours: '0',
        actual_hours: '0'
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const rolesResponse = await taskService.getRoles();
                setRoles(rolesResponse.data);

                if (id) {
                    const taskResponse = await taskService.getTask(parseInt(id));
                    const task = taskResponse.data;
                    setFormData({
                        title: task.title,
                        description: task.description || '',
                        status: task.status,
                        priority: task.priority.toString(),
                        quadrant: task.quadrant || '',
                        role: task.role.toString(),
                        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
                        estimated_hours: task.estimated_hours.toString(),
                        actual_hours: task.actual_hours.toString()
                    });
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: parseInt(formData.priority),
                quadrant: formData.quadrant || null,
                role: parseInt(formData.role),
                due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
                estimated_hours: parseFloat(formData.estimated_hours) || 0,
                actual_hours: parseFloat(formData.actual_hours) || 0
            };

            if (id) {
                await taskService.updateTask(parseInt(id), taskData);
            } else {
                await taskService.createTask(taskData);
            }
            navigate('/tasks');
        } catch (err: any) {
            console.error('Error saving task:', err);
            setError(
                err.response?.data?.detail || 
                Object.values(err.response?.data || {}).flat().join(', ') ||
                'Failed to save task. Please check all required fields.'
            );
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {id ? 'Edit Task' : 'Create New Task'}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="1">High</MenuItem>
                            <MenuItem value="2">Medium</MenuItem>
                            <MenuItem value="3">Low</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Quadrant"
                            name="quadrant"
                            value={formData.quadrant}
                            onChange={handleChange}
                            margin="normal"
                        >
                            <MenuItem value="q1">Q1: Urgent & Important</MenuItem>
                            <MenuItem value="q2">Q2: Not Urgent & Important</MenuItem>
                            <MenuItem value="q3">Q3: Urgent & Not Important</MenuItem>
                            <MenuItem value="q4">Q4: Not Urgent & Not Important</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Due Date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Estimated Hours"
                            name="estimated_hours"
                            value={formData.estimated_hours}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: 0.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Actual Hours"
                            name="actual_hours"
                            value={formData.actual_hours}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: 0.5 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mr: 1 }}
                        >
                            {id ? 'Update Task' : 'Create Task'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/tasks')}
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default TaskForm; 