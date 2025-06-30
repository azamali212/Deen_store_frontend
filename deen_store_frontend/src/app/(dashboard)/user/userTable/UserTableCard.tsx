import { Check, Edit, Trash2, Mail, User, Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/buttons/button';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface UserCardProps {
  user: {
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
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getColorForRole: (roleName: string) => string;
  getStatusColor: (status: string) => string;
}

const UserCard = ({ user, onEdit, onDelete, getColorForRole, getStatusColor }: UserCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusColor = getStatusColor(user.status);

  const formatLastLogin = (dateString?: string | null) => {
    if (!dateString) return 'Never logged in';
    return formatDate(dateString);
  };

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-[rgb(var(--dashboard--background))] rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with avatar and basic info */}
      <div className="p-5 pb-4 flex items-start gap-4 relative">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border-2 border-white shadow-xs">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-400" />
            )}
          </div>
          {user.email_verified_at && (
            <div className="absolute -bottom-1 -right-1 bg-[rgb(var(--dashboard--background))] p-1 rounded-full border-2 border-white shadow-xs">
              <div className="bg-green-500 rounded-full p-1 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
        
        {/* Name and email */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-gray-800 truncate">
              {user.name}
            </h3>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 bg-gray-50 border border-gray-200 mt-0.5 flex-shrink-0"
              style={{ color: statusColor, borderColor: statusColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
              {user.status}
            </span>
          </div>
          <a 
            href={`mailto:${user.email}`} 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 mt-1 w-full overflow-hidden"
          >
            <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span className="truncate">{user.email}</span>
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4 space-y-4 flex-1">
        {/* Roles */}
        {user.roles?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role, i) => {
              const roleColor = getColorForRole(role.name);
              return (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-gray-50 border border-gray-200"
                  style={{ color: roleColor, borderColor: roleColor }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: roleColor }} />
                  {role.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1">
              <span className="text-gray-500">Last login:</span> <span className="font-medium text-gray-700">{formatLastLogin(user.last_login_at)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1">
              <span className="text-gray-500">Joined:</span> <span className="font-medium text-gray-700">{formatDate(user.created_at)}</span>
            </span>
          </div>
          {user.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1">
                <span className="text-gray-500">Location:</span> <span className="font-medium text-gray-700">{user.location}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={`bg-[rgb(var(--dashboard--background))] px-5 py-3 flex justify-end gap-3 border-t border-gray-100 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-90'}`}>
        <Tooltip content="Edit user">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => onEdit(user.id)}
          >
            <Edit className="w-4 h-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </Tooltip>
        <Tooltip content="Delete user">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(user.id)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
};

export default UserCard;