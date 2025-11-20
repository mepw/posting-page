export type SentryErrorTrackingParams = {
    total_duration: number;
    database_info?: {
        database: string;
        query: string;
        performance: string;
    };
    custom_error_message: string;
    error: Error | string;
}