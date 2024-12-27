import { combineReducers } from "@reduxjs/toolkit";
import menuReducer from './slices/menuSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/ordersSlice'
import socketReducer from './slices/socketSlice'

import exampleReducer from './slices/exampleSlice';
import notificationsReducer from './slices/notificationsSlice'
import authReducer from './slices/authSlice'
import mainAppReducer from './slices/appSlice'

const appReducer = combineReducers({
    example: exampleReducer,
    menu: menuReducer,
    cart: cartReducer,
    orders: orderReducer,
    socket: socketReducer,
    notifications: notificationsReducer,
    auth: authReducer,
    app: mainAppReducer
  });


  const rootReducer = (state: any, action: any) => {
    if (action.type === 'RESET_STORE') {
        // Preserve auth.token while resetting everything else
        const { auth: { token } = {} } = state || {};
        state = { auth: { token } }; // Retain only token in auth state
      }
    return appReducer(state, action);
};

export default rootReducer;