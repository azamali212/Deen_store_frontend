"use client";
import Button from '@/components/ui/buttons/button';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { useRole } from '@/hooks/role/useRole';
import { toast } from 'react-toastify';
import { showToast } from '@/components/ui/toast/ToastNotification';

interface DeleteRoleModelProps {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (v: boolean) => void;
  id: number;
  roleName: string;
}

const DeleteRoleModel: React.FC<DeleteRoleModelProps> = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  id,
  roleName
}) => {
  const { removeRole, loading, error, successMessage, resetRole } = useRole();

  React.useEffect(() => {
    if (successMessage) {
      showToast({
        type: 'success',
        message: successMessage
      });
      resetRole();
      setIsDeleteModalOpen(false);
    }
    if (error) {
      showToast({
        type: 'error',
        message: error
      });
      resetRole();
    }
  }, [successMessage, error, resetRole, setIsDeleteModalOpen]);

  const handleDelete = () => {
    removeRole(id);
  };

  if (!isDeleteModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className=" bg-[rgb(var(--card))] rounded-xl shadow-2xl overflow-hidden w-full max-w-sm border border-gray-200 dark:border-gray-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full">
            <Trash2 className="w-7 h-7 text-red-500 dark:text-red-400" />
          </div>

          <h3 className="text-xl font-bold text-center text-[rgb(var(--card))] mb-3">
            Confirm Deletion
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
            You are about to delete the role <span className="font-semibold text-red-500 dark:text-red-400">"{roleName}"</span>. 
            <br />
            This action <span className="font-bold">cannot</span> be undone.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-red-500/30 dark:shadow-red-900/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : 'Delete'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteRoleModel;