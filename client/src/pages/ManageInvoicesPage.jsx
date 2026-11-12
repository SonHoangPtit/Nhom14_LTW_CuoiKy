import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices, payInvoice } from '../redux/invoiceSlice';

const ManageInvoicesPage = () => {
  const dispatch = useDispatch();
  const { list: invoices, loading } = useSelector((state) => state.invoices);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleMarkPaid = (id) => {
    if (window.confirm('Xác nhận phòng này đã thanh toán hóa đơn?')) {
      dispatch(payInvoice(id));
    }
  };

  if (loading) return <p className="text-center py-8 dark:text-gray-300">Đang tải danh sách hóa đơn...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Quản Lý Hóa Đơn Tiền Phòng & Điện Nước</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Phòng</th>
                <th className="p-3">Người thuê</th>
                <th className="p-3">Kỳ</th>
                <th className="p-3">Tiền phòng</th>
                <th className="p-3">Tiền điện</th>
                <th className="p-3">Tiền nước</th>
                <th className="p-3">Tổng cộng</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 dark:text-gray-200">
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td className="p-3 font-bold">{inv.roomId?.roomNumber}</td>
                  <td className="p-3">{inv.tenantId?.fullName}</td>
                  <td className="p-3">T{inv.month}/{inv.year}</td>
                  <td className="p-3">{inv.roomPrice.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">{inv.electricCost.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">{inv.waterCost.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 font-bold text-orange-600">{inv.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {inv.isPaid ? 'Đã thu tiền' : 'Chưa thanh toán'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {!inv.isPaid && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(inv._id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Đánh dấu đã thu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageInvoicesPage;