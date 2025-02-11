import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';

export interface User {
    firstName: string;
    lastName: string;
    phone: string;
}

export interface AuthState {
    firstName: string | null;
    lastName: string | null;
    phone: string;
    token: string | null;
    isLoggedIn: boolean;
    otp: string | null;
    otpExpiresAt: string | null; // ISO string for OTP expiration time
    isKitchen: boolean | null;
    kitchenName: string | null;
    kitchenId: string;
    kitchenStatus: boolean;
}

const initialState: AuthState = {
    firstName: null,
    lastName: null,
    phone: "",
    token: null,
    isLoggedIn: false,
    otp: null,
    otpExpiresAt: null,
    isKitchen: null,
    kitchenName: null,
    kitchenId: "empty",
    kitchenStatus: false
};

// Thunk to handle user signup
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (
        payload: { firstName: string; lastName: string; phone: string; otp: string; otpExpiresAt: string },
        thunkAPI
    ) => {
        try {
            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to sign up');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to sign up');
        }
    }
);

// Thunk to handle user login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (payload: { phone: string; otp: string }, thunkAPI) => {
        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to login');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to login');
        }
    }
);

export const logoutUser = createAsyncThunk<void, string>(
    'auth/logoutUser',
    async (phone: string, thunkAPI) => {
        try {
            await axios.post(`${apiUrl}/auth/logout`, { phone });
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to log out');
        }
    }
);


export const getIsLoggedInStatus = createAsyncThunk(
    'auth/getIsLoggedInStatus',
    async (phone, thunkAPI) => {
        try {
            const response = await axios.post(`${apiUrl}/auth/status`, { phone });
            console.log(response)
            return response.data.isLoggedIn; // Assuming the API returns an object with the isLoggedIn field
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to fetch login status');
        }
    }
);


export const fetchKitchenStatus = createAsyncThunk(
    'kitchen/fetchKitchenStatus',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as { auth: AuthState };
        const kitchenId = state.auth.kitchenId;
        console.log(kitchenId)
        try {
            const response = await axios.get(`${apiUrl}/auth/kitchen-status/${kitchenId}`);
            return response.data.status; // Adjust based on your API's response structure
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch kitchen status');
        }
    }
);

// Thunk to update the kitchen status
export const updateKitchenStatus = createAsyncThunk(
    'auth/updateKitchenStatus',
    async (status: boolean, { getState, rejectWithValue }) => {
        const state = getState() as { auth: AuthState };
        const kitchenId = state.auth.kitchenId;
        try {
            const response = await axios.post(`${apiUrl}/auth/update-kitchen-status`, { kitchenId, status });
            return response.data.status;
        } catch (error: any) {
            return rejectWithValue(error.response.data || 'Failed to update kitchen status');
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.firstName = null;
            state.lastName = null;
            state.phone = "";
            state.isLoggedIn = false;
            state.otp = null;
            state.otpExpiresAt = null;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        login: (
            state,
            action: PayloadAction<{
                isKitchen: boolean | null;
                kitchenStatus: boolean;
                kitchenName: string | null; firstName: string; token: string; lastName: string; phone: string; otp: string; otpExpiresAt: string; isLoggedIn: boolean; kitchenId: string;
            }>
        ) => {
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.phone = action.payload.phone;
            state.otp = action.payload.otp;
            state.otpExpiresAt = action.payload.otpExpiresAt;
            state.token = action.payload.token;
            state.isLoggedIn = action.payload.isLoggedIn;
            state.isKitchen = action.payload.isKitchen;
            state.kitchenName = action.payload.kitchenName;
            state.kitchenId = action.payload.kitchenId
            state.kitchenStatus = action.payload.kitchenStatus
        },
        clearLocalStorage: (state) => {
            localStorage.clear(); // Clear all items in local storage
            // Reset the Redux state to initial values
            state.firstName = initialState.firstName;
            state.lastName = initialState.lastName;
            state.phone = initialState.phone;
            state.token = initialState.token;
            state.isLoggedIn = initialState.isLoggedIn;
            state.otp = initialState.otp;
            state.otpExpiresAt = initialState.otpExpiresAt;
        },
    },
    extraReducers: (builder) => {
        builder
            // Signup logic
            .addCase(signupUser.pending, () => {
                // Optionally handle loading state for signup
            })
            .addCase(
                signupUser.fulfilled,
                (state, action: PayloadAction<{ firstName: string; lastName: string; phone: string; otp: string; otpExpiresAt: string }>) => {
                    state.firstName = action.payload.firstName;
                    state.lastName = action.payload.lastName;
                    state.phone = action.payload.phone;
                    state.otp = action.payload.otp;
                    state.otpExpiresAt = action.payload.otpExpiresAt;
                }
            )
            .addCase(signupUser.rejected, (state, action) => {
                console.error(action.payload || 'Error during signup');
                state.firstName = null;
                state.lastName = null;
                state.phone = "";
                state.otp = null;
                state.otpExpiresAt = null;
            })

            // Login logic
            .addCase(loginUser.pending, () => {
                // Optionally handle loading state for login
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
                state.firstName = action.payload.user.firstName;
                state.lastName = action.payload.user.lastName;
                state.phone = action.payload.user.phone;
                state.token = action.payload.token;
                state.isLoggedIn = true;
                state.otp = null;
                state.otpExpiresAt = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                console.error(action.payload || 'Error during login');
                state.firstName = null;
                state.lastName = null;
                state.phone = "";
                state.token = null;
                state.isLoggedIn = false;
            })

            // Logout logic
            .addCase(logoutUser.pending, () => {
                // Optionally handle loading state for logout
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.firstName = null;
                state.lastName = null;
                state.phone = "";
                state.isLoggedIn = false;
                state.otp = null;
                state.otpExpiresAt = null;
            })
            .addCase(logoutUser.rejected, (_state, action) => {
                console.error(action.payload || 'Error during logout');
            })
            .addCase(updateKitchenStatus.pending, () => {

            })
            .addCase(updateKitchenStatus.fulfilled, (state, action) => {
                state.kitchenStatus = action.payload; // Assuming response contains the updated status
            })
            .addCase(updateKitchenStatus.rejected, () => {
            })
            .addCase(fetchKitchenStatus.pending, () => {
            })
            .addCase(fetchKitchenStatus.fulfilled, (state, action) => {
                state.kitchenStatus = action.payload; // Assuming response contains the updated status
            })
            .addCase(fetchKitchenStatus.rejected, () => {
            })
    },
});

export const { logout, setToken, login, clearLocalStorage } = authSlice.actions;
export default authSlice.reducer;