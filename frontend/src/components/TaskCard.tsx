import React from 'react';
import { Task } from '../types/task';
import { Card, Badge, Button } from '@mui/material';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 3: return 'error';
            case 2: return 'warning';
            default: return 'info';
        }
    };

    return (
        <Card sx={{ p: 2, mb: 2 }}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-gray-600">{task.description}</p>
                    <div className="mt-2 space-x-2">
                        <Badge color={getPriorityColor(task.priority)}>
                            Priority: {task.priority}
                        </Badge>
                        <Badge color="primary">{task.status}</Badge>
                        {task.category && (
                            <Badge style={{ backgroundColor: task.category.color }}>
                                {task.category.name}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="space-x-2">
                    <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => onEdit(task)}
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => onDelete(task.id)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default TaskCard; 