"use client";
import { motion } from 'framer-motion';
import UserCard from './UserTableCard';


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
    }>;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    getColorForRole: (roleName: string) => string;
    getStatusColor: (status: string) => string;
  }

const UserCardView = ({ users, onEdit, onDelete, getColorForRole, getStatusColor }: UserCardViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
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
  );
};

export default UserCardView;