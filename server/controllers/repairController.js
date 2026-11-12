import RepairRequest from '../models/RepairRequest.js';
import Contract from '../models/Contract.js';

// 1. Lấy danh sách yêu cầu sửa chữa
export const getRepairs = async (req, res, next) => {
  try {
    const filter = {};

    // Người thuê chỉ xem được các yêu cầu do chính mình gửi
    if (req.user.role === 'tenant') {
      filter.tenantId = req.user.userId;
    }

    const repairs = await RepairRequest.find(filter)
      .populate('roomId', 'roomNumber')
      .populate('tenantId', 'fullName phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: repairs
    });
  } catch (error) {
    next(error);
  }
};

// 2. Người thuê gửi yêu cầu sửa chữa kèm ảnh
export const createRepair = async (req, res, next) => {
  try {
    const { roomId, title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tiêu đề và mô tả sự cố cần sửa chữa'
      });
    }

    // Nếu client không gửi sẵn roomId, tự tìm phòng người thuê đang ở qua hợp đồng hiệu lực
    let targetRoomId = roomId;
    if (!targetRoomId) {
      const activeContract = await Contract.findOne({
        tenantId: req.user.userId,
        status: 'Đang hiệu lực'
      });

      if (!activeContract) {
        return res.status(400).json({
          success: false,
          message: 'Bạn hiện chưa có hợp đồng thuê phòng nào đang hiệu lực'
        });
      }
      targetRoomId = activeContract.roomId;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newRepair = await RepairRequest.create({
      roomId: targetRoomId,
      tenantId: req.user.userId,
      title,
      description,
      imageUrl,
      status: 'Mới'
    });

    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu sửa chữa thành công',
      data: newRepair
    });
  } catch (error) {
    next(error);
  }
};

// 3. Chủ trọ cập nhật trạng thái sửa chữa (Mới -> Đang xử lý -> Xong)
export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Mới', 'Đang xử lý', 'Xong'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ (chỉ nhận: Mới, Đang xử lý, Xong)'
      });
    }

    const updatedRepair = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRepair) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu sửa chữa'
      });
    }

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái sang "${status}"`,
      data: updatedRepair
    });
  } catch (error) {
    next(error);
  }
};