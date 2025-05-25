'use client';

import React from 'react';
import clsx from 'clsx';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

import { PaginationProps } from '@/types/ui';
import Button from '../buttons/button';

const Pagination: React.FC<PaginationProps> = ({
    totalPages,
    currentPage,
    onPageChange,
    siblingCount = 1,
}) => {
    const DOTS = '...';

    const getPaginationRange = () => {
        const totalPageNumbers = siblingCount * 2 + 5;

        if (totalPageNumbers >= totalPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        if (!showLeftDots && showRightDots) {
            const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
            return [...leftRange, DOTS, totalPages];
        }

        if (showLeftDots && !showRightDots) {
            const rightRange = Array.from(
                { length: 3 + 2 * siblingCount },
                (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1
            );
            return [firstPageIndex, DOTS, ...rightRange];
        }

        if (showLeftDots && showRightDots) {
            const middleRange = Array.from(
                { length: 2 * siblingCount + 1 },
                (_, i) => leftSiblingIndex + i
            );
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }
    };

    const paginationRange = getPaginationRange();

    return (
        <div className="flex justify-center items-center mt-6 flex-wrap gap-2">
            <Button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                variant="ghost"
                aria-label="First Page"
            >
                <ChevronsLeft size={18} />
            </Button>

            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="ghost"
                aria-label="Previous Page"
            >
                <ChevronLeft size={18} />
            </Button>

            {paginationRange?.map((page, idx) =>
                page === DOTS ? (
                    <span
                        key={idx}
                        className="px-3 py-1 text-gray-400 font-semibold select-none"
                    >
                        ...
                    </span>
                ) : (
                    <Button
                        key={idx}
                        onClick={() => onPageChange(Number(page))}
                        variant={page === currentPage ? 'primary' : 'ghost'}
                        className={clsx(
                            'min-w-[36px] h-9 px-2 text-sm',
                            page === currentPage ? 'cursor-default' : 'hover:bg-gray-100'
                        )}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </Button>
                )
            )}

            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="ghost"
                aria-label="Next Page"
            >
                <ChevronRight size={18} />
            </Button>

            <Button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                variant="ghost"
                aria-label="Last Page"
            >
                <ChevronsRight size={18} />
            </Button>
        </div>
    );
};

export default Pagination;