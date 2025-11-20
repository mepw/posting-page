/**
 * ----------------------------------- ALL APP CONSTANTS -----------------------------------
 * Exported 1 by 1 so that when imported on other files you can just do DATE_FORMAT
 * instead of being wrapped in another object like CONSTANTS.DATE_FORMAT
 */
export const DATE_FORMAT = {
    year_month_day:      "yyyy-MM-dd",
    year_month_day_numeric: "YYYY-MM-DD",
    year_month_day_time: "yyyy-MM-dd HH:mm:ss",
} as const;

/* Resource: https://kinsta.com/blog/http-status-codes/ */
export const RESPONSE_STATUS = {
    info:         100,
    success:      200, /* Status code for success fetching and updating data */
    created:      201, /* Status code for success creating data */
    no_content:   204, /* Status code for success deleting data */
    redirect:     300, 
    client_error: 400, /* Validation, no file, no text */
    unauthorized: 401,
    server_error: 500 /* Unhandled app error */
} as const;

export const PAGINATION_RULES = {
    minimum_limit:   1,
    minimum_offset:  0
};

export const COMMON_VALUES = {
    number: {
        negative_one: -1,
        zero: 0,
        one:  1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        seven: 7,
        hundred: 100,
        one_thousand: 1000,
        fifteen_thousand: 15000,
        thirty: 30,
        twenty_four: 24,
        sixty: 60
    }
};

export const BOOLEAN_VALUES = {
    active_value: COMMON_VALUES.number.one,
    inactive_value: COMMON_VALUES.number.zero,
    true_value: COMMON_VALUES.number.one,
    false_value: COMMON_VALUES.number.zero
} as const;

export const INDEX_VALUE = {
    zero: COMMON_VALUES.number.zero,
    one:  COMMON_VALUES.number.one,
    two:  COMMON_VALUES.number.two,
    three:  COMMON_VALUES.number.three,
};

export const NO_ID = 0;

export const INDEX_0 = 0;
export const INDEX_1 = 1;
export const NUMBER_8 = 8;
export const NUMBER_10 = 10;

/* Environment */
export const ENVIRONMENT = {
    development: "development",
    staging: "staging",
    production: "production"
};

/* HTTP Request Methods */
export const HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    DELETE: "DELETE",
    PUT: "PUT"
};

export const RESPONSE_DATA_DEFAULT_VALUE = { 
    status: false, 
    error: null 
};

