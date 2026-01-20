// core/auth/auth.storage.ts
import { AuthTab } from "./auth.tab";

export const AuthStorage = {
  key(portal: "admin" | "customer") {
    return `auth:${portal}:${AuthTab.getId()}`;
  },
  
  setAccessToken(token: string, portal: "admin" | "customer") {
    // Store in sessionStorage for frontend
    sessionStorage.setItem(this.key(portal), token);
    
    // Store in localStorage for persistence across tabs
    localStorage.setItem(`${portal}_token`, token);
    
    // Store in cookies for middleware (1 day expiry)
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    document.cookie = `${portal}_access_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  },
  
  getAccessToken(portal: "admin" | "customer"): string | null {
    // Try sessionStorage first
    const sessionToken = sessionStorage.getItem(this.key(portal));
    if (sessionToken) return sessionToken;
    
    // Fallback to localStorage
    const localToken = localStorage.getItem(`${portal}_token`);
    if (localToken) {
      // Restore to sessionStorage
      sessionStorage.setItem(this.key(portal), localToken);
      return localToken;
    }
    
    return null;
  },
  
  getTokenFromCookie(portal: "admin" | "customer"): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${portal}_access_token=`)
    );
    
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  },
  
  clear(portal: "admin" | "customer") {
    const sessionKey = this.key(portal);
    
    // Clear all storage locations
    sessionStorage.removeItem(sessionKey);
    localStorage.removeItem(`${portal}_token`);
    localStorage.removeItem(`auth:${portal}`); // legacy
    
    // Clear all possible cookie variations
    document.cookie = `${portal}_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    
    // Also clear any session storage with similar keys
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes(portal) || key.includes('auth') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  },
  
  hasToken(portal: "admin" | "customer"): boolean {
    return !!this.getAccessToken(portal) || !!this.getTokenFromCookie(portal);
  },
};