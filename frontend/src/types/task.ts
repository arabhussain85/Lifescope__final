export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export interface EisenhowerMatrix {
    id: number;
    urgency: 'urgent' | 'not_urgent';
    importance: 'important' | 'not_important';
}

export interface TaskCategory {
    id: number;
    name: string;
    description: string;
    color: string;
    role: number;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed';
    priority: number;
    quadrant: 'q1' | 'q2' | 'q3' | 'q4' | null;
    due_date: string | null;
    role: number;
    role_name: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    estimated_hours: number;
    actual_hours: number;
}

export interface TaskComment {
    id: number;
    task: number;
    author: number;
    author_name: string;
    content: string;
    created_at: string;
}

interface RoleAnalytics {
    role__name: string;
    role_id: number;
    count: number;
}

export interface TaskAnalytics {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
    by_priority: {
        high: number;
        medium: number;
        low: number;
    };
    by_role: RoleAnalytics[];
    by_quadrant: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
    };
    quadrant_percentages: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
    };
    tasks: Task[];
} 