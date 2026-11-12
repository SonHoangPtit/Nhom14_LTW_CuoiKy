import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

const ManageContractsPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [emptyRooms, setEmptyRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [formData, setFormData] = useState({
    roomId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    deposit: 3000000
  });

  const loadData = async () => {
    try {
      const [contractRes, roomRes, tenantRes] = await Promise.all([
        apiRequest('/contracts'),
        apiRequest('/rooms?status=Trống&limit=50'),
        apiRequest('/auth/tenants')
      ]);

      setContracts(contractRes.data);
      setEmptyRooms(roomRes.data);
      setTenants(tenantRes.data);

      setFormData((prev) => ({
        ...prev,
        roomId: roomRes.data[0]?._id || '',
        tenantId: tenantRes.data[0]?._id || ''
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/contracts', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Tạo hợp đồng thành công! Phòng đã chuyển sang trạng thái Đang thuê.');
      navigate('/landlord/houses-rooms');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTerminate = async (id) => {
    if (!window.confirm('Xác nhận kết thúc hợp đồng này và trả phòng về Trống?')) return;
    try {
      await apiRequest(`/contracts/${id}/terminate`, { method: 'PATCH' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Quản Lý Hợp Đồng Thuê Phòng</h1>

      {/* Form lập hợp đồng mới */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4 dark:text-white">Lập Hợp Đồng Mới</h2>
        <form onSubmit={handleCreateContract} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-sm">
          <div>
            <label htmlFor="c-room" className="block mb-1 dark:text-gray-200">Chọn phòng trống</label>
            <select
              id="c-room"
              required
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {emptyRooms.map((r) => (
                <option key={r._id} value={r._id}>
                  Phòng {r.roomNumber} ({r.price.toLocaleString('vi-VN')}đ)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="c-tenant" className="block mb-1 dark:text-gray-200">Người thuê</label>
            <select
              id="c-tenant"
              required
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {tenants.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName} ({t.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="c-start" className="block mb-1 dark:text-gray-200">Ngày bắt đầu</label>
            <input
              id="c-start"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="c-end" className="block mb-1 dark:text-gray-200">Ngày kết thúc</label>
            <input
              id="c-end"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="c-dep" className="block mb-1 dark:text-gray-200">Tiền cọc (VNĐ)</label>
            <input
              id="c-dep"
              type="number"
              required
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="md:col-span-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Ký hợp đồng & Khóa phòng
          </button>
        </form>
      </section>

      {/* Danh sách hợp đồng */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Phòng</th>
                <th className="p-3">Người thuê</th>
                <th className="p-3">Thời hạn</th>
                <th className="p-3">Tiền cọc</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 dark:text-gray-200">
              {contracts.map((c) => (
                <tr key={c._id}>
                  <td className="p-3 font-bold">{c.roomId?.roomNumber}</td>
                  <td className="p-3">{c.tenantId?.fullName} - {c.tenantId?.phone}</td>
                  <td className="p-3">
                    {new Date(c.startDate).toLocaleDateString('vi-VN')} →{' '}
                    {new Date(c.endDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-3">{c.deposit.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        c.status === 'Đang hiệu lực'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {c.status === 'Đang hiệu lực' && (
                      <button
                        type="button"
                        onClick={() => handleTerminate(c._id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Kết thúc hợp đồng
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ManageContractsPage;