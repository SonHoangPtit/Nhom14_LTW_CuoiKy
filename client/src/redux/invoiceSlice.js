import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../services/api';

// Gọi API lấy danh sách hóa đơn
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          query.append(key, value);
        }
      });

      const queryString = query.toString();
      const endpoint = queryString ? `/invoices?${queryString}` : '/invoices';
      return await apiRequest(endpoint);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Gọi API xác nhận thanh toán hóa đơn
export const payInvoice = createAsyncThunk(
  'invoices/payInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      return await apiRequest(`/invoices/${invoiceId}/pay`, {
        method: 'PATCH'
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(payInvoice.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.list.findIndex((item) => item._id === updated._id);
        if (index !== -1) {
          state.list[index].isPaid = true;
        }
      });
  }
});

export const { clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;