import Contact from '../models/Contact.js';

// Khách gửi thông tin liên hệ (Không cần đăng nhập)
export const createContact = async (req, res, next) => {
  try {
    const { fullName, phone, message } = req.body;

    if (!fullName || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên, số điện thoại và lời nhắn'
      });
    }

    const newContact = await Contact.create({
      fullName,
      phone,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Gửi thông tin liên hệ thành công! Chủ trọ sẽ sớm liên hệ lại với bạn.',
      data: newContact
    });
  } catch (error) {
    next(error);
  }
};

// Chủ trọ xem danh sách khách đã để lại liên hệ
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};