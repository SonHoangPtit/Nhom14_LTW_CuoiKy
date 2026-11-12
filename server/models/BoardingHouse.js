import mongoose from 'mongoose';

const boardingHouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, default: '' },
  electricPrice: { type: Number, required: true }, // Đơn giá điện (VNĐ/kWh)
  waterPrice: { type: Number, required: true },    // Đơn giá nước (VNĐ/m3)
  serviceFee: { type: Number, default: 0 }        // Phí dịch vụ cố định (rác, wifi...)
}, { timestamps: true });

const BoardingHouse = mongoose.model('BoardingHouse', boardingHouseSchema);
export default BoardingHouse;