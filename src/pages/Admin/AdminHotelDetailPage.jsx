import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from '../../services/api';

const AdminHotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHotel() {
      try {
        setLoading(true);
        setError('');
        const data = await get(`/admin/hotels/${id}`);
        setHotel(data.hotel || null);
      } catch (err) {
        setError(err.message || 'Không tải được thông tin khách sạn');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchHotel();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/admin/hotels');
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải thông tin khách sạn...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleBack}
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
        >
          ← Quay lại danh sách
        </button>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleBack}
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
        >
          ← Quay lại danh sách
        </button>
        <p className="text-sm text-gray-500">Không tìm thấy khách sạn.</p>
      </div>
    );
  }

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const roomTypes = Array.isArray(hotel.roomTypes) ? hotel.roomTypes : [];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleBack}
        className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
      >
        ← Quay lại danh sách
      </button>

      <h2 className="text-2xl font-semibold">Chi tiết khách sạn</h2>

      <div className="bg-white rounded-lg shadow p-4 space-y-3 text-sm">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {hotel.imageUrl && (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="w-full md:w-64 h-40 object-cover rounded"
            />
          )}
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{hotel.name}</h3>
            <p className="text-gray-600">
              {hotel.city}
              {hotel.address ? ` • ${hotel.address}` : ''}
            </p>
            <p className="text-gray-700">
              Giá gốc: <span className="font-semibold">{(hotel.pricePerNight || 0).toLocaleString('vi-VN')}đ / đêm</span>
            </p>
            {hotel.rating != null && (
              <p className="text-gray-700">Đánh giá: {hotel.rating} ★</p>
            )}
            {hotel.description && (
              <p className="text-gray-700 mt-2 whitespace-pre-line">{hotel.description}</p>
            )}
          </div>
        </div>

        {amenities.length > 0 && (
          <div>
            <h4 className="font-medium mb-1">Tiện nghi</h4>
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-medium mb-2">Danh sách phòng & giá</h3>
        {roomTypes.length === 0 ? (
          <p className="text-gray-500 text-sm">Khách sạn này chưa có danh sách phòng.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Tên phòng</th>
                  <th className="px-3 py-2">Giá / đêm</th>
                  <th className="px-3 py-2">Số khách tối đa</th>
                  <th className="px-3 py-2">Số phòng</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((room) => (
                  <tr key={room._id || room.id || room.name} className="border-t">
                    <td className="px-3 py-2">{room.name}</td>
                    <td className="px-3 py-2">{(room.pricePerNight || 0).toLocaleString('vi-VN')}đ</td>
                    <td className="px-3 py-2">{room.maxGuests ?? '-'}</td>
                    <td className="px-3 py-2">{room.totalRooms ?? '-'}</td>
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

export default AdminHotelDetailPage;
