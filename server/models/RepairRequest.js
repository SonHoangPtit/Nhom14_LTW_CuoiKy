import mongoose from 'mongoose';

const repairRequestSchema = new mongoose.Schema({
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
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' }, // Đường dẫn ảnh upload qua multer
  status: {
    type: String,
    enum: ['Mới', 'Đang xử lý', 'Xong'],
    default: 'Mới'
  }
}, { timestamps: true });

const RepairRequest = mongoose.model('RepairRequest', repairRequestSchema);
export default RepairRequest;