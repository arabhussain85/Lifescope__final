import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Task, Role, TaskCategory } from '../types/task';
import { taskService } from '../services/api';
import { format } from 'date-fns';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Task>) => void;
    initialData?: Task;
    selectedDate?: Date;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, onSubmit, initialData, selectedDate }) => {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        status: 'not_started',
        priority: 2,
        due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        estimated_hours: 0,
        role: '',
        quadrant: '',
        ...initialData
    });
    const [roles, setRoles] = useState<Role[]>([]);
    const [categories, setCategories] = useState<TaskCategory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFormData();
        if (initialData) {
            setFormData(initialData);
        } else if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                due_date: format(selectedDate, 'yyyy-MM-dd')
            }));
        }
    }, [initialData, selectedDate]);

    const loadFormData = async () => {
        try {
            const [rolesRes, categoriesRes] = await Promise.all([
                taskService.getRoles(),
                taskService.getCategories()
            ]);
            setRoles(rolesRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting task:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {initialData ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
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
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={4}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    {roles.map(role => (
                                        <MenuItem key={role.id} value={role.id}>
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Quadrant</InputLabel>
                                <Select
                                    name="quadrant"
                                    value={formData.quadrant || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="q1">Q1: Urgent & Important</MenuItem>
                                    <MenuItem value="q2">Q2: Not Urgent & Important</MenuItem>
                                    <MenuItem value="q3">Q3: Urgent & Not Important</MenuItem>
                                    <MenuItem value="q4">Q4: Not Urgent & Not Important</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority || 2}
                                    onChange={handleChange}
                                >
                                    <MenuItem value={1}>High</MenuItem>
                                    <MenuItem value={2}>Medium</MenuItem>
                                    <MenuItem value={3}>Low</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status || 'not_started'}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="not_started">Not Started</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label="Due Date"
                                value={formData.due_date ? new Date(formData.due_date) : null}
                                onChange={(newValue) => {
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        due_date: newValue ? format(newValue, "yyyy-MM-dd'T'HH:mm:ss") : null 
                                    }));
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Estimated Hours"
                                name="estimated_hours"
                                type="number"
                                value={formData.estimated_hours}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.5 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TaskForm; 