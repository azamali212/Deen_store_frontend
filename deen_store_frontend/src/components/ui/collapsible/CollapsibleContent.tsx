import React from 'react';

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className = '', isOpen = false }, ref) => {
    return (
      <div
        ref={ref}
        id="collapsible-content"
        className={`collapsible-content ${className}`}
        data-state={isOpen ? 'open' : 'closed'}
        hidden={!isOpen}
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    );
  }
);

CollapsibleContent.displayName = 'CollapsibleContent';

export { CollapsibleContent };