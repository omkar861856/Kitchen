import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';
import { socket } from '../../Layout';

export interface InventoryItem {
    itemId: string;
    name: string;
    category: string;
    price: number;
    availability: boolean;
    preparationTime: number;
    image: string,
    createdAt: string;
    updatedAt: string;
    quantity:number | string;
}

// Initial state: array of inventory items
const initialState: InventoryItem[] = [];

// Async thunks for inventory operations

// Fetch all inventory items
export const fetchInventory = createAsyncThunk('menu/fetchAll', async (_,thunkAPI) => {
    const state:any = thunkAPI.getState()
    const {kitchenId} = state.auth;
    const response = await axios.post(`${apiUrl}/inventory/kitchen`,{kitchenId});
    return response.data; 
});

// Fetch specific inventory item by itemId
export const fetchInventoryItem = createAsyncThunk(
    'menu/fetchItem',
    async (itemId: string) => {
        const response = await axios.get(`${apiUrl}/inventory/${itemId}`);
        return response.data.item; // Assuming `item` is returned from your API
    }
);

// Create a new inventory item
export const createInventoryItem = createAsyncThunk(
    'menu/createItem',
    async (item: Partial<InventoryItem>) => {
        const response = await axios.post(`${apiUrl}/inventory`, item);
        return response.data.item;
    }
);

// Update an inventory item by itemId
export const updateInventoryItem = createAsyncThunk(
    'menu/updateItem',
    async ({ itemId, updates }: { itemId: string; updates: Partial<InventoryItem> }) => {
        console.log(itemId, updates)
        const response = await axios.put(`${apiUrl}/inventory/${itemId}`, updates);
        console.log(response)
        return response.data.item; // Assuming `item` is returned from your API
    }
);

// Delete an inventory item by itemId
export const deleteInventoryItem = createAsyncThunk(
    'menu/deleteItem',
    async (itemId: string) => {
        await axios.delete(`${apiUrl}/inventory/${itemId}`);
        socket.emit('order-update', {room:'order', message:"A menu item deleted"});
        return itemId; // Returning the deleted item's ID
    }
);

// Update inventory quantity by itemId
export const updateInventoryQuantity = createAsyncThunk(
    'menu/updateQuantity',
    async ({ itemId, quantityChange }: { itemId: string; quantityChange: number }) => {
        const response = await axios.patch(`${apiUrl}/inventory/${itemId}/quantity`, { quantityChange });
        return response.data.item; // Assuming `item` is returned from your API
    }
);

// Redux slice
const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInventory.fulfilled, (_, action: PayloadAction<InventoryItem[]>) => {
                return action.payload;
            })
            .addCase(fetchInventoryItem.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
                const index = state.findIndex((item) => item.itemId === action.payload.itemId);
                if (index !== -1) {
                    state[index] = action.payload;
                } else {
                    state.push(action.payload);
                }
            })
            .addCase(createInventoryItem.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
                state.push(action.payload);
            })
            .addCase(updateInventoryItem.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
                const index = state.findIndex((item) => item.itemId === action.payload.itemId);
                if (index !== -1) {
                    state[index] = action.payload;
                }
            })
            .addCase(deleteInventoryItem.fulfilled, (state, action: PayloadAction<string>) => {
                return state.filter((item) => item.itemId !== action.payload);
            })
            .addCase(updateInventoryQuantity.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
                const index = state.findIndex((item) => item.itemId === action.payload.itemId);
                if (index !== -1) {
                    state[index] = action.payload;
                }
            });
    },
});

export default menuSlice.reducer;