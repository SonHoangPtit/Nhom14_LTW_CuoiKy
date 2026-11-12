import nodemailer from 'nodemailer';
import Invoice from '../models/Invoice.js';
import Room from '../models/Room.js';
import Contract from '../models/Contract.js';

// Hàm tính tiền điện bậc thang (50 số đầu 1.800đ, 50 số tiếp 2.000đ, từ 101 trở lên 2.500đ)
const calcTieredElectric = (kwh) => {
  if (kwh <= 50) {
    return kwh * 1800;
  } else if (kwh <= 100) {
    return 50 * 1800 + (kwh - 50) * 2000;
  } else {
    return 50 * 1800 + 50 * 2000 + (kwh - 100) * 2500;
  }
};

// 1. Lấy danh sách hóa đơn (Chủ trọ xem tất cả, Người thuê chỉ xem hóa đơn của mình)
export const getInvoices = async (req, res, next) => {
  try {
    const { month, year, isPaid, roomId } = req.query;
    const filter = {};

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
      newWater,
      useTieredElectric
    } = req.body;

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

    if (Number(newElectric) < Number(oldElectric) || Number(newWater) < Number(oldWater)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số điện hoặc nước mới không được nhỏ hơn chỉ số cũ'
      });
    }

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

    const room = await Room.findById(roomId).populate('boardingHouseId');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ'
      });
    }

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

    const roomPrice = room.price;
    const electricPrice = room.boardingHouseId.electricPrice;
    const waterPrice = room.boardingHouseId.waterPrice;
    const serviceFee = room.boardingHouseId.serviceFee || 0;

    const kwhUsed = Number(newElectric) - Number(oldElectric);
    const electricCost = useTieredElectric
      ? calcTieredElectric(kwhUsed)
      : kwhUsed * electricPrice;

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

// 5. Gửi email nhắc nợ chi tiết cho người thuê (Chỉ Chủ trọ)
export const sendRemindEmail = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('roomId', 'roomNumber')
      .populate('tenantId', 'fullName email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    if (invoice.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Hóa đơn này đã được thanh toán'
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(400).json({
        success: false,
        message: 'Chưa cấu hình EMAIL_USER và EMAIL_PASS trong file server/.env'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Quản Lý Nhà Trọ" <${process.env.EMAIL_USER}>`,
      to: invoice.tenantId.email,
      subject: `[Nhắc thanh toán] Hóa đơn Phòng ${invoice.roomId.roomNumber} - Tháng ${invoice.month}/${invoice.year}`,
      html: `
        <h3>Xin chào ${invoice.tenantId.fullName},</h3>
        <p>Ban quản lý nhà trọ xin thông báo chi tiết hóa đơn <strong>Phòng ${invoice.roomId.roomNumber}</strong> kỳ <strong>Tháng ${invoice.month}/${invoice.year}</strong>:</p>
        <ul>
          <li>Tiền thuê phòng: <strong>${invoice.roomPrice.toLocaleString('vi-VN')} đ</strong></li>
          <li>Tiền điện (${invoice.oldElectric} → ${invoice.newElectric}): <strong>${invoice.electricCost.toLocaleString('vi-VN')} đ</strong></li>
          <li>Tiền nước (${invoice.oldWater} → ${invoice.newWater}): <strong>${invoice.waterCost.toLocaleString('vi-VN')} đ</strong></li>
          <li>Phí dịch vụ: <strong>${invoice.serviceFee.toLocaleString('vi-VN')} đ</strong></li>
        </ul>
        <p><strong>Tổng tiền cần thanh toán: ${invoice.totalAmount.toLocaleString('vi-VN')} VNĐ</strong></p>
        <p>Vui lòng thanh toán đúng hạn. Xin cảm ơn!</p>
      `
    });

    res.status(200).json({
      success: true,
      message: `Đã gửi email nhắc nợ tới ${invoice.tenantId.email}`
    });
  } catch (error) {
    next(error);
  }
};