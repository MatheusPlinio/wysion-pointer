import axios from "axios";
import * as dotenv from 'dotenv';
dotenv.config();

const apiClient = axios.create({
    baseURL: process.env.BASE_URL_API_DRHOXI,
    headers: {
        "Content-Type": "application/json"
    }
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Erro na API:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;