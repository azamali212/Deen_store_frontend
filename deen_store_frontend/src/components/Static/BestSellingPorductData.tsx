"use client"
import React, { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import Table from '@/components/ui/table/Table';

const BestSellingTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const generateData = () => {
      const generatedData = Array.from({ length: 10 }).map(() => {
        const productName = faker.commerce.productName();
        const productImage = faker.image.urlLoremFlickr({ category: 'product' });

        // Generating numeric data for total sales and revenue
        const totalSales = Math.floor(Math.random() * (5000 - 100 + 1)) + 100; // Random sales between 100 and 5000
        const totalRevenue = `$${(Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000).toFixed(2)}`; // Random revenue between $1000 and $20000

        return {
          product: {
            name: productName,
            image: productImage
          },
          category: faker.commerce.department(),
          total: totalSales,
          stock: Math.floor(Math.random() * 100) + 1,
          totalRevenue: totalRevenue
        };
      });
      setData(generatedData);
    };

    generateData();
  }, []);

  const headers = ['Product', 'Category', 'Total', 'Stock', 'Total Revenue'];

  return <Table title="Best Selling Products" headers={headers} data={data} />;
};

export default BestSellingTable;