//API url apiUrl.tsx
import axios from 'axios';

export const apiUrl = {
    apiUrlConfig: "http://103.214.132.20:8002",
}

// Create an Axios instance with the base URL
export const apiAxios = axios.create({
    baseURL: apiUrl.apiUrlConfig,
});

export const AUTH_TOKEN = "token 1b670b800ace83b:f82627cb56de7f6"; 