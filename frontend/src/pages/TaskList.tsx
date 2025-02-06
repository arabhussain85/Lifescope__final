import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Button, 
    Grid, 
    TextField, 
    MenuItem, 
    CircularProgress, 
    Alert, 
    Card, 
    CardContent, 
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    IconButton,
    Checkbox,
    Tooltip,
    Divider,
    Collapse,
    useTheme,
    Chip,
    CardActions,
    LinearProgress,
} from '@mui/material';
import { taskService } from '../services/api';
import { Role, Task, TaskCategory } from '../types/task';
import { Add as AddIcon, PlayArrow as StartIcon, Check as CompleteIcon, Stop as StopIcon, CheckCircle as CheckCircleIcon, CheckCircleOutline as CheckCircleOutlineIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Today as TodayIcon, NavigateBefore as NavigateBeforeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import { startOfWeek, endOfWeek, format, isWithinInterval, parseISO, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DueTodayTasks from '../components/DueTodayTasks';

const groupTodayTasksByRole = (tasks: Task[]) => {
    return tasks.reduce((acc, task) => {
        if (task.due_date && isToday(parseISO(task.due_date))) {
            const roleKey = task.role_name || 'Unassigned';
            if (!acc[roleKey]) {
                acc[roleKey] = [];
            }
            acc[roleKey].push(task);
        }
        return acc;
    }, {} as Record<string, Task[]>);
};

const groupTasksByWeekAndRole = (tasks: Task[], weekStart: Date, weekEnd: Date) => {
    return tasks.reduce((acc, task) => {
        if (!task.due_date) return acc;
        
        const taskDate = parseISO(task.due_date);
        
        // Ensure valid date comparison
        if (taskDate && weekStart && weekEnd && 
            isWithinInterval(taskDate, { 
                start: startOfWeek(weekStart, { weekStartsOn: 1 }), 
                end: endOfWeek(weekEnd, { weekStartsOn: 1 }) 
            })
        ) {
            const taskDay = format(taskDate, 'yyyy-MM-dd');
            
            // Group by date
            if (!acc[taskDay]) {
                acc[taskDay] = {};
            }
            
            // Group by role within each date
            const roleKey = task.role_name || 'Unassigned';
            if (!acc[taskDay][roleKey]) {
                acc[taskDay][roleKey] = [];
            }
            
            acc[taskDay][roleKey].push(task);
        }
        
        return acc;
    }, {} as Record<string, Record<string, Task[]>>);
};

const TaskList: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [categories, setCategories] = useState<TaskCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        priority: '',
        quadrant: ''
    });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const theme = useTheme();
    const [weekStart, setWeekStart] = useState(() => {
        const today = new Date();
        return startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
    });
    const [weekEnd, setWeekEnd] = useState(() => {
        const today = new Date();
        return endOfWeek(today, { weekStartsOn: 1 }); // End week on Sunday
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const { activeTasks, completedTasks } = React.useMemo(() => {
        return {
            activeTasks: tasks.filter(task => !task.is_completed),
            completedTasks: tasks.filter(task => task.is_completed)
        };
    }, [tasks]);

    useEffect(() => {
        fetchData();
    }, [filters, weekStart, weekEnd]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const weekFilters = {
                ...filters,
                start_date: format(weekStart, 'yyyy-MM-dd'),
                end_date: format(weekEnd, 'yyyy-MM-dd')
            };

            const [tasksRes, rolesRes, categoriesRes] = await Promise.all([
                taskService.getTasks(weekFilters),
                taskService.getRoles(),
                taskService.getCategories(),
            ]);

            setTasks(tasksRes.data);
            setRoles(rolesRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async () => {
        try {
            await taskService.createRole(newRole);
            setRoleDialogOpen(false);
            setNewRole({ name: '', description: '' });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error creating role:', error);
            setError('Failed to create role');
        }
    };

    const handleFilterChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        
        try {
            setLoading(true);
            const response = await taskService.getTasks(newFilters);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await taskService.updateTask(taskId, { 
                status: newStatus,
            });
            await fetchData(); // Refresh the list
            
            // Show success message
            setSuccessMessage(
                newStatus === 'completed' ? 
                'Task marked as complete!' : 
                'Task status updated successfully'
            );
        } catch (error: any) {
            console.error('Error updating task status:', error);
            setError(error.response?.data?.detail || 'Failed to update task status');
        }
    };

    const handleToggleComplete = async (taskId: number, currentStatus: boolean) => {
        try {
            const response = await taskService.toggleTaskComplete(taskId);
            
            // Update local state
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId 
                        ? response.task
                        : task
                )
            );
            
            // Show success message
            setSuccessMessage(
                currentStatus ? 
                'Task marked as incomplete' : 
                'Task marked as complete!'
            );

            // Refresh the task list to ensure consistency
            fetchData();
        } catch (error: any) {
            console.error('Error toggling task completion:', error);
            setError(error.response?.data?.detail || 'Failed to update task status');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            if (window.confirm('Are you sure you want to delete this task?')) {
                await taskService.deleteTask(taskId);
                // Update local state instead of fetching
                setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
                setSuccessMessage('Task deleted successfully');
            }
        } catch (error: any) {
            console.error('Error deleting task:', error);
            setError(error.response?.data?.detail || 'Failed to delete task');
        }
    };

    const handleSubmit = async (taskData: Partial<Task>) => {
        try {
            if (selectedTask) {
                await taskService.updateTask(selectedTask.id, taskData);
            } else {
                await taskService.createTask(taskData);
            }
            setIsFormOpen(false);
            setSelectedTask(null);
            fetchData();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const getTasksByRole = (roleId: number) => {
        return tasks.filter(task => task.role === roleId);
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'error';
            case 2: return 'warning';
            case 3: return 'info';
            default: return 'default';
        }
    };

    const handleProgressChange = async (taskId: number, currentStatus: string) => {
        try {
            let newStatus: string;
            if (currentStatus === 'not_started') {
                newStatus = 'in_progress';
            } else if (currentStatus === 'in_progress') {
                newStatus = 'completed';
            } else {
                newStatus = 'not_started';
            }

            await taskService.updateTask(taskId, { status: newStatus });
            
            // Update local state
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId 
                        ? { ...task, status: newStatus }
                        : task
                )
            );
            
            setSuccessMessage(`Task ${newStatus.replace('_', ' ')}!`);
        } catch (error: any) {
            console.error('Error updating task status:', error);
            setError(error.response?.data?.detail || 'Failed to update task status');
        }
    };

    const handleOpenNewTask = (date?: Date) => {
        setSelectedDate(date || new Date());
        setIsFormOpen(true);
    };

    // Role Dialog Component
    const RoleDialog = () => (
        <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Role Name"
                    fullWidth
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRole} variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    );

    // Add this helper function to get quadrant display text
    const getQuadrantText = (quadrant: string) => {
        switch (quadrant) {
            case 'q1': return 'Urgent & Important';
            case 'q2': return 'Not Urgent & Important';
            case 'q3': return 'Urgent & Not Important';
            case 'q4': return 'Not Urgent & Not Important';
            default: return 'Unassigned';
        }
    };

    // Add this helper function for priority colors
    const getPriorityStyles = (priority: number) => {
        switch (priority) {
            case 1:
                return {
                    color: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(145deg, #424242 0%, #303030 100%)'
                        : `linear-gradient(145deg, ${theme.palette.error.light}15 0%, ${theme.palette.error.light}05 100%)`
                };
            case 2:
                return {
                    color: theme.palette.warning.main,
                    borderColor: theme.palette.warning.main,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #424242 0%, #303030 100%)'
                        : `linear-gradient(145deg, ${theme.palette.warning.light}15 0%, ${theme.palette.warning.light}05 100%)`
                };
            case 3:
                return {
                    color: theme.palette.info.main,
                    borderColor: theme.palette.info.main,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #424242 0%, #303030 100%)'
                        : `linear-gradient(145deg, ${theme.palette.info.light}15 0%, ${theme.palette.info.light}05 100%)`
                };
            default:
                return {
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #424242 0%, #303030 100%)'
                        : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
                };
        }
    };

    // Update the task card design
    const renderTaskCard = (task: Task) => (
            <Paper 
                                sx={{
                    p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderLeft: 4,
                borderColor: getPriorityColor(task.priority) + '.main'
            }}
        >
                    <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                            {task.title}
                        </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                    </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip 
                        label={task.role_name} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                    />
                    <Chip 
                        label={getPriorityText(task.priority)} 
                        size="small" 
                        color={getPriorityColor(task.priority)}
                        variant="outlined"
                    />
                    <Chip 
                        label={getQuadrantText(task.quadrant || '')}
                        size="small"
                        color={getQuadrantColor(task.quadrant || '')}
                        variant="outlined"
                    />
                </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={
                                task.status === 'completed' ? 100 :
                                task.status === 'in_progress' ? 50 :
                                0
                            }
                            sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.15)'
                                    : 'rgba(0,0,0,0.05)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, 
                                        ${task.status === 'completed' 
                                    ? theme.palette.success.main
                                            : task.status === 'in_progress' 
                                        ? theme.palette.info.main
                                        : theme.palette.warning.main} 0%,
                                        ${task.status === 'completed'
                                    ? theme.palette.success.dark
                                            : task.status === 'in_progress'
                                        ? theme.palette.info.dark
                                        : theme.palette.warning.dark} 100%)`
                                }
                            }}
                        />
                    </Box>

                    {/* Task Actions */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 'auto'
            }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={
                                task.status === 'not_started' ? "Start Task" :
                                task.status === 'in_progress' ? "Complete Task" :
                                "Reset Task"
                            }>
                                <IconButton
                                    onClick={() => handleProgressChange(task.id, task.status)}
                                    color={
                                        task.status === 'not_started' ? "primary" :
                                        task.status === 'in_progress' ? "success" :
                                        "warning"
                                    }
                                    size="small"
                                    sx={{ 
                                        bgcolor: theme.palette.mode === 'dark' 
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(0,0,0,0.04)',
                                        '&:hover': { 
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.08)'
                                        }
                                    }}
                                >
                                    {task.status === 'in_progress' ? <StopIcon /> : <StartIcon />}
                                </IconButton>
                            </Tooltip>
                    <Tooltip title={task.is_completed ? "Mark Incomplete" : "Mark Complete"}>
                        <IconButton
                            onClick={() => handleToggleComplete(task.id, task.is_completed)}
                                    size="small"
                                    sx={{ 
                                color: task.is_completed ? 'success.main' : 'inherit',
                                        bgcolor: theme.palette.mode === 'dark' 
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(0,0,0,0.04)',
                                        '&:hover': { 
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.08)'
                                        }
                                    }}
                        >
                            {task.is_completed ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                        <IconButton
                                    size="small"
                            onClick={() => {
                                setSelectedTask(task);
                                setIsFormOpen(true);
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTask(task.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Paper>
    );

    // Group tasks by week and role
    const weeklyTasks = groupTasksByWeekAndRole(tasks, weekStart, weekEnd);

    // Add week navigation functions
    const handlePreviousWeek = () => {
        setWeekStart(prev => {
            const newStart = new Date(prev);
            newStart.setDate(newStart.getDate() - 7);
            return startOfWeek(newStart, { weekStartsOn: 1 });
        });
        setWeekEnd(prev => {
            const newEnd = new Date(prev);
            newEnd.setDate(newEnd.getDate() - 7);
            return endOfWeek(newEnd, { weekStartsOn: 1 });
        });
    };

    const handleNextWeek = () => {
        setWeekStart(prev => {
            const newStart = new Date(prev);
            newStart.setDate(newStart.getDate() + 7);
            return startOfWeek(newStart, { weekStartsOn: 1 });
        });
        setWeekEnd(prev => {
            const newEnd = new Date(prev);
            newEnd.setDate(newEnd.getDate() + 7);
            return endOfWeek(newEnd, { weekStartsOn: 1 });
        });
    };

    // Add these functions for day navigation
    const handlePreviousDay = () => {
        setWeekStart(prev => {
            const newStart = new Date(prev);
            newStart.setDate(newStart.getDate() - 1);
            return newStart;
        });
    };

    const handleNextDay = () => {
        setWeekStart(prev => {
            const newStart = new Date(prev);
            newStart.setDate(newStart.getDate() + 1);
            return newStart;
        });
    };

    // Update the WeekNavigation component
    const WeekNavigation = () => (
        <Box sx={{ mb: 3 }}>
            {/* Week Navigation */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
            }}>
                <Button 
                    onClick={handlePreviousWeek}
                    startIcon={<NavigateBeforeIcon />}
                    size="small"
                >
                    Previous Week
                </Button>
                <Typography variant="h6">
                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </Typography>
                <Button 
                    onClick={handleNextWeek}
                    endIcon={<NavigateNextIcon />}
                    size="small"
                >
                    Next Week
                </Button>
            </Box>

            {/* Day Navigation */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 2
            }}>
                <IconButton 
                    onClick={handlePreviousDay}
                    size="small"
                >
                    <NavigateBeforeIcon />
                </IconButton>
                <Typography variant="subtitle1" sx={{ minWidth: 200, textAlign: 'center' }}>
                    {format(weekStart, 'EEEE, MMMM d')}
                </Typography>
                <IconButton 
                    onClick={handleNextDay}
                    size="small"
                >
                    <NavigateNextIcon />
                </IconButton>
            </Box>

            {/* Today Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button 
                    size="small"
                    onClick={() => {
                        setWeekStart(new Date());
                        setWeekEnd(endOfWeek(new Date()));
                    }}
                    startIcon={<TodayIcon />}
                    variant="outlined"
                >
                    Today
                </Button>
            </Box>
        </Box>
    );

    // Add this function to handle drag end
    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const sourceDate = result.source.droppableId;
        const destinationDate = result.destination.droppableId;
        const taskId = parseInt(result.draggableId);

        try {
            // Update the task's due date
            await taskService.updateTask(taskId, {
                due_date: destinationDate
            });
            
            // Refresh the task list
            fetchData();
            setSuccessMessage('Task moved successfully');
        } catch (error) {
            console.error('Error moving task:', error);
            setError('Failed to move task');
        }
    };

    // Add this helper function for priority text
    const getPriorityText = (priority: number) => {
        switch (priority) {
            case 1:
                return 'High Priority';
            case 2:
                return 'Medium Priority';
            case 3:
                return 'Low Priority';
            default:
                return 'No Priority';
        }
    };

    // Add this helper function for quadrant color
    const getQuadrantColor = (quadrant: string) => {
        switch (quadrant) {
            case 'q1': return 'error';
            case 'q2': return 'primary';
            case 'q3': return 'warning';
            case 'q4': return 'success';
            default: return 'default';
        }
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
                mb: { xs: 2, sm: 3, md: 4 }, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', sm: 'center' } 
            }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
                    Weekly Tasks
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' }
                }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenNewTask(weekStart)}
                    sx={{ borderRadius: '20px' }}
                >
                    New Task
                </Button>
                </Box>
            </Box>

            {/* Week Navigation - make it more mobile friendly */}
            <Box sx={{ 
                mb: { xs: 2, sm: 3 },
                '& .MuiButton-root': {
                    minWidth: { xs: 'auto', sm: 140 },
                    px: { xs: 1, sm: 2 }
                }
            }}>
                <Box sx={{ 
                        display: 'flex',
                    justifyContent: 'space-between', 
                        alignItems: 'center',
                    mb: { xs: 1, sm: 2 },
                    flexWrap: 'wrap',
                        gap: 1
                }}>
                    <WeekNavigation />
                    </Box>
            </Box>

            {/* Due Today Section */}
            <DueTodayTasks
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onEditTask={(task) => {
                    setSelectedTask(task);
                    setIsFormOpen(true);
                }}
            />

            {/* Task Cards */}
            <DragDropContext onDragEnd={handleDragEnd}>
                {Object.entries(weeklyTasks).map(([date, roleTasks]) => (
                    <Droppable key={date} droppableId={date}>
                        {(provided) => (
                            <Box ref={provided.innerRef} {...provided.droppableProps}>
                                <Paper 
                                    sx={{ 
                                        p: { xs: 2, sm: 3 },
                                        mb: { xs: 2, sm: 3 },
                                        background: theme.palette.mode === 'dark' 
                                            ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                            : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom color="primary">
                                        {format(parseISO(date), 'EEEE, MMMM d')}
                                    </Typography>
                                    
                                    {Object.entries(roleTasks).map(([roleName, tasks]) => (
                                        <Box key={roleName} sx={{ mb: 3 }}>
                                            <Typography 
                                                variant="subtitle1" 
                                                gutterBottom 
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    borderBottom: 1,
                                                    borderColor: 'divider',
                                                    pb: 1,
                                                    mb: 2
                                                }}
                                            >
                                                {roleName}
                                            </Typography>
                                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                                {tasks.map((task, index) => (
                                                    <Draggable 
                                                        key={task.id} 
                                                        draggableId={task.id.toString()} 
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <Grid 
                                                                item 
                                                                xs={12} 
                                                                md={6} 
                                                                lg={4}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {renderTaskCard(task)}
                                                            </Grid>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </Grid>
                                        </Box>
                                    ))}
                                    {Object.keys(roleTasks).length === 0 && (
                                        <Typography 
                                            variant="body1" 
                                            color="text.secondary" 
                                            textAlign="center"
                                            sx={{ py: 2 }}
                                        >
                                            No tasks scheduled for this day
                                        </Typography>
                                    )}
                                </Paper>
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                ))}
            </DragDropContext>

            {/* Show message if no tasks */}
            {Object.keys(weeklyTasks).length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No tasks scheduled for this week
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenNewTask(weekStart)}
                        sx={{ mt: 2 }}
                    >
                        Add Task
                    </Button>
                </Paper>
            )}

            {/* Dialogs */}
            <RoleDialog />

            {/* Task Form Dialog */}
            <TaskForm
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedDate(null);
                }}
                onSubmit={handleSubmit}
                initialData={selectedTask || undefined}
                selectedDate={selectedDate}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this task?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TaskList;
