const InvoiceDetailModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        id="printable-invoice"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 text-gray-900 dark:text-gray-100"
      >
        <div className="border-b pb-3 text-center">
          <h2 className="text-xl font-bold uppercase">Phiếu Báo Tiền Phòng & Điện Nước</h2>
          <p className="text-sm text-gray-500">
            Kỳ thanh toán: Tháng {invoice.month}/{invoice.year}
          </p>
        </div>

        <div className="text-sm space-y-1">
          <p><strong>Phòng:</strong> {invoice.roomId?.roomNumber}</p>
          <p><strong>Người thuê:</strong> {invoice.tenantId?.fullName}</p>
          <p><strong>Trạng thái:</strong> {invoice.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
        </div>

        <table className="w-full text-sm border-t border-b my-2">
          <tbody className="divide-y">
            <tr>
              <td className="py-2">Tiền thuê phòng</td>
              <td className="py-2 text-right font-medium">{invoice.roomPrice.toLocaleString('vi-VN')} đ</td>
            </tr>
            <tr>
              <td className="py-2">
                Tiền điện ({invoice.oldElectric} → {invoice.newElectric} kWh)
              </td>
              <td className="py-2 text-right font-medium">{invoice.electricCost.toLocaleString('vi-VN')} đ</td>
            </tr>
            <tr>
              <td className="py-2">
                Tiền nước ({invoice.oldWater} → {invoice.newWater} m³)
              </td>
              <td className="py-2 text-right font-medium">{invoice.waterCost.toLocaleString('vi-VN')} đ</td>
            </tr>
            <tr>
              <td className="py-2">Phí dịch vụ chung</td>
              <td className="py-2 text-right font-medium">{invoice.serviceFee.toLocaleString('vi-VN')} đ</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-center text-base font-bold pt-1">
          <span>TỔNG CỘNG:</span>
          <span className="text-xl text-orange-600">{invoice.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            🖨️ Xuất hóa đơn PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;