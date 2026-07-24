"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bell, Plus, Trash2, Pencil, Phone, Mail,
  MapPin, Calendar, X, Search, Users, HardHat,
  CheckCircle2, Clock, AlertCircle, ChevronRight, Save, CircleDot
} from 'lucide-react';
import Logo from '@/components/Logo';
import Tooltip from '@/components/Tooltip';
import { dbHelper } from '@/lib/supabase';
import {
  PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon,
  SoporteIcon, ConfiguracionIcon, HerramientasIcon
} from '@/components/ModernIcons';

// =================== TIPOS ===================
interface Cliente {
  id: string;
  nombre: string;
  initials: string;
  color: string;
  telefono: string;
  email: string;
  direccion: string;
}

interface Pago {
  id: string;
  monto: number;
  fecha: string;
  nota: string;
}

interface Obra {
  id: string;
  clienteId: string;
  nombre: string;
  direccion: string;
  fecha: string;
  estado: 'presupuestada' | 'en-curso' | 'finalizada';
  total: number;
  avance: number;
  pagos: Pago[];
}



// =================== HELPERS ===================
const fmtMoney = (n: number) => '$ ' + Math.round(n).toLocaleString();

const estadoConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  'presupuestada': { label: 'Presupuestada', className: 'bg-blue-50 text-blue-700 border border-blue-200', icon: <Clock className="w-3 h-3" /> },
  'en-curso': { label: 'En curso', className: 'bg-orange-50 text-orange-700 border border-orange-200', icon: <CircleDot className="w-3 h-3" /> },
  'finalizada': { label: 'Finalizada', className: 'bg-green-50 text-green-700 border border-green-200', icon: <CheckCircle2 className="w-3 h-3" /> },
};

const AVATAR_COLORS = ['#fc8127', '#00355f', '#059669', '#7c3aed', '#dc2626', '#0891b2', '#d97706', '#db2777'];

