import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../services/api';

// Gọi API lấy danh sách phòng (hỗ trợ tìm kiếm, lọc, phân trang)
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          query.append(key, value);
        }
      });

      const queryString = query.toString();
      const endpoint = queryString ? `/rooms?${queryString}` : '/rooms';
      return await apiRequest(endpoint);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    list: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 1
    },
    loading: false,
    error: null
  },
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRoomError } = roomSlice.actions;
export default roomSlice.reducer;