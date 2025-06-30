"use client";
import { motion } from 'framer-motion';
import UserCard from './UserTableCard';
import Pagination from '@/components/ui/pagination/Pagination';
// Import your existing pagination component

interface UserCardViewProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    email_verified_at?: string | null;
    status: string;
    roles: Array<{ name: string }>;
    last_login_at?: string | null;
    created_at: string;
    location?: string | null;
    avatar?: string | null;
  }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getColorForRole: (roleName: string) => string;
  getStatusColor: (status: string) => string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

const UserCardView = ({ 
  users, 
  onEdit, 
  onDelete, 
  getColorForRole, 
  getStatusColor,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 8,
  totalItems
}: UserCardViewProps) => {
  return (
    <div className="space-y-6">
      {/* User Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            getColorForRole={getColorForRole}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 pb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            siblingCount={1} // You can adjust this as needed
          />
          
          {/* Optional: Items per page selector and count */}
          {totalItems && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} users
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCardView;