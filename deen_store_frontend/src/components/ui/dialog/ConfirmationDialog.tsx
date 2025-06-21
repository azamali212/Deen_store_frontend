'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/buttons/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  destructive = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          {/* Light, subtle backdrop */}
          <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-[1px]" />

          {/* Centered dialog container */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 400,
                duration: 0.15
              }}
              className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="success"
                  onClick={onClose}
                  disabled={loading}
                  className="text-gray-700 hover:bg-gray-50"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={loading}
                  variant={destructive ? 'destructive' : 'primary'}
                  className="shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationDialog;