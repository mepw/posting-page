import { UserTokenDataInterface } from "../interfaces/token.interface";

export type ValidatedUserDataType = { id: number, bearer_token?: string } & Omit<UserTokenDataInterface, "id">;