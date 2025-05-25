"use client";

import React, { useState } from 'react';
import { TableProps } from '@/types/ui';
import {
    AdjustmentsHorizontalIcon,
    ArrowUpTrayIcon,
    EllipsisVerticalIcon,
    FunnelIcon,
    PlusIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Button from '../buttons/button';
import Tooltip from '../tooltip/Tooltip';
import Pagination from '../pagination/Pagination';

const Table: React.FC<TableProps> = ({ title, headers, data }) => {
    const [filter, setFilter] = useState('');
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const pageSize = 5;

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    const handleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set()); // Deselect all if all are selected
        } else {
            const allSelected = new Set(paginatedData.map((_, index) => index));
            setSelectedRows(allSelected); // Select all
        }
    };

    const handleSelectRow = (index: number) => {
        const updatedRows = new Set(selectedRows);
        if (updatedRows.has(index)) {
            updatedRows.delete(index); // Deselect the row
        } else {
            updatedRows.add(index); // Select the row
        }
        setSelectedRows(updatedRows);
    };

    const filteredData = data.filter((row) =>
        headers.some((header) =>
            String(row[header.toLowerCase()] ?? '')
                .toLowerCase()
                .includes(filter.toLowerCase())
        )
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);

    return (
        <div className="w-full p-6 bg-[rgb(var(--table--color))] rounded-2xl shadow-lg">
            <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">{title || 'Table'}</h2>
                <div className="flex gap-2">
                    <Button
                        className="w-10 h-10 bg-[rgb(var(--main--chart--card--background))] flex items-center justify-center rounded-full text-white hover:bg-opacity-80 transition duration-200"
                        variant="ghost"
                        onClick={() => console.log('Filter clicked')}
                    >
                        <Tooltip content="Filter" side="bottom">
                            <FunnelIcon className="w-6 h-6 text-gray-500" />
                        </Tooltip>
                    </Button>
                    <Button
                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 flex items-center justify-center rounded-full text-white transition duration-200"
                        variant="ghost"
                        onClick={() => console.log('Export clicked')}
                    >
                        <Tooltip content="Export" side="bottom">
                            <ArrowUpTrayIcon className="w-6 h-6 text-gray-500" />
                        </Tooltip>
                    </Button>
                    <Button
                        className="w-10 h-10 bg-green-500 hover:bg-green-600 flex items-center justify-center rounded-full text-white transition duration-200"
                        variant="ghost"
                        onClick={() => console.log('Add clicked')}
                    >
                        <Tooltip content="Add" side="bottom">
                            <PlusIcon className="w-6 h-6 text-gray-500" />
                        </Tooltip>
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                    <thead className="bg-[rgb(var(--table--color))] text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedRows.size === paginatedData.length}
                                    className="w-4 h-4"
                                />
                            </th>
                            {headers.map((header, index) => (
                                <th key={index} className="px-4 py-3 text-left whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-[rgb(var(--table--color))] divide-y divide-gray-100">
                        {paginatedData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={() => handleSelectRow(rowIndex)}
                                        checked={selectedRows.has(rowIndex)}
                                        className="w-4 h-4"
                                    />
                                </td>
                                {headers.map((header, colIndex) => {
                                    // Convert header to camelCase for property access
                                    const property = header.toLowerCase().replace(/\s+/g, '');
                                    const value = row[property];

                                    if (header === 'Product') {
                                        return (
                                            <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={value.image || '/images/product.jpeg'}
                                                        alt={value.name}
                                                        className="w-10 h-10 rounded-md object-cover mr-3"
                                                    />
                                                    <span>{value.name}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (header === 'Total Revenue') {
                                        return (
                                            <td key={colIndex} className="px-4 py-3 whitespace-nowrap font-medium">
                                                ${parseFloat(value).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                                            {value}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 text-right relative">
                                    <button
                                        onClick={() => toggleDropdown(rowIndex)}
                                        className="text-gray-500 hover:text-gray-800 focus:outline-none"
                                    >
                                        <EllipsisVerticalIcon className="w-5 h-5" />
                                    </button>
                                    {openDropdownIndex === rowIndex && (
                                        <div className="absolute right-4 top-10 z-20 w-40 bg-white border border-gray-200 rounded-lg shadow-lg animate-fade-in">
                                            <ul className="py-1 text-sm">
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 text-gray-700">Edit</a>
                                                </li>
                                                <li>
                                                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 text-red-600">Delete</a>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
};

export default Table;