/* Imports for vendors */
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/* Helpers */
import { DatabaseError } from "../helpers/global.helper";
import { SentryErrorHelper } from "../helpers/sentry.helper";

/* Imports for interfaces and types */
import { ResponseDataInterface } from "../entities/interfaces/request_response.interfaces";

/* Imports for constants */
import { BOOLEAN_VALUES, COMMON_VALUES, ENVIRONMENT } from "../../../configs/constants/app.constant";
import { DATABASE, READ_REPLICA_DATABASE } from "../../../configs/constants/env.constant";

/**
 * Class representing Database Model
 * Last Updated Date: << INSERT_DATE >>
 * @author << INSERT_NAME >>
 */
class DatabaseModel {
    private static pool: Pool;
    private static read_only_pool: Pool;

    activeTransaction?: PoolClient | null;
    transaction_start_time: number | null;
    database: string | null;
    retry_count: number | null;
    use_replica_db: boolean | null;

    constructor(transaction_connection: PoolClient | null = null) {
        this.activeTransaction = transaction_connection;
        this.transaction_start_time = null;
        this.database = "";
        this.retry_count = COMMON_VALUES.number.zero;
        this.use_replica_db = (process.env.NODE_ENV === ENVIRONMENT.production) && !transaction_connection;

        if(!DatabaseModel.pool){
            this.createPoolConnection(!!BOOLEAN_VALUES.inactive_value);
        }

        if(!DatabaseModel.read_only_pool && this.use_replica_db){
            this.createPoolConnection(!!BOOLEAN_VALUES.active_value);
        }
    }

    /**
     * DOCU: Creates PostgreSQL connection pool <br>
     * Triggered: When DatabaseModel is instantiated <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param use_replica - Whether to create read replica pool
     * @author << INSERT_NAME >>
     */
    createPoolConnection = (use_replica = false) => {
        const db_config = (use_replica) ? READ_REPLICA_DATABASE : DATABASE;
        const database_pool = new Pool(db_config);
        this._setupConnectionListeners(database_pool);

        if(use_replica){
            DatabaseModel.read_only_pool = database_pool;
        }
        else{
            DatabaseModel.pool = database_pool;
        }
    }

    /**
     * DOCU: Get PostgreSQL connection from pool <br>
     * Triggered: When query will be executed <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param use_replica - Whether to use read replica
     * @returns PostgreSQL connection
     * @author << INSERT_NAME >>
     */
    getConnection = async (use_replica = false): Promise<PoolClient> => {
        if(this.activeTransaction){
            this.database = (use_replica) ? READ_REPLICA_DATABASE.database : DATABASE.database;
            return this.activeTransaction;
        }

        try{
            const database_pool = (use_replica) ? DatabaseModel.read_only_pool : DatabaseModel.pool;

            if(database_pool){
                const connection = await database_pool.connect();
                this.database = (use_replica) ? READ_REPLICA_DATABASE.database : DATABASE.database;
                return connection;
            }
            else{
                throw new DatabaseError("Database connection pool is not initialized.");
            }
        }
        catch(error){
            /* For easy debugging */
            if(process.env.NODE_ENV !== ENVIRONMENT.production){
                console.log(error);
            }

            throw error instanceof Error ? error : new Error(String(error));
        }
    }

    /**
     * DOCU: Executes query with parameterized values <br>
     * Triggered: By all models <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param query - SQL query with $1, $2 placeholders
     * @param values - Array of values for parameters
     * @param use_replica - Use read replica if available
     * @returns Query result
     * @author << INSERT_NAME >>
     */
    executeQuery = async <RowType extends QueryResultRow>(query: string, values: any[] = [], use_replica = false): Promise<QueryResult<RowType>> => {
        this.use_replica_db = use_replica && !this.activeTransaction && process.env.NODE_ENV === ENVIRONMENT.production;
        const connection = await this.getConnection(this.use_replica_db);
        const execution_start = new Date().getTime();

        try{
            const result = await connection.query(query, values);
            const total_duration = ((new Date().getTime()) - execution_start) / COMMON_VALUES.number.one_thousand;

            if(!this.activeTransaction){
                connection.release();
            }

            /* Track slow queries (> 1 second) */
            if(total_duration > COMMON_VALUES.number.one){
                const sentryErrorHelper = new SentryErrorHelper(process.env.NODE_ENV !== ENVIRONMENT.development);
                sentryErrorHelper.trackError({
                    total_duration,
                    error: "",
                    custom_error_message: "SlowQueryException",
                    database_info: {
                        database: this.database as string,
                        performance: `${total_duration}s runtime`,
                        query: query,
                    }
                }, true);
            }

            return result;
        }
        catch(error){
            if(!this.activeTransaction){
                connection.release();
            }

            const total_duration = ((new Date().getTime()) - execution_start) / COMMON_VALUES.number.one_thousand;
            const sentryErrorHelper = new SentryErrorHelper(process.env.NODE_ENV !== ENVIRONMENT.development);
            sentryErrorHelper.trackError({
                total_duration,
                error: (error instanceof Error) ? error : String(error),
                custom_error_message: "ErrorQueryException",
                database_info: {
                    database: this.database as string,
                    performance: `${total_duration}s runtime`,
                    query: query,
                } 
            }, true);

            throw new DatabaseError((error instanceof Error) ? error.message : String(error));
        }
    }

