/**
 * Knex adapter implementation
 */
export class KnexAdapter extends BaseAdapter {
    connect(config: any): Promise<any>;
    createClient(config: any): Promise<any>;
    executeQuery(query: any, params?: any[]): Promise<any>;
    createDatabase(name: any): Promise<void>;
    dropDatabase(name: any): Promise<void>;
    createSchema(name: any): Promise<void>;
    dropSchema(name: any): Promise<void>;
    listDatabases(): Promise<any>;
    listSchemas(): Promise<any>;
    applyTenantMiddleware(client: any, tenantId: any): (tableName: any) => any;
    detectKnexClient(): "pg" | "mysql2" | "sqlite3";
    getSystemUrl(): any;
    sanitizeName(name: any): any;
}
import { BaseAdapter } from './base.js';
