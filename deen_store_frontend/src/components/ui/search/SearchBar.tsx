'use client';

import React, { useState } from 'react';
import Input from '../inputs/input';

type SearchBarProps = {
    onSearch: (query: string) => void;
    className?: string; // 👈 Add this
  };
  const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className }) => {
    const [query, setQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
            <Input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                }}
            />
            <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">🔍</span>
        </form>
    );
};

export default SearchBar;