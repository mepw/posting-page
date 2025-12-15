/* Vendor modules */
import Fs from "fs";
import Yaml from "js-yaml";

/* Interfaces/Types */
import {
    AuthInterface,
    ConstantsInterface,
    DatabaseInterface,
    FileContentInterface,
    JWTInterface,
    SentryInterface,
    BcryptType
} from "./entities.constant";

/* Create CONSTANTS from the <environment>.env.yml file */
const env_file_name = `${process.env.NODE_ENV?.trim()}.env.yml`;
const env_file_contents = Fs.readFileSync(`./configs/${env_file_name}`, 'utf8');
const CONSTANTS: ConstantsInterface   = Yaml.load(env_file_contents) as FileContentInterface;

/* Handling for typing nested values from <environment>.env.yml */
const AUTH = CONSTANTS.AUTH as AuthInterface;
export const API = AUTH.API;
export const ENV = CONSTANTS;
export const JWT = CONSTANTS.JWT as JWTInterface;
export const SHOW_ERROR_DETAILS = CONSTANTS.SHOW_ERROR_DETAILS;
export const DATABASE = CONSTANTS.DATABASE as DatabaseInterface;
export const BCRYPT = CONSTANTS.BCRYPT as BcryptType;
export const READ_REPLICA_DATABASE = CONSTANTS.READ_REPLICA_DATABASE as DatabaseInterface;
export const SMTP_USER = ENV.SMTP_USER as string;
export const SMTP_PASS = ENV.SMTP_PASS as string;
export const SMTP_FROM = ENV.SMTP_FROM as string;

/* Sentry */
export const SENTRY = CONSTANTS.SENTRY as SentryInterface;