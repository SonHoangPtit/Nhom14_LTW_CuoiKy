import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Đăng ký tài khoản mới
export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu'
      });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng'
      });
    }

    // 3. Mã hóa mật khẩu bằng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Lưu người dùng mới vào MongoDB
    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'tenant'
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // 1. Tìm tài khoản theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // 2. So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // 3. Ký JWT có thời hạn 7 ngày (không đưa mật khẩu vào payload)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách tài khoản Người thuê (để Chủ trọ chọn khi lập hợp đồng)
export const getTenants = async (req, res, next) => {
  try {
    const tenants = await User.find({ role: 'tenant' }).select('_id fullName email phone');
    res.status(200).json({
      success: true,
      data: tenants
    });
  } catch (error) {
    next(error);
  }
};