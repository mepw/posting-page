import { SignOptions } from "jsonwebtoken";

export interface FileContentInterface {
    [key: string]: string;
}

export interface DatabaseInterface {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
}

export interface AuthAPIInterface {
    secretToken: string;
    versionNumber: string;
}

export interface AuthInterface {
    API: AuthAPIInterface;
}

export interface JWTInterface {
    secretKey: string;
    bytes: number;
    options: SignOptions;
    access: TokenCredentialsTypes;
    refresh: TokenCredentialsTypes;
}

export type TokenCredentialsTypes = {
    secret_key: string;
    expires_in: string;
};

export type BcryptType = {
    SECRET_KEY: string;
    SALT_ROUNDS: number;
};

export interface SentryInterface {
    dsn: string;
}

export interface GmailSmtpTypes {
    APP_EMAIL_ADDRESS: string;
    APP_PASSWORD: string;
    APP_BCC_EMAIL_ADDRESS: string;
}

export interface ConstantsInterface {
    [key: string]: 
        | string
        | number
        | boolean
        | DatabaseInterface
        | AuthInterface
        | JWTInterface
        | SentryInterface
        | BcryptType
        | TokenCredentialsTypes
        | GmailSmtpTypes;
}