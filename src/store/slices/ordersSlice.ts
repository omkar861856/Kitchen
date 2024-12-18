import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';
import { InventoryItem } from './menuSlice';

// Define interfaces for orders and their statuses
export interface Order {
    orderId: string;
    userId: string;
    items: InventoryItem[];
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    deliveryTime: string;
    totalPrice?:number;
    orderedAt?:string | undefined;
    completedAt?:string | undefined;
    totalPreparationTime: number ;
}

interface OrdersState {
    orders: Order[];
    pendingOrders: Order[];
    loading: boolean;
    error: string | null | undefined;
}

// Initial state for orders
const initialState: OrdersState = {
    orders: [],
    pendingOrders: [],
    loading: false,
    error: null,
};

// Async thunk to fetch orders
export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async () => {
        try {
            const response = await axios.get(`${apiUrl}/orders`);
            return response.data; // Assuming the response contains the orders in the "orders" field
        } catch (error) {
            throw Error('Failed to fetch orders');
        }
    }
);

// Async thunk to fetch orders
export const fetchOrdersByUserId = createAsyncThunk(
  'orders/fetchByUserId',
  async (userId: string) => {
      try {
          const response = await axios.get(`${apiUrl}/orders?userId=${userId}`);
          return response.data.orders; // Assuming the response contains the orders in the "orders" field
      } catch (error) {
          throw Error('Failed to fetch orders');
      }
  }
);

// Async thunk to update the order status
export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status }: { orderId: string; status: string }) => {
        try {
            const response = await axios.put(`${apiUrl}/orders/${orderId}`, { status });
            return response.data.updatedOrder; // Assuming the updated order is returned
        } catch (error) {
            throw Error('Failed to update order status');
        }
    }
);

// Redux slice to manage orders
const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Handle successful fetch of orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
              state.loading = false;
              const orders = action.payload;
              // Ensure that we filter pending orders correctly
              const pendingOrders = orders.filter(e => e.status === 'pending');
              // Store both pending and all orders
              state.pendingOrders = pendingOrders;
              state.orders = orders;
          })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Handle successful update of order status
            .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
              console.log(action.payload);  // Log to see if the payload is being received correctly
              if (action.payload) {
                const index = state.orders.findIndex((order) => order.orderId === action.payload.orderId);
                if (index !== -1) {
                  state.orders[index] = action.payload; // Update the order with new status
                }
              } else {
                console.error('No payload found');
              }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export default ordersSlice.reducer;