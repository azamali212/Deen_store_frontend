import React from 'react';
import { CollapsibleContext } from './Collapsible';

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className = '', asChild = false }, ref) => {
    const { isOpen, toggle } = React.useContext(CollapsibleContext);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      toggle();
    };

    if (asChild && React.isValidElement(children)) {
      // Type-safe approach using type assertion
      const child = children as React.ReactElement<{
        onClick?: React.MouseEventHandler;
        [key: string]: unknown;
      }>;

      return React.cloneElement(child, {
        onClick: (e: React.MouseEvent) => {
          handleClick(e);
          if (child.props.onClick) {
            child.props.onClick(e);
          }
        },
        'aria-expanded': isOpen,
        'aria-controls': 'collapsible-content',
        ref,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={`collapsible-trigger ${className}`}
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-controls="collapsible-content"
      >
        {children}
      </button>
    );
  }
);

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export { CollapsibleTrigger };