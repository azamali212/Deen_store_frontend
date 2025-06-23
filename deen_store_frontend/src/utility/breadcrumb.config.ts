import ROUTES from "@/constants/route.constant";

// You can move this to a separate file like `breadcrumb.config.ts`
const BREADCRUMB_CONFIG: { [key: string]: { label: string; href: string } } = {
    [ROUTES.ROLE]: { label: 'Role', href: ROUTES.ROLE },
    [ROUTES.DASHBOARD]: { label: 'Ecommerce', href: ROUTES.DASHBOARD },
    [ROUTES.PERMISSIONS]: { label: 'Permissions', href: ROUTES.PERMISSIONS }, 
    [ROUTES.USER]: { label: 'User', href: ROUTES.USER }, 
  };


  export default BREADCRUMB_CONFIG;