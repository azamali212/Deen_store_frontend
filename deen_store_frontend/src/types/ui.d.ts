import Dashboard from '../app/(dashboard)/dashboard/page';
import { color } from 'framer-motion';
"use client"

//Auth 
interface AuthLayoutProps {
  children: ReactNode;
}
//For Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  styleType?: StyleType;
  rightIcon?: React.ReactNode;
  variant?: 'admin' | 'customer';
}

//For Button
// @/types/ui.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ButtonVariant?: 'primary' | 'text' | 'ghost';
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

//Card
export interface CardProps {
  children?: React.ReactNode; //? this sign use only for optional or not a null same like that 
  className?: string;
  title?: string;
  styleType?: StyleType;
  style?: React.CSSProperties;
  variant?: string;
  content?: React.ReactNode;
}

//Chart
export interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  width?: number;
  height?: number;
  plugins?: Plugin[];
}

export interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}
//Table
export interface TableProps {
  title?: string;
  headers: string[];
  headers: TableHeader[];
  data: any[];
  data: TableRow[];
  customRender?: {
    [key: string]: (value: any, row?: any) => ReactNode;
  };
  externalPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  rowProps?: (row: any) => React.HTMLAttributes<HTMLTableRowElement>;
  onPageChange?: (page: number) => void;
  externalSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  pageSize?: number;
  rowExpandable?: boolean;
  expandedRows?: Set<string>;
  onRowExpand?: (id: string) => void;
  expandedContent?: (row: any) => React.ReactNode;


  selectable?: boolean;
  onSelectRow?: (id: number | string, isSelected: boolean) => void;
  onSelectAll?: (isSelected: boolean) => void;
  selectedRows?: Set<number>;
  loading?: boolean; 
  rowClassName?: string;
  headerClassName?: string;
  cellClassName?: string;
  pageSize?: number;
}


export interface TableHeader {
  id: string;
  label: string | React.ReactNode;
  width?: string;
  name: string;
  render?: () => React.ReactNode;
  className?: string;
}

export interface TableRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  status: string;
  last_activity: string | null;
  user: {
      name: string;
      email: string;
      created_at: string;
      avatar: string;
  };
  contact: {
      email: string;
      verified: boolean;
  };
  location: string;
  roles: any[];
  permissions: any[];
  actions: {
      id: string;
  };
}

interface LogoProps {
  src?: string;
  alt?: string;
  height?: number;
  width?: number;
  className?: string;
  variant?: 'customer' | 'admin';
}

//Model 
interface ModelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Define sizes as needed
  position?: 'top' | 'center' | 'bottom'; // Define positions as needed
}

//ForgetPassword
interface ForgotPasswordModalProps {
  modalStep: ModalStep;
  onClose: () => void;
  forgotEmail: string;
  setForgotEmail: (value: string) => void;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onSubmitEmail: (e: React.FormEvent) => void;
  onSubmitVerification: (e: React.FormEvent) => void;
  onSubmitResetPassword: (e: React.FormEvent) => void;
  forgotPhone;
  setForgotPhone;
  onSelectMethod: (method: 'email' | 'phone') => void;
  loading?: boolean;
  error?: string | null;
}

//Login Form
interface LoginProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  handleLogin: (e: React.FormEvent) => void;
  openForgotPassword: () => void;
  variant?: 'customer' | 'admin';
  error?: string | null;
}

export type StyleType = 'primary' | 'light' | 'dark' | 'accent';


export interface SidebarItemProps {
  label: string;
  collapsed: boolean;
  icon: React.ReactElement<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  showTooltip?: boolean;
  href?: string;
  activeClass?: string;
  rightIcon?: React.ReactNode;
}

export interface DropdownItem {
  label?: string;
  href?: string;
  onClick?: () => void;
}

export interface DropDownProps {
  icon?: React.ReactElement<{ size?: number; strokeWidth?: number } & React.SVGProps<SVGSVGElement>>;
  label?: string;
  collapsed?: boolean;
  items: DropdownItem[];
  variant?: 'sidebar' | 'navbar';
  showTooltip?: boolean;
}

export interface DashboardLayoutProps {
  children: ReactNode;
}

export interface NavbarItemProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface TooltipProps {
  children: ReactElement<{
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
  }>;
  content: React.ReactNode; // Changed from string to React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
  interactive?: boolean; // Add this if you want interactive tooltips
  placement?: 'top' | 'right' | 'bottom' | 'left'; // Alias for 'side'
  delayDuration?: number; // 
  className?: string; // Add className for custom styles
  maxHeight?: string; // Add maxHeight prop for tooltip content
}



export interface SidebarDropdownItem {
  label: string;
  href: string;
  icon?: React.ReactElement;
  items?: SidebarDropdownItem[];
  onMouseEnter?: () => void;
  onClick?: () => void;
}

export interface SidebarDropdownProps {
  icon: React.ReactElement<{ size?: number; strokeWidth?: number }>;
  label: string;
  collapsed: boolean;
  items: SidebarDropdownItem[];
  href?: string;
  activeClass?: string;
  onMouseEnter?: () => void;
  isActive?: boolean;
  onClick?: () => void;
}

