
// export function getUserSession(): UserSession | null {
//   try {
//     // Check both localStorage and sessionStorage
//     const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
//     if (sessionData) {
//       return JSON.parse(sessionData);
//     }
//     return null;
//   } catch (error) {
//     console.error('Error parsing user session:', error);
//     return null;
//   }
// }
// utils/session.ts
export function getUserSession(): UserSession | null {
  try {
    const sessionData =
      localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user session:', error);
    return null;
  }
}

export interface UserSession {
  company?: string;
  username?: string;
  email?: string;
  full_name?: string;
  sid?: string;
  api_key?: string;
  api_secret?: string;
}

// export function setUserSession(sessionData: UserSession): void {
//   if (!sessionData) return;

//   // Store each property individually
//   const entries = Object.entries(sessionData);
//   for (const [key, value] of entries) {
//     const val = value ?? ''; // Fallback to empty string if null/undefined
//     localStorage.setItem(key, val);
//     sessionStorage.setItem(key, val);
//   }

//   localStorage.setItem('isLoggedIn', 'true');
// }

export function setUserSession(sessionData: UserSession): void {
  if (!sessionData) return;

  const sessionString = JSON.stringify(sessionData);
  localStorage.setItem('userSession', sessionString);
  sessionStorage.setItem('userSession', sessionString);
  localStorage.setItem('isLoggedIn', 'true');
}



export function clearUserSession(): void {
  localStorage.removeItem('userSession');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentRoute');
  sessionStorage.removeItem('userSession');
}

export function isUserLoggedIn(): boolean {
  // Check if user is logged in and has valid session data
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const session = getUserSession();

  // Both conditions must be true for a valid login state
  return isLoggedIn && session !== null;
}

export function getAuthHeaders(): Record<string, string> {
  const session = getUserSession();
  if (session && session.api_key && session.api_secret) {
    return {
      'Authorization': `token 1b670b800ace83b:9f48cd1310e112b`
    };
  }
  // Fallback to existing token
  return {
    'Authorization': 'token 1b670b800ace83b:9bbee85daf53def'
  };
}