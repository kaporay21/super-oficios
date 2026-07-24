"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Wrench, Zap, MapPin, 
  ChevronRight, FileText, Share2, LayoutDashboard, 
  Briefcase, MessageSquare, User, Trash2, PlusCircle
} from 'lucide-react';

interface ItemPresupuesto {
  id: number;
  concepto: string;
  detalle: string;
  cantidad: number;
  precioUnitario: number;
}

// Interfaz para la memoria de autocompletado
interface ConceptoMemoria {
  concepto: string;
  detalle: string;
  precioUnitario: number;
}

export default function MisTrabajosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'activos' | 'pendientes' | 'historial' | 'presupuesto'>('presupuesto');

  // Estados del formulario general
  const [clientePresupuesto, setClientePresupuesto] = useState('');
  
  // Estado para un nuevo ítem individual
  const [conceptoInput, setConceptoInput] = useState('');
  const [detalleInput, setDetalleInput] = useState('');
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [precioInput, setPrecioInput] = useState<number>(0);

  // Lista acumulativa de ítems guardados para este presupuesto
  const [listaItems, setListaItems] = useState<ItemPresupuesto[]>([]);

  // ---- ESTADOS PARA EL AUTOCOMPLETADO (MEMORIA INTERNA) ----
  const [memoriaConceptos, setMemoriaConceptos] = useState<ConceptoMemoria[]>([]);
  const [sugerencias, setSugerencias] = useState<ConceptoMemoria[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Cargar la memoria interna al iniciar la pantalla
  useEffect(() => {
    const memoriaGuardada = localStorage.getItem('oficiosya_catalogo_conceptos');
    if (memoriaGuardada) {
      setMemoriaConceptos(JSON.parse(memoriaGuardada));
    }
  }, []);

  // Manejador al escribir en "Concepto"
  const handleConceptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setConceptoInput(valor);

    if (valor.length > 0) {
      // Filtrar conceptos que coincidan con lo escrito
      const filtradas = memoriaConceptos.filter(c => 
        c.concepto.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerencias(filtradas);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  // Seleccionar una sugerencia del menú
  const seleccionarSugerencia = (item: ConceptoMemoria) => {
    setConceptoInput(item.concepto);
    setDetalleInput(item.detalle);
    setPrecioInput(item.precioUnitario);
    setMostrarSugerencias(false);
  };

  // Función para agregar el ítem actual a la lista acumulada
  const agregarItem = () => {
    if (!conceptoInput || precioInput <= 0) return;
    
    // 1. Agregamos a la lista del presupuesto
    const nuevoItem: ItemPresupuesto = {
      id: Date.now(),
      concepto: conceptoInput,
      detalle: detalleInput,
      cantidad: cantidadInput,
      precioUnitario: precioInput
    };
    setListaItems([...listaItems, nuevoItem]);

    // 2. Guardamos/Actualizamos en la Memoria Interna (Autocompletado)
    const nuevaMemoria = [...memoriaConceptos];
    const indexExistente = nuevaMemoria.findIndex(c => c.concepto.toLowerCase() === conceptoInput.toLowerCase());
    
    const conceptoParaGuardar = { 
      concepto: conceptoInput, 
      detalle: detalleInput, 
      precioUnitario: precioInput 
    };

    if (indexExistente >= 0) {
      nuevaMemoria[indexExistente] = conceptoParaGuardar; // Actualiza si ya existe
    } else {
      nuevaMemoria.push(conceptoParaGuardar); // Agrega si es nuevo
    }

    setMemoriaConceptos(nuevaMemoria);
    localStorage.setItem('oficiosya_catalogo_conceptos', JSON.stringify(nuevaMemoria));

    // 3. Limpiamos los campos del ítem para cargar el siguiente
    setConceptoInput('');
    setDetalleInput('');
    setCantidadInput(1);
    setPrecioInput(0);
    setMostrarSugerencias(false);
  };

  // Función para eliminar un ítem guardado del presupuesto
  const eliminarItem = (id: number) => {
    setListaItems(listaItems.filter(item => item.id !== id));
  };

  // Cálculo del monto total acumulado
  const montoTotal = listaItems.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

  // Compartir por WhatsApp con el desglose completo
  const enviarPorWhatsApp = () => {
    if (!clientePresupuesto || listaItems.length === 0) return;

    let detalleTexto = listaItems.map(i => `• ${i.cantidad}x ${i.concepto} (${i.detalle}) - $${i.cantidad * i.precioUnitario}`).join('\n');
    
    const texto = `Hola *${clientePresupuesto}*, aquí tienes tu presupuesto detallado de *OficiosYa*:\n\n${detalleTexto}\n\n*Monto Total:* $${montoTotal.toLocaleString('es-AR')}\n\n¿Te parece bien para confirmar el trabajo?`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20 pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/panel-profesional')}>
            <Wrench className="w-7 h-7 text-[#00355f]" />
            <h1 className="font-extrabold text-xl text-[#00355f]">Oficios<span className="text-[#fc8127]">Ya</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#00355f] transition-colors" />
            <div className="w-8 h-8 rounded-full bg-[#0f4c81] overflow-hidden border border-gray-200 cursor-pointer" onClick={() => router.push('/configuracion-profesional')}>
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1W2fOmSq-AynqbO3ZoWLKh_XWhnamU4gzNipXAwgMd19QXjrLW74lvJpK-ZQeavvPt4luRYD7mhyI0qQuA6QCs8afpj3cqqLqgCs6S4po0rIeUYesugVkfTIMWiABeNBgEH8TIKJHiZdH_Pv9DLWbTS8ggXJkSpU6taEOfoFmwVs-S04n62fGxmqyzsGqJSR4eb_sNOrD5MTYiXByZcjscbg4QHwR8TpMzDU7dtp1JrFSPFMp9pBSecyG65yj2h2KnVBnkMvHuipY" alt="Perfil" />
            </div>
          </div>
        </div>
      </header>

      {/* Navegación Lateral Desktop (Versión Profesional) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button onClick={() => router.push('/panel-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><LayoutDashboard className="w-6 h-6" /></button>
        <button className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center shadow-sm"><Briefcase className="w-6 h-6" /></button>
        <button onClick={() => router.push('/chat')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><MessageSquare className="w-6 h-6" /></button>
        <div className="mt-auto mb-6">
          <button onClick={() => router.push('/configuracion-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Main Content Canvas */}
      <main className="max-w-[1200px] mx-auto px-4 pt-6 flex-grow w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#00355f]">Mis Trabajos</h2>
          <p className="text-sm text-gray-500">Gestiona tus servicios activos y arma presupuestos rápidos.</p>
        </div>

        {/* Segmented Tab Control */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('activos')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === 'activos' ? 'border-[#fc8127] text-[#00355f]' : 'border-transparent text-gray-500 hover:text-[#00355f]'}`}>ACTIVOS (2)</button>
          <button onClick={() => setActiveTab('pendientes')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === 'pendientes' ? 'border-[#fc8127] text-[#00355f]' : 'border-transparent text-gray-500 hover:text-[#00355f]'}`}>PENDIENTES (0)</button>
          <button onClick={() => setActiveTab('historial')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === 'historial' ? 'border-[#fc8127] text-[#00355f]' : 'border-transparent text-gray-500 hover:text-[#00355f]'}`}>HISTORIAL</button>
          <button onClick={() => setActiveTab('presupuesto')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'presupuesto' ? 'border-[#fc8127] text-[#fc8127]' : 'border-transparent text-[#fc8127] hover:brightness-110'}`}><FileText className="w-4 h-4" /> CREAR PRESUPUESTO</button>
        </div>

        {/* Generador Interactivo de Presupuestos */}
        {activeTab === 'presupuesto' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Columna Izquierda: Agregar nuevos ítems */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-[#00355f] border-b pb-3">1. Datos del Cliente</h3>
              <div>
                <label className="block text-xs font-bold text-[#00355f] uppercase tracking-wider mb-1">Nombre del Cliente</label>
                <input type="text" value={clientePresupuesto} onChange={(e) => setClientePresupuesto(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full h-11 px-4 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#0f4c81] text-sm transition-all" />
              </div>

              <h3 className="text-lg font-bold text-[#00355f] border-b pb-3 pt-2">2. Agregar Ítems al Presupuesto</h3>
              <div className="space-y-3">
                
                {/* Autocompletado Concepto */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Concepto / Servicio</label>
                  <input 
                    type="text" 
                    value={conceptoInput} 
                    onChange={handleConceptoChange}
                    onFocus={() => { if (conceptoInput) setMostrarSugerencias(true) }}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)} // Timeout para permitir el clic en la sugerencia
                    placeholder="Ej: Instalación de ventana" 
                    className="w-full h-11 px-4 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f4c81] transition-all" 
                  />
                  
                  {/* Menú desplegable de sugerencias */}
                  {mostrarSugerencias && sugerencias.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 shadow-xl max-h-48 rounded-lg overflow-y-auto mt-1 top-full left-0">
                      {sugerencias.map((sug, i) => (
                        <li 
                          key={i} 
                          onClick={() => seleccionarSugerencia(sug)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          <div className="font-bold text-sm text-[#00355f]">{sug.concepto}</div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span className="truncate pr-2">{sug.detalle}</span>
                            <span className="font-bold text-[#fc8127]">${sug.precioUnitario}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Detalle / Medidas</label>
                  <input type="text" value={detalleInput} onChange={(e) => setDetalleInput(e.target.value)} placeholder="Ej: Medida estándar 1.20x1.00m" className="w-full h-11 px-4 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f4c81] transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cantidad</label>
                    <input type="number" min={1} value={cantidadInput} onChange={(e) => setCantidadInput(Number(e.target.value))} className="w-full h-11 px-4 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f4c81] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Precio Unitario ($)</label>
                    <input type="number" value={precioInput || ''} onChange={(e) => setPrecioInput(Number(e.target.value))} placeholder="20000" className="w-full h-11 px-4 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f4c81] transition-all" />
                  </div>
                </div>

                <button 
                  onClick={agregarItem}
                  className="w-full h-12 bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 shadow-sm"
                >
                  <PlusCircle className="w-5 h-5" /> Guardar y sumar ítem
                </button>
              </div>
            </div>

            {/* Columna Derecha: Listado dinámico de lo que se va guardando */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#00355f] border-b pb-3 mb-4">Ítems Guardados en este Presupuesto</h3>
                
                {listaItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    Aún no has agregado ningún servicio o material.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {listaItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-bold text-sm text-[#00355f]">{item.cantidad}x {item.concepto}</p>
                          <p className="text-xs text-gray-500">{item.detalle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-gray-800">${(item.cantidad * item.precioUnitario).toLocaleString('es-AR')}</span>
                          <button onClick={() => eliminarItem(item.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-5 mt-6 space-y-4">
                <div className="flex justify-between items-center text-lg font-extrabold text-[#00355f]">
                  <span>Total Acumulado:</span>
                  <span className="text-2xl text-[#fc8127]">${montoTotal.toLocaleString('es-AR')}</span>
                </div>

                <button 
                  onClick={enviarPorWhatsApp}
                  disabled={listaItems.length === 0 || !clientePresupuesto}
                  className={`w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${listaItems.length === 0 || !clientePresupuesto ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Share2 className="w-5 h-5" /> Compartir por WhatsApp
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Vistas anteriores: Activos */}
        {activeTab === 'activos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm hover:border-[#0f4c81] transition-all cursor-pointer hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 mb-1"><Zap className="w-4 h-4 text-[#00355f]" /> Electricidad</span>
                  <h3 className="font-bold text-lg text-[#00355f] leading-tight">Instalación Eléctrica Local</h3>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">Confirmado</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-y border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOGyo0ecaq131IPCRtkHh3vyOpynoa2XH1Z7rsKCgI6TIcbUu8t51k2GhLW2PG9tF1hXrL-nGa8dNWvA5D2HD8maRBJzbPQTVCyf04kbsP7Jn9z5Ss_VqZiWUsJKxv0RmegQs4QRfEsJkpx8ZtZj4aLIGnIsZzBltgkdC9f8-3GV5wg8FZH2_t3XedL98noWBsZ0xB5ZPhQ_cBHMEFBYJTtHUZcpIyaXQs0uiK2r6EVB-7hNyxrXM3Xlks6fASoSRbi74xlpChoqpm" alt="Ricardo" className="w-full h-full object-cover" /></div>
                <div><p className="font-bold text-sm text-gray-900">Ricardo Gómez</p><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Palermo, CABA</p></div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">Hoy, 14:30 hs</span>
                <button className="bg-[#fc8127] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#e67320] transition-colors">Ver Detalle</button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm hover:border-[#0f4c81] transition-all cursor-pointer hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 mb-1"><Wrench className="w-4 h-4 text-[#00355f]" /> Plomería</span>
                  <h3 className="font-bold text-lg text-[#00355f] leading-tight">Reparación de Cañería</h3>
                </div>
                <span className="px-3 py-1 bg-orange-50 text-[#fc8127] rounded-full text-xs font-bold animate-pulse border border-orange-100">En Camino</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-y border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE48gRWxOvOxlrbvaoO_9gQRyhRDDO2YGAhVXqBeZlJyULKUTqWaYg6rxg2ZXjXNdSOyE2_I0bqwtse8jmded8c8S0fsJ9fk9c-kgl897gZ_YQqLcR5SZ5qUfApmKCWxC7YyU46jq_UXBhOEX52hecS5ksyHgLRE-CZynsbXszbZDxhPF9hQUwIkkMTuIjfs4uw2tWEW3G_jFYcDDEG47U6UOy5CbAVvsulHsXSxOh-4T5UgBLcTh8vQbJ-oVkH_Z0mF0pNaNRp63u" alt="Mariana" className="w-full h-full object-cover" /></div>
                <div><p className="font-bold text-sm text-gray-900">Mariana Solís</p><p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Belgrano, CABA</p></div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">Ahora mismo</span>
                <button className="bg-[#fc8127] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#e67320] transition-colors">Ver Detalle</button>
              </div>
            </div>
          </div>
        )}

        {/* Empty States para Pendientes e Historial */}
        {(activeTab === 'pendientes' || activeTab === 'historial') && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm max-w-2xl mx-auto mt-8">
            <Briefcase className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-[#00355f]">No hay trabajos aquí</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-md">
              {activeTab === 'pendientes' 
                ? 'Actualmente no tienes solicitudes de trabajo esperando confirmación.' 
                : 'Aún no tienes un historial de trabajos finalizados en tu cuenta.'}
            </p>
          </div>
        )}

      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f] transition-colors"><LayoutDashboard className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Dashboard</span></button>
        <button onClick={() => setActiveTab('activos')} className="flex flex-col items-center text-[#fc8127]"><Briefcase className="w-5 h-5 fill-current" /><span className="text-[10px] font-bold mt-1">Mis Trabajos</span></button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f] transition-colors relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          <span className="text-[10px] mt-1 font-medium">Mensajes</span>
        </button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f] transition-colors"><User className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Perfil</span></button>
      </nav>
    </div>
  );
}