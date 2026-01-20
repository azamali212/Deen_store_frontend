// features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthStorage } from "@/core/auth/auth.storage";
import { AuthTab } from "@/core/auth/auth.tab";
import { publicApi } from "@/services/api.public";

const key = (portal: string) => `${portal}:${AuthTab.getId()}`;

// --------------------
// LOGOUT THUNK - NEW!
// --------------------
export const logout = createAsyncThunk(
  "auth/logout",
  async (portal: "admin" | "customer", { rejectWithValue }) => {
    try {
      // Get token for API call
      const token = AuthStorage.getAccessToken(portal);
      
      if (token) {
        try {
          // Call backend logout API
          await publicApi.post("/user-logout", {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (apiError) {
          console.log("Backend logout API error (might be expected if token expired):", apiError);
          // Continue with frontend logout even if backend fails
        }
      }
      
      // Clear frontend storage
      AuthStorage.clear(portal);
      
      return { portal };
    } catch (e: any) {
      console.error("Logout error:", e);
      // Still clear frontend storage even if something fails
      AuthStorage.clear(portal);
      return rejectWithValue("Logout failed");
    }
  }
);

// --------------------
// LOGIN THUNK
// --------------------
export const login = createAsyncThunk(
  "auth/login",
  async (
    payload: { email: string; password: string; portal: "admin" | "customer" },
    { rejectWithValue }
  ) => {
    try {
      console.log("Sending login request:", payload);

      const { data } = await publicApi.post("/user-login", {
        email: payload.email,
        password: payload.password,
        portal: payload.portal,
      });
      
      console.log("Login response data:", data);
      
      return { 
        data, 
        portal: payload.portal, 
        email: payload.email,
         redirectTo: payload.portal === "admin" ? "/dashboard" : "/userInterface"
      };
    } catch (e: any) {
      console.error("Login error:", e.response?.data || e.message);
      return rejectWithValue(e.response?.data?.message || "Login failed");
    }
  }
);

// --------------------
// VERIFY OTP THUNK
// --------------------
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    payload: {
      portal: "admin" | "customer";
      email: string;
      session_id: string;
      otp: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("🔵 Sending OTP verification:", payload);

      const { data } = await publicApi.post("/verify-otp", payload);

      console.log("✅ OTP verified successfully:", data);

      return { 
        data, 
        portal: payload.portal,
        redirectTo: payload.portal === "admin" ? "/dashboard" : "/userInterface"
      };
    } catch (e: any) {
      console.error("❌ OTP verification failed:", e);
      return rejectWithValue(e.response?.data?.message || "OTP failed");
    }
  }
);

// --------------------
// CHECK SESSION THUNK
// --------------------
// features/auth/authSlice.ts - Update checkSession thunk
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (portal: "admin" | "customer", { rejectWithValue, dispatch }) => {
    try {
      console.log(`🔍 Checking session for portal: ${portal}`);
      
      // Get token from all possible sources
      const token = AuthStorage.getAccessToken(portal);
      const cookieToken = AuthStorage.getTokenFromCookie(portal);
      
      console.log(`Token from storage: ${!!token}, from cookie: ${!!cookieToken}`);
      
      if (!token && !cookieToken) {
        console.log(`❌ No token found for ${portal}`);
        throw new Error("No token found");
      }
      
      // Use whichever token is available
      const validToken = token || cookieToken;
      
      // Optional: Validate token with backend API
      try {
        // Uncomment this if you want to validate token with backend
        /*
        const { data } = await publicApi.get("/validate-token", {
          headers: {
            Authorization: `Bearer ${validToken}`
          }
        });
        console.log(`✅ Token validated for ${portal}:`, data);
        return { portal, token: validToken, user: data.user };
        */
        
        // For now, just return the token
        console.log(`✅ Session valid for ${portal}`);
        return { portal, token: validToken };
      } catch (apiError) {
        console.log(`⚠️ Token validation failed for ${portal}:`, apiError);
        // Even if API validation fails, if we have a token, consider session valid
        // Or you can clear the token here if it's invalid
        // AuthStorage.clear(portal);
        // throw new Error("Token invalid");
        return { portal, token: validToken };
      }
      
    } catch (e: any) {
      console.error(`❌ Session check failed for ${portal}:`, e.message);
      
      // Clear invalid tokens
      AuthStorage.clear(portal);
      
      return rejectWithValue("Session expired or invalid");
    }
  }
);

// --------------------
// SLICE
// --------------------
const slice = createSlice({
  name: "auth",
  initialState: { 
    sessions: {} as Record<string, any>,
    loading: false,
    error: null as string | null,
    logoutLoading: false, // Add logout loading state
  },
  reducers: {
    // Keep this for immediate logout without API call if needed
    forceLogout(state, action) {
      const portal = action.payload as "admin" | "customer";
      const sessionKey = key(portal);
      
      AuthStorage.clear(portal);
      delete state.sessions[sessionKey];
      state.error = null;
      
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = portal === "admin" ? "/admin/login" : "/customer/login";
      }
    },
    
    clearError(state) {
      state.error = null;
    },
    
    setSession(state, action) {
      const { portal, data } = action.payload;
      const sessionKey = key(portal);
      
      AuthStorage.setAccessToken(data.token.access_token, portal);
      
      state.sessions[sessionKey] = {
        phase: "authenticated",
        portal,
        user: data.user,
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { data, portal, email, redirectTo } = action.payload;
        const sessionKey = key(portal);
        
        state.loading = false;
        
        if (data.requires_verification) {
          state.sessions[sessionKey] = {
            phase: "otp_required",
            portal,
            email,
            sessionId: data.session_id,
          };
          return;
        }

        // Store token and redirect
        AuthStorage.setAccessToken(data.token.access_token, portal);
        
        state.sessions[sessionKey] = {
          phase: "authenticated",
          portal,
          user: data.user,
        };
        
        // Redirect to appropriate dashboard
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 100);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Login failed";
      })
      
      // OTP cases
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const { data, portal, redirectTo } = action.payload;
        const sessionKey = key(portal);
        
        state.loading = false;
        
        AuthStorage.setAccessToken(data.token.access_token, portal);
        
        state.sessions[sessionKey] = {
          phase: "authenticated",
          portal,
          user: data.user,
        };
        
        // Redirect to appropriate dashboard
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 100);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "OTP verification failed";
      })
      
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        const { portal } = action.payload;
        const sessionKey = key(portal);
        
        state.logoutLoading = false;
        delete state.sessions[sessionKey];
        state.error = null;
        
        // Redirect to login page
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = portal === "admin" ? "/admin/login" : "/customer/login";
          }, 100);
        }
      })
      .addCase(logout.rejected, (state, action) => {
        state.logoutLoading = false;
        // Still clear sessions even if logout failed
        const portal = action.meta.arg as "admin" | "customer";
        const sessionKey = key(portal);
        delete state.sessions[sessionKey];
        
        // Redirect to login page
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = portal === "admin" ? "/admin/login" : "/customer/login";
          }, 100);
        }
      })
      
      // Session check cases
      .addCase(checkSession.fulfilled, (state, action) => {
        const { portal, token } = action.payload;
        const sessionKey = key(portal);
        
        if (!state.sessions[sessionKey]) {
          state.sessions[sessionKey] = {
            phase: "authenticated",
            portal,
            token,
          };
        }
      });
  },
});

export const { forceLogout, clearError, setSession } = slice.actions;
export default slice.reducer;