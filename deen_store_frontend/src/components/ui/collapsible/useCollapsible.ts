import { useState, useEffect } from 'react';

interface UseCollapsibleProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const useCollapsible = ({ defaultOpen = false, onOpenChange }: UseCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  return { isOpen, toggle };
};