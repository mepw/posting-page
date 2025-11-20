export const AUTHENTICATION_ERROR_MESSAGES = {
    token_expired: "Token expired.",
    incorrect_token: "Authorization token is incorrect.",
    empty_token: "Authorization token is required.",
    invalid_token: "Authorization token is invalid."
};

/**  
 * Default Status code for each request, can be used in the response 
 * NOTE: Code Format will depend on the Project Lead and need to be change per project.
 */
export const STATUS_CODE = {
    valid: {
        success: "VS200"
    },
    invalid: {
        internal_server_error: "ISE500",
        business_logic_error: "BLE400",
        database_error: "DBE500",
        custom_error: "CE400",
        validation_error: "VE400",
        unauthorized: "UA401"
    }
};

/* Default Response type for each request, can be used in the response */
export const RESPONSE_TYPE = {
    valid: {
        success: "success"
    },
    invalid: {
        internal_server_error: "internal_server_error",
        business_logic_error: "business_logic_error",
        database_error: "database_error",
        validation_error: "validation_error",
        custom_error: "custom_error",
        error: "error"
    }
};
    
