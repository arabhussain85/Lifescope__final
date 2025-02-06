import React from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    IconButton,
    Checkbox,
    useTheme
} from '@mui/material';
import { Task } from '../types/task';
import {
    CheckCircle as CheckCircleIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    Edit as EditIcon,
    Today as TodayIcon
} from '@mui/icons-material';
import { isToday, parseISO } from 'date-fns';

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

interface DueTodayTasksProps {
    tasks: Task[];
    onToggleComplete: (taskId: number, currentStatus: boolean) => void;
    onEditTask: (task: Task) => void;
}

const DueTodayTasks: React.FC<DueTodayTasksProps> = ({ 
    tasks, 
    onToggleComplete, 
    onEditTask 
}) => {
    const theme = useTheme();
    const todayTasks = groupTodayTasksByRole(tasks);

    return (
        <Paper 
            sx={{ 
                p: { xs: 2, sm: 3 },
                mb: { xs: 3, sm: 4 },
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderLeft: 4,
                borderColor: 'error.main'
            }}
        >
            <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                    mb: { xs: 2, sm: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'error.main'
                }}
            >
                <TodayIcon color="error" />
                Due Today
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
                {Object.entries(todayTasks).map(([roleName, roleTasks]) => (
                    <Grid item xs={12} sm={6} md={4} key={roleName}>
                        <Paper 
                            sx={{ 
                                p: { xs: 2, sm: 2.5 },
                                background: theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                                height: '100%',
                                borderLeft: 2,
                                borderColor: 'error.main',
                                '&:hover': {
                                    borderColor: 'error.dark'
                                }
                            }}
                        >
                            <Typography 
                                variant="subtitle1" 
                                gutterBottom 
                                sx={{ 
                                    color: 'error.main',
                                    fontWeight: 'medium'
                                }}
                            >
                                {roleName}
                            </Typography>
                            {roleTasks.map((task) => (
                                <Box 
                                    key={task.id}
                                    sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.02)'
                                        }
                                    }}
                                >
                                    <Checkbox
                                        checked={task.is_completed}
                                        onChange={() => onToggleComplete(task.id, task.is_completed)}
                                        icon={<CheckCircleOutlineIcon />}
                                        checkedIcon={<CheckCircleIcon />}
                                        sx={{ 
                                            color: task.is_completed ? 'success.main' : 'inherit',
                                            '&.Mui-checked': {
                                                color: 'success.main'
                                            }
                                        }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography 
                                            variant="body2"
                                            sx={{ 
                                                textDecoration: task.is_completed ? 'line-through' : 'none',
                                                color: task.is_completed ? 'text.secondary' : 'text.primary'
                                            }}
                                        >
                                            {task.title}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                        >
                                            {getPriorityText(task.priority)}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => onEditTask(task)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                ))}
                {Object.keys(todayTasks).length === 0 && (
                    <Grid item xs={12}>
                        <Typography 
                            variant="body1" 
                            color="error.main"
                            textAlign="center"
                            sx={{ 
                                py: 2,
                                fontStyle: 'italic'
                            }}
                        >
                            No tasks due today
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default DueTodayTasks; 