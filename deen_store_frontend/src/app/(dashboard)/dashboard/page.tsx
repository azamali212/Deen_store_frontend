"use client";
import React, { FC } from 'react';
import { DashboardProps } from '@/types/ui';
import Card from '@/components/ui/cards/card';
import LineChart from '@/components/Chart/LineChart';
import Progress from '@/components/ProgressBar/Progress';
import Bar from '@/components/Chart/Bar';
import Table from '@/components/ui/table/Table';
import SampleTable from '@/components/Static/TableData';
import CombinationChart from '@/components/Chart/Combination';
import classNames from 'classnames';
import BestSellingTable from '@/components/Static/BestSellingPorductData';

const Dashboard: FC<DashboardProps> = ({ isSidebarCollapsed }) => {
  const vendorData = [65, 59, 80, 81, 56, 55, 40];
  const customerData = [45, 60, 70, 45, 40, 56, 65];
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const tableHeaders = ['Vendor', 'Sales', 'Customer', 'Feedback']; // Example headers for the table
  const tableData = [
    { vendor: 'Vendor 1', sales: 1000, customer: 'Customer 1', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 1', sales: 1000, customer: 'Customer 1', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 1', sales: 1000, customer: 'Customer 1', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    { vendor: 'Vendor 2', sales: 2000, customer: 'Customer 2', feedback: 'Success' },
    // Add more rows as per your need
  ];

 
  const chartData = {
    labels: ['January', 'February', 'March', 'April'],

    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };
  return (
    <div
      style={{
        transform: isSidebarCollapsed ? 'translateX(-140px)' : 'translateX(0)',
        transition: 'transform 0.2s ease-in-out',
      }}
      className="p-2 space-y-6"
    >
      {/* Cards Container without Scroll */}
      <div className="w-full p-6 flex flex-wrap justify-between gap-4 bg-[rgb(var(--dashboard--background))] rounded-2xl shadow-sm">
        <Card
          variant="product"
          title="Product Stats"
          content="Total Products"
          className="flex-1 min-w-[250px] max-w-[320px] h-[150px] md:h-[200px] transition-all duration-300 transform hover:scale-105"
        />
        <Card
          variant="order"
          title="Order Fulfillment"
          content="Total Orders"
          className="flex-1 min-w-[250px] max-w-[320px] h-[150px] md:h-[200px] transition-all duration-300 transform hover:scale-105"
        />
        <Card
          variant="order"
          title="Order Fulfillment"
          content="Total Orders"
          className="flex-1 min-w-[250px] max-w-[320px] h-[150px] md:h-[200px] transition-all duration-300 transform hover:scale-105"
        />
        <Card
          variant="stock"
          title="Stock Monitoring"
          content="Stock Levels"
          className="flex-1 min-w-[250px] max-w-[320px] h-[150px] md:h-[200px] transition-all duration-300 transform hover:scale-105"
        />
      </div>

      {/* Section after Cards */}
      {/* Section after Cards */}
      <div className="w-full p-6 bg-[rgb(var(--dashboard--background))] rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Progress Section */}
          <Card title="Shopping Cart" variant='chart' className="w-full h-[300px] md:h-[450px] p-4">
            <div className="flex flex-col space-y-8">
              <Progress title='Cart' value={65} showLabel color="blue" />
              <Progress title='Abandonment rate' value={50} showLabel color="blue" />
              <Progress title='Bounce rate' value={40} showLabel color="blue" />
              <Progress title='Completion rate' value={75} showLabel color="blue" />
              <Progress title='Conversion rate' value={60} showLabel color="blue" />
            </div>
          </Card>

          {/* Bar Chart Section */}
          <Card title="Monthly Revenue" variant='chart' className="w-full h-[300px] md:h-[450px]">
            <div className="w-full h-[350px]">
              <Bar
                data={{
                  labels: ['Jan', 'Feb', 'Mar'],
                  datasets: [
                    {
                      label: 'Revenue',
                      data: [300, 500, 700],
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                      borderRadius: 6,
                    },
                  ],
                }}
              />
            </div>
          </Card>

          {/* Line Chart Section */}
          <Card
            variant="chart"
            title="Sales Overview"
            className="w-full h-[300px] md:h-[450px] p-4 transition-all duration-300 transform hover:scale-105"
          >
            <LineChart type="line" data={chartData} width={500} height={300} />
          </Card>

        </div>
      </div>

      <div className="w-full p-6 bg-[rgb(var(--dashboard--background))] rounded-2xl shadow-sm">
        <div>
          <SampleTable />
        </div>
      </div>
      <div className="w-full h-full p-6 bg-[rgb(var(--dashboard--background))] rounded-2xl shadow-sm">
        <div className="flex justify-between gap-6">
          {/* Chart Section */}
          <div className="flex-1">
            <Card variant="chart" className='h-full'>
              <CombinationChart
                vendorData={vendorData}
                customerData={customerData}
                labels={labels}
                chartTitle="Vendor vs Customer Performance"

              />
            </Card>
          </div>

          {/* Table Section */}
          <div className="flex-1">

            <Table
              title="Vendor & Customer Table"
              headers={tableHeaders}
              data={tableData}
            />

          </div>
        </div>
      </div>

      <div className="w-full p-6 bg-[rgb(var(--dashboard--background))] rounded-2xl shadow-sm">
        <div className="flex justify-between gap-6">
          <div className="flex-1">
            <BestSellingTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;