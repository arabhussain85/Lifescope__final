import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Box,
    Card,
    CardContent,
    LinearProgress,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    Label
} from 'recharts';
import { taskService } from '../services/api';
import { TaskAnalytics } from '../types/task';
import { CheckCircleOutline, CheckCircle, Today as TodayIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await taskService.getAnalytics();
                setAnalytics(response.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const handleToggleComplete = async (taskId: number) => {
        try {
            const response = await taskService.toggleTaskComplete(taskId);
            // Update both task and analytics data
            setAnalytics(response.analytics);
        } catch (error) {
            console.error('Error toggling task completion:', error);
            setError('Failed to update task');
        }
    };

    const handleRoleTasksClick = (roleId: number) => {
        navigate(`/tasks?role=${roleId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!analytics) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No analytics data available
            </Alert>
        );
    }

    const getChartData = () => {
        if (!analytics) return null;

        const priorityData = [
            {
                name: 'High Priority',
                tasks: analytics.by_priority.high,
                completed: analytics.tasks.filter(t => t.priority === 1 && t.is_completed).length,
                color: theme.palette.error.main
            },
            {
                name: 'Medium Priority',
                tasks: analytics.by_priority.medium,
                completed: analytics.tasks.filter(t => t.priority === 2 && t.is_completed).length,
                color: theme.palette.warning.main
            },
            {
                name: 'Low Priority',
                tasks: analytics.by_priority.low,
                completed: analytics.tasks.filter(t => t.priority === 3 && t.is_completed).length,
                color: theme.palette.info.main
            }
        ];

        return {
            status: [
                { name: 'Completed', value: analytics.completed_tasks },
                { name: 'In Progress', value: analytics.in_progress_tasks },
                { name: 'Not Started', value: analytics.total_tasks - analytics.completed_tasks - analytics.in_progress_tasks }
            ],
            quadrant: [
                { name: 'Urgent & Important', value: analytics.by_quadrant.q1, id: 'q1' },
                { name: 'Not Urgent & Important', value: analytics.by_quadrant.q2, id: 'q2' },
                { name: 'Urgent & Not Important', value: analytics.by_quadrant.q3, id: 'q3' },
                { name: 'Not Urgent & Not Important', value: analytics.by_quadrant.q4, id: 'q4' }
            ],
            taskDistribution: [
                {
                    subject: 'High Priority',
                    value: analytics.by_priority.high,
                    fullMark: analytics.total_tasks
                },
                {
                    subject: 'Completed',
                    value: analytics.completed_tasks,
                    fullMark: analytics.total_tasks
                },
                {
                    subject: 'In Progress',
                    value: analytics.in_progress_tasks,
                    fullMark: analytics.total_tasks
                },
                {
                    subject: 'Urgent & Important',
                    value: analytics.by_quadrant.q1,
                    fullMark: analytics.total_tasks
                },
                {
                    subject: 'Important Tasks',
                    value: analytics.by_quadrant.q2,
                    fullMark: analytics.total_tasks
                },
                {
                    subject: 'Overdue',
                    value: analytics.overdue_tasks,
                    fullMark: analytics.total_tasks
                }
            ],
            priority: priorityData
        };
    };

    const chartData = getChartData();
    if (!chartData) return null;

    // Add this helper function at the component level to get unique roles with their tasks
    const getUniqueRolesWithTasks = (analytics: TaskAnalytics) => {
        // Get unique roles
        const uniqueRoles = Array.from(new Set(
            analytics.by_role.map(role => role.role__name)
        )).map(roleName => {
            const roleData = analytics.by_role.find(r => r.role__name === roleName);
            return {
                role_id: roleData?.role_id || 0,
                role__name: roleName,
                count: roleData?.count || 0
            };
        });

        // Get unique tasks for each role
        const roleTasksMap = uniqueRoles.map(role => {
            const uniqueTasks = Array.from(
                new Map(
                    analytics.tasks
                        .filter(task => task.role_name === role.role__name)
                        .map(task => [task.id, task])
                ).values()
            );

            return {
                ...role,
                tasks: uniqueTasks
            };
        });

        return roleTasksMap;
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    mb: { xs: 2, sm: 3, md: 4 }, 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                    fontWeight: 'bold', 
                    color: 'primary.main' 
                }}
            >
                Dashboard Overview
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        sx={{ 
                            p: { xs: 2.5, sm: 3, md: 4 }, 
                            height: '100%',
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
                        <Typography variant="h6" color="primary" gutterBottom>Total Tasks</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{analytics.total_tasks}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        sx={{ 
                            p: { xs: 2.5, sm: 3, md: 4 },
                            height: '100%',
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
                        <Typography variant="h6" color="success.main" gutterBottom>Completed</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{analytics.completed_tasks}</Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={(analytics.completed_tasks / analytics.total_tasks) * 100} 
                            color="success"
                            sx={{ 
                                mt: 2, 
                                height: 8, 
                                borderRadius: 4 
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        sx={{ 
                            p: { xs: 2.5, sm: 3, md: 4 },
                            height: '100%',
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
                        <Typography variant="h6" color="info.main" gutterBottom>In Progress</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{analytics.in_progress_tasks}</Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={(analytics.in_progress_tasks / analytics.total_tasks) * 100} 
                            color="info"
                            sx={{ 
                                mt: 2, 
                                height: 8, 
                                borderRadius: 4 
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        sx={{ 
                            p: { xs: 2.5, sm: 3, md: 4 },
                            height: '100%',
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
                        <Typography variant="h6" color="error.main" gutterBottom>Overdue</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{analytics.overdue_tasks}</Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={(analytics.overdue_tasks / analytics.total_tasks) * 100} 
                            color="error"
                            sx={{ 
                                mt: 2, 
                                height: 8, 
                                borderRadius: 4 
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Typography 
                        variant="h5" 
                        gutterBottom 
                        sx={{ 
                            mt: { xs: 4, sm: 5, md: 6 },
                            mb: { xs: 3, sm: 4, md: 5 },
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                            fontWeight: 'medium' 
                        }}
                    >
                        Task Analytics
                    </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper 
                        sx={{ 
                            p: { xs: 3, sm: 4, md: 5 },
                            height: '100%',
                            minHeight: { xs: 400, sm: 450, md: 500 },
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                color: 'primary.main',
                                mb: { xs: 3, sm: 4 }
                            }}
                        >
                            Task Status Distribution
                        </Typography>
                        <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={chartData.status}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label
                                >
                                    {chartData.status.map((entry, index) => (
                                        <Cell 
                                                key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper 
                        sx={{ 
                            p: { xs: 3, sm: 4, md: 5 },
                            height: '100%',
                            minHeight: { xs: 400, sm: 450, md: 500 },
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
                            Task Distribution Analysis
                        </Typography>
                        <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}>
                        <ResponsiveContainer width="100%" height={350}>
                                <RadarChart outerRadius={130} data={chartData.taskDistribution}>
                                    <PolarGrid gridType="web" />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis />
                                <Radar
                                    name="Tasks"
                                    dataKey="value"
                                    stroke={theme.palette.primary.main}
                                    fill={theme.palette.primary.main}
                                    fillOpacity={0.3}
                                    />
                                    <Tooltip />
                                    <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        sx={{ 
                            p: { xs: 3, sm: 4, md: 5 },
                            minHeight: { xs: 450, sm: 500, md: 550 },
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>Eisenhower Matrix Distribution</Typography>
                        <Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
                            <Grid item xs={12} md={6}>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.quadrant}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            label
                                        >
                                            {Object.entries(analytics.by_quadrant).map(([quadrant, value], index) => (
                                                <Cell 
                                                    key={`quadrant-cell-${quadrant}`}
                                                    fill={
                                                        index === 0 ? '#f44336' : // red for q1
                                                        index === 1 ? '#2196f3' : // blue for q2
                                                        index === 2 ? '#ff9800' : // orange for q3
                                                        '#4caf50'                 // green for q4
                                                    } 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {Object.entries(analytics.quadrant_percentages).map(([quadrant, percentage]) => (
                                        <Box key={quadrant}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                {quadrant === 'q1' ? 'Urgent & Important' :
                                                 quadrant === 'q2' ? 'Not Urgent & Important' :
                                                 quadrant === 'q3' ? 'Urgent & Not Important' :
                                                 'Not Urgent & Not Important'}
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={percentage} 
                                                sx={{ 
                                                    height: 10, 
                                                    borderRadius: 5,
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: 
                                                            quadrant === 'q1' ? '#f44336' :
                                                            quadrant === 'q2' ? '#2196f3' :
                                                            quadrant === 'q3' ? '#ff9800' :
                                                            '#4caf50'
                                                    }
                                                }}
                                            />
                                            <Typography variant="caption">
                                                {percentage.toFixed(1)}% ({analytics.by_quadrant[quadrant]} tasks)
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        sx={{ 
                            p: { xs: 3, sm: 4, md: 5 },
                            minHeight: { xs: 450, sm: 500, md: 550 },
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ 
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'error.main'
                        }}>
                            <TodayIcon color="error" />
                            Today's Tasks Overview
                        </Typography>
                        <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={analytics.tasks
                                        .filter(task => task.due_date && isToday(parseISO(task.due_date)))
                                        .reduce((acc, task) => {
                                            const roleKey = task.role_name || 'Unassigned';
                                            const existingRole = acc.find(item => item.name === roleKey);
                                            
                                            if (existingRole) {
                                                existingRole.total += 1;
                                                if (task.is_completed) existingRole.completed += 1;
                                            } else {
                                                acc.push({
                                                    name: roleKey,
                                                    total: 1,
                                                    completed: task.is_completed ? 1 : 0,
                                                    completionRate: 0
                                                });
                                            }
                                            
                                            return acc;
                                        }, [] as Array<{
                                            name: string;
                                            total: number;
                                            completed: number;
                                            completionRate: number;
                                        }>)
                                        .map(item => ({
                                            ...item,
                                            completionRate: (item.completed / item.total) * 100
                                        }))
                                    }
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name"
                                        tick={{ fill: theme.palette.text.primary }}
                                        axisLine={{ stroke: theme.palette.divider }}
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        orientation="left"
                                        tick={{ fill: theme.palette.text.primary }}
                                        axisLine={{ stroke: theme.palette.divider }}
                                    >
                                        <Label
                                            value="Number of Tasks"
                                            angle={-90}
                                            position="insideLeft"
                                            style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
                                        />
                                    </YAxis>
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fill: theme.palette.text.primary }}
                                        axisLine={{ stroke: theme.palette.divider }}
                                    >
                                        <Label
                                            value="Completion Rate (%)"
                                            angle={90}
                                            position="insideRight"
                                            style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
                                        />
                                    </YAxis>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="total" 
                                        name="Total Tasks" 
                                        fill={theme.palette.primary.main}
                                        yAxisId="left"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar 
                                        dataKey="completed" 
                                        name="Completed Tasks" 
                                        fill={theme.palette.success.main}
                                        yAxisId="left"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completionRate"
                                        name="Completion Rate"
                                        stroke={theme.palette.error.main}
                                        yAxisId="right"
                                        dot={{ fill: theme.palette.error.main }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        sx={{ 
                            p: { xs: 3, sm: 4, md: 5 },
                            minHeight: { xs: 450, sm: 500, md: 550 },
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                            Tasks by Priority
                        </Typography>
                        <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData.priority}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                <Legend />
                                    <Bar dataKey="tasks" name="Total Tasks" fill={theme.palette.primary.main} />
                                    <Bar dataKey="completed" name="Completed" fill={theme.palette.success.main} />
                            </BarChart>
                        </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        sx={{ 
                            p: { xs: 3, sm: 4, md: 5 },
                            minHeight: { xs: 400, sm: 450, md: 500 },
                            background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                            Roles Overview
                        </Typography>
                        <Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
                            {getUniqueRolesWithTasks(analytics).map((roleData, index) => {
                                const taskCount = roleData.tasks.length;

                                return taskCount > 0 ? (
                                    <Grid item xs={12} sm={6} md={4} key={roleData.role_id}>
                                        <Paper 
                                            onClick={() => handleRoleTasksClick(roleData.role_id)}
                                            sx={{ 
                                                p: { xs: 2, sm: 2.5, md: 3 },
                                                borderLeft: 6,
                                                borderColor: COLORS[index % COLORS.length],
                                                cursor: 'pointer',
                                                background: theme.palette.mode === 'dark' 
                                                    ? 'rgba(255,255,255,0.05)'
                                                    : 'rgba(0,0,0,0.02)',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    background: theme.palette.mode === 'dark' 
                                                        ? 'rgba(255,255,255,0.08)'
                                                        : 'rgba(0,0,0,0.04)'
                                                }
                                            }}
                                        >
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom 
                                                color={COLORS[index % COLORS.length]}
                                                sx={{ mb: 2 }}
                                            >
                                                {roleData.role__name}
                                            </Typography>
                                            
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Tasks
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {taskCount}
                                                </Typography>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={(taskCount / analytics.total_tasks) * 100}
                                                    sx={{ 
                                                        height: 6, 
                                                        borderRadius: 3,
                                                        bgcolor: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255,255,255,0.1)'
                                                            : 'rgba(0,0,0,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: COLORS[index % COLORS.length]
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Completed
                                                    </Typography>
                                                    <Typography variant="h6" color="success.main">
                                                        {roleData.tasks.filter(t => t.is_completed).length}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        In Progress
                                                    </Typography>
                                                    <Typography variant="h6" color="info.main">
                                                        {roleData.tasks.filter(t => t.status === 'in_progress').length}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pending
                                                    </Typography>
                                                    <Typography variant="h6" color="warning.main">
                                                        {roleData.tasks.filter(t => t.status === 'not_started').length}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ) : null;
                            })}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 