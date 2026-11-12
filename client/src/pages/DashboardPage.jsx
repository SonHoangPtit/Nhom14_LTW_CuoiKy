import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { apiRequest } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statRes, contactRes] = await Promise.all([
          apiRequest('/statistics/dashboard'),
          apiRequest('/contacts')
        ]);
        setStats(statRes.data);
        setContacts(contactRes.data);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p className="text-center py-8 dark:text-gray-300">Đang tải số liệu thống kê...</p>;
  if (!stats) return null;

  const chartData = stats.monthlyRevenue.map((item) => ({
    label: `T${item._id.month}/${item._id.year}`,
    revenue: item.totalRevenue
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Tổng Quan & Thống Kê Nhà Trọ</h1>

      {/* 4 Thẻ chỉ số nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số phòng</p>
          <p className="text-2xl font-bold dark:text-white">{stats.overview.totalRooms}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Phòng đang trống</p>
          <p className="text-2xl font-bold text-green-600">{stats.overview.availableRooms}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Phòng đang thuê</p>
          <p className="text-2xl font-bold text-blue-600">{stats.overview.rentedRooms}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Hóa đơn chưa thu</p>
          <p className="text-2xl font-bold text-red-600">{stats.overview.unpaidCount}</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu & Danh sách phòng nợ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Doanh Thu Đã Thu Theo Tháng</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(val) => `${val.toLocaleString('vi-VN')} đ`} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Danh Sách Phòng Đang Nợ Tiền</h2>
          {stats.unpaidRooms.length === 0 ? (
            <p className="text-sm text-gray-500">Tất cả các phòng đều đã thanh toán đủ.</p>
          ) : (
            <ul className="divide-y dark:divide-gray-700 text-sm">
              {stats.unpaidRooms.map((item) => (
                <li key={item._id} className="py-3 flex justify-between items-center dark:text-gray-200">
                  <div>
                    <strong>Phòng {item.roomNumber}</strong>
                    <span className="block text-xs text-gray-500">
                      Kỳ hóa đơn: Tháng {item.month}/{item.year}
                    </span>
                  </div>
                  <span className="font-bold text-red-600">
                    {item.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Khách vãng lai để lại liên hệ */}
      <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-3 dark:text-white">Khách Hẹn Xem Phòng Gần Đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Họ tên khách</th>
                <th className="p-3">Số điện thoại</th>
                <th className="p-3">Lời nhắn</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 dark:text-gray-200">
              {contacts.map((c) => (
                <tr key={c._id}>
                  <td className="p-3 font-medium">{c.fullName}</td>
                  <td className="p-3 text-blue-600">{c.phone}</td>
                  <td className="p-3">{c.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;