import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../redux/roomSlice';
import { apiRequest } from '../services/api';

const ManageHousesRoomsPage = () => {
  const dispatch = useDispatch();
  const { list: rooms } = useSelector((state) => state.rooms);

  const [houses, setHouses] = useState([]);
  const [houseForm, setHouseForm] = useState({
    name: '',
    address: '',
    electricPrice: 3500,
    waterPrice: 25000,
    serviceFee: 100000
  });

  const [roomForm, setRoomForm] = useState({
    boardingHouseId: '',
    roomNumber: '',
    price: 3000000,
    area: 20,
    status: 'Trống'
  });

  const loadHouses = async () => {
    const res = await apiRequest('/boarding-houses');
    setHouses(res.data);
    if (res.data.length > 0 && !roomForm.boardingHouseId) {
      setRoomForm((prev) => ({ ...prev, boardingHouseId: res.data[0]._id }));
    }
  };

  useEffect(() => {
    loadHouses();
    dispatch(fetchRooms({ limit: 50 }));
  }, [dispatch]);

  const handleAddHouse = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/boarding-houses', {
        method: 'POST',
        body: JSON.stringify(houseForm)
      });
      setHouseForm({ name: '', address: '', electricPrice: 3500, waterPrice: 25000, serviceFee: 100000 });
      loadHouses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomForm)
      });
      setRoomForm((prev) => ({ ...prev, roomNumber: '' }));
      dispatch(fetchRooms({ limit: 50 }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      await apiRequest(`/rooms/${id}`, { method: 'DELETE' });
      dispatch(fetchRooms({ limit: 50 }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white">Quản Lý Dãy Trọ & Phòng Trọ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form thêm dãy trọ */}
        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Thêm Dãy Trọ Mới</h2>
          <form onSubmit={handleAddHouse} className="space-y-3 text-sm">
            <div>
              <label htmlFor="h-name" className="block mb-1 dark:text-gray-200">Tên dãy trọ</label>
              <input
                id="h-name"
                type="text"
                required
                value={houseForm.name}
                onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="h-addr" className="block mb-1 dark:text-gray-200">Địa chỉ</label>
              <input
                id="h-addr"
                type="text"
                required
                value={houseForm.address}
                onChange={(e) => setHouseForm({ ...houseForm, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="h-elec" className="block mb-1 dark:text-gray-200">Giá điện</label>
                <input
                  id="h-elec"
                  type="number"
                  required
                  value={houseForm.electricPrice}
                  onChange={(e) => setHouseForm({ ...houseForm, electricPrice: Number(e.target.value) })}
                  className="w-full px-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="h-water" className="block mb-1 dark:text-gray-200">Giá nước</label>
                <input
                  id="h-water"
                  type="number"
                  required
                  value={houseForm.waterPrice}
                  onChange={(e) => setHouseForm({ ...houseForm, waterPrice: Number(e.target.value) })}
                  className="w-full px-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="h-fee" className="block mb-1 dark:text-gray-200">Phí DV</label>
                <input
                  id="h-fee"
                  type="number"
                  value={houseForm.serviceFee}
                  onChange={(e) => setHouseForm({ ...houseForm, serviceFee: Number(e.target.value) })}
                  className="w-full px-2 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              + Thêm dãy trọ
            </button>
          </form>
        </section>

        {/* Form thêm phòng trọ */}
        <section className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Thêm Phòng Trọ Mới</h2>
          <form onSubmit={handleAddRoom} className="space-y-3 text-sm">
            <div>
              <label htmlFor="r-house" className="block mb-1 dark:text-gray-200">Thuộc dãy trọ</label>
              <select
                id="r-house"
                required
                value={roomForm.boardingHouseId}
                onChange={(e) => setRoomForm({ ...roomForm, boardingHouseId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {houses.map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="r-num" className="block mb-1 dark:text-gray-200">Số phòng</label>
                <input
                  id="r-num"
                  type="text"
                  required
                  placeholder="P105"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="r-status" className="block mb-1 dark:text-gray-200">Trạng thái</label>
                <select
                  id="r-status"
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Trống">Trống</option>
                  <option value="Đang thuê">Đang thuê</option>
                  <option value="Đang sửa">Đang sửa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="r-price" className="block mb-1 dark:text-gray-200">Giá thuê (VNĐ)</label>
                <input
                  id="r-price"
                  type="number"
                  required
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({ ...roomForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="r-area" className="block mb-1 dark:text-gray-200">Diện tích (m²)</label>
                <input
                  id="r-area"
                  type="number"
                  required
                  value={roomForm.area}
                  onChange={(e) => setRoomForm({ ...roomForm, area: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              + Thêm phòng trọ
            </button>
          </form>
        </section>
      </div>

      {/* Bảng danh sách tất cả phòng */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Phòng</th>
                <th className="p-3">Dãy trọ</th>
                <th className="p-3">Giá thuê</th>
                <th className="p-3">Diện tích</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 dark:text-gray-200">
              {rooms.map((r) => (
                <tr key={r._id}>
                  <td className="p-3 font-bold">{r.roomNumber}</td>
                  <td className="p-3">{r.boardingHouseId?.name}</td>
                  <td className="p-3">{r.price.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3">{r.area} m²</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(r._id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Xóa
                    </button>
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

export default ManageHousesRoomsPage;