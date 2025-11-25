// utils/sidebarPermissions.ts
export interface SidebarPermission {
    label: string;
    roles: string[];
  }
  
  export const sidebarPermissions: Record<string, SidebarPermission> = {
    dashboard: {
      label: 'Dashboard',
      roles: ['Super Admin', 'Admin', 'Product Admin']
    },
    ecommerce: {
      label: 'Ecommerce',
      roles: ['Super Admin', 'Admin']
    },
    users: {
      label: 'Users',
      roles: ['Super Admin', 'Admin']
    },
    customer: {
      label: 'Customer',
      roles: ['Super Admin', 'Admin']
    },
    vendor_management: {
      label: 'Vendor Management',
      roles: ['Super Admin', 'Admin']
    },
    inventory_management: {
      label: 'Inventory Management',
      roles: ['Super Admin', 'Admin', 'Product Admin']
    },
    analytics_reports: {
      label: 'Analytics & Reports',
      roles: ['Super Admin', 'Admin']
    },
    customization: {
      label: 'Customization',
      roles: ['Super Admin']
    },
    profile_settings: {
      label: 'Profile Settings',
      roles: ['Super Admin', 'Admin', 'Product Admin']
    },
    roles_permissions: {
      label: 'Roles & Permissions',
      roles: ['Super Admin']
    },
    multi_support: {
      label: 'Multi Support',
      roles: ['Super Admin', 'Admin', 'Product Admin']
    },
    language_settings: {
      label: 'Language Settings',
      roles: ['Super Admin', 'Admin', 'Product Admin']
    },
    logistics: {
      label: 'Logistics',
      roles: ['Super Admin', 'Admin']
    },
    salary_management: {
      label: 'Salary Management',
      roles: ['Super Admin', 'Admin']
    },
    payment_management: {
      label: 'Payment Management',
      roles: ['Super Admin']
    },
    marketing_promotions: {
      label: 'Marketing & Promotions',
      roles: ['Super Admin', 'Admin']
    },
    content_management: {
      label: 'Content Management',
      roles: ['Super Admin', 'Admin']
    },
    email: {
      label: 'Email',
      roles: ['Super Admin', 'Admin']
    }
  };
  
  export const hasSidebarPermission = (itemKey: string, userRole: string): boolean => {
    const permission = sidebarPermissions[itemKey];
    return permission ? permission.roles.includes(userRole) : false;
  };