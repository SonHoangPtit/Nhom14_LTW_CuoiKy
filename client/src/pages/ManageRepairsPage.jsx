import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

const ManageRepairsPage = () => {
  const [repairs, setRepairs] = useState([]);

  const loadRepairs = async () => {
    try {
      const res = await apiRequest('/repairs');
      setRepairs(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await apiRequest(`/repairs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadRepairs();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Danh Sách Yêu Cầu Sửa Chữa</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repairs.map((item) => (
          <div key={item._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg dark:text-white">
                Phòng {item.roomId?.roomNumber}: {item.title}
              </h2>
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item._id, e.target.value)}
                className="px-2 py-1 text-xs border rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="Mới">Mới</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Xong">Xong</option>
              </select>
            </div>
            <p className="text-xs text-gray-500">
              Người báo: {item.tenantId?.fullName} ({item.tenantId?.phone})
            </p>
            <p className="text-sm dark:text-gray-300">{item.description}</p>
            {item.imageUrl && (
              <img
                src={`http://localhost:5000${item.imageUrl}`}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg mt-2"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRepairsPage;