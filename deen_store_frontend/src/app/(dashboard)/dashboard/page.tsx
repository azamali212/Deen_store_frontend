import React, { FC } from 'react';
import Breadcrumb from '@/components/ui/breadcrumb/Breadcrumb';
import { DashboardProps } from '@/types/ui';

const Dashboard: FC<DashboardProps> = ({ isSidebarCollapsed }) => {
  return (
    <div
      style={{
        transform: isSidebarCollapsed ? 'translateX(-140px)' : 'translateX(0)',
        transition: 'transform 0.5s ease-in-out',
      }}
      className="p-6 space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard', active: true },
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-xl p-10 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Welcome!</h2>
        <p className="text-gray-600">
          This is your dashboard overview. You can place widgets or summary cards here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;