import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
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
  month: { type: Number, required: true }, // Tháng tính tiền (1-12)
  year: { type: Number, required: true },
  oldElectric: { type: Number, required: true },
  newElectric: { type: Number, required: true },
  oldWater: { type: Number, required: true },
  newWater: { type: Number, required: true },
  roomPrice: { type: Number, required: true },
  electricCost: { type: Number, required: true },
  waterCost: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false } // Đã thu tiền hay chưa
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;