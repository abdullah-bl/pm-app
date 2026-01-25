// src/lib/permissions.ts
import type { User } from '@/types';

export type Role = 'admin' | 'manager' | 'budgeter' | 'viewer';
export type Action = 'view' | 'create' | 'edit' | 'delete';
export type Resource =
    | 'projects'
    | 'bills'
    | 'budgets'
    | 'budget_items'
    | 'payments'
    | 'obligations'
    | 'transfers';

// All resources for convenience
const ALL_RESOURCES: Resource[] = [
    'projects', 'bills', 'budgets', 'budget_items',
    'payments', 'obligations', 'transfers'
];

const permissions: Record<Role, Record<Action, Resource[]>> = {
    admin: {
        view: ALL_RESOURCES,
        create: ALL_RESOURCES,
        edit: ALL_RESOURCES,
        delete: ALL_RESOURCES,
    },
    budgeter: {
        // Can view everything budget-related including what's obligated
        view: ['budgets', 'budget_items', 'obligations', 'payments', 'transfers', 'bills'],
        create: ['budget_items', 'transfers'],
        edit: ['budget_items', 'transfers'],
        delete: ['budget_items'], // careful with transfers
    },
    manager: {
        // Project managers - can manage projects and their financials
        view: ['projects', 'payments', 'obligations', 'bills', 'budgets'],
        create: ['projects', 'payments', 'obligations'],
        edit: ['projects', 'payments', 'obligations'],
        delete: [],
    },
    viewer: {
        view: ['projects', 'payments', 'obligations', 'bills', 'budgets'],
        create: [],
        edit: [],
        delete: [],
    },
};

export function can(user: User & { role?: Role }, action: Action, resource: Resource): boolean {
    const role = user.role || 'viewer';
    return permissions[role]?.[action]?.includes(resource) ?? false;
}

// Helper for checking multiple permissions at once
export function canAny(
    user: User & { role?: Role },
    action: Action,
    resources: Resource[]
): boolean {
    return resources.some(r => can(user, action, r));
}

// Helper for requiring permission (throws if denied)
export function requirePermission(
    user: User & { role?: Role },
    action: Action,
    resource: Resource
): void {
    if (!can(user, action, resource)) {
        throw new Error(`Permission denied: cannot ${action} ${resource}`);
    }
}