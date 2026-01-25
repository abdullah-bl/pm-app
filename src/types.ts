import type { RecordService } from 'pocketbase';
import type PocketBase from 'pocketbase';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Budget {
    id: string;
    name: string;
    ref: string;
    description: string;
    created: string;
    updated: string;
}

export interface BudgetItem {
    id: string;
    budget: string;
    year: number;
    cash: number;
    cost: number;
    note: string;
    created: string;
    updated: string;
    expand?: {
        budget: Budget;
    }
}

export interface Transfer {
    id: string;
    from: string;
    to: string;
    cash: number;
    cost: number;
    note: string;
    created: string;
    updated: string;
    files: string[];
    expand?: {
        from: Budget;
        to: Budget;
    }
}

export interface Obligation {
    id: string;
    ref: string;
    cash: number;
    cost: number;
    note: string;
    date: string;
    budget: string;
    project: string;
    bill: string;
    created: string;
    updated: string;
    files: string[];
    expand?: {
        project: Project;
        bill: Bill;
        budget: Budget;
    }
}

export interface Phase {
    id: string;
    name: string;
    description: string;
    order: number;
    color: string; // 
    created: string;
    updated: string;
}


export interface Bill {
    id: string;
    ref: string;
    name: string;
    budget: string;
    amount: number;
    due_date: string;
    note: string;
    created: string;
    updated: string;
    files: string[];
    expand?: {
        budget: Budget;
    }
}

export interface Project {
    id: string;
    ref: string; // 1234
    slug: string; // PRO-123
    name: string;
    duration: string; // 
    start_date: string;
    end_date: string;
    total: number; // 
    phase: string; // 
    files: string[]; // 
    created: string;
    updated: string;
    assignee: string[];
    active: boolean;
    expand?: {
        phase: Phase;
        assignee: User[];
    }
}

export interface ProjectLog {
    id: string;
    project: string;        // relation to Project
    phase: string;          // relation to Phase (the new phase)
    previous_phase?: string; // relation to Phase (optional, the old phase)
    by: string;             // relation to User (who made the change)
    note?: string;          // optional comment about the change
    created: string;
    updated: string;
    expand?: {
        project: Project;
        phase: Phase;
        previous_phase?: Phase;
        by: User;
    }
}


export interface Payment {
    id: string;
    ref: string;
    budget: string;
    amount: number;
    note: string;
    bill: string;
    obligation: string;
    project: string;
    created: string;
    updated: string;
    files: string[];
    expand?: {
        budget: Budget;
        bill: Bill;
        obligation: Obligation;
        project: Project;
    }
}


export interface TypedPocketBase extends PocketBase {
    collection(idOrName: string): RecordService // default fallback for any other collection
    collection(idOrName: 'budgets'): RecordService<Budget>
    collection(idOrName: 'budget_items'): RecordService<BudgetItem>
    collection(idOrName: 'obligations'): RecordService<Obligation>
    collection(idOrName: 'phases'): RecordService<Phase>
    collection(idOrName: 'bills'): RecordService<Bill>
    collection(idOrName: 'projects'): RecordService<Project>
    collection(idOrName: 'payments'): RecordService<Payment>
    collection(idOrName: 'transfers'): RecordService<Transfer>
    collection(idOrName: 'project_logs'): RecordService<ProjectLog>
}