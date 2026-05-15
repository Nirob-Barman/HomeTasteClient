import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TUserProfile } from "@/types/user";
import type { AuthState } from "./types";

const STORAGE_KEY = "ht_auth";

function loadFromStorage(): Partial<AuthState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AuthState>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

const persisted = loadFromStorage();

const initialState: AuthState = {
  user: persisted.user ?? null,
  accessToken: persisted.accessToken ?? null,
  refreshToken: persisted.refreshToken ?? null,
  isAuthenticated: !!(persisted.accessToken && persisted.user),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: TUserProfile;
        accessToken: string;
        refreshToken: string;
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      saveToStorage({ ...state });
    },
    setTokensOnly(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      // isAuthenticated stays false until user profile is loaded
    },
    updateTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveToStorage({ ...state });
    },
    updateUser(state, action: PayloadAction<TUserProfile>) {
      state.user = action.payload;
      saveToStorage({ ...state });
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      clearStorage();
    },
  },
});

export const { setCredentials, setTokensOnly, updateTokens, updateUser, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;
