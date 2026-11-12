import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';

const RoomDetailPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [contactForm, setContactForm] = useState({
    fullName: '',
    phone: '',
    message: ''
  });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const loadRoomDetail = async () => {
      try {
        const res = await apiRequest(`/rooms/${id}`);
        setRoom(res.data);
        setContactForm((prev) => ({
          ...prev,
          message: `Tôi quan tâm và muốn xem phòng ${res.data.roomNumber} (${res.data.boardingHouseId?.name}).`
        }));
      } catch (err) {
        setStatusMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRoomDetail();
  }, [id]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactForm)
      });
      setStatusMsg(res.message);
      setContactForm({ fullName: '', phone: '', message: '' });
    } catch (err) {
      setStatusMsg(err.message);
    }
  };

  if (loading) return <p className="text-center py-8 dark:text-gray-300">Đang tải thông tin phòng...</p>;
  if (!room) return <p className="text-center py-8 text-red-500">Không tìm thấy phòng trọ.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        ← Quay lại danh sách phòng trống
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin chi tiết phòng */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold dark:text-white">Phòng {room.roomNumber}</h1>
            <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              {room.status}
            </span>
          </div>

          <p className="text-xl font-bold text-orange-600">
            {room.price.toLocaleString('vi-VN')} VNĐ / tháng
          </p>

          <div className="border-t dark:border-gray-700 pt-3 space-y-2 text-sm dark:text-gray-200">
            <p><strong>Dãy trọ:</strong> {room.boardingHouseId?.name}</p>
            <p><strong>Địa chỉ:</strong> {room.boardingHouseId?.address}</p>
            <p><strong>Diện tích:</strong> {room.area} m²</p>
            <p><strong>Giá điện:</strong> {room.boardingHouseId?.electricPrice?.toLocaleString('vi-VN')} đ/kWh</p>
            <p><strong>Giá nước:</strong> {room.boardingHouseId?.waterPrice?.toLocaleString('vi-VN')} đ/m³</p>
            <p><strong>Phí dịch vụ chung:</strong> {room.boardingHouseId?.serviceFee?.toLocaleString('vi-VN')} đ/tháng</p>
          </div>
        </section>

        {/* Form khách để lại SĐT liên hệ */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Để lại thông tin hẹn xem phòng</h2>

          {statusMsg && (
            <p className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">{statusMsg}</p>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Họ và tên của bạn
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={contactForm.fullName}
                onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Số điện thoại liên hệ
              </label>
              <input
                id="contact-phone"
                type="tel"
                required
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="0912345678"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="contact-msg" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Lời nhắn / Phòng muốn thuê
              </label>
              <textarea
                id="contact-msg"
                rows="3"
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Gửi yêu cầu liên hệ
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default RoomDetailPage;