import { DashboardGroup } from './dashboard-group';

export interface Dashboard {
    id?: string;
    name: string;
    description?: string;
    updateRate?: number;
    groups: DashboardGroup[];
}
