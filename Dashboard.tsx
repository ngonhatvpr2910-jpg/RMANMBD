import React, { useState } from 'react';
import { useTickets } from './TicketContext';
import { WORKFLOW_STEPS, WorkflowStep } from './types';
import { TicketCard } from './TicketCard';
import CreateTicketModal from './CreateTicketModal';
import TicketDetailModal from './TicketDetailModal';
import QRScannerModal from './QRScannerModal';
import ScanActionModal from './ScanActionModal';
import GenerateLotQRModal from './GenerateLotQRModal';
import ColumnScanner from './ColumnScanner';
import { Plus, QrCode, Download, Search, Printer, ArrowRight, Upload, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { tickets, moveLot, lots, importData } = useTickets();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGenerateLotQROpen, setIsGenerateLotQROpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [scannedTicketId, setScannedTicketId] = useState<string | null>(null);
  const [searchLot, setSearchLot] = useState('');

  const handleScan = (scannedId: string) => {
    setIsScannerOpen(false);
    
    let foundTicket = null;

    if (scannedId.startsWith('LOT-')) {
      const parts = scannedId.split('-');
      if (parts.length >= 2) {
        const lotNumber = parts[1];
        foundTicket = tickets.find(t => t.lotNumber === lotNumber);
      }
    } else {
      let baseId = scannedId;
      if (scannedId.includes('-') && scannedId.split('-').length > 2) {
         baseId = scannedId.split('-').slice(0, 2).join('-');
      }
      foundTicket = tickets.find(t => t.id === baseId || t.id === scannedId);
    }
    
    if (foundTicket) {
      setScannedTicketId(foundTicket.id);
    } else {
      alert(`Không tìm thấy dữ liệu cho mã: ${scannedId}`);
    }
  };

  const handleExportParts = () => {
    const rows = [
      ['Tên sản phẩm', 'Mã Lô/Lot', 'Số máy (Serial)', 'Mã RMA', 'Linh kiện thay thế', 'Số lượng cần']
    ];

    tickets.forEach(ticket => {
      if (ticket.damagedParts && ticket.damagedParts.length > 0) {
        ticket.damagedParts.forEach(part => {
          rows.push([
            `"${ticket.productName}"`, 
            `"${ticket.lotNumber}"`, 
            `"${ticket.serialNumber}"`,
            `"${ticket.id}"`, 
            `"${part}"`, 
            ticket.quantity.toString()
          ]);
        });
      }
    });

    if (rows.length === 1) {
      alert("Chưa có dữ liệu linh kiện hư hỏng để xuất.");
      return;
    }

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Du_Lieu_Linh_Kien_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackup = () => {
    const data = {
      tickets,
      lots,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rma_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tickets && data.lots) {
          if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu? Dữ liệu hiện tại sẽ bị thay thế.')) {
            importData(data);
            alert('Khôi phục dữ liệu thành công!');
          }
        } else {
          alert('Tệp sao lưu không hợp lệ.');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp sao lưu.');
      }
    };
    reader.readAsText(file);
    // @ts-ignore
    e.target.value = '';
  };

  const filteredTickets = tickets.filter(t => 
    searchLot.trim() === '' ? true : t.lotNumber.toLowerCase().includes(searchLot.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        {/* Row 1: Main Actions */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã Lô..." 
              value={searchLot}
              onChange={(e) => setSearchLot(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportParts}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Xuất vật tư"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">Xuất vật tư</span>
            </button>
            
            <button 
              onClick={() => setIsGenerateLotQROpen(true)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Tạo QR Lô Hàng"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">Tạo QR Lô</span>
            </button>

            <button 
              onClick={handleBackup}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Sao lưu toàn bộ dữ liệu"
            >
              <Database className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">Sao lưu</span>
            </button>

            <label className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer" title="Phục hồi dữ liệu">
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">Phục hồi</span>
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>

            <button 
              onClick={() => {
                const finishedTickets = filteredTickets.filter(t => t.status === WorkflowStep.FINISHED && t.imei);
                if (finishedTickets.length === 0) {
                  alert("Không có dữ liệu IMEI ở bước 5 để xuất.");
                  return;
                }
                
                let csvContent = "\uFEFF"; // BOM for Excel
                csvContent += "Lô hàng,Mã sản phẩm,Số máy (Serial),Mã IMEI,Ngày nhập kho\n";
                
                finishedTickets.sort((a, b) => a.lotNumber.localeCompare(b.lotNumber)).forEach(t => {
                  const date = new Date(t.updatedAt).toLocaleDateString('vi-VN');

                  csvContent += `"${t.lotNumber}","${t.productName}","${t.serialNumber}","${t.imei}","${date}"\n`;
                });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `IMEI_Buoc5_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Xuất IMEI Bước 5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">Xuất IMEI (B5)</span>
            </button>

            <button 
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md border border-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">Tạo RMA</span>
            </button>
          </div>
        </div>

        {/* Row 2: Workflow Summary Stats */}
        <div className="px-6 pb-3 flex items-center space-x-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center bg-slate-100 rounded-md px-2.5 py-1.5 border border-slate-200 shrink-0">
            <span className="text-[10px] text-slate-500 uppercase font-bold mr-3 tracking-wider">Tổng RMA</span>
            <span className="text-sm font-black text-slate-900 leading-none">{filteredTickets.length}</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {WORKFLOW_STEPS.map((step) => {
            const count = filteredTickets.filter(t => t.status === step.id).length;
            let dotColor = "bg-slate-400";
            let activeBg = "bg-white";
            
            if (step.id === WorkflowStep.RMA_IN) { dotColor = "bg-blue-500"; activeBg = "bg-blue-50/50"; }
            if (step.id === WorkflowStep.EVALUATION) { dotColor = "bg-orange-500"; activeBg = "bg-orange-50/50"; }
            if (step.id === WorkflowStep.QUOTED) { dotColor = "bg-emerald-500"; activeBg = "bg-emerald-50/50"; }
            if (step.id === WorkflowStep.REWORK) { dotColor = "bg-indigo-500"; activeBg = "bg-indigo-50/50"; }
            if (step.id === WorkflowStep.FINISHED) { dotColor = "bg-green-500"; activeBg = "bg-green-50/50"; }
            if (step.id === WorkflowStep.LIQUIDATION) { dotColor = "bg-rose-500"; activeBg = "bg-rose-50/50"; }

            return (
              <div key={step.id} className={`flex items-center ${activeBg} border border-slate-100 rounded-md px-3 py-1.5 shadow-sm shrink-0 transition-colors`}>
                <div className={`w-2 h-2 rounded-full ${dotColor} mr-2.5`}></div>
                <span className="text-[10px] text-slate-600 font-bold mr-3 whitespace-nowrap tracking-wide">{step.label}</span>
                <span className="text-sm font-black text-slate-900 leading-none">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50">
        <div className="flex space-x-6 h-full items-start min-w-max pb-4">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className="w-80 flex flex-col max-h-full">
              <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <h3 className="font-semibold text-slate-700 text-sm">{step.fullLabel}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredTickets.filter(t => t.status === step.id).length}
                </span>
              </div>
              
              <ColumnScanner stepId={step.id} />

              {step.id === WorkflowStep.EVALUATION && filteredTickets.filter(t => t.status === step.id).length > 0 && (
                <div className="mb-3 px-1">
                  <div className="flex flex-col space-y-2">
                    {Array.from(new Set(filteredTickets.filter(t => t.status === step.id).map(t => t.lotNumber))).map(lotNum => (
                      <button
                        key={lotNum}
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc chắn muốn chuyển toàn bộ Lô ${lotNum} sang bước Đã báo giá?`)) {
                            moveLot(lotNum, WorkflowStep.EVALUATION, WorkflowStep.QUOTED);
                          }
                        }}
                        className="flex items-center justify-between bg-white border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition-colors shadow-sm group"
                      >
                        <span className="truncate max-w-[140px]">Chuyển Lô: {lotNum}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step.id === WorkflowStep.QUOTED && filteredTickets.filter(t => t.status === step.id).length > 0 && (
                <div className="mb-3 px-1">
                  <div className="flex flex-col space-y-2">
                    {Array.from(new Set(filteredTickets.filter(t => t.status === step.id).map(t => t.lotNumber))).map(lotNum => (
                      <button
                        key={lotNum}
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc chắn muốn chuyển toàn bộ Lô ${lotNum} sang bước Thanh lý (do báo giá cao)?`)) {
                            moveLot(lotNum, WorkflowStep.QUOTED, WorkflowStep.LIQUIDATION);
                          }
                        }}
                        className="flex items-center justify-between bg-white border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors shadow-sm group"
                      >
                        <span className="truncate max-w-[140px]">Thanh lý Lô: {lotNum}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto bg-slate-100/50 rounded-xl p-2.5 border border-slate-200/60 min-h-[150px]">
                <div className="flex flex-col space-y-3">
                  {filteredTickets
                    .filter(t => t.status === step.id)
                    .map((ticket, i) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        onClick={() => setSelectedTicketId(ticket.id)} 
                        index={i}
                      />
                  ))}
                  {filteredTickets.filter(t => t.status === step.id).length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm font-medium">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCreateOpen && <CreateTicketModal onClose={() => setIsCreateOpen(false)} />}
      {isScannerOpen && <QRScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleScan} />}
      {scannedTicketId && (
        <ScanActionModal 
          ticketId={scannedTicketId}
          onClose={() => setScannedTicketId(null)}
          onOpenDetail={() => setSelectedTicketId(scannedTicketId)}
        />
      )}
      {selectedTicketId && (
        <TicketDetailModal 
          ticketId={selectedTicketId} 
          onClose={() => setSelectedTicketId(null)} 
        />
      )}
      {isGenerateLotQROpen && (
        <GenerateLotQRModal
          onClose={() => setIsGenerateLotQROpen(false)}
        />
      )}
    </div>
  );
}
