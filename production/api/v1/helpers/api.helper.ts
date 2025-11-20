import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BusinessLogicError } from "./global.helper";
import { RequestConfig } from "../entities/types/global.type";

/**
 * DOCU: Sends an HTTP request using Axios. <br>
 * Triggered by: Any service file that calls API requests to other microservices. 
 * Last updated at: Nov 11, 2025 <br>
 * @param {Object} config - The configuration object for the request.
 * @param {string} config.url - The URL to which the request is sent.
 * @param {HttpMethods} config.method - The HTTP method to use for the request.
 * @param {Record<string, unknown>} [config.data={}] - The data to send in the request body (for POST, PUT, PATCH).
 * @param {Record<string, unknown>} [config.query_params={}] - The query parameters to include in the request URL.
 * @param {Record<string, string>} [config.headers={}] - Custom headers to include in the request.
 * @template Result - The type of the response data that is expected.
 * @returns {Promise<Result>} A promise that resolves to the response data of type Result.
 * @throws {BusinessLogicError} Throws a BusinessLogicError if the request fails, providing the error message from Axios or a generic message.
 * @author Jaybee
 */
export const sendRequest = async <Result>(
    {url, method, data = {}, query_params = {}, headers = {}
}: RequestConfig): Promise<Result> => {

    try{
        const config: AxiosRequestConfig = { method, url, data, params: query_params, headers };
        const response: AxiosResponse<Result> = await axios(config);

        return response.data;
    }
    catch(error){
        let error_message: string = "";

        if (axios.isAxiosError(error)) {
            if(error.response?.data){
                error_message = typeof error.response.data === "string"
                ? error.response.data 
                : JSON.stringify(error.response.data);
            }
            else{
                error_message = error.message;
            }
        } 
        else if(error instanceof Error){
            error_message = error.message;
        } 
        else{
            error_message = String(error); 
        }

        throw new BusinessLogicError(error_message || "Something went wrong in sending request.");
    }
}