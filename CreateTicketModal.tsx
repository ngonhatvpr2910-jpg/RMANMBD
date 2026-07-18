import React, { useState } from 'react';
import { useTickets } from './TicketContext';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
}

export default function CreateTicketModal({ onClose }: Props) {
  const { tickets, addTicket } = useTickets();
  const [formData, setFormData] = useState({
    productCode: '',
    lotNumber: '',
    serialNumber: '',
    quantity: 1,
    issueDescription: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productCode || !formData.lotNumber || !formData.serialNumber || formData.quantity < 1) return;
    
    // Validate unique serial number (Mã máy)
    const exists = tickets.some(t => t.serialNumber === formData.serialNumber);
    if (exists) {
      setError(`Số máy/Serial "${formData.serialNumber}" đã tồn tại trên hệ thống.`);
      return;
    }

    addTicket({
      productName: formData.productCode, // Use code as name
      productCode: formData.productCode,
      lotNumber: formData.lotNumber,
      serialNumber: formData.serialNumber,
      quantity: formData.quantity,
      issueDescription: formData.issueDescription
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">1. Nhập hàng lỗi (RMA)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mã Sản phẩm <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
              placeholder="VD: MSV2"
              value={formData.productCode}
              onChange={e => {
                setError('');
                setFormData({...formData, productCode: e.target.value});
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mã Lô (Lot) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="VD: 50-11-2023 (SL - Tháng - Năm)"
                value={formData.lotNumber}
                onChange={e => {
                  setError('');
                  setFormData({...formData, lotNumber: e.target.value});
                }}
              />
              <p className="text-[11px] text-slate-500 mt-1">Cấu trúc: Số lượng Lot - Tháng nhập - Năm nhập</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số máy (Serial) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="VD: SN-12345"
                value={formData.serialNumber}
                onChange={e => {
                  setError('');
                  setFormData({...formData, serialNumber: e.target.value});
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input 
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.quantity}
              onChange={e => {
                setError('');
                setFormData({...formData, quantity: parseInt(e.target.value) || 1});
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả lỗi từ khách hàng
            </label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Mô tả chi tiết tình trạng..."
              value={formData.issueDescription}
              onChange={e => setFormData({...formData, issueDescription: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 mt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Tạo phiếu RMA
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
