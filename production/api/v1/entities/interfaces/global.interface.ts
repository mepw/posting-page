export interface ResponseDataInterface<ResultValue = undefined>{
    status: boolean,
    result?: ResultValue,
    error: unknown
}