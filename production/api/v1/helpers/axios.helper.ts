import axios from "axios";
import { ENVIRONMENT } from "../../../configs/constants/app.constant";
import { SendRequestToAxiosInterface } from "../entities/interfaces/request_response.interfaces";

/**
 * DOCU: This is function helper to send a request to other server/service. <br>
 * Last updated at: Nov 11, 2025 <br>
 * @param token - Bearer token
 * @param url - URL to make the request
 * @param method - Method type of the request
 * @param data - The body or payload of the request
 * @returns reference_number - string
 * @author Jaybee
 */
export const sendRequestToAxios = async <RequestDataType, ResponseDataType>(params: SendRequestToAxiosInterface<RequestDataType>): Promise<ResponseDataType> => {
    try{
        const { token, url, method, data } = params;
        const headers: { "Content-Type": string; "Authorization"?: string } = {
            "Content-Type": "application/json"
        };

        /* Check if token is provided */
        if(token){
            headers["Authorization"] = `Bearer ${token}`;
        }

        /* Make the axios request */
        const axios_response = await axios({
            method, url, data, headers
        });

        return axios_response.data;
    }
    catch(error){
        /* For easy debugging */
        if(![ENVIRONMENT.production, process.env.TEST_PORT].includes(process.env.PORT)){
          
        }

        throw error;
    }
}