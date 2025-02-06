import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Grid,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
    Checkbox,
    CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { taskService } from '../services/api';
import { Task, Role } from '../types/task';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    CheckCircle as CheckCircleIcon,
    ArrowForward as MoveIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NewTask {
    title: string;
    description: string;
    due_date: Date | null;
    role: string;
    priority: string;
    recurrence: string;
}

const WeeklyTasks: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [newTask, setNewTask] = useState<NewTask>({
        title: '',
        description: '',
        due_date: null,
        role: '',
        priority: '2',
        recurrence: '',
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const start = startOfWeek(selectedDate);
        const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        setWeekDays(days);
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, rolesRes] = await Promise.all([
                taskService.getTasks(),
                taskService.getRoles(),
            ]);
            const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : [];
            console.log('Fetched tasks:', tasksData);
            setTasks(tasksData);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setTasks([]);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        try {
            if (!newTask.due_date || !newTask.role) return;

            const taskData = {
                title: newTask.title,
                description: newTask.description,
                status: 'not_started',
                priority: parseInt(newTask.priority),
                role: parseInt(newTask.role),
                due_date: format(newTask.due_date, "yyyy-MM-dd'T'HH:mm:ss"),
                scheduled_date: format(newTask.due_date, 'yyyy-MM-dd'),
                recurrence: newTask.recurrence || null
            };

            await taskService.createTask(taskData);
            setOpenDialog(false);
            setNewTask({
                title: '',
                description: '',
                due_date: null,
                role: '',
                priority: '2',
                recurrence: '',
            });
            await fetchData();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleToggleComplete = async (taskId: number) => {
        try {
            await taskService.toggleTaskComplete(taskId);
            fetchData();
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await taskService.deleteTask(taskId);
            fetchData();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getTasksForDay = (date: Date) => {
        if (!Array.isArray(tasks)) {
            console.error('Tasks is not an array:', tasks);
            return [];
        }
        return tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
    };

    const handleMoveTask = async (task: Task, targetDate: Date) => {
        try {
            await taskService.updateTask(task.id, {
                ...task,
                due_date: format(targetDate, "yyyy-MM-dd'T'HH:mm:ss"),
                scheduled_date: format(targetDate, 'yyyy-MM-dd')
            });
            await fetchData();
        } catch (error) {
            console.error('Error moving task:', error);
        }
    };

    const handleAddTask = () => {
        navigate('/tasks/new', { 
            state: { 
                initialDate: selectedDay 
            } 
        });
    };

    const renderDayTasks = (date: Date) => {
        const dayTasks = getTasksForDay(date);
        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

        return (
            <Paper 
                sx={{ 
                    p: 2, 
                    height: '100%', 
                    minHeight: 200,
                    border: isToday ? 2 : 0,
                    borderColor: 'primary.main',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        {format(date, 'EEEE, MMM d')}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddTask}
                    >
                        Add Task
                    </Button>
                </Box>
                {dayTasks.map(task => (
                    <Paper
                        key={task.id}
                        sx={{
                            p: 1,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: task.is_completed ? 'action.selected' : 'background.paper',
                            textDecoration: task.is_completed ? 'line-through' : 'none',
                        }}
                    >
                        <Checkbox
                            checked={task.is_completed}
                            onChange={() => handleToggleComplete(task.id)}
                            icon={<CheckCircleIcon />}
                            checkedIcon={<CheckCircleIcon color="success" />}
                        />
                        <Box flex={1}>
                            <Typography variant="body1">{task.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {task.description}
                            </Typography>
                        </Box>
                        <Box>
                            <Tooltip title="Move to Next Day">
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleMoveTask(task, addDays(date, 1))}
                                    color="primary"
                                >
                                    <MoveIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Task">
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteTask(task.id)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                ))}
            </Paper>
        );
    };

    return (
        <Container maxWidth="xl">
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Typography variant="h4" gutterBottom>
                    Weekly Task Planner
                </Typography>
            )}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateCalendar
                                value={selectedDate}
                                onChange={(newDate) => setSelectedDate(newDate || new Date())}
                            />
                        </LocalizationProvider>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                        {weekDays.map((day) => (
                            <Grid item xs={12} key={day.toString()}>
                                {renderDayTasks(day)}
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            {/* Create Task Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="Due Date"
                                    value={newTask.due_date}
                                    onChange={(date) => setNewTask({ ...newTask, due_date: date })}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Role"
                                value={newTask.role}
                                onChange={(e) => setNewTask({ ...newTask, role: e.target.value })}
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
                                select
                                fullWidth
                                label="Priority"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
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
                                label="Recurrence"
                                value={newTask.recurrence}
                                onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
                            >
                                <MenuItem value="">No Recurrence</MenuItem>
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateTask} variant="contained" color="primary">
                        Create Task
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default WeeklyTasks; 