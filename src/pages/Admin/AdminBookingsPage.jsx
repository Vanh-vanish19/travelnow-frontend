import React, { useEffect, useState } from 'react';
import { get, put } from '../../services/api';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = () => {
    setLoading(true);
    get('/admin/bookings')
      .then((data) => {
        setBookings(data.bookings || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Không tải được danh sách đặt phòng');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = (bookingId, status) => {
    put(`/admin/bookings/${bookingId}/status`, { status })
      .then(fetchBookings)
      .catch(() => {});
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Quản lý đặt phòng</h2>
      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-medium mb-3">Danh sách đặt phòng</h3>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có đơn đặt phòng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Mã đặt phòng</th>
                  <th className="px-3 py-2">Khách hàng</th>
                  <th className="px-3 py-2">Khách sạn</th>
                  <th className="px-3 py-2">Ngày ở</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{b.bookingCode}</td>
                    <td className="px-3 py-2">
                      {b.user?.fullName || b.contact?.fullName || '-'}
                      <div className="text-gray-500 text-xs">
                        {b.user?.email || b.contact?.email}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {b.hotel?.name}
                      <div className="text-gray-500 text-xs">{b.hotel?.address}</div>
                    </td>
                    <td className="px-3 py-2">
                      {b.stay?.checkIn &&
                        new Date(b.stay.checkIn).toLocaleDateString('vi-VN')}
                      {' - '}
                      {b.stay?.checkOut &&
                        new Date(b.stay.checkOut).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          b.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {b.status !== 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(b._id, 'confirmed')}
                          className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          Xác nhận
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(b._id, 'cancelled')}
                          className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
