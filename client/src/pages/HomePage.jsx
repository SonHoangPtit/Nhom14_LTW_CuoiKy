import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../redux/roomSlice';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';

const HomePage = () => {
  const dispatch = useDispatch();
  const { list: rooms, pagination, loading, error } = useSelector((state) => state.rooms);

  const [filters, setFilters] = useLocalStorage('guestRoomFilters', {
    roomNumber: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: ''
  });
  const [page, setPage] = useState(1);

  const debouncedRoomNumber = useDebounce(filters.roomNumber, 500);

  useEffect(() => {
    dispatch(
      fetchRooms({
        status: 'Trống',
        roomNumber: debouncedRoomNumber,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        page,
        limit: 6
      })
    );
  }, [
    dispatch,
    debouncedRoomNumber,
    filters.minPrice,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
    page
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      roomNumber: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: ''
    });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
          Danh Sách Phòng Trọ Đang Trống
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Tìm kiếm phòng phù hợp theo ngân sách và diện tích của bạn
        </p>
      </div>

      {/* Thanh bộ lọc tìm kiếm */}
      <form className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label htmlFor="filter-room" className="block text-xs font-medium mb-1 dark:text-gray-300">
            Số phòng
          </label>
          <input
            id="filter-room"
            name="roomNumber"
            type="text"
            value={filters.roomNumber}
            onChange={handleFilterChange}
            placeholder="VD: P103"
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="filter-min-price" className="block text-xs font-medium mb-1 dark:text-gray-300">
            Giá từ (VNĐ)
          </label>
          <input
            id="filter-min-price"
            name="minPrice"
            type="number"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="2000000"
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="filter-max-price" className="block text-xs font-medium mb-1 dark:text-gray-300">
            Giá đến (VNĐ)
          </label>
          <input
            id="filter-max-price"
            name="maxPrice"
            type="number"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="5000000"
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="filter-min-area" className="block text-xs font-medium mb-1 dark:text-gray-300">
            Diện tích từ (m²)
          </label>
          <input
            id="filter-min-area"
            name="minArea"
            type="number"
            value={filters.minArea}
            onChange={handleFilterChange}
            placeholder="15"
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="filter-max-area" className="block text-xs font-medium mb-1 dark:text-gray-300">
            Diện tích đến (m²)
          </label>
          <input
            id="filter-max-area"
            name="maxArea"
            type="number"
            value={filters.maxArea}
            onChange={handleFilterChange}
            placeholder="35"
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          Đặt lại lọc
        </button>
      </form>

      {/* Danh sách thẻ phòng trọ */}
      {loading && <p className="text-center dark:text-gray-300">Đang tải danh sách phòng...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && rooms.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Không tìm thấy phòng trống nào phù hợp điều kiện lọc.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <article
              key={room._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col justify-between border border-gray-100 dark:border-gray-700"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    Phòng {room.roomNumber}
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    {room.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Khu trọ:</strong> {room.boardingHouseId?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <strong>Địa chỉ:</strong> {room.boardingHouseId?.address}
                </p>

                <div className="flex items-center justify-between text-sm border-t dark:border-gray-700 pt-3">
                  <span>
                    Diện tích: <strong>{room.area} m²</strong>
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {room.price.toLocaleString('vi-VN')} đ/tháng
                  </span>
                </div>
              </div>

              <Link
                to={`/rooms/${room._id}`}
                className="mt-4 block text-center py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Xem chi tiết & Liên hệ thuê
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${
                page === num
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-gray-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;