// // //API url apiUrl.tsx
// // import axios from 'axios';

// // export const apiUrl = {
// //     apiUrlConfig: "https://api.erpnext.ai",
// // }

// // // Create an Axios instance with the base URL
// // export const apiAxios = axios.create({
// //     baseURL: apiUrl.apiUrlConfig,
// // });

// // export const AUTH_TOKEN = "token 1b670b800ace83b:f32066fea74d0fe"; 





// import axios from 'axios';
// import { getUserSession } from '../utils/session'; // Adjust the path based on your project structure

// export const apiUrl = {
//     apiUrlConfig: "https://api.erpnext.ai",
// }

// // Create an Axios instance with the base URL
// export const apiAxios = axios.create({
//     baseURL: apiUrl.apiUrlConfig,
// });

// // Function to get dynamic auth token
// export const getAuthToken = (): string => {
//     const session = getUserSession();
    
//     if (session?.api_key && session?.api_secret) {
//         return `token ${session.api_key}:${session.api_secret}`;
//     }
    
//     // Fallback to hardcoded token if session data is not available
//     console.warn('Session API credentials not found, using fallback token');
//     return "token 11c96b6a1db6ad9:b864f10ffc5e362";
// };

// // Legacy export for backward compatibility (but now dynamic)
// export const AUTH_TOKEN = getAuthToken();

// // Configure axios interceptor to automatically add auth header
// apiAxios.interceptors.request.use(
//     (config) => {
//         // Get fresh token for each request
//         const token = getAuthToken();
//         config.headers.Authorization = token;
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Optional: Response interceptor to handle auth errors
// apiAxios.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401 || error.response?.status === 403) {
//             console.error('Authentication failed. Please check your credentials.');
//             // You could redirect to login page here if needed
//             // window.location.href = '/app';
//         }
//         return Promise.reject(error);
//     }
// );

// // Helper function to manually set headers for specific requests
// export const getAuthHeaders = () => {
//     return {
//         'Authorization': getAuthToken(),
//         'Content-Type': 'application/json'
//     };
// };




import axios from 'axios';
import { getUserSession } from '../utils/session';

export const apiUrl = {
    apiUrlConfig: "https://api.erpnext.ai",
};

export const apiAxios = axios.create({
    baseURL: apiUrl.apiUrlConfig,
});

// api/apiUrl.ts
export const getAuthToken = () => {
    const session = getUserSession();
    if (session?.api_key && session?.api_secret) {
        return `token ${session.api_key}:${session.api_secret}`;
    }
    
    // For development/debugging, you might want to log this
    console.warn("Session API credentials not found. User might not be logged in.");
    return null;
};

// ✅ Add this line back for old imports
export const AUTH_TOKEN = getAuthToken();

apiAxios.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) config.headers.Authorization = token;
        return config;
    },
    (error) => Promise.reject(error)
);

apiAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.error('Authentication failed.');
            // window.location.href = '/app';
        }
        return Promise.reject(error);
    }
);

export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        ...(token && { Authorization: token }),
        'Content-Type': 'application/json'
    };
};
