'use client';

import React, { useState } from 'react';
import Input from '../inputs/input';

type SearchBarProps = {
    onSearch?: (query: string) => void;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    autoFocus?: boolean;
    className?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({ 
    onSearch = () => {}, 
    value = '', 
    onChange,
    placeholder = 'Search...',
    autoFocus = false,
    className = '' 
}) => {
    const [query, setQuery] = useState(value);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (onChange) {
            onChange(e);
        } else {
            onSearch(value);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearchSubmit} className={`relative w-full ${className}`}>
            <Input
                type="text"
                value={value || query}
                onChange={handleSearchChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                }}
            />
            <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
        </form>
    );
};

export default SearchBar;