'use client';

import React, { useEffect, useState } from 'react';
import { TableProps } from '@/types/ui';
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
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
    <div className="w-full p-6 rounded-xl shadow-lg border transition-all duration-300"
         style={{
           backgroundColor: 'var(--surface)',
           borderColor: 'var(--border)',
           color: 'var(--text-primary)',
         }}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold"
              style={{ color: 'var(--text-primary)' }}>
            {title || 'Table'}
          </h2>
          <p className="text-sm mt-1"
             style={{ color: 'var(--text-secondary)' }}>
            Showing {filteredData.length} entries
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5"
                                   style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm transition-all duration-200"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Search..."
              value={filter}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border"
           style={{ borderColor: 'var(--border)' }}>
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
          <thead style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)' 
          }}>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer group transition-colors duration-200"
                  style={{ 
                    color: 'var(--text-secondary)',
                  }}
                  onClick={() => requestSort(header)}
                >
                  <div className="flex items-center gap-2">
                    <span className="group-hover:text-[var(--primary)] transition-colors duration-200">
                      {header}
                    </span>
                    <ChevronUpDownIcon
                      className={clsx(
                        'h-4 w-4 transition-transform duration-150',
                        sortConfig?.key === header &&
                          sortConfig.direction === 'asc' &&
                          'rotate-180'
                      )}
                      style={{ 
                        color: sortConfig?.key === header 
                          ? 'var(--primary)' 
                          : 'var(--text-tertiary)' 
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ 
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)' 
          }}>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={clsx(
                    'transition-all duration-200 hover:opacity-80',
                    selectedRows.has(rowIndex) && 'opacity-90'
                  )}
                  style={{
                    backgroundColor: selectedRows.has(rowIndex)
                      ? 'rgba(var(--primary), 0.1)'
                      : 'transparent',
                    borderColor: 'var(--border)',
                  }}
                >
                  {headers.map((header, colIndex) => {
                    const property = header.toLowerCase().replace(/\s+/g, '');
                    const value = row[property];

                    if (customRender && customRender[property]) {
                      return (
                        <td 
                          key={colIndex} 
                          className="px-6 py-4 whitespace-nowrap"
                          style={{ color: 'var(--text-primary)' }}
                        >
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
                        <td 
                          key={colIndex} 
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {new Date(value).toLocaleDateString()}
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={colIndex} 
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={headers.length} 
                  className="px-6 py-12 text-center"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <MagnifyingGlassIcon 
                      className="h-10 w-10 mb-3"
                      style={{ color: 'var(--primary)' }}
                    />
                    <h3 
                      className="text-lg font-semibold mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      No data found
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
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
        <div 
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Showing{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {(currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {filteredData.length}
          </span>{' '}
          results
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
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
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-200'
                )}
                style={{
                  backgroundColor: currentPage === pageNum
                    ? 'var(--primary)'
                    : 'var(--surface)',
                  border: `1px solid ${currentPage === pageNum ? 'var(--primary)' : 'var(--border)'}`,
                  color: currentPage === pageNum
                    ? '#FFFFFF'
                    : 'var(--text-secondary)',
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;