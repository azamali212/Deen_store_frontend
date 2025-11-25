import { PayloadAction, CaseReducer, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import {
  fetchUsers,
  fetchSingleUser,
  softDeleteUser,
  fetchDeletedUsers,
  restoreDeletedUser,
  forceDeleteUser,
  bulkDeleteSoftDeletedUsers,
  restoreAllDeletedUsers,
  deactivateUser,
  activateUser,
  assignRolesToUser,
  removeRolesFromUser,
  changeUserRole,
  assignTemporaryPermissions,
  syncUserRoles,
  revokeTemporaryPermissions,
  getTemporaryPermissions,
  cleanupExpiredTemporaryPermissions,
  getActiveTemporaryPermissions
} from "./userSlice";
import { User, UserState, Permission } from "@/types/ui";
import { initialState } from "./userSlice";

// Helper type to handle the WritableDraft conversion
type Draft<T> = {
  -readonly [K in keyof T]: T[K] extends object ? Draft<T[K]> : T[K];
};

// Define type for our reducers
type UserReducers = {
  clearMessages: CaseReducer<UserState>;
  setSelectedUser: CaseReducer<UserState, PayloadAction<User | null>>;
  resetUserState: CaseReducer<UserState>;
  setSelectedUserPermissions: CaseReducer<UserState, PayloadAction<Permission[]>>;
  clearTemporaryPermissionsError: CaseReducer<UserState>; // ADD THIS
  clearTemporaryPermissions: CaseReducer<UserState>; // ADD THIS
};

export const reducers: UserReducers = {
  clearMessages(state) {
    state.error = null;
    state.successMessage = null;
    state.error = null;
    state.successMessage = null;
    state.temporaryPermissions.error = null;
  },
  setSelectedUserPermissions: (state, action: PayloadAction<Permission[]>) => {
    state.selectedUserPermissions = action.payload;
  },

  setSelectedUser(state, action) {
    state.selectedUser = action.payload;
  },
  resetUserState() {
    return initialState;
  },
  clearTemporaryPermissionsError(state) {
    state.temporaryPermissions.error = null;
  },
  clearTemporaryPermissions(state) {
    state.temporaryPermissions.active = [];
    state.temporaryPermissions.all = [];
    state.temporaryPermissions.error = null;
  }
};

// Define the extra reducers function with proper typing
export const extraReducers = (builder: ActionReducerMapBuilder<UserState>) => {
  builder
    .addCase(fetchUsers.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload.users as User[];
      state.pagination = action.payload.pagination;
      state.stats = action.payload.stats;
    })
    .addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch users';
    })
    .addCase(fetchSingleUser.pending, (state) => {
      state.loading = true;
      state.selectedUser = null;
    })
    .addCase(fetchSingleUser.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedUser = action.payload.user;
      state.selectedUserPermissions = action.payload.permissions;
    })
    .addCase(fetchSingleUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch user';
    })
    .addCase(softDeleteUser.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(softDeleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      state.users = state.users.filter(user => user.id !== action.payload.data.user_id);
      if (state.stats.totalUsers > 0) {
        state.stats.totalUsers -= 1;
      }
    })
    .addCase(softDeleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to delete user';
    })
    .addCase(fetchDeletedUsers.pending, (state) => {
      state.deletedUsers.loading = true;
      state.deletedUsers.error = null;
    })
    .addCase(fetchDeletedUsers.fulfilled, (state, action) => {
      state.deletedUsers.loading = false;
      state.deletedUsers.data = action.payload.data;
    })
    .addCase(fetchDeletedUsers.rejected, (state, action) => {
      state.deletedUsers.loading = false;
      state.deletedUsers.error = action.payload?.message || 'Failed to fetch deleted users';
    })
    .addCase(restoreDeletedUser.pending, (state) => {
      state.deletedUsers.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(restoreDeletedUser.fulfilled, (state, action) => {
      state.deletedUsers.loading = false;
      state.successMessage = action.payload.message;
      state.deletedUsers.data = state.deletedUsers.data.filter(
        user => user.user_id !== action.payload.data.user_id
      );
    })
    .addCase(restoreDeletedUser.rejected, (state, action) => {
      state.deletedUsers.loading = false;
      state.error = action.payload?.message || 'Failed to restore user';
    })
    .addCase(forceDeleteUser.pending, (state) => {
      state.deletedUsers.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(forceDeleteUser.fulfilled, (state, action) => {
      state.deletedUsers.loading = false;
      state.successMessage = action.payload.message;
      state.deletedUsers.data = state.deletedUsers.data.filter(
        user => user.user_id !== action.payload.data.user_id
      );
      if (state.stats.totalUsers > 0) {
        state.stats.totalUsers -= 1;
      }
    })
    .addCase(forceDeleteUser.rejected, (state, action) => {
      state.deletedUsers.loading = false;
      state.error = action.payload?.message || 'Failed to permanently delete user';
    })
    .addCase(bulkDeleteSoftDeletedUsers.pending, (state) => {
      state.deletedUsers.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(bulkDeleteSoftDeletedUsers.fulfilled, (state, action) => {
      state.deletedUsers.loading = false;
      state.successMessage = action.payload.message;
      if (action.payload.deleted_count > 0) {
        state.deletedUsers.data = state.deletedUsers.data.filter(
          user => !action.payload.failed_ids.includes(user.user_id)
        );
      }
    })
    .addCase(bulkDeleteSoftDeletedUsers.rejected, (state, action) => {
      state.deletedUsers.loading = false;
      state.error = action.payload?.message || 'Failed to bulk delete users';
    })
    .addCase(restoreAllDeletedUsers.pending, (state) => {
      state.deletedUsers.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(restoreAllDeletedUsers.fulfilled, (state, action) => {
      state.deletedUsers.loading = false;
      state.successMessage = action.payload.message;
      const failedIds = action.payload.failed_ids || [];
      if (failedIds.length === 0) {
        state.deletedUsers.data = [];
      } else {
        state.deletedUsers.data = state.deletedUsers.data.filter(
          user => failedIds.includes(user.user_id)
        );
      }
    })
    .addCase(restoreAllDeletedUsers.rejected, (state, action) => {
      state.deletedUsers.loading = false;
      state.error = action.payload?.message || 'Failed to restore all users';
    })
    .addCase(deactivateUser.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(deactivateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      // Update the user's status in the users array if needed
      state.users = state.users.map(user =>
        user.id === action.payload.data.user_id
          ? { ...user, status: 'inactive' }
          : user
      );
      // Update stats
      if (state.stats.activeUsers > 0) {
        state.stats.activeUsers -= 1;
      }
      state.stats.inactiveUsers += 1;
    })
    .addCase(deactivateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to deactivate user';
    })
    .addCase(activateUser.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(activateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      // Update the user's status in the users array if needed
      state.users = state.users.map(user =>
        user.id === action.payload.data.user_id
          ? { ...user, status: 'active' }
          : user
      );
      // Update stats
      if (state.stats.inactiveUsers > 0) {
        state.stats.inactiveUsers -= 1;
      }
      state.stats.activeUsers += 1;
    })
    .addCase(activateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to activate user';
    })
    // Add these cases to your existing extraReducers builder
    // Add these cases to your existing extraReducers builder
    .addCase(assignRolesToUser.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(assignRolesToUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;

      // Convert string roles to Role objects if needed
      const roleObjects = action.payload.data.roles.map(role =>
        typeof role === 'string' ? { name: role } : role
      );

      // Update the user in the users list if they exist
      if (state.selectedUser && state.selectedUser.id === action.payload.data.user.id) {
        state.selectedUser.roles = roleObjects;
      }

      // Also update in the main users list
      state.users = state.users.map(user =>
        user.id === action.payload.data.user.id
          ? { ...user, roles: roleObjects }
          : user
      );
    })
    .addCase(assignRolesToUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to assign roles';
    })
    .addCase(removeRolesFromUser.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(removeRolesFromUser.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;

      // Convert string roles to Role objects if needed
      const roleObjects = action.payload.data.remaining_roles.map(role =>
        typeof role === 'string' ? { name: role } : role
      );

      // Update the user in the users list if they exist
      if (state.selectedUser && state.selectedUser.id === action.payload.data.user.id) {
        state.selectedUser.roles = roleObjects;
      }

      // Also update in the main users list
      state.users = state.users.map(user =>
        user.id === action.payload.data.user.id
          ? { ...user, roles: roleObjects }
          : user
      );
    })
    .addCase(removeRolesFromUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to remove roles';
    })
    .addCase(changeUserRole.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    .addCase(changeUserRole.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;

      // The user details will be updated by the fetchSingleUser call in the thunk
    })
    .addCase(changeUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to change user role';
    })
    .addCase(syncUserRoles.pending, (state) => {
      state.loading = true;
      state.successMessage = null;
      state.error = null;
    })
    // features/user/userReducers.ts
    .addCase(syncUserRoles.fulfilled, (state, action) => {
      state.loading = false;

      // Handle empty response
      if (!action.payload || Object.keys(action.payload).length === 0) {
        state.successMessage = 'Roles synced successfully';
        return;
      }

      // Set success message
      state.successMessage = action.payload.message || 'Roles synced successfully';

      // Extract data from the response
      const responseData = action.payload.data;

      if (!responseData) {
        console.warn('No data found in response');
        return;
      }

      // Extract roles data - use the correct field from the response
      const rolesData = responseData.roles || responseData.final_roles || responseData.new_roles || [];

      // Extract user ID - use the correct field from the response
      const userId = responseData.user_id;

      if (!Array.isArray(rolesData) || rolesData.length === 0) {
        console.warn('No roles data found in response');
        return;
      }

      if (!userId) {
        console.warn('User ID not found in response');
        return;
      }

      // Convert string roles to Role objects if needed
      const roleObjects = rolesData.map(role =>
        typeof role === 'string' ? { name: role } : role
      );

      // Update the selected user if it exists and matches
      // Note: Make sure to compare with the correct ID field (user_id vs id)
      if (state.selectedUser && (state.selectedUser.id === userId || state.selectedUser.user_id === userId)) {
        state.selectedUser.roles = roleObjects;
      }

      // Update the user in the main list
      // Note: Check both id and user_id fields since your User type has both
      state.users = state.users.map(user =>
        (user.id === userId || user.user_id === userId)
          ? { ...user, roles: roleObjects }
          : user
      );
    })
    .addCase(syncUserRoles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to sync user roles';
    })

    // Add these cases to your existing extraReducers builder in userReducers.ts

    // Temporary Permissions Cases
    .addCase(assignTemporaryPermissions.pending, (state) => {
      state.temporaryPermissions.loading = true;
      state.temporaryPermissions.error = null;
    })
    .addCase(assignTemporaryPermissions.fulfilled, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.successMessage = action.payload.message;

      // Update active permissions list
      if (action.payload.assigned_permissions) {
        const newPermissions = action.payload.assigned_permissions.map(perm => ({
          ...perm,
          permission_name: perm.permission_name // Map permission to permission_name for consistency
        }));
        state.temporaryPermissions.active = [
          ...state.temporaryPermissions.active,
          ...newPermissions
        ];
      }
    })
    .addCase(assignTemporaryPermissions.rejected, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.error = action.payload?.message || 'Failed to assign temporary permissions';
    })

    .addCase(revokeTemporaryPermissions.pending, (state) => {
      state.temporaryPermissions.loading = true;
      state.temporaryPermissions.error = null;
    })
    .addCase(revokeTemporaryPermissions.fulfilled, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.successMessage = action.payload.message;

      // Remove revoked permissions from active list
      if (action.payload.revoked_permissions) {
        const revokedIds = action.payload.revoked_permissions.map(p => p.id);
        state.temporaryPermissions.active = state.temporaryPermissions.active.filter(
          perm => !revokedIds.includes(perm.id)
        );
      }
    })
    .addCase(revokeTemporaryPermissions.rejected, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.error = action.payload?.message || 'Failed to revoke temporary permissions';
    })

    .addCase(getTemporaryPermissions.pending, (state) => {
      state.temporaryPermissions.loading = true;
      state.temporaryPermissions.error = null;
    })
    .addCase(getTemporaryPermissions.fulfilled, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.active = action.payload.data.active_temporary_permissions || [];
      state.temporaryPermissions.all = action.payload.data.all_temporary_permissions || [];
    })
    .addCase(getTemporaryPermissions.rejected, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.error = action.payload?.message || 'Failed to fetch temporary permissions';
    })

    .addCase(getActiveTemporaryPermissions.pending, (state) => {
      state.temporaryPermissions.loading = true;
      state.temporaryPermissions.error = null;
    })
    .addCase(getActiveTemporaryPermissions.fulfilled, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.active = action.payload.data || [];
    })
    .addCase(getActiveTemporaryPermissions.rejected, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.error = action.payload?.message || 'Failed to fetch active temporary permissions';
    })

    .addCase(cleanupExpiredTemporaryPermissions.pending, (state) => {
      state.temporaryPermissions.loading = true;
      state.temporaryPermissions.error = null;
    })
    .addCase(cleanupExpiredTemporaryPermissions.fulfilled, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.successMessage = action.payload.message;
    })
    .addCase(cleanupExpiredTemporaryPermissions.rejected, (state, action) => {
      state.temporaryPermissions.loading = false;
      state.temporaryPermissions.error = action.payload?.message || 'Failed to cleanup expired permissions';
    });
};