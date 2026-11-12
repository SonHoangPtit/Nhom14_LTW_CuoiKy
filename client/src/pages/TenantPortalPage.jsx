import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../redux/invoiceSlice';
import { apiRequest } from '../services/api';

const TenantPortalPage = () => {
  const dispatch = useDispatch();
  const { list: invoices } = useSelector((state) => state.invoices);

  const [contracts, setContracts] = useState([]);
  const [repairs, setRepairs] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Dùng useRef cho nút chọn file ảnh
  const fileInputRef = useRef(null);

  const loadTenantData = async () => {
    try {
      const [contractRes, repairRes] = await Promise.all([
        apiRequest('/contracts'),
        apiRequest('/repairs')
      ]);
      setContracts(contractRes.data);
      setRepairs(repairRes.data);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    dispatch(fetchInvoices());
    loadTenantData();
  }, [dispatch]);

  // useEffect có hàm cleanup giải phóng bộ nhớ URL.createObjectURL
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  // useEffect có hàm cleanup clearTimeout cho thông báo
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => {
      setToastMsg('');
    }, 4000);

    return () => clearTimeout(timer);
  }, [toastMsg]);

  const handleSubmitRepair = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await apiRequest('/repairs', {
        method: 'POST',
        body: formData
      });

      setToastMsg(res.message);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadTenantData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white">Không Gian Người Thuê Trọ</h1>

      {/* Hợp đồng thuê của tôi */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-3 dark:text-white">Hợp Đồng Thuê Của Tôi</h2>
        {contracts.length === 0 ? (
          <p className="text-sm text-gray-500">Bạn chưa có hợp đồng thuê nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm dark:text-gray-200">
            {contracts.map((c) => (
              <div key={c._id} className="p-4 border dark:border-gray-700 rounded-lg space-y-1">
                <p className="text-base font-bold text-blue-600">Phòng {c.roomId?.roomNumber}</p>
                <p>Giá thuê: <strong>{c.roomId?.price?.toLocaleString('vi-VN')} đ/tháng</strong></p>
                <p>Tiền cọc: {c.deposit.toLocaleString('vi-VN')} đ</p>
                <p>
                  Hiệu lực: {new Date(c.startDate).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(c.endDate).toLocaleDateString('vi-VN')} ({c.status})
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hóa đơn phòng của tôi */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-3 dark:text-white">Hóa Đơn Hàng Tháng</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Phòng</th>
                <th className="p-3">Kỳ</th>
                <th className="p-3">Điện / Nước</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 dark:text-gray-200">
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td className="p-3 font-bold">{inv.roomId?.roomNumber}</td>
                  <td className="p-3">T{inv.month}/{inv.year}</td>
                  <td className="p-3">
                    {inv.electricCost.toLocaleString('vi-VN')}đ / {inv.waterCost.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-3 font-bold text-orange-600">{inv.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {inv.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Form gửi yêu cầu sửa chữa kèm ảnh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-3 dark:text-white">Gửi Yêu Cầu Sửa Chữa</h2>

          {toastMsg && (
            <p className="mb-3 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{toastMsg}</p>
          )}

          <form onSubmit={handleSubmitRepair} className="space-y-3 text-sm">
            <div>
              <label htmlFor="rep-title" className="block mb-1 dark:text-gray-200">Tiêu đề sự cố</label>
              <input
                id="rep-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hỏng bóng đèn nhà vệ sinh"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="rep-desc" className="block mb-1 dark:text-gray-200">Mô tả chi tiết</label>
              <textarea
                id="rep-desc"
                rows="3"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.png,.webp"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                📷 Chọn ảnh minh họa (.jpg, .png, .webp)
              </button>
              {selectedFile && (
                <span className="ml-2 text-xs text-gray-500">{selectedFile.name}</span>
              )}
            </div>

            {previewUrl && (
              <img src={previewUrl} alt="Xem trước ảnh" className="w-40 h-32 object-cover rounded-lg border" />
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Gửi yêu cầu sửa chữa
            </button>
          </form>
        </section>

        {/* Lịch sử yêu cầu đã gửi */}
        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow space-y-3">
          <h2 className="text-lg font-bold dark:text-white">Lịch Sử Báo Hỏng Của Bạn</h2>
          {repairs.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có yêu cầu sửa chữa nào.</p>
          ) : (
            <ul className="divide-y dark:divide-gray-700 text-sm">
              {repairs.map((r) => (
                <li key={r._id} className="py-3 dark:text-gray-200">
                  <div className="flex justify-between">
                    <strong>{r.title}</strong>
                    <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{r.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default TenantPortalPage;