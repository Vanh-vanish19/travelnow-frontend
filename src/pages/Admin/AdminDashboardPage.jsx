import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { get } from '../../services/api';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalVouchers: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await get('/admin/stats');
        setStats((prev) => ({ ...prev, ...data }));
      } catch (e) {
        // lỗi đã được xử lý ở api layer / toast
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Bảng điều khiển Admin</h2>

      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 text-sm">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 text-lg font-semibold">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || user.email}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            (user?.fullName || user?.email || '?')
              .charAt(0)
              .toUpperCase()
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">Tài khoản hiện tại</p>
          <p className="text-sm font-semibold">{user?.fullName || user?.email}</p>
          <p className="text-xs text-gray-600">{user?.email}</p>
        </div>
      </div>

      <p className="text-gray-600 text-sm">
        Đây là khu vực quản trị TravelNow. Sử dụng menu bên trái để quản lý
        khách sạn, người dùng, ưu đãi và các đơn đặt phòng.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 mb-1">Tổng số khách sạn</p>
          <p className="text-2xl font-semibold text-blue-600">
            {loading ? '...' : stats.totalHotels}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 mb-1">Tài khoản khách hàng (User)</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {loading ? '...' : stats.totalUsers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 mb-1">Tài khoản nhân viên / Admin</p>
          <p className="text-2xl font-semibold text-indigo-600">
            {loading ? '...' : stats.totalAdmins}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 mb-1">Số đơn đặt phòng</p>
          <p className="text-2xl font-semibold text-orange-600">
            {loading ? '...' : stats.totalBookings}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Số ưu đãi (voucher)</p>
          <p className="text-2xl font-semibold text-pink-600">
            {loading ? '...' : stats.totalVouchers}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
