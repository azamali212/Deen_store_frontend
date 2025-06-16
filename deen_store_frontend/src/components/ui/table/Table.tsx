'use client';
import React, { useEffect, useState } from 'react';
import { TableProps } from '@/types/ui';
import {
    AdjustmentsHorizontalIcon,
    ArrowUpTrayIcon,
    EllipsisVerticalIcon,
    FunnelIcon,
    PlusIcon,
    ChevronUpDownIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Button from '../buttons/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Badge from '../badge/badge';

const Table: React.FC<TableProps> = ({
    title,
    headers,
    data,
    customRender,
    externalPagination = false,
    currentPage: externalCurrentPage = 1,
    totalPages: externalTotalPages = 1,
    onPageChange,
    externalSearch = false,
    searchQuery: externalSearchQuery = '',
    onSearchChange,
    pageSize: externalPageSize = 10,
}) => {

    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [internalCurrentPage, setInternalCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [internalFilter, setInternalFilter] = useState('');

    const pageSize = externalPagination ? externalPageSize : 10;
    const currentPage = externalPagination ? externalCurrentPage : internalCurrentPage;

    const filter = externalSearch ? externalSearchQuery : internalFilter;
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        if (externalSearch && onSearchChange) {
            onSearchChange(query);
        } else {
            setInternalFilter(query);
        }
    };

    // Sort data
    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig) return 0;
        const key = sortConfig.key.toLowerCase().replace(/\s+/g, '');
        if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Filter data - only if not using external search
    const filteredData = externalSearch
        ? sortedData
        : sortedData.filter((row) =>
            headers.some((header) => {
                const property = header.toLowerCase().replace(/\s+/g, '');
                const value = row[property];

                // Handle nested objects (like roles)
                if (property === 'roles' && Array.isArray(value)) {
                    return value.some(role =>
                        role.name.toLowerCase().includes(filter.toLowerCase())
                    );
                }

                return String(value ?? '').toLowerCase().includes(filter.toLowerCase());
            })
        );

    // Calculate total pages based on external or internal pagination
    const totalPages = externalPagination
        ? externalTotalPages
        : Math.ceil(filteredData.length / pageSize);

    // Paginate data - only if not using external pagination
    const paginatedData = externalPagination
        ? filteredData
        : filteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );

    // Handle page changes
    const goToPage = (page: number) => {
        const newPage = Math.max(1, Math.min(page, totalPages));
        if (externalPagination && onPageChange) {
            onPageChange(newPage);
        } else {
            setInternalCurrentPage(newPage);
        }
    };

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    const handleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
        } else {
            const allSelected = new Set(paginatedData.map((_, index) => index));
            setSelectedRows(allSelected);
        }
    };

    const handleSelectRow = (index: number) => {
        const updatedRows = new Set(selectedRows);
        if (updatedRows.has(index)) {
            updatedRows.delete(index);
        } else {
            updatedRows.add(index);
        }
        setSelectedRows(updatedRows);
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    // Reset to first page when search changes (for internal search)
    useEffect(() => {
        if (!externalSearch && !externalPagination) {
            setInternalCurrentPage(1);
        }
    }, [filter, externalSearch, externalPagination]);

    const filterData = () => {
        if (externalSearch && onSearchChange) {
            onSearchChange(filter);
        } else {
            setInternalFilter(filter);
            setInternalCurrentPage(1); // Reset to first page on filter change
        }
    }

    return (
        <div className="w-full p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Table Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">{title || 'Table'}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {filteredData.length} entries
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Search..."
                            value={filter}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={()=>filterData()}
                            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50"
                        >
                            <FunnelIcon className="w-4 h-4" />
                            <span>Filter</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('Export clicked')}
                            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50"
                        >
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            <span>Export</span>
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => console.log('Add clicked')}
                            className="flex items-center gap-2 shadow-primary hover:shadow-primary-hover"
                        >
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-xs">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10 rounded-tl-xl">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </th>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer group"
                                    onClick={() => requestSort(header)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{header}</span>
                                        <ChevronUpDownIcon className="ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                    </div>
                                </th>
                            ))}
                            
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={clsx(
                                        'transition-all duration-150',
                                        selectedRows.has(rowIndex)
                                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                            : 'hover:bg-gray-50'
                                    )}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectRow(rowIndex)}
                                            checked={selectedRows.has(rowIndex)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </td>
                                    {headers.map((header, colIndex) => {
                                        const property = header.toLowerCase().replace(/\s+/g, '');
                                        const value = row[property];

                                        // Check if there's a custom renderer for this header
                                        if (customRender && customRender[property]) {
                                            return (
                                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                                    {customRender[property](value)}
                                                </td>
                                            );
                                        }

                                        if (header === 'Status') {
                                            return (
                                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant={
                                                            value === 'Active' ? 'success' :
                                                                value === 'Pending' ? 'warning' :
                                                                    'danger'
                                                        }
                                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                                    >
                                                        {value}
                                                    </Badge>
                                                </td>
                                            );
                                        }

                                        if (header === 'Date') {
                                            return (
                                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(value).toLocaleDateString()}
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-800">{value}</div>
                                            </td>
                                        );
                                    })}
                                    
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length + 2} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                                            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                                        <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, filteredData.length)}</span> of{' '}
                    <span className="font-medium">{filteredData.length}</span> results
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => goToPage(pageNum)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="px-2 text-gray-500">...</span>
                        )}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <button
                                onClick={() => goToPage(totalPages)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentPage === totalPages
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Table;