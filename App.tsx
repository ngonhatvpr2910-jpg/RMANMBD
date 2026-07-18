import React from 'react';
import { TicketProvider } from './TicketContext';
import Dashboard from './Dashboard';
import { Settings, Package, LayoutDashboard } from 'lucide-react';

export default function App() {
  return (
    <TicketProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">RMA REWORK NMBD</h1>
              <p className="text-sm text-slate-500 font-medium">Hệ thống quản lý quy trình xử lý hàng RMA</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <Dashboard />
        </main>
      </div>
    </TicketProvider>
  );
}
