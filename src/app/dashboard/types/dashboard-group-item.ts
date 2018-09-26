import { TagValue } from '@intelligentplant/data-core-types';

export interface DashboardGroupItem {
    dsn: string;
    tag: string;
    displayName?: string;
    description?: string;
    subscriptions: string[];
    values?: { [key: string]: TagValue };
    lastUpdatedAt?: Date;
}
