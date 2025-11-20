import { HttpMethods } from "../enums/global.enum";

export interface RequestConfig {
    url: string;
    method: HttpMethods;
    data?: Record<string, unknown>;
    query_params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export type NullableString = null | string;
export type OptionalString = undefined | string;


/* Type definitions for formatResponse - START */
export type ErrorDetails = {
    title: string;
    message: string;
    details?: Error | string | unknown;
};

export type SuccessResponse<GenericResponseData> = {
    code: string;
    result: GenericResponseData;
};

export type ErrorResponse = {
    code: string;
    result: null;
    error: ErrorDetails;
};

export type FormattedResponse<GenericResponseData = void> = SuccessResponse<GenericResponseData> | ErrorResponse;

type SuccessResponseParams<GenericResponseData> = {
  type: 'success';
  code: string;
  result: GenericResponseData;
};

type ValidationErrorParams = {
    type: 'validation_error';
    code: string;
    errors: { [key: string]: string };
};

type BaseErrorParams = {
    code: string;
    title: string;
    message: string;
    error?: Error | string | unknown;
};

type AuthenticationErrorParams = BaseErrorParams & {
    type: 'authentication_error';
};

type BusinessLogicErrorParams = BaseErrorParams & {
    type: 'business_logic_error';
};

type CustomErrorParams = BaseErrorParams & {
    type: 'custom_error';
};

type DatabaseErrorParams = BaseErrorParams & {
    type: 'database_error';
};

type ErrorParams = BaseErrorParams & {
    type: 'error';
};

/* Options for formatResponse function */
export type FormatResponseParams<GenericResponse = unknown> = 
    | SuccessResponseParams<GenericResponse>
    | ValidationErrorParams
    | AuthenticationErrorParams
    | BusinessLogicErrorParams
    | CustomErrorParams
    | DatabaseErrorParams
    | ErrorParams;

/* Type definitions for formatResponse - END */