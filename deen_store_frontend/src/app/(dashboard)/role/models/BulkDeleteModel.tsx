import Button from '@/components/ui/buttons/button';
import { MotionConfig, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react'

const BulkDeleteModel = ({
    isOpen,
    onClose,
    onConfirm,
    count
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    count: number;
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>

                    <div className="text-center mt-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="mt-3 text-lg font-medium text-gray-900">
                            Delete {count} role{count !== 1 ? 's' : ''}?
                        </h3>
                        <div className="mt-2 text-sm text-gray-500">
                            <p>This action cannot be undone. All users assigned to these roles will have them removed.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            variant="ghost"
                            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BulkDeleteModel
