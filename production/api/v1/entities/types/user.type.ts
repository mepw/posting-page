export type CreateUserParamsTypes = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export type VerifyLoginParamsTypes = {
    email: string,
    password: string,
    first_name: string
}

export type JWTUserPayload = {
    id: number;
};