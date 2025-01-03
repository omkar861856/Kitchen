import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';

interface AppState {

  connectedUsers: number | null;
  loading:boolean;
  error:string | null;
  status: "loading" | "succeeded" | "failed" | null;
  kitchenStatus: boolean;
  vapiPublicKey: string;
  
}

const initialState: AppState = {

  connectedUsers: null,
  loading:false,
  error:null,
  status: null,
  kitchenStatus:false,
  vapiPublicKey:"empty"
  
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


// Create the slice
const feedbackSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Optionally, you can add synchronous reducers if needed
    setAppState: () => {
     
    },
    setWebWorkerDetails: (state,action)=>{

        state.vapiPublicKey = action.payload.vapiPublicKey

    }
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
  },
});

// Export actions and reducer
export const { setAppState, setWebWorkerDetails } = feedbackSlice.actions;
export default feedbackSlice.reducer;