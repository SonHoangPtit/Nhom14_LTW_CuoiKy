import Contract from '../models/Contract.js';
import Room from '../models/Room.js';

// 1. Lấy danh sách hợp đồng (Chủ trọ xem tất cả, Người thuê chỉ xem hợp đồng của mình)
export const getContracts = async (req, res, next) => {
  try {
    const filter = {};

    // Nếu là người thuê thì chỉ lọc các hợp đồng của chính người đó
    if (req.user.role === 'tenant') {
      filter.tenantId = req.user.userId;
    }

    const contracts = await Contract.find(filter)
      .populate('roomId', 'roomNumber price area status')
      .populate('tenantId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (error) {
    next(error);
  }
};

// 2. Tạo hợp đồng mới (Chỉ Chủ trọ)
export const createContract = async (req, res, next) => {
  try {
    const { roomId, tenantId, startDate, endDate, deposit } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!roomId || !tenantId || !startDate || !endDate || deposit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin phòng, người thuê, ngày bắt đầu, ngày kết thúc và tiền cọc'
      });
    }

    // Kiểm tra phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ'
      });
    }

    // Kiểm tra phòng có đang có hợp đồng hiệu lực hay chưa (Bắt buộc theo đề bài)
    const activeContract = await Contract.findOne({
      roomId,
      status: 'Đang hiệu lực'
    });

    if (activeContract) {
      return res.status(400).json({
        success: false,
        message: 'Phòng này đang có hợp đồng hiệu lực'
      });
    }

    // Tạo hợp đồng mới
    const newContract = await Contract.create({
      roomId,
      tenantId,
      startDate,
      endDate,
      deposit,
      status: 'Đang hiệu lực'
    });

    // Tự động đổi trạng thái phòng sang 'Đang thuê'
    await Room.findByIdAndUpdate(roomId, { status: 'Đang thuê' });

    res.status(201).json({
      success: true,
      message: 'Tạo hợp đồng thành công và đã cập nhật trạng thái phòng sang Đang thuê',
      data: newContract
    });
  } catch (error) {
    next(error);
  }
};

// 3. Kết thúc hợp đồng (Chỉ Chủ trọ)
export const terminateContract = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hợp đồng'
      });
    }

    if (contract.status === 'Đã kết thúc') {
      return res.status(400).json({
        success: false,
        message: 'Hợp đồng này đã kết thúc trước đó'
      });
    }

    // Đổi trạng thái hợp đồng sang 'Đã kết thúc'
    contract.status = 'Đã kết thúc';
    await contract.save();

    // Tự động cập nhật trạng thái phòng về 'Trống'
    await Room.findByIdAndUpdate(contract.roomId, { status: 'Trống' });

    res.status(200).json({
      success: true,
      message: 'Đã kết thúc hợp đồng và trả trạng thái phòng về Trống',
      data: contract
    });
  } catch (error) {
    next(error);
  }
};