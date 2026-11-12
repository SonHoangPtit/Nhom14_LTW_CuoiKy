import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  boardingHouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingHouse',
    required: true
  },
  roomNumber: { type: String, required: true },
  price: { type: Number, required: true }, // Giá thuê hàng tháng
  area: { type: Number, required: true },  // Diện tích m2
  status: {
    type: String,
    enum: ['Trống', 'Đang thuê', 'Đang sửa'],
    default: 'Trống'
  }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;