import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // Sẽ lưu chuỗi hash bcrypt
  role: {
    type: String,
    enum: ['landlord', 'tenant'],
    default: 'tenant'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;