    /**
     * DOCU: Start database transaction <br>
     * Triggered: By models with multiple queries <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param use_replica - Use read replica if available
     * @returns Transaction connection
     * @author << INSERT_NAME >>
     */
    startTransaction = async (use_replica = false): Promise<PoolClient> => {
        const connection = await this.getConnection(use_replica);

        try{
            this.transaction_start_time = new Date().getTime();
            await connection.query('BEGIN');
            return connection;
        }
        catch(error){
            await this.cancelTransaction("Failed to start transaction", connection, error);
            throw new DatabaseError((error instanceof Error) ? error.message : String(error));
        }
    }

    /**
     * DOCU: Commit transaction <br>
     * Triggered: After successful queries <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param connection - Transaction connection
     * @param force_commit - Force commit in test environment
     * @returns Success boolean
     * @author << INSERT_NAME >>
     */
    commitTransaction = async (connection: PoolClient, force_commit = false): Promise<boolean> => {
        if(process.env.TEST_PORT && !force_commit){
            await this.cancelTransaction("Rollback test data", connection);
            return false;
        }

        try{
            await connection.query('COMMIT');

            this.activeTransaction = null;
            this.use_replica_db = !!BOOLEAN_VALUES.active_value && process.env.NODE_ENV === ENVIRONMENT.production;
            connection.release();

            return true;
        }
        catch(error){
            await this.cancelTransaction("Failed to commit transaction", connection, error);
            throw new DatabaseError((error instanceof Error) ? error.message : String(error));
        }
    }

    /**
     * DOCU: Rollback transaction <br>
     * Triggered: On query error <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param error_message - Error description
     * @param connection - Transaction connection
     * @param error_object - Error object for logging
     * @returns Response with error
     * @author << INSERT_NAME >>
     */
    cancelTransaction = async (error_message: string, connection: PoolClient, error_object: any = null): Promise<ResponseDataInterface<undefined>> => {
        try{
            await connection.query('ROLLBACK');
        }
        catch(rollback_error){
            console.error("Rollback error:", rollback_error);
        }

        this.activeTransaction = null;
        this.use_replica_db = !!BOOLEAN_VALUES.active_value && process.env.NODE_ENV === ENVIRONMENT.production;
        connection.release();

        if(error_object){
            const sentryErrorHelper = new SentryErrorHelper(process.env.NODE_ENV !== ENVIRONMENT.development);
            const total_duration = ((new Date().getTime()) - this.transaction_start_time!) / COMMON_VALUES.number.one_thousand;
            sentryErrorHelper.trackError({
                total_duration,
                error: error_object,
                custom_error_message: "TransactionErrorException",
                database_info: {
                    database: this.database as string,
                    performance: `${total_duration}s runtime`,
                    query: "",
                }
            }, true);
        }

        return { status: false, error: error_message };
    }

    /**
     * DOCU: Setup connection listeners <br>
     * Triggered: On connection established <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param pool - PostgreSQL connection pool
     * @author << INSERT_NAME >>
     */
    private _setupConnectionListeners(pool: Pool) {
        pool.on('connect', () => {
            this.retry_count = 0;
        });

        pool.on('error', this._onPostgreSQLError);
    }

    /**
     * DOCU: Handle connection error <br>
     * Triggered: On connection error <br>
     * Last Updated Date: << INSERT_DATE >>
     * @param error - Error object
     * @author << INSERT_NAME >>
     */
    private readonly _onPostgreSQLError = (error: Error) => {
        if(this.retry_count !== null && this.retry_count < COMMON_VALUES.number.three){
            console.error('Retrying PostgreSQL Connection:', error.message);
            setTimeout(async () => {
                if (this.retry_count !== null) {
                    this.retry_count++;
                }
                await this.getConnection();
            }, COMMON_VALUES.number.fifteen_thousand);
        }
        else{
            console.error('PostgreSQL Connection Error:', error.message);
            throw error;
        }
    }
}

export default DatabaseModel;