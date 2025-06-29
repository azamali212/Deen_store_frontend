"use client";
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/buttons/button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { motion } from 'framer-motion';

interface UserCardProps {
    user: {
      id: string;
      name: string;
      email: string;
      email_verified_at?: string | null; // Add null to the type
      status: string;
      roles: Array<{ name: string }>;
      last_login_at?: string | null; // Also add null here if needed
      created_at: string;
      location?: string | null; // And here if needed
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    getColorForRole: (roleName: string) => string;
    getStatusColor: (status: string) => string;
  }

const UserCard = ({ user, onEdit, onDelete, getColorForRole, getStatusColor }: UserCardProps) => {
  const statusColor = getStatusColor(user.status);

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-purple-500"></div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {user.name}
            </h3>
          </div>
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
            style={{
              backgroundColor: `${statusColor}15`,
              color: statusColor
            }}
          >
            {user.status}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <a 
              href={`mailto:${user.email}`} 
              className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:underline"
            >
              {user.email}
            </a>
            {user.email_verified_at ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {user.roles?.map((role, i) => {
              const roleColor = getColorForRole(role.name);
              return (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                  style={{
                    backgroundColor: `${roleColor}15`,
                    color: roleColor
                  }}
                >
                  {role.name}
                </span>
              );
            })}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Last login: {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}</p>
            <p>Joined: {formatDate(user.created_at)}</p>
            {user.location && <p>Location: {user.location}</p>}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-end gap-2">
        <Tooltip content="Edit user">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-purple-500"
            onClick={() => onEdit(user.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Delete user">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
            onClick={() => onDelete(user.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
};

export default UserCard;