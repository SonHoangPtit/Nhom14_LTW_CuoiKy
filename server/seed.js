import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import BoardingHouse from './models/BoardingHouse.js';
import Room from './models/Room.js';
import Contract from './models/Contract.js';
import Invoice from './models/Invoice.js';
import RepairRequest from './models/RepairRequest.js';
import Contact from './models/Contact.js';

dotenv.config();

// Hàm hỗ trợ tính toán chính xác tiền điện, nước và tổng hóa đơn
const buildInvoice = ({
  room,
  house,
  tenantId,
  month,
  year,
  oldElectric,
  newElectric,
  oldWater,
  newWater,
  isPaid
}) => {
  const electricCost = (newElectric - oldElectric) * house.electricPrice;
  const waterCost = (newWater - oldWater) * house.waterPrice;
  const totalAmount = room.price + electricCost + waterCost + house.serviceFee;

  return {
    roomId: room._id,
    tenantId,
    month,
    year,
    oldElectric,
    newElectric,
    oldWater,
    newWater,
    roomPrice: room.price,
    electricCost,
    waterCost,
    serviceFee: house.serviceFee,
    totalAmount,
    isPaid
  };
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Dang ket noi MongoDB de tao du lieu mau...');

    // 1. Xóa sạch dữ liệu cũ trong tất cả các collection
    await Promise.all([
      User.deleteMany({}),
      BoardingHouse.deleteMany({}),
      Room.deleteMany({}),
      Contract.deleteMany({}),
      Invoice.deleteMany({}),
      RepairRequest.deleteMany({}),
      Contact.deleteMany({})
    ]);

    // 2. Tạo 1 tài khoản Chủ trọ và 3 tài khoản Người thuê (mật khẩu chung: 123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const [landlord, tenant1, tenant2, tenant3] = await User.create([
      {
        fullName: 'Nguyễn Văn Chủ',
        email: 'chutro@gmail.com',
        phone: '0901234567',
        password: hashedPassword,
        role: 'landlord'
      },
      {
        fullName: 'Trần Minh Tuấn',
        email: 'nguoithue1@gmail.com',
        phone: '0912345678',
        password: hashedPassword,
        role: 'tenant'
      },
      {
        fullName: 'Lê Thị Mai',
        email: 'nguoithue2@gmail.com',
        phone: '0923456789',
        password: hashedPassword,
        role: 'tenant'
      },
      {
        fullName: 'Phạm Hoàng Nam',
        email: 'nguoithue3@gmail.com',
        phone: '0934567890',
        password: hashedPassword,
        role: 'tenant'
      }
    ]);

    // 3. Tạo 2 Dãy trọ
    const [house1, house2] = await BoardingHouse.create([
      {
        name: 'Nhà trọ Ánh Dương - Cơ sở 1',
        address: 'Số 122 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
        description: 'Khu trọ khép kín, có thang máy, camera an ninh 24/7, gần các trường đại học.',
        electricPrice: 3500,
        waterPrice: 25000,
        serviceFee: 150000
      },
      {
        name: 'Nhà trọ Bình Minh - Cơ sở 2',
        address: 'Ngõ 68 Cầu Giấy, Quan Hoa, Hà Nội',
        description: 'Phòng rộng thoáng có ban công, chỗ để xe tầng 1 miễn phí, giờ giấc tự do.',
        electricPrice: 3800,
        waterPrice: 28000,
        serviceFee: 120000
      }
    ]);

    // 4. Tạo 8 Phòng trọ (4 Đang thuê, 3 Trống, 1 Đang sửa)
    const rooms = await Room.create([
      // Dãy 1
      { boardingHouseId: house1._id, roomNumber: 'P101', price: 3200000, area: 22, status: 'Đang thuê' },
      { boardingHouseId: house1._id, roomNumber: 'P102', price: 3500000, area: 25, status: 'Đang thuê' },
      { boardingHouseId: house1._id, roomNumber: 'P103', price: 2800000, area: 18, status: 'Trống' },
      { boardingHouseId: house1._id, roomNumber: 'P104', price: 3000000, area: 20, status: 'Đang sửa' },
      // Dãy 2
      { boardingHouseId: house2._id, roomNumber: 'P201', price: 4000000, area: 28, status: 'Đang thuê' },
      { boardingHouseId: house2._id, roomNumber: 'P202', price: 3800000, area: 26, status: 'Đang thuê' },
      { boardingHouseId: house2._id, roomNumber: 'P203', price: 3300000, area: 22, status: 'Trống' },
      { boardingHouseId: house2._id, roomNumber: 'P204', price: 4200000, area: 30, status: 'Trống' }
    ]);

    const [p101, p102, , , p201, p202] = rooms;

    // 5. Tạo 4 Hợp đồng đang hiệu lực tương ứng với 4 phòng 'Đang thuê'
    await Contract.create([
      {
        roomId: p101._id,
        tenantId: tenant1._id,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-06-01'),
        deposit: 3200000,
        status: 'Đang hiệu lực'
      },
      {
        roomId: p102._id,
        tenantId: tenant2._id,
        startDate: new Date('2026-06-15'),
        endDate: new Date('2027-06-15'),
        deposit: 3500000,
        status: 'Đang hiệu lực'
      },
      {
        roomId: p201._id,
        tenantId: tenant3._id,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2027-07-01'),
        deposit: 4000000,
        status: 'Đang hiệu lực'
      },
      {
        roomId: p202._id,
        tenantId: tenant1._id, // Người thuê 1 đứng tên thuê thêm 1 phòng cho người nhà
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-06-01'),
        deposit: 3800000,
        status: 'Đang hiệu lực'
      }
    ]);

    // 6. Tạo 12 Hóa đơn rải đều qua các tháng 7, 8, 9, 10 năm 2026 (9 đã thu, 3 đang nợ)
    const invoiceList = [
      // Phòng P101 (3 hóa đơn)
      buildInvoice({ room: p101, house: house1, tenantId: tenant1._id, month: 7, year: 2026, oldElectric: 100, newElectric: 180, oldWater: 10, newWater: 15, isPaid: true }),
      buildInvoice({ room: p101, house: house1, tenantId: tenant1._id, month: 8, year: 2026, oldElectric: 180, newElectric: 270, oldWater: 15, newWater: 21, isPaid: true }),
      buildInvoice({ room: p101, house: house1, tenantId: tenant1._id, month: 10, year: 2026, oldElectric: 270, newElectric: 350, oldWater: 21, newWater: 26, isPaid: false }),

      // Phòng P102 (3 hóa đơn)
      buildInvoice({ room: p102, house: house1, tenantId: tenant2._id, month: 7, year: 2026, oldElectric: 200, newElectric: 300, oldWater: 20, newWater: 26, isPaid: true }),
      buildInvoice({ room: p102, house: house1, tenantId: tenant2._id, month: 9, year: 2026, oldElectric: 300, newElectric: 410, oldWater: 26, newWater: 33, isPaid: true }),
      buildInvoice({ room: p102, house: house1, tenantId: tenant2._id, month: 10, year: 2026, oldElectric: 410, newElectric: 500, oldWater: 33, newWater: 39, isPaid: false }),

      // Phòng P201 (3 hóa đơn)
      buildInvoice({ room: p201, house: house2, tenantId: tenant3._id, month: 8, year: 2026, oldElectric: 50, newElectric: 150, oldWater: 5, newWater: 12, isPaid: true }),
      buildInvoice({ room: p201, house: house2, tenantId: tenant3._id, month: 9, year: 2026, oldElectric: 150, newElectric: 260, oldWater: 12, newWater: 19, isPaid: true }),
      buildInvoice({ room: p201, house: house2, tenantId: tenant3._id, month: 10, year: 2026, oldElectric: 260, newElectric: 350, oldWater: 19, newWater: 25, isPaid: true }),

      // Phòng P202 (3 hóa đơn)
      buildInvoice({ room: p202, house: house2, tenantId: tenant1._id, month: 7, year: 2026, oldElectric: 80, newElectric: 160, oldWater: 8, newWater: 13, isPaid: true }),
      buildInvoice({ room: p202, house: house2, tenantId: tenant1._id, month: 8, year: 2026, oldElectric: 160, newElectric: 250, oldWater: 13, newWater: 19, isPaid: true }),
      buildInvoice({ room: p202, house: house2, tenantId: tenant1._id, month: 10, year: 2026, oldElectric: 250, newElectric: 330, oldWater: 19, newWater: 24, isPaid: false })
    ];

    await Invoice.create(invoiceList);

    // 7. Tạo thêm dữ liệu mẫu cho Yêu cầu sửa chữa và Khách liên hệ
    await RepairRequest.create([
      {
        roomId: p101._id,
        tenantId: tenant1._id,
        title: 'Hỏng vòi sen nhà tắm',
        description: 'Vòi sen bị rỉ nước liên tục ở khớp nối, nhờ chủ trọ kiểm tra thay giúp.',
        status: 'Đang xử lý'
      },
      {
        roomId: p201._id,
        tenantId: tenant3._id,
        title: 'Điều hòa kém mát',
        description: 'Điều hòa bật 20 độ nhưng gió yếu, có thể cần vệ sinh lưới lọc hoặc bơm gas.',
        status: 'Mới'
      }
    ]);

    await Contact.create([
      {
        fullName: 'Đỗ Hoàng Yến',
        phone: '0987654321',
        message: 'Mình muốn hỏi thăm phòng P103 còn trống không ạ? Cuối tuần mình qua xem phòng được không?'
      }
    ]);

    console.log('Tao du lieu mau thanh cong!');
    console.log('--- TAI KHOAN DEMO ---');
    console.log('Chu tro   : chutro@gmail.com / 123456');
    console.log('Nguoi thue: nguoithue1@gmail.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('Loi khi tao du lieu mau:', error.message);
    process.exit(1);
  }
};

seedDatabase();