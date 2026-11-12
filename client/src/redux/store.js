import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './roomSlice';
import invoiceReducer from './invoiceSlice';

const store = configureStore({
  reducer: {
    rooms: roomReducer,
    invoices: invoiceReducer
  }
});

export default store;