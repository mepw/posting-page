export interface ResponseDataInterface <ResultValue = void>{
    status: boolean;
    result?: ResultValue;
    error?: null | string;
}

export interface SendRequestToAxiosInterface <RequestDataType> {
    token: string, 
    url: string, 
    method: string, 
    data: RequestDataType
}