export interface DashboardProps {
  isSidebarCollapsed: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export interface ProgressProps {
  value?: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  className?: string;
  title?: string;
}

export interface BarProps {
  data: any;
  options?: any;
  width?: number;
  height?: number;
}

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}


//For Redux


export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ErrorResponse {
  message: string;
  details?: string;
  status?: number;
}
export interface ErrorDetails {
  message: string;
  details?: Record<string, string[]> | {}; // For validation errors
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isAuthenticated: boolean;
}

//ForgetPassword
export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

//Role Interface
export interface Role {
  id: number;
  name: string;
  slug: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    model_type: string;
    model_id: string;
    role_id: number;
  };
  permissions: Permission[];
}

interface RoleData {
  id: string;
  title: RoleTitle;  // use your RoleTitle type here
  description: string;
  userCount: number;
  color: string;
}

export interface RolePayload {
  name: string;
  slug?: string;
  permission_names: string[];
  permissions?: string[];
}

export interface RoleResponse {
  role: Role;
  message?: string;
  permissions: { id: number; name: string }[];
}

export interface PermissionAttachPayload {
  id: number;
  permissions: string[];
}

export interface RoleUserAttachPayload {
  id: number;
  users: string[];
}

export interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  roleUsers: PaginatedUserResponse | null;
  loading: boolean;
  roleUsers: PaginatedUserResponse | null;
  rolePermissions: Permission[];
  error: string | null;
  rolePermissions?: string[]; // add if needed
  roleUsers?: number[]; // add if needed
  successMessage: string | null;
  error: ErrorDetails | null; // Changed from string | null
  lastDeleted?: string; // Optional timestamp
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };


  roles: Role[];
  selectedRole: Role | null;
  rolePermissions: RolePermissionsResponse | null; // Updated to match response structure
  roleUsers?: number[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface PaginatedUserResponse {
  data: User[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;

}

export interface PaginatedRoleResponse {
  current_page: number;
  data: Role[];
  total: number;
  per_page: number;
  last_page: number;
  // add other pagination fields from your API response if needed
}

export interface RolePermissionsResponse {
  data: Permission[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    role_id: number;
    permission_id: number;
  };
}


//Permission Interface *******************************************
export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  category?: string;
  roles?: Role[];
  color?: string; // 
}

export interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  successMessage: string | null;
  color?: string;
  distribution: {
    data: PermissionDistribution[];
    loading: boolean;
    error: string | null;
  };
}
export interface PermissionDistribution {
  name: string;
  role_count: number;
  user_count: number;
  role_percentage: number;
  user_percentage: number;
}

export interface ExtendedPermission extends Permission {
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      permission_id: number;
      role_id: number;
    };
  }>;
}





interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface BulkDeleteResponse {
  success: boolean;
  message: string;
  data: {
    ids: number[];          // IDs that were successfully deleted
    deleted_count: number;  // Number of successfully deleted items
    failed_ids: number[];   // IDs that failed to delete
    skipped_ids: number[];  // IDs that were skipped
  };
  metadata?: {
    total_requested: number;
    timestamp: string;
  };
}

// User Interfaces
export interface UserPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  customerUsers: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  roles: Role[];

  confirm_password?: string | null;
  stripe_id?: string | null;
  pm_type?: string | null;
  pm_last_four?: string | null;
  trial_ends_at?: string | null;
  default_payment_method?: string | null;
  deleted_at?: string | null;
  email_verification_token?: string | null;
  status: 'active' | 'inactive'; // Add status with specific values

  account_type: 'admin' | 'customer' | null; // Add account_type
  created_at: string;
  updated_at: string;

  last_login_at?: string;
  email_verified_at?: string | null;
  location?: string;
  roles?: Array<{
    id: number;
    name: string;
    permissions?: Array<{
      id: number;
      name: string;
    }>;
  }>;
  permissions?: Array<{
    id: number;
    name: string;
  }>;
  avatar?: string;
  account_type?: string;
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: UserPagination;
  successMessage: string | null;
  selectedUser: User | null;
  stats: UserStats; // Add stats to UserState
  roles?: Role[];
  permissions?: Permission[];
  location?: string;
  deletedUsers: DeletedUsersState;
}

//Delete Interface 
export interface DeletedUser {
  user_id: string;
  user_name: string;
  roles: string[];
  deleted_at: string;
  // Add any other fields your API returns
}

interface DeletedUsersState {
  data: DeletedUser[];
  loading: boolean;
  error: string | null;
}

export interface DetailedUser extends User {
  roles: Array<{
    id: number;
    name: string;
    permissions: Array<{
      id: number;
      name: string;
      slug?: string; // Make slug optional
    }>;
  }>;
  permissions: Array<{
    id: number;
    name: string;
    slug?: string; // Make slug optional
  }>;
  avatar?: string;
}

export interface TableUser {
  id: string;
  user: {
    name: string;
    email: string;
    created_at: string;
    avatar: string;
  };
  contact: {
    email: string;
    verified: boolean;
  };
  location: string;
  role: string;
  roles: any[];
  permissions: any[];
  status: 'active' | 'inactive';
  last_activity: string | null;
  actions: {
    id: string;
  };
}

