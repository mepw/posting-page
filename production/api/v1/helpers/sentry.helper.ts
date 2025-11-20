/* Imports for vendors */
import * as Sentry from "@sentry/node";

/* Imports for helpers */

/* Imports for interfaces and types */
import { SentryErrorTrackingParams } from "../entities/types/sentry.type";

/**
 * @class
 * Class representing Sentry Helper
 */
export class SentryErrorHelper {
    /* Flag to enable or disable Sentry tracking */
    private readonly enable_sentry_tracking: boolean;

    /**
     * Default Constructor.<br>
     * Triggered: When encountered an error in database and in application. <br>
     * Last Updated Date: << INSERT_DATE >>
     * @author << INSERT_AUTHOR >>
     */
    constructor(enable_sentry_tracking: boolean) {
        this.enable_sentry_tracking = enable_sentry_tracking;
    }

    /**
     * DOCU: Tracks errors and sends them to Sentry with additional context.<br>
     * Triggered: When an error needs to be logged to Sentry.<br>
     * Last Updated Date: << INSERT_DATE >>
     * @module SentryErrorHelper
     * @param {SentryErrorTrackingParams} details - Object containing error details such as duration, database info, and custom message.
     * @param {boolean} is_database_error - Optional flag to indicate if the error is a database-related error.
     * @returns void
     * @author << INSERT_AUTHOR >>
     */
    trackError = (details: SentryErrorTrackingParams, is_database_error: boolean = false): void => {
        const {total_duration, database_info, error, custom_error_message} = details;

        /* Disable Sentry tracking in the local development environment. */
        if(!this.enable_sentry_tracking){
            return;
        }

        /* Skip logging specific error types, such as 'EADDRINUSE'. */
        if(typeof error === "string" && error.includes("EADDRINUSE")){
            return;
        }

        /* Configure Sentry scope and capture the exception. */
        Sentry.withScope((scope) => {
            /* Add request duration to the scope. */
            scope.setExtra("request-runtime", `${total_duration}s runtime`);

            if(is_database_error && database_info){
                /* Tag the error as a database-related error and add database context. */
                scope.setTag("error-type", "database");
                scope.setExtra("database", database_info.database);
                scope.setExtra("db-performance", database_info.performance);
                scope.setExtra("db-query", database_info.query);
            }
            else{
                /* Tag the error as an application-related error and add custom error info. */
                scope.setTag("error-type", "application");
                scope.setExtra("custom-error", error);
            }

            /* Create a new error instance with the custom error message or default message. */
            const tracked_error = error || new Error(custom_error_message?.toString() || "Unknown error");

            /* Send the error to Sentry for logging. */
            Sentry.captureException(tracked_error);
        });
    }
}