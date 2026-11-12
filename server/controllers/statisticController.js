import Invoice from '../models/Invoice.js';
import Room from '../models/Room.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Aggregation Pipeline 1: Thống kê doanh thu theo tháng từ hóa đơn đã thanh toán
    const monthlyRevenue = await Invoice.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 2. Aggregation Pipeline 2: Lấy danh sách phòng đang nợ tiền kết hợp $lookup sang bảng Room
    const unpaidRooms = await Invoice.aggregate([
      { $match: { isPaid: false } },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'roomInfo'
        }
      },
      { $unwind: '$roomInfo' },
      {
        $project: {
          _id: 1,
          month: 1,
          year: 1,
          totalAmount: 1,
          roomId: 1,
          roomNumber: '$roomInfo.roomNumber'
        }
      },
      { $sort: { year: -1, month: -1 } }
    ]);

    // 3. Thống kê nhanh số lượng phòng cho các thẻ tổng quan trên Dashboard
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Trống' });
    const rentedRooms = await Room.countDocuments({ status: 'Đang thuê' });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRooms,
          availableRooms,
          rentedRooms,
          unpaidCount: unpaidRooms.length
        },
        monthlyRevenue,
        unpaidRooms
      }
    });
  } catch (error) {
    next(error);
  }
};