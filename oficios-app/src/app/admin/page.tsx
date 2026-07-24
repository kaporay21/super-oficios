"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, BarChart3, Send, MessageSquare, 
  Settings, LogOut, Search, Filter, ShieldCheck, 
  TrendingUp, AlertCircle, Crown
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'resumen' | 'usuarios' | 'marketing' | 'soporte'>('resumen');

  // Datos simulados para el administrador
  const stats = [
    { title: 'Usuarios Totales', value: '1,245', icon: <Users className="text-blue-500" />, trend: '+12%' },
    { title: 'Profesionales', value: '430', icon: <WrenchIcon className="text-orange-500" />, trend: '+5%' },
    { title: 'Suscripciones Pagas', value: '85', icon: <Crown className="text-yellow-500" />, trend: '+22%' },
    { title: 'Tickets Soporte', value: '12', icon: <AlertCircle className="text-red-500" />, trend: '-2%' },
  ];

  const mockUsers = [
    { id: 1, name: 'Juan Pérez', role: 'Profesional', plan: 'Master', status: 'Activo', date: '12/07/2026' },
    { id: 2, name: 'Lucía Gómez', role: 'Cliente', plan: '-', status: 'Activo', date: '14/07/2026' },
    { id: 3, name: 'Carlos Ruiz', role: 'Profesional', plan: 'Gratis', status: 'Inactivo', date: '10/07/2026' },
    { id: 4, name: 'Mariana Silva', role: 'Profesional', plan: 'Pro', status: 'Activo', date: '13/07/2026' },
  ];

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-[#0f4c81] selection:text-white">
      
      {/* Sidebar Admin */}
      <aside className="w-64 bg-[#00355f] text-white hidden md:flex flex-col shadow-xl z-20 relative">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-8 h-8 text-[#fc8127]" />
            <span className="font-black text-xl tracking-tight">Oficios<span className="text-[#fc8127]">Ya</span></span>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded text-blue-100 uppercase tracking-widest">
            Panel Admin
          </span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <button onClick={() => setActiveTab('resumen')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'resumen' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-200 hover:bg-white/10'}`}>
            <BarChart3 className="w-5 h-5" /> Resumen
          </button>
          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'usuarios' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-200 hover:bg-white/10'}`}>
            <Users className="w-5 h-5" /> Usuarios & Planes
          </button>
          <button onClick={() => setActiveTab('marketing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'marketing' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-200 hover:bg-white/10'}`}>
            <Send className="w-5 h-5" /> Marketing
          </button>
          <button onClick={() => setActiveTab('soporte')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'soporte' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-200 hover:bg-white/10'}`}>
            <MessageSquare className="w-5 h-5" /> Soporte / Quejas
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Admin */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h2 className="text-2xl font-bold text-[#00355f] capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Gonzalo Humacata</p>
              <p className="text-xs text-[#fc8127] font-bold">Super Administrador</p>
            </div>
            <div className="w-10 h-10 bg-[#00355f] rounded-full flex items-center justify-center text-white font-bold">G</div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          
          {/* VISTA: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        {stat.icon}
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {stat.trend}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400">{stat.title}</p>
                      <p className="text-3xl font-black text-[#00355f]">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA: USUARIOS Y PLANES */}
          {activeTab === 'usuarios' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Buscar usuario..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 w-full sm:w-auto justify-center">
                  <Filter className="w-4 h-4" /> Filtros
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold">Usuario</th>
                      <th className="p-4 font-bold">Rol</th>
                      <th className="p-4 font-bold">Suscripción</th>
                      <th className="p-4 font-bold">Estado</th>
                      <th className="p-4 font-bold">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {mockUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-[#00355f]">{user.name}</td>
                        <td className="p-4 text-gray-600">{user.role}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user.plan === 'Master' ? 'bg-purple-100 text-purple-700' :
                            user.plan === 'Pro' ? 'bg-blue-100 text-blue-700' :
                            user.plan === 'Gratis' ? 'bg-gray-200 text-gray-700' : 'text-gray-400'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA: MARKETING */}
          {activeTab === 'marketing' && (
            <div className="max-w-3xl bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#00355f]">Enviar Promoción</h3>
                <p className="text-sm text-gray-500">Envía correos o notificaciones push a tus usuarios para ofrecer descuentos o novedades.</p>
              </div>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Destinatarios</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f]">
                    <option>Todos los Usuarios</option>
                    <option>Solo Profesionales (Plan Gratis)</option>
                    <option>Solo Clientes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Asunto / Título</label>
                  <input type="text" placeholder="Ej: ¡Llegó el Plan Master a OficiosYa!" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje</label>
                  <textarea rows={5} placeholder="Escribe tu mensaje aquí..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f]"></textarea>
                </div>
                <button className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" /> Enviar Masivamente
                </button>
              </form>
            </div>
          )}

          {/* VISTA: SOPORTE / BUZÓN */}
          {activeTab === 'soporte' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px] animate-in fade-in duration-300">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-[#00355f]">Buzón de Sugerencias y Quejas</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-red-800 text-sm">Queja - Usuario: Carlos Méndez</span>
                    <span className="text-xs text-red-500 font-bold">Hace 2 horas</span>
                  </div>
                  <p className="text-sm text-gray-700">Tuve un problema con un cliente que canceló a último momento, ¿tienen políticas de cancelación?</p>
                  <button className="mt-3 text-xs font-bold text-red-600 hover:underline">Responder</button>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#00355f] text-sm">Sugerencia - Usuario: Ana Gómez</span>
                    <span className="text-xs text-blue-400 font-bold">Ayer</span>
                  </div>
                  <p className="text-sm text-gray-700">La app es buenísima, me gustaría que agreguen la opción de subir videos además de fotos al perfil.</p>
                  <button className="mt-3 text-xs font-bold text-[#00355f] hover:underline">Responder</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Icono auxiliar
function WrenchIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}