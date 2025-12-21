import React, { useEffect, useState } from 'react';
import { del, get, post, put } from '../../services/api';

const initialForm = {
  code: '',
  description: '',
  discountPercentage: '',
  validTo: '',
  type: 'gift'
};

const AdminVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = () => {
    setLoading(true);
    get('/admin/vouchers')
      .then((data) => {
        setVouchers(data.vouchers || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Không tải được danh sách voucher');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      code: form.code,
      description: form.description,
      discountPercentage: Number(form.discountPercentage) || 0,
      validTo: form.validTo ? new Date(form.validTo) : undefined,
      type: form.type
    };

    post('/admin/vouchers', payload)
      .then(() => {
        setForm(initialForm);
        fetchVouchers();
      })
      .catch((err) => {
        setError(err.message || 'Không tạo được voucher');
      })
      .finally(() => setSubmitting(false));
  };

  const handleToggleActive = (voucher) => {
    put(`/admin/vouchers/${voucher._id}`, { isActive: !voucher.isActive })
      .then(fetchVouchers)
      .catch(() => {});
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    del(`/admin/vouchers/${id}`)
      .then(fetchVouchers)
      .catch(() => {});
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Quản lý ưu đãi (Voucher)</h2>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow p-4 space-y-3 text-sm"
      >
        <h3 className="font-medium">Tạo voucher mới</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mã voucher
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mô tả
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Giảm (%)
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={form.discountPercentage}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              min={0}
              max={100}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Hạn sử dụng
            </label>
            <input
              type="date"
              name="validTo"
              value={form.validTo}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Loại
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="gift">Gift</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
        >
          {submitting ? 'Đang lưu...' : 'Tạo voucher'}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </form>

      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-medium mb-3">Danh sách voucher</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : vouchers.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có voucher nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2">Mã</th>
                  <th className="px-3 py-2">Mô tả</th>
                  <th className="px-3 py-2">Giảm (%)</th>
                  <th className="px-3 py-2">Hạn</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v._id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{v.code}</td>
                    <td className="px-3 py-2">{v.description}</td>
                    <td className="px-3 py-2">{v.discountPercentage}%</td>
                    <td className="px-3 py-2">
                      {v.validTo ? new Date(v.validTo).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(v)}
                        className={`text-xs px-2 py-0.5 rounded ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {v.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(v._id)}
                        className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Xóa
                      </button>
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

export default AdminVouchersPage;
