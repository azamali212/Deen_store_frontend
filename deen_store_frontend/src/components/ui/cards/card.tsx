import { Colors } from '@/constants/colors';
import { CardProps } from '@/types/ui';
import React from 'react';

const Card: React.FC<CardProps> = ({ children, className = '', style = {}, variant = "customer", title }) => {
    const adminStyle = {
        backgroundColor: Colors.SIERRA,
        border: `1px solid ${Colors.SIERRA}`,
    };

    const customerStyle = {
        backgroundColor: '#ffffff',
        border: `1px solid ${Colors.PRIMARY_LIGHT}`,
    };

    const sidebarStyle = {
        backgroundColor: Colors.SIERRA,
        backgroundImage: 'linear-gradient(135deg, rgba(53, 73, 94, 0.8), rgba(33, 44, 56, 0.8)), url("/dashboard_logo/done.jpeg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        border: 'none',
        color: '#fff',
      };

    const cardStyle = {
        ...(variant === 'admin' ? adminStyle : variant === 'sidebar' ? sidebarStyle : customerStyle),
        ...style,
    };

    return (
        <div className={`shadow-md rounded-lg p-6 ${className}`} style={cardStyle}>
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            {children}
        </div>
    );
};

export default Card;