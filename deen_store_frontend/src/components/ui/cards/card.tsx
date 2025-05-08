'use client';

import { CardProps } from '@/types/ui';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Chart from '@/components/Chart/Chart';
import { MoreVertical } from 'lucide-react';

const variantClasses: Record<string, string> = {
    admin: 'bg-[rgb(var(--card-admin))] border border-[rgb(var(--accent))]',
    customer: 'bg-[rgb(var(--card-customer))] border border-[rgb(var(--foreground))]/10',
    product: 'bg-[rgb(var(--card-product))] text-theme',
    order: 'bg-[rgb(var(--card-order))] text-theme',
    stock: 'bg-[rgb(var(--card-stock))] text-theme',
    chart:'bg-[rgb(var(--main--chart--card--background))] text-theme',
};

const progressColorMap: Record<string, string> = {
    admin: 'rgb(var(--progress-admin))',
    customer: 'rgb(var(--progress-customer))',
    product: 'rgb(var(--progress-product))',
    order: 'rgb(var(--progress-order))',
    stock: 'rgb(var(--progress-stock))',
};

interface ExtendedCardProps extends CardProps {
    progress?: number;
    targetNumber?: number;
}

const Card: React.FC<ExtendedCardProps> = ({
    children,
    className = '',
    style = {},
    variant = 'customer',
    title,
    progress,
    content,
    targetNumber = 1000,
}) => {
    const variantClass = variantClasses[variant] || variantClasses.customer;
    const progressColor = progressColorMap[variant] || 'rgb(var(--progress-customer))';

    const [count, setCount] = useState(0);
    

    useEffect(() => {
        if (!['product', 'order', 'stock'].includes(variant)) return;

        let current = 0;
        const step = Math.ceil(targetNumber / 30);
        const interval = setInterval(() => {
            current += step;
            setCount(prev => (prev + step <= targetNumber ? prev + step : targetNumber));
            if (current >= targetNumber) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [targetNumber, variant]);

    return (
        <div
            className={clsx(
                'rounded-2xl shadow-md px-6 py-5 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg',
                variantClass,
                className
            )}
            style={style}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2
                    className="text-[rgb(var(--text-color))]"
                    style={{ fontSize: 'var(--font-size-lg)' }}
                >
                    {title}
                </h2>
                <button
                    className="text-[rgb(var(--text-color))] hover:text-[rgb(var(--accent))] transition"
                    aria-label="More options"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Content */}
            {content && (
                <p
                    className="mb-4 text-[rgb(var(--foreground))]"
                    style={{ fontSize: 'var(--font-size-sm)' }}
                >
                    {content}
                </p>
            )}

            {children}

            {/* Progress Bar */}
            {typeof progress === 'number' && (
                <div className="mt-4 w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: progressColor,
                        }}
                    />
                </div>
            )}

            {/* Chart + Counter */}
            {['product', 'order', 'stock'].includes(variant) && (
                <div className="flex flex-col md:flex-row  items-center md:justify-between mt-4 gap-4 w-full">
                    {/* Chart */}
                    <div className="w-full md:w-1/2 max-w-[200px] mx-auto md:mx-0 aspect-square">
                        <Chart
                            type="pie"
                            data={{
                                datasets: [
                                    {
                                        label: 'Stats',
                                        data: [300, 50, 100],
                                        backgroundColor: [
                                            'rgb(168, 201, 246)',
                                            'rgb(243, 212, 197)',
                                            'rgb(185, 227, 242)',
                                        ],
                                        hoverBackgroundColor: [
                                            'rgb(0, 185, 247)',
                                            'rgb(249, 179, 147)',
                                            'rgb(102, 209, 244)',
                                        ],
                                    },
                                ],
                            }}
                        />
                    </div>

                    {/* Counter */}
                    <div className="w-full md:w-1/2 text-center md:text-right">
                        <p className=" style={{ fontSize: 'var(--font-size-xl)' }} font-bold text-[rgb(var(--text-color))]">{count.toLocaleString()}</p>
                        <p className=" style={{ fontSize: 'var(--font-size-sm)' }} text-[rgb(var(--muted))] mt-1">Live Count</p>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Card;