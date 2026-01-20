"use client"

import { COLORS } from '@/constants/colors'
import { InputProps } from '@/types/ui'
import React from 'react'

const Input: React.FC<InputProps> = ({ label, className = '', rightIcon, style = {}, variant = 'customer', ...props }) => {
    return (
        <div className="w-full mb-4">
            {label && (
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    {...props}
                    style={style}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] border-[rgb(var(--border))] ${className}`}
                    onFocus={(e) => {
                        const focusColor = variant === 'admin' ? COLORS.light.primary.main : COLORS.light.primary.main;
                        const shadowColor = variant === 'admin' ? '#a88974' : COLORS.light.primary.light;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${shadowColor}`;
                        e.currentTarget.style.borderColor = focusColor;
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = ''
                        e.currentTarget.style.borderColor = ''
                    }}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {rightIcon}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Input