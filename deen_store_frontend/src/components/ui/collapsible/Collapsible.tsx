import React from 'react';
import { useCollapsible } from './useCollapsible';

interface CollapsibleProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CollapsibleContextProps {
  isOpen: boolean;
  toggle: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextProps>({
  isOpen: false,
  toggle: () => {},
});

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, className = '', defaultOpen = false, onOpenChange }, ref) => {
    const { isOpen, toggle } = useCollapsible({ defaultOpen, onOpenChange });

    return (
      <CollapsibleContext.Provider value={{ isOpen, toggle }}>
        <div 
          ref={ref}
          className={`collapsible ${className}`}
          data-state={isOpen ? 'open' : 'closed'}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);

Collapsible.displayName = 'Collapsible';

export { Collapsible, CollapsibleContext };