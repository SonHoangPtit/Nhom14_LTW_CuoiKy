import BoardingHouse from '../models/BoardingHouse.js';

// Lấy danh sách tất cả dãy trọ
export const getAllBoardingHouses = async (req, res, next) => {
  try {
    const houses = await BoardingHouse.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: houses
    });
  } catch (error) {
    next(error);
  }
};

// Thêm dãy trọ mới (Chủ trọ)
export const createBoardingHouse = async (req, res, next) => {
  try {
    const { name, address, description, electricPrice, waterPrice, serviceFee } = req.body;

    if (!name || !address || electricPrice === undefined || waterPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên dãy trọ, địa chỉ, giá điện và giá nước'
      });
    }

    const newHouse = await BoardingHouse.create({
      name,
      address,
      description,
      electricPrice,
      waterPrice,
      serviceFee: serviceFee || 0
    });

    res.status(201).json({
      success: true,
      message: 'Tạo dãy trọ thành công',
      data: newHouse
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin dãy trọ (Chủ trọ)
export const updateBoardingHouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedHouse = await BoardingHouse.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedHouse) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dãy trọ'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật dãy trọ thành công',
      data: updatedHouse
    });
  } catch (error) {
    next(error);
  }
};

// Xóa dãy trọ (Chủ trọ)
export const deleteBoardingHouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedHouse = await BoardingHouse.findByIdAndDelete(id);

    if (!deletedHouse) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dãy trọ để xóa'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa dãy trọ'
    });
  } catch (error) {
    next(error);
  }
};