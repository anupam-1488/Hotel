/**
 * Prisma adapter implementation
 */
export class PrismaAdapter extends BaseAdapter {
    connect(config: any): Promise<any>;
    createClient(config: any): Promise<any>;
    executeQuery(query: any, params?: any[]): Promise<any>;
    createDatabase(name: any): Promise<void>;
    dropDatabase(name: any): Promise<void>;
    createSchema(name: any): Promise<void>;
    dropSchema(name: any): Promise<void>;
    listDatabases(): Promise<any>;
    listSchemas(): Promise<any>;
    applyTenantMiddleware(client: any, tenantId: any): any;
    sanitizeName(name: any): any;
}
import { BaseAdapter } from './base.js';
