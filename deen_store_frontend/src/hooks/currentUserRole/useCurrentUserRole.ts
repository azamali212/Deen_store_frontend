// hooks/useCurrentUserRole.ts
import { useAuth } from '../auth/useAuth';

export const useCurrentUserRole = () => {
  const { user } = useAuth();
  
  //console.log('=== DEBUG USER ROLES ===');
  //console.log('User roles array:', user?.roles);
  
  // Extract role from the roles array
  const getUserRole = () => {
    if (!user?.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return 'Super Admin'; // Fallback
    }
    
    // Get the first role (assuming users have one primary role)
    const userRole = user.roles[0];
    console.log('First role object:', userRole);
    
    // The role name could be in different properties
    return userRole.name  || userRole.name || 'Super Admin';
  };
  
  const userRole = getUserRole();
  const loading = !user;

  //console.log('Extracted userRole:', userRole);
  //console.log('=== END DEBUG ===');
  
  return { userRole, loading };
};