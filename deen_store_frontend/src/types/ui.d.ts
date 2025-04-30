import Dashboard from '../app/(dashboard)/dashboard/page';
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
  variant?: 'primary' | 'text' | 'ghost';
  className?: string;
  style?: React.CSSProperties;
}

//Card
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  styleType?: StyleType;
  style?: React.CSSProperties;
  variant?: 'admin' | 'customer' | "sidebar";
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
}

//Login Form
interface LoginProps {
  emailOrPhone: string;
  setEmailOrPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  handleLogin: (e: React.FormEvent) => void;
  openForgotPassword: () => void;
  variant?: 'customer' | 'admin';
}

export type StyleType = 'primary' | 'light' | 'dark' | 'accent';


interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  collapsed: boolean;
  icon: ReactElement;

}


interface DropDownProps {
  icon: ReactElement; // <-- change this from ReactNode
  label: string;
  collapsed: boolean;
  items: {
    label: string;
    href: string;
  }[];

}

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavbarItemProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}
interface SidebarProps {
  collapsed: boolean;  // Expect the collapsed prop
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;  // Expect the setCollapsed function
}
