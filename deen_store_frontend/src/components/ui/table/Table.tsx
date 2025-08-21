'use client';

import React, { useEffect, useState } from 'react';
import { TableProps } from '@/types/ui';
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Button from '../buttons/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
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
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
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

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const key = sortConfig.key.toLowerCase().replace(/\s+/g, '');
    if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredData = externalSearch
    ? sortedData
    : sortedData.filter((row) =>
        headers.some((header) => {
          const property = header.toLowerCase().replace(/\s+/g, '');
          const value = row[property];

          if (property === 'roles' && Array.isArray(value)) {
            return value.some((role) =>
              role.name.toLowerCase().includes(filter.toLowerCase())
            );
          }

          return String(value ?? '').toLowerCase().includes(filter.toLowerCase());
        })
      );

  const totalPages = externalPagination
    ? externalTotalPages
    : Math.ceil(filteredData.length / pageSize);

  const paginatedData = externalPagination
    ? filteredData
    : filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (externalPagination && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!externalSearch && !externalPagination) {
      setInternalCurrentPage(1);
    }
  }, [filter, externalSearch, externalPagination]);

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{title || 'Table'}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredData.length} entries
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Search..."
              value={filter}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer group hover:text-blue-600"
                  onClick={() => requestSort(header)}
                >
                  <div className="flex items-center gap-2">
                    <span>{header}</span>
                    <ChevronUpDownIcon
                      className={clsx(
                        'h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-transform duration-150',
                        sortConfig?.key === header &&
                          sortConfig.direction === 'asc' &&
                          'rotate-180'
                      )}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={clsx(
                    'hover:bg-blue-50/50 transition-all duration-200',
                    selectedRows.has(rowIndex) && 'bg-blue-100/30'
                  )}
                >
                  {headers.map((header, colIndex) => {
                    const property = header.toLowerCase().replace(/\s+/g, '');
                    const value = row[property];

                    if (customRender && customRender[property]) {
                      return (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                          {customRender[property](value, row)}
                        </td>
                      );
                    }

                    if (header === 'Status') {
                      return (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              value === 'Active'
                                ? 'success'
                                : value === 'Pending'
                                ? 'warning'
                                : 'danger'
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
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <MagnifyingGlassIcon className="h-10 w-10 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      No data found
                    </h3>
                    <p className="text-sm text-gray-500">
                      Try refining your search or filters.
                    </p>
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
          Showing{' '}
          <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of <span className="font-medium">{filteredData.length}</span> results
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = totalPages <= 5
              ? i + 1
              : currentPage <= 3
              ? i + 1
              : currentPage >= totalPages - 2
              ? totalPages - 4 + i
              : currentPage - 2 + i;

            return (
              <button
                key={i}
                onClick={() => goToPage(pageNum)}
                className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm',
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;