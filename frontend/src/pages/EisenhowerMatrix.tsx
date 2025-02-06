import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Chip,
    Button,
    CircularProgress,
    LinearProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowForward as MoveIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import { Task } from '../types/task';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface QuadrantBoxProps {
    title: string;
    description: string;
    tasks: Task[];
    quadrant: string;
    onMoveTask: (taskId: number, newQuadrant: string) => void;
    onDeleteTask: (taskId: number) => void;
}

const QuadrantBox: React.FC<QuadrantBoxProps> = ({
    title,
    description,
    tasks,
    quadrant,
    onMoveTask,
    onDeleteTask
}) => (
    <Paper 
        sx={{ 
            p: 2, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderTop: 3,
            borderColor: (theme) => 
                quadrant === 'q1' ? theme.palette.error.main :
                quadrant === 'q2' ? theme.palette.primary.main :
                quadrant === 'q3' ? theme.palette.warning.main :
                theme.palette.success.main,
            '& .MuiChip-root': {
                borderColor: (theme) =>
                    quadrant === 'q1' ? theme.palette.error.main :
                    quadrant === 'q2' ? theme.palette.primary.main :
                    quadrant === 'q3' ? theme.palette.warning.main :
                    theme.palette.success.main,
            },
            '& .MuiCard-root': {
                borderLeft: 2,
                borderColor: (theme) =>
                    quadrant === 'q1' ? theme.palette.error.main :
                    quadrant === 'q2' ? theme.palette.primary.main :
                    quadrant === 'q3' ? theme.palette.warning.main :
                    theme.palette.success.main,
            }
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color={(theme) => 
                quadrant === 'q1' ? 'error' :
                quadrant === 'q2' ? 'primary' :
                quadrant === 'q3' ? 'warning' :
                'success'
            }>
                {title}
            </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {description}
        </Typography>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '400px' }}>
            {tasks.map((task) => (
                <Card 
                    key={task.id} 
                    sx={{ 
                        mb: 1,
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                        }
                    }}
                >
                    <CardContent sx={{ 
                        p: '12px !important',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                                {task.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                {task.description?.slice(0, 50)}
                                {task.description?.length > 50 ? '...' : ''}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                <Chip 
                                    label={`Role: ${task.role_name}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                />
                                <Chip 
                                    label={`Priority: ${
                                        task.priority === 1 ? 'High' :
                                        task.priority === 2 ? 'Medium' : 'Low'
                                    }`}
                                    size="small"
                                    color={
                                        task.priority === 1 ? 'error' :
                                        task.priority === 2 ? 'warning' : 'success'
                                    }
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                            <Tooltip title="Move to next quadrant">
                                <IconButton 
                                    size="small"
                                    onClick={() => {
                                        const nextQuadrant = {
                                            q1: 'q2',
                                            q2: 'q3',
                                            q3: 'q4',
                                            q4: 'q1'
                                        }[quadrant];
                                        onMoveTask(task.id, nextQuadrant);
                                    }}
                                >
                                    <MoveIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete task">
                                <IconButton 
                                    size="small"
                                    onClick={() => onDeleteTask(task.id)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </CardContent>
                </Card>
            ))}
            {tasks.length === 0 && (
                <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ textAlign: 'center', py: 4 }}
                >
                    No tasks in this quadrant
                </Typography>
            )}
        </Box>
    </Paper>
);

const EisenhowerMatrix: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getTasks();
            if (Array.isArray(response.data)) {
                console.log('Fetched tasks:', response.data);
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const quadrantTasks = React.useMemo(() => ({
        q1: tasks.filter(task => task.quadrant === 'q1'),
        q2: tasks.filter(task => task.quadrant === 'q2'),
        q3: tasks.filter(task => task.quadrant === 'q3'),
        q4: tasks.filter(task => task.quadrant === 'q4')
    }), [tasks]);

    const handleMoveTask = async (taskId: number, newQuadrant: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            await taskService.updateTask(taskId, {
                quadrant: newQuadrant
            });
            await fetchTasks(); // Refresh tasks after update
        } catch (error) {
            console.error('Error moving task:', error);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                await fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
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
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Eisenhower Matrix</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/tasks/new')}
                    >
                        New Task
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <QuadrantBox
                        title="Urgent & Important"
                        description="Do these tasks immediately"
                        tasks={quadrantTasks.q1}
                        quadrant="q1"
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTask}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <QuadrantBox
                        title="Not Urgent & Important"
                        description="Schedule these tasks"
                        tasks={quadrantTasks.q2}
                        quadrant="q2"
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTask}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <QuadrantBox
                        title="Urgent & Not Important"
                        description="Delegate these tasks"
                        tasks={quadrantTasks.q3}
                        quadrant="q3"
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTask}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <QuadrantBox
                        title="Not Urgent & Not Important"
                        description="Eliminate these tasks"
                        tasks={quadrantTasks.q4}
                        quadrant="q4"
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTask}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default EisenhowerMatrix; 