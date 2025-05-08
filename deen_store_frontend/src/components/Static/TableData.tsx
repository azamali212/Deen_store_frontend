'use client';

import React, { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import Table from '@/components/ui/table/Table';

const SampleTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  // Generate 10 random data entries
  useEffect(() => {
    const generateData = () => {
      const generatedData = Array.from({ length: 10 }).map(() => ({
        name: faker.person.firstName(),
        email: faker.internet.email(),
        product: faker.commerce.productName(),
        // Set random payment type to 'success', 'withdraw', or 'block'
        payment: ['success', 'withdraw', 'block'][Math.floor(Math.random() * 3)],
        amount: `$${faker.commerce.price()}`,
      }));
      setData(generatedData);
    };

    generateData();
  }, []);

  const headers = ['Name', 'Email', 'Product', 'Payment', 'Amount'];

  return <Table title="Recent Purchases" headers={headers} data={data} />;
};

export default SampleTable;