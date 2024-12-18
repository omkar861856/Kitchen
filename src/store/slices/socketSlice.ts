import { createSlice} from '@reduxjs/toolkit';

interface socketState {
  orderPage: number;
}

const initialState: socketState = {
  orderPage: 0,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    update: (state) => {
      state.orderPage = state.orderPage+1;
    },
  },
});

export const { update } = socketSlice.actions;
export default socketSlice.reducer;