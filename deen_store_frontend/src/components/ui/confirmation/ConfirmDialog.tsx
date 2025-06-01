// Create a new file: src/hooks/use-confirm.ts
import { useState } from 'react';
import Model from '../modals/model';
import Button from '../buttons/button';


export const useConfirm = (title: string, message: string) => {
    const [isOpen, setIsOpen] = useState(false);
    const [resolve, setResolve] = useState<(value: boolean) => void>(() => { });

    const confirm = () => {
        setIsOpen(true);
        return new Promise<boolean>((res) => {
            setResolve(() => res);
        });
    };

    const handleConfirm = () => {
        resolve(true);
        setIsOpen(false);
    };

    const handleCancel = () => {
        resolve(false);
        setIsOpen(false);
    };

    const ConfirmDialog = () => (
        <Model
            isOpen={isOpen}
            onClose={handleCancel}
            title={title}
            size="md"
            showFooter={true}
            footerContent={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        style={{ backgroundColor: '#EF4444' }}
                    >
                        Delete
                    </Button>
                </div>
            }
        >
            <p>{message}</p>
        </Model>
    );

    return [ConfirmDialog, confirm] as const;
};