import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

const calcTieredElectric = (kwh) => {
  if (kwh <= 50) {
    return kwh * 1800;
  } else if (kwh <= 100) {
    return 50 * 1800 + (kwh - 50) * 2000;
  } else {
    return 50 * 1800 + 50 * 2000 + (kwh - 100) * 2500;
  }
};

const BulkUtilityPage = () => {
  const navigate = useNavigate();
  const currentDate = new Date();

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [useTieredElectric, setUseTieredElectric] = useState(false);

  useEffect(() => {
    const loadRentedRooms = async () => {
      try {
        const statusQuery = encodeURIComponent('Đang thuê');
        const [roomRes, invoiceRes] = await Promise.all([
          apiRequest(`/rooms?status=${statusQuery}&limit=100`),
          apiRequest('/invoices')
        ]);

        const rentedRooms = roomRes.data || [];
        const pastInvoices = invoiceRes.data || [];

        const initialRows = rentedRooms.map((room) => {
          const lastInv = pastInvoices.find(
            (inv) => (inv.roomId?._id || inv.roomId) === room._id
          );

          const oldElectric = lastInv ? lastInv.newElectric : 0;
          const oldWater = lastInv ? lastInv.newWater : 0;

          return {
            roomId: room._id,
            roomNumber: room.roomNumber,
            houseName: room.boardingHouseId?.name || '',
            roomPrice: room.price,
            electricPrice: room.boardingHouseId?.electricPrice || 3500,
            waterPrice: room.boardingHouseId?.waterPrice || 25000,
            serviceFee: room.boardingHouseId?.serviceFee || 0,
            oldElectric,
            newElectric: oldElectric,
            oldWater,
            newWater: oldWater,
            selected: true
          };
        });

        setRows(initialRows);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRentedRooms();
  }, []);

  // Giữ nguyên giá trị đang gõ để người dùng xóa/nhập số mượt mà
  const handleRowChange = (roomId, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.roomId === roomId ? { ...row, [field]: value } : row
      )
    );
  };

  const validateRow = (row) => {
    const errors = [];
    if (row.newElectric === '' || Number(row.newElectric) < Number(row.oldElectric)) {
      errors.push('Số điện mới không được nhỏ hơn số điện cũ');
    }
    if (row.newWater === '' || Number(row.newWater) < Number(row.oldWater)) {
      errors.push('Số nước mới không được nhỏ hơn số nước cũ');
    }
    return errors;
  };

  const calcRowTotal = (row) => {
    const electricUsed = Math.max(0, Number(row.newElectric) - Number(row.oldElectric));
    const waterUsed = Math.max(0, Number(row.newWater) - Number(row.oldWater));
    const electricMoney = useTieredElectric
      ? calcTieredElectric(electricUsed)
      : electricUsed * row.electricPrice;

    return row.roomPrice + electricMoney + waterUsed * row.waterPrice + row.serviceFee;
  };

  const grandTotal = useMemo(() => {
    return rows.reduce((sum, row) => {
      if (!row.selected) return sum;
      return sum + calcRowTotal(row);
    }, 0);
  }, [rows, useTieredElectric]);

  const hasAnyError = rows.some((row) => row.selected && validateRow(row).length > 0);

  const handleCreateBulkInvoices = async (e) => {
    e.preventDefault();
    const selectedRows = rows.filter((r) => r.selected);

    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất 1 phòng để lập hóa đơn.');
      return;
    }

    if (hasAnyError) {
      alert('Vui lòng sửa các dòng đang báo lỗi chỉ số trước khi phát hành hóa đơn.');
      return;
    }

    setSubmitting(true);
    let successCount = 0;

    for (const row of selectedRows) {
      try {
        await apiRequest('/invoices', {
          method: 'POST',
          body: JSON.stringify({
            roomId: row.roomId,
            month: Number(month),
            year: Number(year),
            oldElectric: Number(row.oldElectric),
            newElectric: Number(row.newElectric),
            oldWater: Number(row.oldWater),
            newWater: Number(row.newWater),
            useTieredElectric
          })
        });
        successCount += 1;
      } catch (err) {
        alert(`Phòng ${row.roomNumber}: ${err.message}`);
      }
    }

    setSubmitting(false);
    if (successCount > 0) {
      alert(`Đã phát hành thành công ${successCount} hóa đơn tháng ${month}/${year}!`);
      navigate('/landlord/invoices');
    }
  };

  if (loading) return <p className="text-center py-8 dark:text-gray-300">Đang tải danh sách phòng đang thuê...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Bảng Ghi Điện Nước & Lập Hóa Đơn Hàng Loạt</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Nhập chỉ số mới cho các phòng đang thuê, hệ thống tự kiểm tra sai lệch và tính tổng tiền.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <label htmlFor="bill-month" className="text-sm font-medium dark:text-gray-200">
            Tháng:
          </label>
          <input
            id="bill-month"
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <label htmlFor="bill-year" className="text-sm font-medium dark:text-gray-200">
            Năm:
          </label>
          <input
            id="bill-year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <label className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
            <input
              type="checkbox"
              checked={useTieredElectric}
              onChange={(e) => setUseTieredElectric(e.target.checked)}
            />
            Áp dụng giá điện bậc thang
          </label>
        </div>
      </div>

      <form onSubmit={handleCreateBulkInvoices} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-xs">
              <tr>
                <th className="p-3">Chọn</th>
                <th className="p-3">Phòng</th>
                <th className="p-3">Tiền phòng</th>
                <th className="p-3">Điện cũ</th>
                <th className="p-3">Điện mới</th>
                <th className="p-3">Nước cũ</th>
                <th className="p-3">Nước mới</th>
                <th className="p-3">Dịch vụ</th>
                <th className="p-3 text-right">Thành tiền dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 dark:text-gray-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">
                    Hiện chưa có phòng nào ở trạng thái "Đang thuê".
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const rowErrors = validateRow(row);
                  const rowTotal = calcRowTotal(row);

                  return (
                    <tr key={row.roomId} className={rowErrors.length > 0 ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) => handleRowChange(row.roomId, 'selected', e.target.checked)}
                        />
                      </td>
                      <td className="p-3 font-semibold">
                        {row.roomNumber}
                        <span className="block text-xs text-gray-500 font-normal">{row.houseName}</span>
                      </td>
                      <td className="p-3">{row.roomPrice.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.oldElectric}
                          onChange={(e) => handleRowChange(row.roomId, 'oldElectric', e.target.value)}
                          className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.newElectric}
                          onChange={(e) => handleRowChange(row.roomId, 'newElectric', e.target.value)}
                          className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.oldWater}
                          onChange={(e) => handleRowChange(row.roomId, 'oldWater', e.target.value)}
                          className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.newWater}
                          onChange={(e) => handleRowChange(row.roomId, 'newWater', e.target.value)}
                          className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="p-3">{row.serviceFee.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-right">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {rowTotal.toLocaleString('vi-VN')} đ
                        </span>
                        {rowErrors.map((errText, i) => (
                          <p key={i} className="text-xs text-red-600 font-medium mt-1">
                            {errText}
                          </p>
                        ))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-base dark:text-white">
            Tổng tiền dự kiến toàn bộ phòng đã chọn:{' '}
            <span className="text-2xl font-bold text-orange-600">
              {grandTotal.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || hasAnyError}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Đang phát hành...' : `Phát hành hóa đơn tháng ${month}/${year}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkUtilityPage;