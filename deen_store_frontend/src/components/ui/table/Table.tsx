"use client";
import React, { useState } from 'react';
import { TableProps } from '@/types/ui';
import { AdjustmentsHorizontalIcon, ArrowUpCircleIcon, ArrowUpTrayIcon, EllipsisVerticalIcon, FunnelIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Button from '../buttons/button';
import Input from '../inputs/input';
import { PlusIcon } from 'lucide-react';
import Tooltip from '../tooltip/Tooltip';

const Table: React.FC<TableProps> = ({ title, headers, data }) => {
    const [filter, setFilter] = useState('');
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };
    const filteredData = data.filter((row) =>
        headers.some((header) =>
            String(row[header.toLowerCase()] ?? '')
                .toLowerCase()
                .includes(filter.toLowerCase())
        )
    );
    // Function to get background color for payment status
    const getPaymentClass = (payment: string) => {
        const cleanPayment = payment?.trim().toLowerCase();
        switch (cleanPayment) {
            case 'success':
                return 'bg-[rgb(var(--accent))] text-green-700 px-2 py-1 rounded-full'; // Light green with padding and rounded corners
            case 'block':
                return 'bg-red-200 text-red-700 px-2 py-1 rounded-full'; // Light red with padding and rounded corners
            case 'withdraw':
                return 'bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full'; // Light yellow with padding and rounded corners
            default:
                return '';
        }
    };
    return (
        <div className="w-full p-6 bg-[rgb(var(--table--color))] rounded-2xl shadow-lg">
            <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* Title on the left */}
                <h2 className="text-2xl font-bold text-gray-800">{title || 'Table'}</h2>
                {/* Buttons on the right */}
                <div className="flex gap-2">
                    <Button
                        className="w-10 h-10 bg-[rgb(var(--main--chart--card--background))] flex items-center justify-center rounded-full text-white hover:bg-opacity-80 transition duration-200"
                        variant="ghost"
                        onClick={() => console.log('Filter clicked')}
                        aria-label="Filter"
                    >
                        <Tooltip content="Filter" side="bottom">
                            <span>
                                <FunnelIcon className="w-6 h-6 text-gray-500" />
                            </span>
                        </Tooltip>
                    </Button>
                    <Button
                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 flex items-center justify-center rounded-full text-white transition duration-200"
                        variant="ghost"
                        onClick={() => console.log('Add clicked')}
                        aria-label="Add"
                    >
                        <Tooltip content="Export" side="bottom">
                            <span>
                                <ArrowUpTrayIcon className="w-6 h-6 text-gray-500" />
                            </span>
                        </Tooltip>
                    </Button>
                    <Button
                        className="w-10 h-10 bg-green-500 hover:bg-green-600 flex items-center justify-center rounded-full text-white transition duration-200"
                        variant="ghost"
                        onClick={() => console.log('Export clicked')}
                        aria-label="Export"
                    >
                        <Tooltip content="Add" side="bottom">
                            <span>
                                <PlusIcon className="w-6 h-6 text-gray-500" />
                            </span>
                        </Tooltip>
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                    <thead className="bg-[rgb(var(--table--color))] text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className="px-4 py-3 text-left whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="bg-[rgb(var(--table--color))] divide-y divide-gray-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 transition duration-150">
                                    {headers.map((header, colIndex) => {
                                        const value = row[header.toLowerCase()];
                                        // Apply conditional background styling to the `payment` column only
                                        const paymentClass = header === 'Payment' ? getPaymentClass(value) : '';
                                        return (
                                            <td
                                                key={colIndex}
                                                className={clsx('px-4 py-3  whitespace-nowrap', paymentClass)}
                                            >
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
                                                        <a
                                                            href="#"
                                                            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                                                        >
                                                            Edit
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            href="#"
                                                            className="block px-4 py-2 hover:bg-gray-100 text-red-600"
                                                        >
                                                            Delete
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length + 1}
                                    className="text-center px-4 py-5 text-gray-400"
                                >
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;