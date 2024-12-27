import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';

interface AppState {

  connectedUsers: number | null;
  loading:boolean;
  error:string | null;
  status: "loading" | "succeeded" | "failed" | null;
  kitchenStatus: "online" | "offline";
  
}

const initialState: AppState = {

  connectedUsers: null,
  loading:false,
  error:null,
  status: null,
  kitchenStatus:"offline",
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

// Thunk to update the kitchen status
export const updateKitchenStatus = createAsyncThunk(
  'app/updateKitchenStatus',
  async (status: "online" | "offline", { rejectWithValue }) => {
    try {
      // const response = await axios.post(`${apiUrl}/update-kitchen-status`, { status });
      // return response.data;
      return {status}
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
        state.kitchenStatus = action.payload.status; // Assuming response contains the updated status
      })
      .addCase(updateKitchenStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setAppState } = feedbackSlice.actions;
export default feedbackSlice.reducer;