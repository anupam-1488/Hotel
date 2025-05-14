/**
 * TypeORM adapter implementation
 */
export class TypeORMAdapter extends BaseAdapter {
    dataSources: Map<any, any>;
    connect(config: any): Promise<any>;
    createClient(config: any): Promise<any>;
    executeQuery(query: any, params?: any[]): Promise<any>;
    createDatabase(name: any): Promise<void>;
    dropDatabase(name: any): Promise<void>;
    createSchema(name: any): Promise<void>;
    dropSchema(name: any): Promise<void>;
    listDatabases(): Promise<any>;
    listSchemas(): Promise<any>;
    applyTenantMiddleware(dataSource: any, tenantId: any): any;
    detectTypeORMDriver(): "mysql" | "mongodb" | "sqlite" | "postgres";
    sanitizeName(name: any): any;
}
import { BaseAdapter } from './base.js';
