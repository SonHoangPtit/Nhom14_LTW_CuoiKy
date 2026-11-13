import Room from '../models/Room.js';
import Contract from '../models/Contract.js';
import Invoice from '../models/Invoice.js';

// Lấy danh sách phòng (Có lọc, tìm kiếm và phân trang)
export const getRooms = async (req, res, next) => {
  try {
    const {
      roomNumber,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      status,
      boardingHouseId,
      page = 1,
      limit = 6
    } = req.query;

    // Xây dựng điều kiện lọc động
    const filter = {};

    // 1. Tìm số phòng gần đúng bằng $regex (không phân biệt hoa thường)
    if (roomNumber) {
      filter.roomNumber = { $regex: roomNumber, $options: 'i' };
    }

    // 2. Lọc theo dãy trọ
    if (boardingHouseId) {
      filter.boardingHouseId = boardingHouseId;
    }

    // 3. Lọc khoảng giá thuê bằng $gte và $lte
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 4. Lọc khoảng diện tích bằng $gte và $lte
    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) filter.area.$gte = Number(minArea);
      if (maxArea) filter.area.$lte = Number(maxArea);
    }

    // 5. Lọc trạng thái bằng $in (VD: status="Trống" hoặc "Trống,Đang sửa")
    if (status) {
      const statusList = status.split(',');
      filter.status = { $in: statusList };
    }

    // Tính toán phân trang ở server
    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const totalRooms = await Room.countDocuments(filter);
    const rooms = await Room.find(filter)
      .populate('boardingHouseId', 'name address electricPrice waterPrice serviceFee')
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        total: totalRooms,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(totalRooms / perPage)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết 1 phòng
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      'boardingHouseId',
      'name address electricPrice waterPrice serviceFee'
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// Tạo phòng mới (Chủ trọ)
export const createRoom = async (req, res, next) => {
  try {
    const { boardingHouseId, roomNumber, price, area, status } = req.body;

    if (!boardingHouseId || !roomNumber || !price || !area) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ dãy trọ, số phòng, giá thuê và diện tích'
      });
    }

    const newRoom = await Room.create({
      boardingHouseId,
      roomNumber,
      price,
      area,
      status: status || 'Trống'
    });

    res.status(201).json({
      success: true,
      message: 'Thêm phòng trọ thành công',
      data: newRoom
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin phòng (Chủ trọ)
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ'
      });
    }

    // Chặn đổi trạng thái thủ công nếu phòng đang có hợp đồng thuê
    if (room.status === 'Đang thuê' && req.body.status && req.body.status !== 'Đang thuê') {
      return res.status(400).json({
        success: false,
        message: 'Phòng đang có người thuê, hãy kết thúc hợp đồng ở mục Hợp đồng trước!'
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật phòng thành công',
      data: updatedRoom
    });
  } catch (error) {
    next(error);
  }
};

// Xóa phòng (Chủ trọ - Chỉ xóa được phòng chưa từng có hợp đồng hoặc hóa đơn)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ để xóa'
      });
    }

    if (room.status === 'Đang thuê') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa phòng đang có người thuê! Hãy kết thúc hợp đồng trước.'
      });
    }

    const hasContract = await Contract.exists({ roomId: room._id });
    const hasInvoice = await Invoice.exists({ roomId: room._id });
    if (hasContract || hasInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Phòng này đã có lịch sử hợp đồng hoặc hóa đơn, không thể xóa!'
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Đã xóa phòng trọ'
    });
  } catch (error) {
    next(error);
  }
};