import { Colors } from '@/constants/colors'
import { InputProps } from '@/types/ui'
import React from 'react'

const Input: React.FC<InputProps> = ({ label, className = '',rightIcon, style = {},variant='customer', ...props }) => {
    return (
        <div className="w-full mb-4">
            {label && (
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                {...props}
                style={style}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${className}`}
                onFocus={(e) => {
                    const focusColor = variant === 'admin' ? Colors.ADMINLOGINCOLOR : Colors.PRIMARY;
                    const shadowColor = variant === 'admin' ? '#a88974' : Colors.PRIMARY_LIGHT;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${shadowColor}`;
                    e.currentTarget.style.borderColor = focusColor;
                }}
                onBlur={(e) => {
                    e.currentTarget.style.boxShadow = ''
                    e.currentTarget.style.borderColor = ''
                }}
            />
        </div>
    )
}

export default Input
