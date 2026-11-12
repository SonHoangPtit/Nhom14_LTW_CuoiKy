import Invoice from '../models/Invoice.js';
import Room from '../models/Room.js';
import Contract from '../models/Contract.js';

// 1. Lấy danh sách hóa đơn (Chủ trọ xem tất cả, Người thuê chỉ xem hóa đơn của mình)
export const getInvoices = async (req, res, next) => {
  try {
    const { month, year, isPaid, roomId } = req.query;
    const filter = {};

    // Nếu là người thuê thì chỉ lọc hóa đơn thuộc về người thuê đó
    if (req.user.role === 'tenant') {
      filter.tenantId = req.user.userId;
    }

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (roomId) filter.roomId = roomId;
    if (isPaid !== undefined && isPaid !== '') {
      filter.isPaid = isPaid === 'true';
    }

    const invoices = await Invoice.find(filter)
      .populate('roomId', 'roomNumber price')
      .populate('tenantId', 'fullName email phone')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

// 2. Xem chi tiết 1 hóa đơn (Chặn người thuê xem hóa đơn của phòng khác -> 403)
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('roomId', 'roomNumber price area')
      .populate('tenantId', 'fullName email phone');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Lấy ID người thuê của hóa đơn để đối chiếu
    const invoiceTenantId = invoice.tenantId._id
      ? invoice.tenantId._id.toString()
      : invoice.tenantId.toString();

    if (req.user.role === 'tenant' && invoiceTenantId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hóa đơn của phòng khác'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

// 3. Tạo hóa đơn mới và tự động tính tiền tại Server (Chỉ Chủ trọ)
export const createInvoice = async (req, res, next) => {
  try {
    const {
      roomId,
      tenantId,
      month,
      year,
      oldElectric,
      newElectric,
      oldWater,
      newWater
    } = req.body;

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (
      !roomId ||
      !month ||
      !year ||
      oldElectric === undefined ||
      newElectric === undefined ||
      oldWater === undefined ||
      newWater === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ phòng, tháng, năm và chỉ số điện nước cũ/mới'
      });
    }

    // Kiểm tra chỉ số mới không được nhỏ hơn chỉ số cũ
    if (Number(newElectric) < Number(oldElectric) || Number(newWater) < Number(oldWater)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số điện hoặc nước mới không được nhỏ hơn chỉ số cũ'
      });
    }

    // Kiểm tra trùng hóa đơn trong cùng tháng/năm của phòng đó
    const existingInvoice = await Invoice.findOne({
      roomId,
      month: Number(month),
      year: Number(year)
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: `Phòng này đã có hóa đơn tháng ${month}/${year}`
      });
    }

    // Lấy thông tin phòng kèm đơn giá điện, nước, dịch vụ của dãy trọ
    const room = await Room.findById(roomId).populate('boardingHouseId');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ'
      });
    }

    // Nếu client không gửi sẵn tenantId, tự tìm người thuê qua hợp đồng đang hiệu lực
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      const activeContract = await Contract.findOne({
        roomId,
        status: 'Đang hiệu lực'
      });
      if (!activeContract) {
        return res.status(400).json({
          success: false,
          message: 'Phòng này hiện chưa có hợp đồng đang hiệu lực để lập hóa đơn'
        });
      }
      finalTenantId = activeContract.tenantId;
    }

    // Tính tiền tự động tại Server theo đơn giá của dãy trọ
    const roomPrice = room.price;
    const electricPrice = room.boardingHouseId.electricPrice;
    const waterPrice = room.boardingHouseId.waterPrice;
    const serviceFee = room.boardingHouseId.serviceFee || 0;

    const electricCost = (Number(newElectric) - Number(oldElectric)) * electricPrice;
    const waterCost = (Number(newWater) - Number(oldWater)) * waterPrice;
    const totalAmount = roomPrice + electricCost + waterCost + serviceFee;

    const newInvoice = await Invoice.create({
      roomId,
      tenantId: finalTenantId,
      month: Number(month),
      year: Number(year),
      oldElectric: Number(oldElectric),
      newElectric: Number(newElectric),
      oldWater: Number(oldWater),
      newWater: Number(newWater),
      roomPrice,
      electricCost,
      waterCost,
      serviceFee,
      totalAmount,
      isPaid: false
    });

    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: newInvoice
    });
  } catch (error) {
    next(error);
  }
};

// 4. Đánh dấu hóa đơn đã thanh toán (Chỉ Chủ trọ)
export const markInvoiceAsPaid = async (req, res, next) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isPaid: true },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xác nhận thanh toán hóa đơn',
      data: updatedInvoice
    });
  } catch (error) {
    next(error);
  }
};