import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, put } from '../../services/api';

const AdminHotelEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    description: '',
    pricePerNight: '',
    imageUrl: '',
    amenities: ''
  });
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    async function fetchHotel() {
      try {
        setLoading(true);
        setError('');
        const data = await get(`/admin/hotels/${id}`);
        const hotel = data.hotel;
        if (!hotel) {
          setError('Không tìm thấy khách sạn');
          setLoading(false);
          return;
        }

        setForm({
          name: hotel.name || '',
          city: hotel.city || '',
          address: hotel.address || '',
          description: hotel.description || '',
          pricePerNight: hotel.pricePerNight != null ? String(hotel.pricePerNight) : '',
          imageUrl: hotel.imageUrl || '',
          amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : ''
        });

        setRooms(Array.isArray(hotel.roomTypes) ? hotel.roomTypes.map((r) => ({
          id: r._id || r.id || undefined,
          name: r.name || '',
          pricePerNight: r.pricePerNight != null ? String(r.pricePerNight) : '',
          maxGuests: r.maxGuests != null ? String(r.maxGuests) : '',
          totalRooms: r.totalRooms != null ? String(r.totalRooms) : ''
        })) : []);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (index, field, value) => {
    setRooms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        id: undefined,
        name: '',
        pricePerNight: '',
        maxGuests: '',
        totalRooms: ''
      }
    ]);
  };

  const handleRemoveRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        city: form.city,
        address: form.address,
        description: form.description,
        pricePerNight: Number(form.pricePerNight) || 0,
        imageUrl: form.imageUrl,
        amenities: form.amenities
          ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        roomTypes: rooms.map((room) => ({
          name: room.name,
          pricePerNight: Number(room.pricePerNight) || 0,
          maxGuests: room.maxGuests ? Number(room.maxGuests) : undefined,
          totalRooms: room.totalRooms ? Number(room.totalRooms) : undefined
        }))
      };

      await put(`/admin/hotels/${id}`, payload);
      navigate('/admin/hotels');
    } catch (err) {
      setError(err.message || 'Không lưu được thông tin khách sạn');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải thông tin khách sạn...</p>;
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleBack}
        className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
      >
        ← Quay lại danh sách
      </button>

      <h2 className="text-2xl font-semibold">Sửa thông tin khách sạn</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-4 space-y-4 text-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tên khách sạn
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Thành phố
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Địa chỉ
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Giá gốc / đêm
            </label>
            <input
              type="number"
              name="pricePerNight"
              value={form.pricePerNight}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              min={0}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ảnh đại diện (URL)
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tiện nghi (cách nhau bởi dấu phẩy)
            </label>
            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Danh sách phòng & giá</h3>
            <button
              type="button"
              onClick={handleAddRoom}
              className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
            >
              + Thêm loại phòng
            </button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-xs text-gray-500">Chưa có phòng nào, hãy thêm loại phòng mới.</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room, index) => (
                <div
                  key={room.id || index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border rounded p-2"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Tên phòng
                    </label>
                    <input
                      value={room.name}
                      onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                      placeholder="VD: Phòng Deluxe"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Giá / đêm
                    </label>
                    <input
                      type="number"
                      value={room.pricePerNight}
                      onChange={(e) => handleRoomChange(index, 'pricePerNight', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Số khách tối đa
                    </label>
                    <input
                      type="number"
                      value={room.maxGuests}
                      onChange={(e) => handleRoomChange(index, 'maxGuests', e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs"
                      min={1}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Số phòng
                      </label>
                      <input
                        type="number"
                        value={room.totalRooms}
                        onChange={(e) => handleRoomChange(index, 'totalRooms', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-xs"
                        min={1}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(index)}
                      className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs hover:bg-red-200 whitespace-nowrap"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHotelEditPage;
