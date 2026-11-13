import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Tự động tô xanh đúng mục của trang đang mở
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-blue-600 dark:text-blue-400 font-semibold'
      : 'text-gray-700 dark:text-gray-200 hover:text-blue-600';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            NhàTrọ14
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="md:hidden px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-200"
          >
            {theme === 'light' ? '🌙 Tối' : '☀️ Sáng'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <NavLink to="/" end className={navLinkClass}>
            Phòng trống
          </NavLink>

          {user?.role === 'landlord' && (
            <>
              <NavLink to="/landlord/dashboard" className={navLinkClass}>
                Thống kê
              </NavLink>
              <NavLink to="/landlord/houses-rooms" className={navLinkClass}>
                Dãy & Phòng
              </NavLink>
              <NavLink to="/landlord/contracts" className={navLinkClass}>
                Hợp đồng
              </NavLink>
              <NavLink to="/landlord/bulk-utility" className={navLinkClass}>
                Ghi điện nước
              </NavLink>
              <NavLink to="/landlord/invoices" className={navLinkClass}>
                Hóa đơn
              </NavLink>
              <NavLink to="/landlord/repairs" className={navLinkClass}>
                Sửa chữa
              </NavLink>
            </>
          )}

          {user?.role === 'tenant' && (
            <NavLink to="/tenant" className={navLinkClass}>
              Phòng của tôi
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden md:inline-block px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? '🌙 Chế độ tối' : '☀️ Chế độ sáng'}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Xin chào, <strong>{user.fullName}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;