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
  activateUser
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
};

export const reducers: UserReducers = {
  clearMessages(state) {
    state.error = null;
    state.successMessage = null;
  },
  setSelectedUserPermissions: (state, action: PayloadAction<Permission[]>) => {
    state.selectedUserPermissions = action.payload;
  },
  setSelectedUser(state, action) {
    state.selectedUser = action.payload;
  },
  resetUserState() {
    return initialState;
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
    });

};