function getInitials(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

// =================== COMPONENT ===================
export default function MisTrabajosPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'clientes' | 'obras'>('clientes');

  // CLIENTES
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formCliente, setFormCliente] = useState({ nombre: '', telefono: '', email: '', direccion: '' });

  // OBRAS
  const [obras, setObras] = useState<Obra[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'en-curso' | 'presupuestada' | 'finalizada'>('todas');
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [showNuevaObraModal, setShowNuevaObraModal] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [formObra, setFormObra] = useState({ nombre: '', clienteId: '', direccion: '', total: 0, fecha: '', estado: 'presupuestada' });

  // PAGOS
  const [formPagoMonto, setFormPagoMonto] = useState<number>(0);
  const [formPagoNota, setFormPagoNota] = useState('');
  const [formPagoFecha, setFormPagoFecha] = useState('');

  // Hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    setFormPagoFecha(`${dd}/${mm}/${today.getFullYear()}`);

    async function loadData() {
      try {
        const savedClientes = typeof dbHelper.getClientes === 'function' ? await dbHelper.getClientes() : JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');
        const savedObras = typeof dbHelper.getObras === 'function' ? await dbHelper.getObras() : JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');

        setClientes(savedClientes || []);
        setObras(savedObras || []);
      } catch (err) {
        console.error("Error al cargar clientes y obras:", err);
      }
    }

    loadData();
  }, []);

  // =================== SAVE HELPERS ===================
  const persistClientes = (list: Cliente[]) => {
    setClientes(list);
    list.forEach(c => dbHelper.saveCliente(c));
  };

  const persistObras = (list: Obra[]) => {
    setObras(list);
    list.forEach(o => dbHelper.saveObra(o));
    if (selectedObra) {
      const updated = list.find(o => o.id === selectedObra.id);
      if (updated) setSelectedObra(updated);
    }
  };

  // =================== COMPUTED ===================
  const clientesFiltrados = useMemo(() =>
    clientes.filter(c =>
      c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
      c.direccion.toLowerCase().includes(searchCliente.toLowerCase())
    ), [clientes, searchCliente]);

  const obrasFiltradas = useMemo(() => {
    if (filtroEstado === 'todas') return obras;
    return obras.filter(o => o.estado === filtroEstado);
  }, [obras, filtroEstado]);

  const statsPorCliente = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    obras.forEach(o => {
      if (!map[o.clienteId]) map[o.clienteId] = { count: 0, total: 0 };
      map[o.clienteId].count++;
      map[o.clienteId].total += o.total;
    });
    return map;
  }, [obras]);

  const getCliente = (id: string) => clientes.find(c => c.id === id);

  const getObraCobrado = (obra: Obra) => obra.pagos.reduce((acc, p) => acc + p.monto, 0);

  // =================== HANDLERS CLIENTES ===================
  const handleOpenNewCliente = () => {
    setEditingCliente(null);
    setFormCliente({ nombre: '', telefono: '', email: '', direccion: '' });
    setShowClienteModal(true);
  };

  const handleOpenEditCliente = (c: Cliente, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCliente(c);
    setFormCliente({ nombre: c.nombre, telefono: c.telefono, email: c.email, direccion: c.direccion });
    setShowClienteModal(true);
  };

  const handleSaveCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCliente.nombre.trim()) return;
    const initials = getInitials(formCliente.nombre);
    if (editingCliente) {
      persistClientes(clientes.map(c => c.id === editingCliente.id ? { ...c, ...formCliente, initials } : c));
    } else {
      const color = AVATAR_COLORS[clientes.length % AVATAR_COLORS.length];
      persistClientes([...clientes, { id: 'c_' + Date.now(), ...formCliente, initials, color }]);
    }
    setShowClienteModal(false);
  };

  const handleDeleteCliente = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este cliente? También se eliminarán sus obras asociadas.')) return;
    const remainingClientes = clientes.filter(c => c.id !== id);
    setClientes(remainingClientes);
    dbHelper.deleteCliente(id);

    const remainingObras = obras.filter(o => o.clienteId !== id);
    setObras(remainingObras);
    obras.filter(o => o.clienteId === id).forEach(o => dbHelper.deleteObra(o.id));
  };

  // =================== HANDLERS OBRAS ===================
  const handleOpenNewObra = () => {
    setEditingObra(null);
    setFormObra({ nombre: '', clienteId: clientes[0]?.id || '', direccion: '', total: 0, fecha: formPagoFecha, estado: 'presupuestada' });
    setShowNuevaObraModal(true);
  };

  const handleOpenEditObra = (obra: Obra, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingObra(obra);
    setFormObra({ nombre: obra.nombre, clienteId: obra.clienteId, direccion: obra.direccion, total: obra.total, fecha: obra.fecha, estado: obra.estado });
    setShowNuevaObraModal(true);
  };

  const handleSaveObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObra.nombre.trim() || !formObra.clienteId) return;
    if (editingObra) {
      const updated: Obra = { ...editingObra, ...formObra, total: Number(formObra.total), estado: formObra.estado as Obra['estado'] };
      persistObras(obras.map(o => o.id === editingObra.id ? updated : o));
    } else {
      const newObra: Obra = {
        id: 'o_' + Date.now(),
        clienteId: formObra.clienteId,
        nombre: formObra.nombre,
        direccion: formObra.direccion,
        fecha: formObra.fecha || formPagoFecha,
        estado: formObra.estado as Obra['estado'],
        total: Number(formObra.total),
        avance: 0,
        pagos: []
      };
      persistObras([...obras, newObra]);
    }
    setShowNuevaObraModal(false);
  };

  const handleDeleteObra = (obraId: string) => {
    if (!confirm('¿Eliminar esta obra? Se perderán todos los datos de cobros.')) return;
    const remaining = obras.filter(o => o.id !== obraId);
    setObras(remaining);
    dbHelper.deleteObra(obraId);
    setSelectedObra(null);
  };

  const handleUpdateAvance = (obraId: string, avance: number) => {
    persistObras(obras.map(o => o.id === obraId ? { ...o, avance } : o));
  };

  const handleUpdateEstado = (obraId: string, estado: string) => {
    persistObras(obras.map(o => o.id === obraId ? { ...o, estado: estado as Obra['estado'] } : o));
  };

  // =================== HANDLERS PAGOS ===================
  const handleRegistrarPago = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObra || formPagoMonto <= 0) return;
    const nuevoPago: Pago = { id: 'p_' + Date.now(), monto: formPagoMonto, fecha: formPagoFecha, nota: formPagoNota };
    const updatedObra = { ...selectedObra, pagos: [nuevoPago, ...selectedObra.pagos] };
    persistObras(obras.map(o => o.id === selectedObra.id ? updatedObra : o));
    setSelectedObra(updatedObra);
    setFormPagoMonto(0);
    setFormPagoNota('');
  };

  const handleDeletePago = (pagoId: string) => {
    if (!selectedObra) return;
    const updatedObra = { ...selectedObra, pagos: selectedObra.pagos.filter(p => p.id !== pagoId) };
    persistObras(obras.map(o => o.id === selectedObra.id ? updatedObra : o));
    setSelectedObra(updatedObra);
  };

  // =================== OBRA DETAIL VIEW ===================
  if (selectedObra) {
    const cobrado = getObraCobrado(selectedObra);
    const saldo = selectedObra.total - cobrado;
    const pctCobrado = selectedObra.total > 0 ? Math.round(cobrado / selectedObra.total * 100) : 0;
    const clienteObra = getCliente(selectedObra.clienteId);

    return (
      <div className="bg-[#f7fafc] min-h-screen font-sans text-[#181c1e] pb-8">
        {/* Header de detalle */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setSelectedObra(null)}
              className="flex items-center gap-2 text-[#00355f] hover:bg-gray-100 px-3 py-2 rounded-xl font-bold text-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Volver
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-[#00355f] truncate">{selectedObra.nombre}</h1>
              <p className="text-sm text-gray-500 font-medium">{clienteObra?.nombre}</p>
            </div>
            <select
              value={selectedObra.estado}
              onChange={e => handleUpdateEstado(selectedObra.id, e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase border focus:outline-none focus:ring-2 focus:ring-[#fc8127] cursor-pointer ${estadoConfig[selectedObra.estado].className}`}
            >
              <option value="presupuestada">Presupuestada</option>
              <option value="en-curso">En curso</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* IZQUIERDA: Info + Avance + Pagos */}
          <div className="lg:col-span-3 space-y-5">

            {/* Info de la obra */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                {clienteObra && (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0" style={{ backgroundColor: clienteObra.color }}>
                    {clienteObra.initials}
                  </div>
                )}
                <div>
                  <p className="font-extrabold text-[#00355f]">{clienteObra?.nombre}</p>
                  {clienteObra?.telefono && <p className="text-xs text-gray-400">{clienteObra.telefono}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedObra.direccion || '—'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Inicio: {selectedObra.fecha}
                </div>
              </div>
            </div>

            {/* Avance de obra */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-black text-sm text-gray-600">Avance de obra</span>
                <span className="font-black text-[#fc8127] text-lg">{selectedObra.avance}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-3 bg-gradient-to-r from-[#fc8127] to-[#ffb347] rounded-full transition-all duration-300"
                  style={{ width: `${selectedObra.avance}%` }}
                />
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={selectedObra.avance}
                onChange={e => handleUpdateAvance(selectedObra.id, parseInt(e.target.value))}
                className="w-full accent-[#fc8127]"
              />
              <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-1">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            {/* Historial de pagos */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-black text-[#00355f] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
                Historial de pagos
              </h3>
              {selectedObra.pagos.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Sin pagos registrados todavía.
                </div>
              ) : (
                <div className="space-y-0">
                  {selectedObra.pagos.map((pago, i) => (
                    <div key={pago.id} className={`flex justify-between items-start py-3.5 ${i < selectedObra.pagos.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900">{fmtMoney(pago.monto)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <span className="font-bold">{pago.fecha}</span>
                            {pago.nota && <span className="mx-1.5">·</span>}
                            {pago.nota && <span>{pago.nota}</span>}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePago(pago.id)}
                        className="text-red-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Borrar obra */}
            <button
              onClick={() => handleDeleteObra(selectedObra.id)}
              className="w-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Eliminar esta obra
            </button>
          </div>

          {/* DERECHA: Resumen cobros + Registrar pago */}
          <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-20">

            {/* Resumen de cobros */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-black text-[#00355f] mb-4 text-sm uppercase tracking-wider">Resumen de cobros</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400 uppercase">Total presupuestado</span>
                  <span className="font-black text-gray-900">{fmtMoney(selectedObra.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400 uppercase">Cobrado</span>
                  <span className="font-black text-green-600">{fmtMoney(cobrado)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(pctCobrado, 100)}%` }} />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm font-black text-gray-600">Saldo pendiente</span>
                  <span className={`font-black text-2xl ${saldo > 0 ? 'text-[#fc8127]' : 'text-green-600'}`}>
                    {fmtMoney(saldo)}
                  </span>
                </div>
              </div>
            </div>

            {/* Registrar pago */}
            <div className="bg-[#00355f] rounded-3xl p-5 shadow-md">
              <h3 className="font-black text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="w-1.5 h-5 bg-[#fc8127] rounded-full"></span>
                Registrar Pago
              </h3>
              <form onSubmit={handleRegistrarPago} className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-wider">Monto recibido</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-black text-sm">$</span>
                    <input
                      type="number" min="1" value={formPagoMonto || ''}
                      onChange={e => setFormPagoMonto(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full h-12 pl-7 pr-3 bg-white/10 text-white placeholder-white/30 border border-white/15 rounded-2xl font-extrabold text-xl focus:ring-2 focus:ring-[#fc8127] focus:border-[#fc8127] outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-wider">Fecha</label>
                    <input
                      type="text" value={formPagoFecha}
                      onChange={e => setFormPagoFecha(e.target.value)}
                      className="h-10 px-3 bg-white/10 text-white border border-white/15 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#fc8127] outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-wider">Nota</label>
                    <input
                      type="text" value={formPagoNota}
                      onChange={e => setFormPagoNota(e.target.value)}
                      placeholder="Anticipo, cuota..."
                      className="h-10 px-3 bg-white/10 text-white placeholder-white/30 border border-white/15 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#fc8127] outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formPagoMonto <= 0}
                  className="w-full bg-[#fc8127] hover:bg-[#e67320] disabled:opacity-40 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide shadow-md active:scale-95 transition-all"
                >
                  + Registrar Pago
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== VISTA PRINCIPAL ===================
  return (
    <div className="bg-[#f7fafc] min-h-screen font-sans text-[#181c1e] pb-24 md:pl-24 md:pb-0">

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
        <button onClick={() => router.push('/panel-profesional')} className="p-2 rounded-full hover:bg-gray-100 text-[#00355f] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => router.push('/panel-profesional')}>
          <Logo size="md" theme="light" />
        </div>
        <button onClick={() => router.push('/notificaciones')} className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
        <Tooltip title="Panel" text="Resumen de actividad y ganancias." position="right">
          <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center gap-1 group hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <PanelIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase">Panel</span>
          </button>
        </Tooltip>
        <Tooltip title="Muro" text="Solicitudes de clientes." position="right">
          <button onClick={() => router.push('/muro-trabajos')} className="flex flex-col items-center gap-1 group hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <MuroIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase">Muro</span>
          </button>
        </Tooltip>
        <Tooltip title="Trabajos" text="Clientes y obras." position="right">
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm">
              <TrabajosIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase">Trabajos</span>
          </button>
        </Tooltip>
        <Tooltip title="Mensajes" text="Chat con clientes." position="right">
          <button onClick={() => router.push('/chat')} className="flex flex-col items-center gap-1 group hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <MensajesIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase">Mensajes</span>
          </button>
        </Tooltip>
        <Tooltip title="Herramientas" text="Calculadoras de materiales." position="right">
          <button onClick={() => router.push('/presupuestador-obras')} className="flex flex-col items-center gap-1 group hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <HerramientasIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase">Herramientas</span>
          </button>
        </Tooltip>
        <div className="mt-auto mb-6">
          <Tooltip title="Configuración" text="Editar perfil." position="right">
            <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center gap-1 group hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
                <ConfiguracionIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Configurar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* MAIN */}
      <main className="mt-16 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">

        {/* Título */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#00355f] tracking-tight">Mis Trabajos</h1>
            <p className="text-gray-500 text-sm mt-1">Gestioná tus clientes y el seguimiento de cada obra.</p>
          </div>
          {activeTab === 'clientes' ? (
            <button onClick={handleOpenNewCliente} className="flex items-center gap-2 bg-[#fc8127] hover:bg-[#e67320] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all shrink-0">
              <Plus className="w-4 h-4" /> Nuevo cliente
            </button>
          ) : (
            <button onClick={handleOpenNewObra} className="flex items-center gap-2 bg-[#00355f] hover:bg-[#0f4c81] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all shrink-0">
              <Plus className="w-4 h-4" /> Nueva obra
            </button>
          )}
        </div>

        {/* MAIN TABS */}
        <div className="flex border-b border-gray-200 mb-8 gap-1">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 py-3.5 px-5 font-bold text-xs tracking-wider uppercase border-b-[3px] transition-all shrink-0 ${activeTab === 'clientes' ? 'border-[#fc8127] text-[#00355f]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <Users className="w-4 h-4" />
            Clientes ({clientes.length})
          </button>
          <button
            onClick={() => setActiveTab('obras')}
            className={`flex items-center gap-2 py-3.5 px-5 font-bold text-xs tracking-wider uppercase border-b-[3px] transition-all shrink-0 ${activeTab === 'obras' ? 'border-[#fc8127] text-[#00355f]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <HardHat className="w-4 h-4" />
            Obras ({obras.length})
          </button>
        </div>

        {/* ===== TAB CLIENTES ===== */}
        {activeTab === 'clientes' && (
          <div>
            {/* Búsqueda */}
            <div className="relative max-w-sm mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Buscar por nombre o dirección..."
                value={searchCliente} onChange={e => setSearchCliente(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-[#00355f] outline-none bg-white shadow-sm"
              />
            </div>

            {clientesFiltrados.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">No hay clientes todavía.</p>
                <p className="text-sm mt-1">Hacé clic en "Nuevo cliente" para agregar uno.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {clientesFiltrados.map(cliente => {
                  const stats = statsPorCliente[cliente.id] || { count: 0, total: 0 };
                  return (
                    <div
                      key={cliente.id}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0"
                            style={{ backgroundColor: cliente.color }}
                          >
                            {cliente.initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#00355f] text-base leading-tight">{cliente.nombre}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                              {stats.count === 0 ? 'Sin obras' : stats.count === 1 ? '1 obra' : `${stats.count} obras`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => handleOpenEditCliente(cliente, e)}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-600 text-gray-500 flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDeleteCliente(cliente.id, e)}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-500 text-gray-400 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {cliente.telefono && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {cliente.telefono}
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {cliente.email}
                          </div>
                        )}
                        {cliente.direccion && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {cliente.direccion}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Facturado</p>
                          <p className="font-black text-[#00355f] text-lg">{fmtMoney(stats.total)}</p>
                        </div>
                        {stats.count > 0 && (
                          <button
                            onClick={() => { setActiveTab('obras'); }}
                            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#fc8127] transition-colors"
                          >
                            Ver obras <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB OBRAS ===== */}
        {activeTab === 'obras' && (
          <div>
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(['todas', 'en-curso', 'presupuestada', 'finalizada'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltroEstado(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    filtroEstado === f
                      ? 'bg-[#00355f] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {f === 'todas' ? 'Todas' : f === 'en-curso' ? 'En curso' : f === 'presupuestada' ? 'Presupuestadas' : 'Finalizadas'}
                </button>
              ))}
            </div>

            {obrasFiltradas.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">No hay obras en esta categoría.</p>
                <p className="text-sm mt-1">Creá una nueva obra con el botón de arriba.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {obrasFiltradas.map(obra => {
                  const cobrado = getObraCobrado(obra);
                  const saldo = obra.total - cobrado;
                  const pctCobrado = obra.total > 0 ? Math.round(cobrado / obra.total * 100) : 0;
                  const estadoCfg = estadoConfig[obra.estado];
                  const clienteObra = getCliente(obra.clienteId);

                  return (
                    <div
                      key={obra.id}
                      onClick={() => setSelectedObra(obra)}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-extrabold text-lg text-[#00355f] leading-tight">{obra.nombre}</p>
                          <p className="text-sm text-gray-500 font-medium mt-0.5">{clienteObra?.nombre}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black uppercase ${estadoCfg.className}`}>
                            {estadoCfg.icon}
                            {estadoCfg.label}
                          </span>
                          <button
                            onClick={e => handleOpenEditObra(obra, e)}
                            className="w-7 h-7 rounded-lg bg-slate-100 opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-600 text-gray-500 flex items-center justify-center transition-all"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Dirección + fecha */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 mb-4">
                        {obra.direccion && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <MapPin className="w-3 h-3" /> {obra.direccion}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Calendar className="w-3 h-3" /> {obra.fecha}
                        </div>
                      </div>

                      {/* Avance */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-bold text-gray-500">Avance de obra</span>
                          <span className="font-black text-gray-700">{obra.avance}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-2.5 bg-gradient-to-r from-[#fc8127] to-[#ffb347] rounded-full transition-all"
                            style={{ width: `${obra.avance}%` }}
                          />
                        </div>
                      </div>

                      {/* Cobros */}
                      <div className="border-t border-slate-100 pt-4">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Total</p>
                            <p className="font-black text-sm text-gray-900 mt-0.5">{fmtMoney(obra.total)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Cobrado</p>
                            <p className="font-black text-sm text-green-600 mt-0.5">{fmtMoney(cobrado)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Saldo</p>
                            <p className={`font-black text-sm mt-0.5 ${saldo > 0 ? 'text-[#fc8127]' : 'text-gray-400'}`}>
                              {fmtMoney(saldo)}
                            </p>
                          </div>
                        </div>
                        {/* Barra cobrado */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-green-500 rounded-full transition-all"
                              style={{ width: `${Math.min(pctCobrado, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold shrink-0">Cobrado {pctCobrado}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== MODAL: NUEVO / EDITAR CLIENTE ===== */}
      {showClienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#00355f]">
                {editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
              </h3>
              <button onClick={() => setShowClienteModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveCliente} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Nombre completo / Razón social <span className="text-red-400">*</span></label>
                <input required type="text" value={formCliente.nombre} onChange={e => setFormCliente(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Familia García" className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Teléfono</label>
                  <input type="text" value={formCliente.telefono} onChange={e => setFormCliente(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="+54 9 351..." className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Email</label>
                  <input type="email" value={formCliente.email} onChange={e => setFormCliente(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@..." className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Dirección</label>
                <input type="text" value={formCliente.direccion} onChange={e => setFormCliente(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Calle 123, Ciudad" className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <button type="submit" className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white py-3.5 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all">
                {editingCliente ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: NUEVA / EDITAR OBRA ===== */}
      {showNuevaObraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-md w-full mx-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#00355f]">
                {editingObra ? 'Editar obra' : 'Nueva obra'}
              </h3>
              <button onClick={() => setShowNuevaObraModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveObra} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Nombre de la obra <span className="text-red-400">*</span></label>
                <input required type="text" value={formObra.nombre} onChange={e => setFormObra(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Ampliación baño" className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Cliente <span className="text-red-400">*</span></label>
                {clientes.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold">Primero creá un cliente en la pestaña Clientes.</p>
                ) : (
                  <select required value={formObra.clienteId} onChange={e => setFormObra(p => ({ ...p, clienteId: e.target.value }))}
                    className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white">
                    <option value="">Seleccioná un cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Dirección de la obra</label>
                <input type="text" value={formObra.direccion} onChange={e => setFormObra(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Calle 123, Ciudad" className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Total presupuestado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" min="0" value={formObra.total || ''} onChange={e => setFormObra(p => ({ ...p, total: parseInt(e.target.value) || 0 }))}
                      placeholder="0" className="w-full h-11 pl-7 pr-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm text-green-700" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Estado</label>
                  <select value={formObra.estado} onChange={e => setFormObra(p => ({ ...p, estado: e.target.value }))}
                    className="h-11 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white">
                    <option value="presupuestada">Presupuestada</option>
                    <option value="en-curso">En curso</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Fecha de inicio</label>
                <input type="text" value={formObra.fecha} onChange={e => setFormObra(p => ({ ...p, fecha: e.target.value }))}
                  placeholder="dd/mm/aaaa" className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <button type="submit" disabled={clientes.length === 0}
                className="w-full bg-[#fc8127] hover:bg-[#e67320] disabled:opacity-40 text-white py-3.5 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all">
                {editingObra ? 'Guardar cambios' : 'Crear obra'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}