// components/ui/toast/ToastNotification.tsx
"use client";
import { toast, ToastContainer as ReactToastContainer } from 'react-toastify';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  title?: string;
  options?: ToastOptions;
}

interface ToastOptions {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  draggablePercent?: number;
  progress?: undefined;
  theme?: 'light' | 'dark' | 'colored';
  style?: React.CSSProperties;
  className?: string;
}

// Type styles mapping
const toastStyles = {
  success: "bg-emerald-50 border-emerald-100 text-emerald-800",
  error: "bg-rose-50 border-rose-100 text-rose-800",
  info: "bg-blue-50 border-blue-100 text-blue-800",
  warning: "bg-amber-50 border-amber-100 text-amber-800",
};

const iconStyles = {
  success: "text-emerald-500",
  error: "text-rose-500",
  info: "text-blue-500",
  warning: "text-amber-500",
};

const closeButtonStyles = {
  success: "hover:bg-emerald-500 hover:bg-opacity-20",
  error: "hover:bg-rose-500 hover:bg-opacity-20",
  info: "hover:bg-blue-500 hover:bg-opacity-20",
  warning: "hover:bg-amber-500 hover:bg-opacity-20",
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  return <div className={`flex-shrink-0 ${iconStyles[type]}`}>{iconMap[type]}</div>;
};

const ToastContent = ({ type, message, title }: { type: ToastType; message: string; title?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    className={`relative w-full rounded-lg p-4 shadow-lg border flex items-start gap-3 ${toastStyles[type]}`}
  >
    <ToastIcon type={type} />
    <div className="flex-1">
      {title && (
        <h3 className="font-semibold text-sm mb-1">
          {title}
        </h3>
      )}
      <p className="text-sm">{message}</p>
    </div>
    <button
      onClick={(e) => {
        e.preventDefault();
        toast.dismiss();
      }}
      className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${closeButtonStyles[type]}`}
      aria-label="Close notification"
    >
    </button>
  </motion.div>
);

export const showToast = ({ type, message, title, options }: ToastProps) => {
  if (typeof window === 'undefined') return;
  
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 20,
    progress: undefined,
    theme: "light",
    style: {
      zIndex: 9999,
      padding: 0,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      overflow: 'visible',
    },
    className: 'p-0 bg-transparent shadow-none',
    ...options,
  };

  const content = (
    <AnimatePresence>
      <ToastContent type={type} message={message} title={title} />
    </AnimatePresence>
  );

  toast.dismiss();

  switch (type) {
    case 'success':
      toast.success(content, toastOptions);
      break;
    case 'error':
      toast.error(content, toastOptions);
      break;
    case 'info':
      toast.info(content, toastOptions);
      break;
    case 'warning':
      toast.warn(content, toastOptions);
      break;
    default:
      toast(content, toastOptions);
  }
};

export const ToastContainer = () => {
    return (
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-4 right-4 w-full max-w-xs space-y-2 z-[9999]">
          <ReactToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={true}
            pauseOnHover={true}
            theme="light"
            closeButton={false}
            className="toast-container"
            toastClassName="my-toast"
          />
        </div>
      </div>
    );
  };