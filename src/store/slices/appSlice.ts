import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';
import { AuthState } from './authSlice';

interface AppState {

  connectedUsers: number | null;
  loading:boolean;
  error:string | null;
  status: "loading" | "succeeded" | "failed" | null;
  kitchenStatus: boolean;
  
}

const initialState: AppState = {

  connectedUsers: null,
  loading:false,
  error:null,
  status: null,
  kitchenStatus:false,
  
};

// Thunk to send feedback to the backend
export const connectKitchen = createAsyncThunk(
  'app/connectKitchen',
  async (appData: AppState, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${apiUrl}/generalfeedback`, appData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'Failed to send feedback');
    }
  }
);

export const fetchKitchenStatus = createAsyncThunk(
  'kitchen/fetchKitchenStatus',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }; 
    const kitchenId = state.auth.kitchenId; 
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
  'app/updateKitchenStatus',
  async (status: boolean, { getState,rejectWithValue }) => {
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

// Create the slice
const feedbackSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Optionally, you can add synchronous reducers if needed
    setAppState: () => {
     
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectKitchen.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(connectKitchen.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(connectKitchen.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateKitchenStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateKitchenStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kitchenStatus = action.payload; // Assuming response contains the updated status
      })
      .addCase(updateKitchenStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchKitchenStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchKitchenStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kitchenStatus = action.payload; // Assuming response contains the updated status
      })
      .addCase(fetchKitchenStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
  },
});

// Export actions and reducer
export const { setAppState } = feedbackSlice.actions;
export default feedbackSlice.reducer;