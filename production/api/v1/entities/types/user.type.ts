

export type CreateUserParamsTypes = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    user_level_id: number;
    hobbies: string[];
}

export type GetUserById = {
    id: number;
}

export type VerifyLoginParamsTypes = {
    email: string,
    password: string,
    first_name: string
}

export type JWTUserPayload = {
    id: number;
};

export type LogoutParamsType = {
    id: number;
};