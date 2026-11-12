import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  deposit: { type: Number, required: true }, // Tiền cọc
  status: {
    type: String,
    enum: ['Đang hiệu lực', 'Đã kết thúc'],
    default: 'Đang hiệu lực'
  }
}, { timestamps: true });

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;