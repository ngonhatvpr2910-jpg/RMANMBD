import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, WorkflowStep, LotInfo } from './types';

interface TicketContextType {
  tickets: Ticket[];
  lots: LotInfo[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  registerLot: (lot: LotInfo) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  moveTicket: (id: string, newStatus: WorkflowStep) => void;
  moveLot: (lotNumber: string, currentStatus: WorkflowStep, newStatus: WorkflowStep) => void;
  deleteTicket: (id: string) => void;
  importData: (data: { tickets: Ticket[], lots: LotInfo[] }) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const STORAGE_KEY = 'rma_tickets_data';
const LOTS_STORAGE_KEY = 'rma_lots_data';

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lots, setLots] = useState<LotInfo[]>(() => {
    const saved = localStorage.getItem(LOTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tickets', e);
      }
    }
    // Mock initial data if empty
    return [
      {
        id: 'RMA-1001',
        productName: 'Máy hút bụi X1',
        lotNumber: '50-11-2023',
        serialNumber: 'SN992817',
        quantity: 50,
        issueDescription: 'Động cơ có tiếng kêu lạ, lực hút yếu.',
        status: WorkflowStep.RMA_IN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'RMA-1002',
        productName: 'Nồi cơm điện C2',
        lotNumber: '120-12-2023',
        serialNumber: 'SN112233',
        quantity: 120,
        issueDescription: 'Không lên nguồn',
        status: WorkflowStep.EVALUATION,
        evaluationNotes: 'Cháy cầu chì nhiệt, hỏng bo mạch nguồn.',
        damagedParts: ['Cầu chì nhiệt', 'Bo mạch nguồn chính'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
  }, [lots]);

  const registerLot = (lot: LotInfo) => {
    setLots(prev => {
      const exists = prev.find(l => l.lotNumber === lot.lotNumber);
      if (exists) return prev;
      return [...prev, lot];
    });
  };

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const datePrefix = `${year}${month}`;
    
    // Find tickets from this month to determine next sequence number
    const thisMonthTickets = tickets.filter(t => t.id.startsWith(`RMA-${datePrefix}`));
    const nextNumber = (thisMonthTickets.length + 1).toString().padStart(4, '0');
    
    const newTicket: Ticket = {
      ...ticketData,
      id: `RMA-${datePrefix}-${nextNumber}`,
      status: WorkflowStep.RMA_IN,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() } 
        : t
    ));
  };

  const moveTicket = (id: string, newStatus: WorkflowStep) => {
    updateTicket(id, { status: newStatus });
  };

  const moveLot = (lotNumber: string, currentStatus: WorkflowStep, newStatus: WorkflowStep) => {
    setTickets(prev => prev.map(t => 
      (t.lotNumber === lotNumber && t.status === currentStatus)
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ));
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const importData = (data: { tickets: Ticket[], lots: LotInfo[] }) => {
    if (data.tickets) setTickets(data.tickets);
    if (data.lots) setLots(data.lots);
  };

  return (
    <TicketContext.Provider value={{ tickets, lots, addTicket, registerLot, updateTicket, moveTicket, moveLot, deleteTicket, importData }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
