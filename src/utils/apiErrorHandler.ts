// import { clearUserSession } from './session';

// let logoutCallback: (() => void) | null = null;
// let showModalCallback: ((show: boolean, message?: string) => void) | null = null;
// let isShowingAuthError = false;

// export const registerLogoutCallback = (callback: () => void) => {
//     logoutCallback = callback;
// };

// export const registerAuthModalCallback = (callback: (show: boolean, message?: string) => void) => {
//     showModalCallback = callback;
// };

// export const isAuthenticationError = (response: any): boolean => {
//     if (!response) return false;

//     const hasAuthException =
//         response.exception === 'frappe.exceptions.AuthenticationError' ||
//         response.exc_type === 'AuthenticationError' ||
//         (response.exc && typeof response.exc === 'string' &&
//             response.exc.includes('AuthenticationError'));

//     // ✅ ADD THIS LOG
//     console.log('[Debug] Is Authentication Error?', hasAuthException, 'Response:', response);

//     return hasAuthException;
// };
// export const handleAuthenticationError = (error?: any) => {
//     console.log('[Debug] handleAuthenticationError triggered.');

//     if (isShowingAuthError) return;

//     isShowingAuthError = true;

//     const message = error?.message ||
//         'Your session has expired or authentication failed.';

//     // Use custom modal if available
//     if (showModalCallback) {
//         console.log('[Debug] Firing showModalCallback to display popup.');
//         showModalCallback(true, message);
//         isShowingAuthError = false;
//         return;
//     }

//     // Fallback to window.confirm
//     const shouldLogout = window.confirm(
//         `${message}\n\nClick OK to return to the login page.`
//     );

//     isShowingAuthError = false;

//     if (shouldLogout) {
//         clearUserSession();
//         if (logoutCallback) {
//             logoutCallback();
//         } else {
//             window.location.href = '/';
//         }
//     }
// };

// export const authenticatedFetch = async (
//   url: string,
//   options?: RequestInit
// ): Promise<Response> => {
//   const response = await fetch(url, options);

//   const contentType = response.headers.get('content-type');
//   if (contentType && contentType.includes('application/json')) {
//     const clonedResponse = response.clone();
//     const data = await clonedResponse.json();

//     // ✅ ADD THIS LOG
//     console.log('[Debug] Intercepted API Response Data:', data);

//     if (isAuthenticationError(data)) {
//       handleAuthenticationError(data);
//       throw new Error('Authentication failed');
//     }
//   }

//   return response;
// };
// export const handleApiResponse = async (response: Response) => {
//     const contentType = response.headers.get('content-type');

//     if (contentType && contentType.includes('application/json')) {
//         const data = await response.json();

//         if (isAuthenticationError(data)) {
//             handleAuthenticationError(data);
//             throw new Error('Authentication failed');
//         }

//         return data;
//     }

//     return response;
// };


// src/utils/apiErrorHandler.ts

import { clearUserSession } from './session';

let logoutCallback: (() => void) | null = null;
let showModalCallback: ((show: boolean, message?: string) => void) | null = null;
let isShowingAuthError = false;

export const registerLogoutCallback = (callback: () => void) => {
    logoutCallback = callback;
};

export const registerAuthModalCallback = (callback: (show: boolean, message?: string) => void) => {
    showModalCallback = callback;
};

export const isAuthenticationError = (response: any): boolean => {
    if (!response) return false;

    // Check for the original error format
    const hasAuthException =
        response.exception === 'frappe.exceptions.AuthenticationError' ||
        response.exc_type === 'AuthenticationError' ||
        (response.exc && typeof response.exc === 'string' &&
            response.exc.includes('AuthenticationError'));

    if (hasAuthException) {
        console.log('[Debug] Is Authentication Error? (Original Format)', true, 'Response:', response);
        return true;
    }

    // ADDED: Check for the new error format (nested in an 'errors' array)
    const hasNestedAuthError =
        Array.isArray(response.errors) &&
        response.errors.length > 0 &&
        response.errors[0].type === 'AuthenticationError';

    if (hasNestedAuthError) {
        console.log('[Debug] Is Authentication Error? (Nested Format)', true, 'Response:', response);
        return true;
    }

    return false;
};

// The rest of the file (handleAuthenticationError, authenticatedFetch, etc.) remains the same.
export const handleAuthenticationError = (error?: any) => {
    console.log('[Debug] handleAuthenticationError triggered.');

    if (isShowingAuthError) return;

    isShowingAuthError = true;

    const message = error?.message ||
        'Your session has expired or authentication failed.';

    if (showModalCallback) {
        console.log('[Debug] Firing showModalCallback to display popup.');
        showModalCallback(true, message);
        isShowingAuthError = false;
        return;
    }

    // Fallback logic...
    const shouldLogout = window.confirm(
        `${message}\n\nClick OK to return to the login page.`
    );
    isShowingAuthError = false;
    if (shouldLogout) {
        clearUserSession();
        if (logoutCallback) {
            logoutCallback();
        } else {
            window.location.href = '/';
        }
    }
};

export const authenticatedFetch = async (
    url: string,
    options?: RequestInit
): Promise<Response> => {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        console.log('[Debug] Intercepted API Response Data:', data);

        if (isAuthenticationError(data)) {
            handleAuthenticationError(data);
            throw new Error('Authentication failed');
        }
    }
    return response;
};

export const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (isAuthenticationError(data)) {
            handleAuthenticationError(data);
            throw new Error('Authentication failed');
        }
        return data;
    }
    return response;
};