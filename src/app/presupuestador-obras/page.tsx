"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, Search, Calculator, Plus, Trash2, 
  Share2, Printer, PlusCircle, CheckCircle2, CheckCircle, 
  HelpCircle, User, Phone, FileText, ChevronRight, Settings, 
  Wrench, Hammer, Folder, ClipboardCheck, ArrowRight, X, 
  RotateCcw, Check, Sparkles, Copy, PlusIcon, Pencil, Package
} from 'lucide-react';
import Logo from '@/components/Logo';
import Tooltip from '@/components/Tooltip';
import { dbHelper } from '@/lib/supabase';
import { 
  PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, 
  SoporteIcon, ConfiguracionIcon, HerramientasIcon 
} from '@/components/ModernIcons';

// Calculadoras por defecto iniciales
const DEFAULT_CALCULADORAS = [
  {
    id: 'muro',
    nombre: '🧱 Muro de Ladrillos',
    tipo: 'area',
    unidad: 'm²',
    largo: 4,
    alto: 3,
    aberturas: 0,
    manoObra: 4500,
    items: [
      { name: 'Ladrillos', factor: 17, unit: 'u.' },
      { name: 'Cemento', factor: 0.12, unit: 'bolsas' },
      { name: 'Arena', factor: 0.01, unit: 'm³' }
    ]
  },
  {
    id: 'losa',
    nombre: '🏗️ Losa o Contrapiso',
    tipo: 'volumen',
    unidad: 'm³',
    largo: 5,
    ancho: 4,
    espesor: 10,
    manoObra: 6500,
    items: [
      { name: 'Cemento', factor: 8, unit: 'bolsas' },
      { name: 'Arena', factor: 0.50, unit: 'm³' },
      { name: 'Piedra Partida', factor: 0.70, unit: 'm³' }
    ]
  },
  {
    id: 'revoque',
    nombre: '🌫️ Revoque Grueso',
    tipo: 'area',
    unidad: 'm²',
    largo: 4,
    alto: 3,
    aberturas: 0,
    manoObra: 2500,
    items: [
      { name: 'Cemento', factor: 0.15, unit: 'bolsas' },
      { name: 'Cal Hidratada', factor: 0.25, unit: 'bolsas' },
      { name: 'Arena', factor: 0.015, unit: 'm³' }
    ]
  },
  {
    id: 'pintura',
    nombre: '🎨 Pintura de Paredes',
    tipo: 'area',
    unidad: 'm²',
    largo: 4,
    alto: 3,
    aberturas: 0,
    manoObra: 2000,
    items: [
      { name: 'Pintura Látex', factor: 0.20, unit: 'litros' },
      { name: 'Enduido Plástico', factor: 0.05, unit: 'kg' }
    ]
  }
];

const CATALOGO_SUGERIDO = [
  { id: 'cat_1', nombre: '🧱 Ladrillo Hueco 12x18x33', unidad: 'u.' },
  { id: 'cat_2', nombre: 'Cemento (50kg)', unidad: 'bolsas' },
  { id: 'cat_3', nombre: 'Cal Hidratada (25kg)', unidad: 'bolsas' },
  { id: 'cat_4', nombre: 'Arena Lavada', unidad: 'm³' },
  { id: 'cat_5', nombre: '🎨 Pintura Látex Blanca (20L)', unidad: 'litros' },
  { id: 'cat_6', nombre: '📐 Placa Yeso Estándar 12.5mm', unidad: 'u.' },
  { id: 'cat_7', nombre: '🔧 Llave de Paso Cromo 1/2', unidad: 'u.' },
  { id: 'cat_8', nombre: '🔌 Cable Cobre 2.5mm (100m)', unidad: 'mts' }
];

export default function PresupuestadorObrasPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'calculadoras' | 'presupuestador' | 'historial'>('calculadoras');

  // --- CALCULADORAS ---
  const [calculadoras, setCalculadoras] = useState<any[]>([]);
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>('muro');
  const [showRendimientoConfig, setShowRendimientoConfig] = useState(false);
  const [newInsumoNombre, setNewInsumoNombre] = useState('');
  const [newInsumoFactor, setNewInsumoFactor] = useState<number>(0);
  const [newInsumoUnidad, setNewInsumoUnidad] = useState('bolsas');
  const [showCreateCalcModal, setShowCreateCalcModal] = useState(false);
  const [newCalcNombre, setNewCalcNombre] = useState('');
  const [newCalcTipo, setNewCalcTipo] = useState<'area' | 'volumen' | 'unidades'>('area');
  const [newCalcUnidad, setNewCalcUnidad] = useState('m²');
  const [newCalcManoObra, setNewCalcManoObra] = useState<number>(3000);

  // --- LISTA MANO DE OBRA ---
  const [presupuestoManoObra, setPresupuestoManoObra] = useState<any[]>([
    { id: 'init_1', nombre: 'Muro de Ladrillo Hueco 12', cantidad: 12, unidad: 'm²', precioUnitario: 4500, materiales: { Ladrillos: 204, Cemento: 2, Arena: 1 } },
    { id: 'init_2', nombre: 'Revoque Grueso Exterior', cantidad: 12, unidad: 'm²', precioUnitario: 2500, materiales: { Cemento: 2, 'Cal Hidratada': 3, Arena: 1 } }
  ]);

  // --- LISTA MATERIALES ---
  const [presupuestoMateriales, setPresupuestoMateriales] = useState<any[]>([]);

  // --- INLINE EDIT MANO DE OBRA ---
  const [editingManoObraId, setEditingManoObraId] = useState<string | null>(null);
  const [editMONombre, setEditMONombre] = useState('');
  const [editMOPrecio, setEditMOPrecio] = useState<number>(0);
  const [editMOCantidad, setEditMOCantidad] = useState<number>(0);
  const [editMOUnidad, setEditMOUnidad] = useState('');

  // --- MODAL GUARDAR ---
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [presupuestoNombre, setPresupuestoNombre] = useState('Presupuesto de Obra');
  const [presupuestoNota, setPresupuestoNota] = useState('');

  // Nuevos estados para asociar a cliente/obra (estilo Obrador)
  const [asociarCliente, setAsociarCliente] = useState<boolean>(true);
  const [tipoClienteOption, setTipoClienteOption] = useState<'nuevo' | 'existente'>('nuevo');
  const [listaClientesExistentes, setListaClientesExistentes] = useState<any[]>([]);
  const [clienteExistenteId, setClienteExistenteId] = useState<string>('');
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState<string>('');
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState<string>('');
  const [nuevoClienteEmail, setNuevoClienteEmail] = useState<string>('');
  const [nuevoClienteDireccion, setNuevoClienteDireccion] = useState<string>('');

  // --- FORMULARIO MANO DE OBRA MANUAL ---
  const [newItemNombre, setNewItemNombre] = useState('');
  const [newItemUnidad, setNewItemUnidad] = useState('m²');
  const [newItemPrecio, setNewItemPrecio] = useState<number>(2000);

  // --- FORMULARIO MATERIAL MANUAL ---
  const [newMatNombre, setNewMatNombre] = useState('');
  const [newMatCantidad, setNewMatCantidad] = useState<number>(1);
  const [newMatUnidad, setNewMatUnidad] = useState('u.');
  const [newMatPrecio, setNewMatPrecio] = useState<number>(0);

  // --- HISTORIAL ---
  const [historialPresupuestos, setHistorialPresupuestos] = useState<any[]>([]);

  // --- MATERIALES EDITADOS MANUALMENTE ---
  const [materialesEditados, setMaterialesEditados] = useState<Record<string, number> | null>(null);

  // --- MODAL IMPRESIÓN ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printNombrePro, setPrintNombrePro] = useState('Roberto Gómez');
  const [printIncluirManoObra, setPrintIncluirManoObra] = useState(true);
  const [printIncluirMateriales, setPrintIncluirMateriales] = useState(true);
  const [printIncluirMatCalculados, setPrintIncluirMatCalculados] = useState(true);

  // --- HYDRATION STATES ---
  const [refNo, setRefNo] = useState(1000);
  const [fechaStr, setFechaStr] = useState('');

  useEffect(() => {
    setRefNo(Math.floor(Math.random() * 9000) + 1000);
    setFechaStr(new Date().toLocaleDateString());
    const savedCalcs = localStorage.getItem('oficiosya_custom_calculadoras');
    if (savedCalcs) {
      setCalculadoras(JSON.parse(savedCalcs));
    } else {
      setCalculadoras(DEFAULT_CALCULADORAS);
      localStorage.setItem('oficiosya_custom_calculadoras', JSON.stringify(DEFAULT_CALCULADORAS));
    }
    const guardados = JSON.parse(localStorage.getItem('oficiosya_presupuestos_guardados') || '[]');
    setHistorialPresupuestos(guardados);
  }, []);

  const updateAndSaveCalculadoras = (newList: any[]) => {
    setCalculadoras(newList);
    localStorage.setItem('oficiosya_custom_calculadoras', JSON.stringify(newList));
  };

  const activeCalc = useMemo(() => {
    return calculadoras.find(c => c.id === activeCalculatorId) || calculadoras[0] || DEFAULT_CALCULADORAS[0];
  }, [calculadoras, activeCalculatorId]);

  // --- CÁLCULO EN TIEMPO REAL CON CEIL ---
  const activeCalculos = useMemo(() => {
    if (!activeCalc) return { cantidad: 0, manoObraTotal: 0, materiales: {} };
    let cantidad = 0;
    if (activeCalc.tipo === 'area') {
      const areaBruta = (activeCalc.largo || 0) * (activeCalc.alto || 0);
      cantidad = Math.max(0, areaBruta - (activeCalc.aberturas || 0));
    } else if (activeCalc.tipo === 'volumen') {
      cantidad = (activeCalc.largo || 0) * (activeCalc.ancho || 0) * ((activeCalc.espesor || 0) / 100);
    } else {
      cantidad = activeCalc.cantidad || 10;
    }
    const manoObraTotal = cantidad * (activeCalc.manoObra || 0);
    const materiales: Record<string, number> = {};
    if (activeCalc.items) {
      activeCalc.items.forEach((item: any) => {
        // Redondear siempre hacia arriba
        materiales[item.name] = Math.ceil(cantidad * item.factor);
      });
    }
    return { cantidad, manoObraTotal, materiales };
  }, [activeCalc]);

  const handleUpdateCalcField = (field: string, val: any) => {
    const updated = calculadoras.map(c => c.id === activeCalc.id ? { ...c, [field]: val } : c);
    updateAndSaveCalculadoras(updated);
  };

  const handleUpdateInsumoFactor = (idx: number, val: number) => {
    const updatedItems = [...activeCalc.items];
    updatedItems[idx].factor = val;
    const updated = calculadoras.map(c => c.id === activeCalc.id ? { ...c, items: updatedItems } : c);
    updateAndSaveCalculadoras(updated);
  };

  const handleDeleteInsumo = (indexToRemove: number) => {
    const updated = calculadoras.map(c => {
      if (c.id === activeCalc.id) {
        return { ...c, items: c.items.filter((_: any, idx: number) => idx !== indexToRemove) };
      }
      return c;
    });
    updateAndSaveCalculadoras(updated);
  };

  const handleAddNewInsumo = () => {
    if (!newInsumoNombre.trim()) return;
    const newItem = { name: newInsumoNombre, factor: newInsumoFactor, unit: newInsumoUnidad };
    if (activeCalc.items.some((i: any) => i.name.toLowerCase() === newInsumoNombre.toLowerCase())) {
      alert('Este material ya está en la lista.');
      return;
    }
    const updated = calculadoras.map(c => {
      if (c.id === activeCalc.id) return { ...c, items: [...c.items, newItem] };
      return c;
    });
    updateAndSaveCalculadoras(updated);
    setNewInsumoNombre('');
    setNewInsumoFactor(0);
  };

  const handleResetToStandard = () => {
    if (confirm('¿Restablecer todas las calculadoras a los valores predefinidos? Se perderán las personalizadas.')) {
      updateAndSaveCalculadoras(DEFAULT_CALCULADORAS);
      setActiveCalculatorId('muro');
      alert('Calculadoras restablecidas.');
    }
  };

  const handleCreateCalculator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalcNombre.trim()) return;
    const newCalc = {
      id: 'custom_' + Date.now(),
      nombre: '🛠️ ' + newCalcNombre,
      tipo: newCalcTipo,
      unidad: newCalcUnidad,
      largo: newCalcTipo !== 'unidades' ? 4 : undefined,
      alto: newCalcTipo === 'area' ? 3 : undefined,
      ancho: newCalcTipo === 'volumen' ? 4 : undefined,
      espesor: newCalcTipo === 'volumen' ? 10 : undefined,
      aberturas: newCalcTipo === 'area' ? 0 : undefined,
      cantidad: newCalcTipo === 'unidades' ? 10 : undefined,
      manoObra: newCalcManoObra,
      items: []
    };
    const updated = [...calculadoras, newCalc];
    updateAndSaveCalculadoras(updated);
    setActiveCalculatorId(newCalc.id);
    setShowCreateCalcModal(false);
    setNewCalcNombre('');
    alert(`Calculadora "${newCalcNombre}" creada. Ya podés agregarle insumos.`);
  };

  const handleDeleteCalculator = (id: string) => {
    if (id === 'muro' || id === 'losa') {
      alert('No podés eliminar las calculadoras estructurales principales.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta calculadora?')) {
      const filtradas = calculadoras.filter(c => c.id !== id);
      updateAndSaveCalculadoras(filtradas);
      setActiveCalculatorId('muro');
    }
  };

  // --- HANDLERS MANO DE OBRA ---
  const handleAddActiveCalcToPresupuesto = () => {
    const nuevoItem = {
      id: 'calc_' + Date.now(),
      nombre: activeCalc.nombre,
      cantidad: parseFloat(activeCalculos.cantidad.toFixed(2)),
      unidad: activeCalc.unidad,
      precioUnitario: activeCalc.manoObra,
      materiales: activeCalculos.materiales
    };
    setPresupuestoManoObra([...presupuestoManoObra, nuevoItem]);
    setMaterialesEditados(null);
    alert(`¡Cálculo de "${activeCalc.nombre}" añadido al presupuesto!`);
  };

  const handleAddManualManoObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNombre.trim()) return;
    const nuevoItem = {
      id: 'man_' + Date.now(),
      nombre: newItemNombre,
      cantidad: 1,
      unidad: newItemUnidad,
      precioUnitario: newItemPrecio,
      materiales: {}
    };
    setPresupuestoManoObra([...presupuestoManoObra, nuevoItem]);
    setNewItemNombre('');
    setMaterialesEditados(null);
  };

  const handleDeleteManoObraItem = (id: string) => {
    setPresupuestoManoObra(presupuestoManoObra.filter(i => i.id !== id));
    setMaterialesEditados(null);
    if (editingManoObraId === id) setEditingManoObraId(null);
  };

  const handleUpdateManoObraCantidad = (id: string, cant: number) => {
    setPresupuestoManoObra(presupuestoManoObra.map(item => {
      if (item.id === id) {
        const factor = item.cantidad > 0 ? cant / item.cantidad : 0;
        const updatedMateriales: Record<string, number> = {};
        if (item.materiales) {
          Object.entries(item.materiales).forEach(([name, val]: any) => {
            updatedMateriales[name] = Math.ceil(val * factor);
          });
        }
        return { ...item, cantidad: cant, materiales: updatedMateriales };
      }
      return item;
    }));
    setMaterialesEditados(null);
  };

  const handleStartEditManoObra = (item: any) => {
    setEditingManoObraId(item.id);
    setEditMONombre(item.nombre);
    setEditMOPrecio(item.precioUnitario);
    setEditMOCantidad(item.cantidad);
    setEditMOUnidad(item.unidad);
  };

  const handleSaveEditManoObra = (id: string) => {
    setPresupuestoManoObra(presupuestoManoObra.map(item =>
      item.id === id
        ? { ...item, nombre: editMONombre, precioUnitario: editMOPrecio, cantidad: editMOCantidad, unidad: editMOUnidad }
        : item
    ));
    setEditingManoObraId(null);
    setMaterialesEditados(null);
  };


  // --- MATERIALES CALCULADOS (inferidos desde items de MO, con ceil) ---
  const materialesCalculados = useMemo(() => {
    const total: Record<string, { val: number; unit: string }> = {};
    presupuestoManoObra.forEach(item => {
      if (item.materiales) {
        Object.entries(item.materiales).forEach(([name, val]: any) => {
          let unit = 'u.';
          if (name.toLowerCase().includes('cemento') || name.toLowerCase().includes('cal') || name.toLowerCase().includes('plasticor') || name.toLowerCase().includes('plasticol')) {
            unit = 'bolsas';
          } else if (name.toLowerCase().includes('arena') || name.toLowerCase().includes('piedra') || name.toLowerCase().includes('tierra')) {
            unit = 'm³';
          } else if (name.toLowerCase().includes('pintura') || name.toLowerCase().includes('látex')) {
            unit = 'litros';
          } else if (name.toLowerCase().includes('adhesivo') || name.toLowerCase().includes('pastina') || name.toLowerCase().includes('enduido')) {
            unit = 'kg';
          }
          if (!total[name]) total[name] = { val: 0, unit };
          total[name].val += val;
        });
      }
    });
    // Aplicar Math.ceil a todos
    const ceiled: Record<string, { val: number; unit: string }> = {};
    Object.entries(total).forEach(([name, data]) => {
      ceiled[name] = { val: Math.ceil(data.val), unit: data.unit };
    });
    return ceiled;
  }, [presupuestoManoObra]);

  // --- LISTA DE MATERIALES UNIFICADA (Insumos MO + Materiales Adicionales) ---
  const listaMaterialesUnificada = useMemo(() => {
    const autoItems: any[] = Object.entries(materialesCalculados).map(([nombre, data]) => {
      const id = 'auto_' + nombre.toLowerCase().replace(/\s+/g, '_');
      const customMat = presupuestoMateriales.find(m => m.nombre.toLowerCase() === nombre.toLowerCase() || m.id === id);

      return {
        id,
        nombre,
        cantidad: customMat ? customMat.cantidad : data.val,
        unidad: customMat ? customMat.unidad : data.unit,
        isAuto: true
      };
    });

    const customItems = presupuestoMateriales.filter(m =>
      !autoItems.some(a => a.nombre.toLowerCase() === m.nombre.toLowerCase() || a.id === m.id)
    );

    return [...autoItems, ...customItems];
  }, [materialesCalculados, presupuestoMateriales]);

  // --- HANDLERS MATERIALES ---
  const handleAddCatalogoItem = (item: any) => {
    const existing = listaMaterialesUnificada.find(m => m.nombre.toLowerCase().includes(item.nombre.toLowerCase()) || item.nombre.toLowerCase().includes(m.nombre.toLowerCase()));
    if (existing) {
      handleUpdateMaterialCantidad(existing.id, existing.cantidad + 1);
    } else {
      const nuevoItem = {
        id: 'cat_' + Date.now() + '_' + item.id,
        nombre: item.nombre,
        cantidad: 1,
        unidad: item.unidad || 'u.'
      };
      setPresupuestoMateriales([...presupuestoMateriales, nuevoItem]);
    }
  };

  const handleAddMaterialManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatNombre.trim()) return;
    const nuevoItem = {
      id: 'mat_' + Date.now(),
      nombre: newMatNombre,
      cantidad: newMatCantidad,
      unidad: newMatUnidad
    };
    setPresupuestoMateriales([...presupuestoMateriales, nuevoItem]);
    setNewMatNombre('');
    setNewMatCantidad(1);
    setNewMatUnidad('u.');
  };

  const handleDeleteMaterialItem = (id: string) => {
    const itemInList = listaMaterialesUnificada.find(i => i.id === id);
    if (itemInList?.isAuto) {
      handleUpdateMaterialCantidad(id, 0);
    } else {
      setPresupuestoMateriales(presupuestoMateriales.filter(i => i.id !== id));
    }
  };

  const handleUpdateMaterialCantidad = (id: string, cant: number) => {
    const itemInList = listaMaterialesUnificada.find(i => i.id === id);
    if (!itemInList) return;
    const existingInState = presupuestoMateriales.find(i => i.id === id || i.nombre.toLowerCase() === itemInList.nombre.toLowerCase());
    if (existingInState) {
      setPresupuestoMateriales(presupuestoMateriales.map(item =>
        (item.id === id || item.nombre.toLowerCase() === itemInList.nombre.toLowerCase()) ? { ...item, cantidad: cant } : item
      ));
    } else {
      setPresupuestoMateriales([
        ...presupuestoMateriales,
        {
          id,
          nombre: itemInList.nombre,
          cantidad: cant,
          unidad: itemInList.unidad
        }
      ]);
    }
  };

  const handleUpdateMaterialUnidad = (id: string, nuevaUnidad: string) => {
    const itemInList = listaMaterialesUnificada.find(i => i.id === id);
    if (!itemInList) return;
    const existingInState = presupuestoMateriales.find(i => i.id === id || i.nombre.toLowerCase() === itemInList.nombre.toLowerCase());
    if (existingInState) {
      setPresupuestoMateriales(presupuestoMateriales.map(item =>
        (item.id === id || item.nombre.toLowerCase() === itemInList.nombre.toLowerCase()) ? { ...item, unidad: nuevaUnidad } : item
      ));
    } else {
      setPresupuestoMateriales([
        ...presupuestoMateriales,
        {
          id,
          nombre: itemInList.nombre,
          cantidad: itemInList.cantidad,
          unidad: nuevaUnidad
        }
      ]);
    }
  };

  // --- TOTALES ---
  const subtotalManoObra = useMemo(() => {
    return presupuestoManoObra.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  }, [presupuestoManoObra]);

  const subtotalMateriales = useMemo(() => {
    return listaMaterialesUnificada.reduce((acc, item) => acc + (item.cantidad * (item.precioUnitario || 0)), 0);
  }, [listaMaterialesUnificada]);

  const totalGeneral = subtotalManoObra;

  // --- GUARDADO ---
  const handleOpenSaveModal = () => {
    const existingClientes = JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');
    setListaClientesExistentes(existingClientes);
    if (existingClientes.length > 0) {
      setClienteExistenteId(existingClientes[0].id);
      setTipoClienteOption('existente');
    } else {
      setTipoClienteOption('nuevo');
    }
    setShowSaveModal(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presupuestoNombre.trim()) return;

    let finalClienteId = '';
    let finalClienteNombre = 'Consumidor Final';
    let finalClienteTelefono = '';
    let finalClienteDireccion = '';

    if (asociarCliente) {
      const existingClientes = JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');

      if (tipoClienteOption === 'nuevo') {
        if (!nuevoClienteNombre.trim()) {
          alert('Por favor especificá el nombre del cliente.');
          return;
        }
        const initials = nuevoClienteNombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
        const AVATAR_COLORS = ['#fc8127', '#00355f', '#059669', '#7c3aed', '#dc2626', '#0891b2', '#d97706', '#db2777'];
        const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        const newCliente = {
          id: 'c_' + Date.now(),
          nombre: nuevoClienteNombre,
          initials,
          color,
          telefono: nuevoClienteTelefono,
          email: nuevoClienteEmail || '',
          direccion: nuevoClienteDireccion || ''
        };
        dbHelper.saveCliente(newCliente);
        finalClienteId = newCliente.id;
        finalClienteNombre = newCliente.nombre;
        finalClienteTelefono = newCliente.telefono;
        finalClienteDireccion = newCliente.direccion;
      } else {
        const found = existingClientes.find((c: any) => c.id === clienteExistenteId);
        if (found) {
          finalClienteId = found.id;
          finalClienteNombre = found.nombre;
          finalClienteTelefono = found.telefono;
          finalClienteDireccion = found.direccion;
        }
      }

      // Crear Obra asociada en oficiosya_obras_v2
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const fechaHoy = `${dd}/${mm}/${today.getFullYear()}`;

      const newObra = {
        id: 'o_' + Date.now(),
        clienteId: finalClienteId,
        nombre: presupuestoNombre,
        direccion: finalClienteDireccion || presupuestoNota || '',
        fecha: fechaHoy,
        estado: 'presupuestada',
        total: totalGeneral,
        avance: 0,
        pagos: []
      };

      dbHelper.saveObra(newObra);
    }

    setClienteNombre(finalClienteNombre);
    setClienteTelefono(finalClienteTelefono);

    // Guardar presupuesto en historial
    const nuevoPresupuesto = {
      id: 'pres_' + Date.now(),
      nombre: presupuestoNombre,
      cliente: finalClienteNombre,
      telefono: finalClienteTelefono,
      nota: presupuestoNota,
      totalManoObra: subtotalManoObra,
      cantMateriales: listaMaterialesUnificada.filter(i => i.cantidad > 0).length,
      total: totalGeneral,
      manoObra: presupuestoManoObra,
      materiales: listaMaterialesUnificada,
      fecha: new Date().toLocaleDateString()
    };

    dbHelper.savePresupuesto(nuevoPresupuesto);
    setHistorialPresupuestos([nuevoPresupuesto, ...historialPresupuestos]);

    setShowSaveModal(false);
    alert('¡Presupuesto guardado con éxito!' + (asociarCliente ? ' Se asoció el cliente y se creó la obra en Mis Trabajos.' : ''));
  };

  const handleCargarPresupuestoHistorial = (pres: any) => {
    setPresupuestoManoObra(pres.manoObra || pres.items || []);
    setPresupuestoMateriales(pres.materiales || []);
    setClienteNombre(pres.cliente);
    setClienteTelefono(pres.telefono || '');
    setPresupuestoNombre(pres.nombre);
    setPresupuestoNota(pres.nota || '');
    setActiveTab('presupuestador');
    alert(`Presupuesto de ${pres.cliente} cargado en el editor.`);
  };

  const handleEliminarPresupuestoHistorial = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto del historial?')) {
      const filtrados = historialPresupuestos.filter(p => p.id !== id);
      localStorage.setItem('oficiosya_presupuestos_guardados', JSON.stringify(filtrados));
      setHistorialPresupuestos(filtrados);
    }
  };

  // --- WHATSAPP MANO DE OBRA ---
  const handleShareWhatsAppManoObra = () => {
    let mensaje = `*${presupuestoNombre} — Mano de Obra*\n`;
    if (clienteNombre) mensaje += `Cliente: ${clienteNombre}\n`;
    mensaje += `---------------------------\n`;
    presupuestoManoObra.forEach(i => {
      mensaje += `• ${i.nombre} (${i.cantidad} ${i.unidad}) — $${Math.round(i.cantidad * i.precioUnitario).toLocaleString()}\n`;
    });
    mensaje += `---------------------------\n`;
    mensaje += `*Total Mano de Obra: $${Math.round(subtotalManoObra).toLocaleString()}*\n`;
    const url = `https://wa.me/${clienteTelefono ? '54' + clienteTelefono : ''}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // --- WHATSAPP MATERIALES ---
  const handleShareWhatsAppMateriales = () => {
    let mensaje = `*${presupuestoNombre} — Lista de Materiales*\n`;
    if (clienteNombre) mensaje += `Cliente: ${clienteNombre}\n`;
    mensaje += `---------------------------\n`;
    listaMaterialesUnificada.filter(i => i.cantidad > 0).forEach(i => {
      const totalItem = Math.round(i.cantidad * i.precioUnitario);
      mensaje += `• ${i.nombre}: ${i.cantidad} ${i.unidad}${totalItem > 0 ? ` — $${totalItem.toLocaleString()}` : ''}\n`;
    });
    mensaje += `---------------------------\n`;
    if (subtotalMateriales > 0) {
      mensaje += `*Total Materiales: $${Math.round(subtotalMateriales).toLocaleString()}*\n`;
    }
    const url = `https://wa.me/${clienteTelefono ? '54' + clienteTelefono : ''}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // --- SVG MURO ---
  const renderSVGWall = () => {
    const width = 300;
    const height = 150;
    const columnas = 16;
    const filas = 14;
    const ladrilloW = width / columnas;
    const ladrilloH = height / filas;
    const rows = [];
    for (let f = 0; f < filas; f++) {
      const bricksInRow = [];
      const offset = (f % 2) * (ladrilloW / 2);
      for (let c = -1; c < columnas + 1; c++) {
        bricksInRow.push(
          <rect 
            key={`${f}-${c}`} 
            x={c * ladrilloW + offset} 
            y={f * ladrilloH} 
            width={ladrilloW - 1.5} 
            height={ladrilloH - 1.5} 
            rx="1"
            fill={activeCalculatorId === 'muro' ? '#ea580c' : '#b45309'} 
            stroke="#7c2d12" 
            strokeWidth="0.5" 
            opacity="0.8" 
          />
        );
      }
      rows.push(<g key={f}>{bricksInRow}</g>);
    }
    const aberturas = typeof activeCalc.aberturas === 'number' ? activeCalc.aberturas : 0;
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        {rows}
        {aberturas > 0 && (
          <g>
            <rect x="90" y="40" width="80" height="70" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" rx="4" />
            <text x="130" y="80" textAnchor="middle" fill="#475569" className="text-[10px] font-black uppercase tracking-wider">Abertura</text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pl-24 md:pb-0 print:bg-white print:p-0 print:pl-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/panel-profesional')} className="p-2 rounded-full hover:bg-gray-100 text-[#00355f] transition-colors relative z-10">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10" onClick={() => router.push('/panel-profesional')}>
          <Logo size="md" theme="light" />
        </div>
        <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full relative z-10 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </header>

      {/* Navegación Lateral Desktop */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm print:hidden overflow-y-auto scrollbar-none">
        <Tooltip title="Panel" text="Hacé clic para ver el resumen de tu actividad, trabajos activos y ganancias del mes." position="right">
          <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <PanelIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Panel</span>
          </button>
        </Tooltip>
        <Tooltip title="Muro de trabajos" text="Explorá el muro de solicitudes publicadas por clientes y postulá tus presupuestos." position="right">
          <button onClick={() => router.push('/muro-trabajos')} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <MuroIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Muro</span>
          </button>
        </Tooltip>
        <Tooltip title="Mis trabajos" text="Revisá y gestioná tus trabajos en curso, presupuestados o finalizados." position="right">
          <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <TrabajosIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Trabajos</span>
          </button>
        </Tooltip>
        <Tooltip title="Mensajes" text="Chateá directamente con tus clientes para coordinar visitas y detalles de los trabajos." position="right">
          <button onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
              <MensajesIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Mensajes</span>
          </button>
        </Tooltip>
        <Tooltip title="Calculadora" text="Herramientas y calculadora de materiales y mano de obra para construcción." position="right">
          <button className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm">
              <HerramientasIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Herramientas</span>
          </button>
        </Tooltip>
        <div className="mt-auto mb-6">
          <Tooltip title="Configuración" text="Editá tus datos, cambia tu contraseña y activa o desactiva estos globitos aclaratorios." position="right">
            <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
                <ConfiguracionIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Configurar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* PRINT-ONLY DOCUMENT */}
      <div className="hidden print:block w-full text-black">
        <div className="flex justify-between items-start border-b-4 border-[#00355f] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <img src="/mascot.png" alt="Mascota" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-black text-[#00355f] tracking-tight">Oficios<span className="text-[#fc8127]">Ya</span></span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Presupuestos de Obras Profesionales</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-extrabold">Fecha: {fechaStr}</p>
            <p className="text-gray-500 mt-0.5">Nº Ref: #{refNo}</p>
          </div>
        </div>

        <div className="text-center my-6">
          <h1 className="text-3xl font-black uppercase tracking-wider text-[#00355f] border-y border-gray-200 py-2">PRESUPUESTO</h1>
        </div>

        <div className="grid grid-cols-2 gap-8 my-6 bg-slate-50 p-4 rounded-2xl border border-gray-150">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Profesional Emisor</p>
            <p className="text-base font-black text-[#00355f] mt-1">{printNombrePro}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Presupuestado Para</p>
            <p className="text-base font-black text-gray-900 mt-1">{clienteNombre || 'Consumidor Final'}</p>
            {clienteTelefono && <p className="text-xs text-gray-500">WhatsApp: {clienteTelefono}</p>}
          </div>
        </div>

        {printIncluirManoObra && (
          <div className="my-8">
            <h3 className="text-lg font-black text-[#00355f] mb-3">Detalle de Mano de Obra</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-300">
                  <th className="py-2.5 px-3 font-bold text-gray-600">Concepto / Servicio</th>
                  <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Cantidad</th>
                  <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Precio Unitario</th>
                  <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {presupuestoManoObra.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-150">
                    <td className="py-2.5 px-3 font-bold text-gray-800">{item.nombre}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{item.cantidad} {item.unidad}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">${item.precioUnitario.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">${Math.round(item.cantidad * item.precioUnitario).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-1 text-right">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-xs text-gray-500 font-bold">Total Mano de Obra:</span>
                  <span className="text-sm font-black text-[#00355f]">${Math.round(subtotalManoObra).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {printIncluirMateriales && listaMaterialesUnificada.filter(i => i.cantidad > 0).length > 0 && (
          <div className="my-8">
            <h3 className="text-lg font-black text-[#00355f] mb-3">Lista de Materiales</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-300">
                  <th className="py-2.5 px-3 font-bold text-gray-600">Material / Insumo</th>
                  <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Cantidad</th>
                  <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Unidad</th>
                </tr>
              </thead>
              <tbody>
                {listaMaterialesUnificada.filter(i => i.cantidad > 0).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-150">
                    <td className="py-2.5 px-3 font-bold text-gray-800">{item.nombre}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{item.cantidad}</td>
                    <td className="py-2.5 px-3 text-right text-gray-500">{item.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totales finales print */}
        <div className="flex justify-end mt-6">
          <div className="w-72 space-y-2 text-right bg-slate-50 p-4 rounded-xl border border-gray-200">
            {printIncluirManoObra && (
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-sm text-gray-500 font-bold">Mano de Obra:</span>
                <span className="text-sm font-black text-[#00355f]">${Math.round(subtotalManoObra).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-base text-gray-900 font-extrabold">Total General:</span>
              <span className="text-xl font-black text-green-600">${Math.round(totalGeneral).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {presupuestoNota && (
          <div className="mt-8 border-t border-gray-200 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase">Observaciones</p>
            <p className="text-xs text-gray-600 mt-1 whitespace-pre-line leading-relaxed">{presupuestoNota}</p>
          </div>
        )}

        <div className="mt-16 grid grid-cols-2 gap-8 text-center pt-8 border-t border-gray-150">
          <div>
            <div className="w-44 border-b border-gray-300 mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Firma del Profesional</p>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{printNombrePro}</p>
          </div>
          <div>
            <div className="w-44 border-b border-gray-300 mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Conformidad del Cliente</p>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{clienteNombre || 'Consumidor Final'}</p>
          </div>
        </div>
      </div>

      {/* SCREEN VIEWPORT */}
      <main className="mt-16 flex-grow px-4 md:px-8 py-8 max-w-6xl mx-auto w-full print:hidden">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#00355f] tracking-tight flex items-center gap-2">
              Presupuestador de Obras
              <span className="text-xs font-black bg-orange-100 text-[#fc8127] px-2 py-0.5 rounded-full uppercase">Flex</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Calculador de materiales con módulos personalizables y agregables.</p>
          </div>
          <button 
            onClick={() => setActiveTab('presupuestador')}
            className="flex items-center gap-2 bg-[#00355f] hover:bg-[#0f4c81] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            <ClipboardCheck className="w-4 h-4 text-[#fc8127]" />
            Ver Presupuesto ({presupuestoManoObra.length + presupuestoMateriales.length})
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('calculadoras')}
            className={`py-3.5 px-5 font-bold text-xs tracking-wider border-b-[3px] transition-all uppercase flex items-center gap-2 shrink-0 ${activeTab === 'calculadoras' ? 'text-[#00355f] border-[#fc8127]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            <Calculator className="w-4 h-4" />
            Calculadoras de Insumos
          </button>
          <button 
            onClick={() => setActiveTab('presupuestador')}
            className={`py-3.5 px-5 font-bold text-xs tracking-wider border-b-[3px] transition-all uppercase flex items-center gap-2 shrink-0 ${activeTab === 'presupuestador' ? 'text-[#00355f] border-[#fc8127]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            <Folder className="w-4 h-4" />
            Presupuesto & Ítems ({presupuestoManoObra.length + presupuestoMateriales.length})
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={`py-3.5 px-5 font-bold text-xs tracking-wider border-b-[3px] transition-all uppercase flex items-center gap-2 shrink-0 ${activeTab === 'historial' ? 'text-[#00355f] border-[#fc8127]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            <FileText className="w-4 h-4" />
            Historial de Obras ({historialPresupuestos.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">

          {/* TAB 1: CALCULADORAS */}
          {activeTab === 'calculadoras' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left: Calculator list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 lg:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Módulos de Cómputo</span>
                  <button onClick={handleResetToStandard} className="text-[9px] text-gray-400 hover:text-red-500 font-bold" title="Restablece las calculadoras de fábrica">
                    Restablecer
                  </button>
                </div>
                <div className="space-y-2">
                  {calculadoras.map((c) => (
                    <div 
                      key={c.id}
                      onClick={() => { setActiveCalculatorId(c.id); setShowRendimientoConfig(false); }}
                      className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex justify-between items-center ${activeCalculatorId === c.id ? 'border-[#fc8127] bg-orange-50/20 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                    >
                      <div>
                        <p className="font-extrabold text-sm text-[#00355f]">{c.nombre}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Cálculo por {c.unidad}</p>
                      </div>
                      {c.id !== 'muro' && c.id !== 'losa' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCalculator(c.id); }}
                          className="text-red-400 hover:text-red-600 p-2 print:hidden"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowCreateCalcModal(true)}
                  className="w-full bg-[#00355f] hover:bg-[#0f4c81] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4 text-[#fc8127]" />
                  Crear Nueva Calculadora
                </button>
              </div>

              {/* Right Columns: Active calculator */}
              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Calculator inputs */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-[#00355f]">{activeCalc.nombre}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Calculando mano de obra y materiales por {activeCalc.unidad}</p>
                    </div>
                    <button 
                      onClick={() => setShowRendimientoConfig(!showRendimientoConfig)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${showRendimientoConfig ? 'bg-orange-50 border-orange-200 text-[#fc8127]' : 'bg-slate-50 border-slate-200 text-gray-600 hover:bg-slate-100'}`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      {showRendimientoConfig ? 'Ocultar Insumos' : 'Ajustar Insumos'}
                    </button>
                  </div>

                  {showRendimientoConfig && (
                    <div className="bg-orange-50/20 border border-orange-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
                      <div>
                        <p className="text-xs font-extrabold text-[#00355f]">🛠️ Dosificación de Materiales (Rendimiento por 1 {activeCalc.unidad})</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Editá las proporciones por cada unidad de cómputo.</p>
                      </div>
                      <div className="space-y-2">
                        {activeCalc.items && activeCalc.items.length === 0 ? (
                          <p className="text-xs text-gray-400 italic text-center py-4">No hay materiales agregados a este módulo.</p>
                        ) : (
                          activeCalc.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white border border-orange-50 rounded-xl">
                              <span className="text-xs font-bold text-gray-700">{item.name}</span>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" step="any" value={item.factor}
                                  onChange={(e) => handleUpdateInsumoFactor(idx, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-8 text-center border border-gray-250 rounded-lg text-xs font-bold focus:border-[#fc8127] outline-none"
                                />
                                <span className="text-[10px] text-gray-400 font-bold w-12">{item.unit}</span>
                                <button onClick={() => handleDeleteInsumo(idx)} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="pt-3 border-t border-orange-100 space-y-3">
                        <p className="text-[10px] font-bold text-[#00355f] uppercase tracking-wider">Añadir otro material al cálculo:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-gray-500">Nombre del material</label>
                            <input type="text" placeholder="Ej: Cal, Pegamento..." value={newInsumoNombre} onChange={(e) => setNewInsumoNombre(e.target.value)} className="h-9 px-3 border border-gray-250 rounded-lg text-xs font-bold outline-none" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-gray-500">Consumo por {activeCalc.unidad}</label>
                            <input type="number" step="any" value={newInsumoFactor} onChange={(e) => setNewInsumoFactor(parseFloat(e.target.value) || 0)} className="h-9 px-3 border border-gray-250 rounded-lg text-xs font-bold outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1 flex-1">
                              <label className="text-[9px] font-bold text-gray-500">Unidad</label>
                              <input type="text" value={newInsumoUnidad} onChange={(e) => setNewInsumoUnidad(e.target.value)} className="h-9 px-3 border border-gray-250 rounded-lg text-xs font-bold outline-none" />
                            </div>
                            <button type="button" onClick={handleAddNewInsumo} className="bg-[#00355f] text-white px-3 h-9 rounded-lg font-bold text-xs shadow hover:bg-[#0f4c81]">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {activeCalc.tipo === 'area' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-600">Largo (metros)</label>
                          <input type="number" value={activeCalc.largo ?? 4} onChange={(e) => handleUpdateCalcField('largo', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-600">Alto / Ancho (metros)</label>
                          <input type="number" value={activeCalc.alto ?? 3} onChange={(e) => handleUpdateCalcField('alto', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-600">Aberturas a descontar ({activeCalc.unidad})</label>
                          <input type="number" value={activeCalc.aberturas ?? 0} onChange={(e) => handleUpdateCalcField('aberturas', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" placeholder="Ej: Puertas o ventanas" />
                        </div>
                      </div>
                    )}
                    {activeCalc.tipo === 'volumen' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-600">Largo (metros)</label>
                          <input type="number" value={activeCalc.largo ?? 5} onChange={(e) => handleUpdateCalcField('largo', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-600">Ancho (metros)</label>
                          <input type="number" value={activeCalc.ancho ?? 4} onChange={(e) => handleUpdateCalcField('ancho', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-600">Espesor (centímetros)</label>
                          <input type="number" value={activeCalc.espesor ?? 10} onChange={(e) => handleUpdateCalcField('espesor', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" />
                        </div>
                      </div>
                    )}
                    {activeCalc.tipo === 'unidades' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-600">Cantidad Total ({activeCalc.unidad})</label>
                        <input type="number" value={activeCalc.cantidad ?? 10} onChange={(e) => handleUpdateCalcField('cantidad', parseFloat(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-xs font-bold text-gray-600">Mano de Obra por unidad {activeCalc.unidad} (ARS)</label>
                      <input type="number" value={activeCalc.manoObra || 0} onChange={(e) => handleUpdateCalcField('manoObra', parseInt(e.target.value) || 0)} className="h-11 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-green-600" />
                    </div>
                  </div>

                  {activeCalculatorId === 'muro' && (
                    <div className="space-y-2 mt-4">
                      <span className="text-xs font-bold text-gray-600">Representación del Muro:</span>
                      <div className="h-40 w-full">{renderSVGWall()}</div>
                    </div>
                  )}
                </div>

                {/* Results card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6 lg:col-span-1">
                  <div>
                    <h4 className="text-lg font-black text-[#00355f]">Insumos Calculados</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Módulo: {activeCalc.nombre}</p>
                    <p className="text-xs text-[#fc8127] font-black mt-1">Cómputo Neto: {activeCalculos.cantidad.toFixed(2)} {activeCalc.unidad}</p>
                  </div>
                  <div className="space-y-4">
                    {Object.keys(activeCalculos.materiales).length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No hay materiales asociados al cálculo.</p>
                    ) : (
                      Object.entries(activeCalculos.materiales).map(([name, val], idx) => {
                        const itemData = activeCalc.items.find((i: any) => i.name === name);
                        const unitLabel = itemData ? itemData.unit : 'unid.';
                        return (
                          <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span className="text-xs text-gray-500 font-medium">{name}</span>
                            <span className="font-black text-[#00355f] text-sm">{val} {unitLabel}</span>
                          </div>
                        );
                      })
                    )}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3 pt-1">
                      <span className="text-xs text-gray-500 font-medium">Mano de Obra Subtotal</span>
                      <span className="font-black text-green-600 text-base">${Math.round(activeCalculos.manoObraTotal).toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleAddActiveCalcToPresupuesto}
                    className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Añadir al Presupuesto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESUPUESTO & ÍTEMS */}
          {activeTab === 'presupuestador' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left: Mano de Obra + Materiales */}
              <div className="space-y-6 lg:col-span-2">

                {/* ===== SECCIÓN MANO DE OBRA ===== */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-[#00355f] flex items-center gap-2">
                      <span className="w-2 h-5 bg-[#fc8127] rounded-full inline-block"></span>
                      Mano de Obra
                    </h4>
                    <button 
                      onClick={() => { setPresupuestoManoObra([]); setMaterialesEditados(null); }} 
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Vaciar
                    </button>
                  </div>

                  {presupuestoManoObra.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 font-medium text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Sin ítems de mano de obra. Calculá módulos o agregá manualmente.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {presupuestoManoObra.map((item) => (
                        <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all overflow-hidden">
                          {editingManoObraId === item.id ? (
                            // MODO EDICIÓN
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre del servicio</label>
                                  <input 
                                    type="text" value={editMONombre} onChange={(e) => setEditMONombre(e.target.value)}
                                    className="h-9 px-3 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00355f] outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Precio unitario (ARS)</label>
                                  <input 
                                    type="number" value={editMOPrecio} onChange={(e) => setEditMOPrecio(parseInt(e.target.value) || 0)}
                                    className="h-9 px-3 border border-gray-300 rounded-xl text-sm font-bold text-green-700 focus:ring-2 focus:ring-[#00355f] outline-none"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Cantidad</label>
                                  <input 
                                    type="number" step="any" value={editMOCantidad} onChange={(e) => setEditMOCantidad(parseFloat(e.target.value) || 0)}
                                    className="h-9 px-3 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00355f] outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Unidad</label>
                                  <input 
                                    type="text" value={editMOUnidad} onChange={(e) => setEditMOUnidad(e.target.value)}
                                    className="h-9 px-3 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00355f] outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button 
                                  onClick={() => handleSaveEditManoObra(item.id)}
                                  className="flex-1 bg-[#00355f] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" /> Guardar
                                </button>
                                <button 
                                  onClick={() => setEditingManoObraId(null)}
                                  className="flex-1 bg-slate-200 text-gray-700 py-2 rounded-xl text-xs font-bold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            // MODO VISTA
                            <div className="flex justify-between items-center gap-4 p-4">
                              <div className="min-w-0 flex-1">
                                <p className="font-extrabold text-sm text-[#00355f] truncate">{item.nombre}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                  {item.cantidad} {item.unidad} @ ${item.precioUnitario.toLocaleString()} c/u
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" value={item.cantidad} min="0" step="any"
                                  onChange={(e) => handleUpdateManoObraCantidad(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-8 text-center border border-gray-250 rounded-lg text-xs font-extrabold"
                                />
                                <span className="text-xs text-gray-500 font-bold hidden sm:block">{item.unidad}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-extrabold text-sm text-gray-900">${Math.round(item.cantidad * item.precioUnitario).toLocaleString()}</p>
                                <div className="flex items-center gap-2 justify-end mt-1">
                                  <button 
                                    onClick={() => handleStartEditManoObra(item)}
                                    className="text-blue-500 hover:text-blue-700 p-1"
                                    title="Editar ítem"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteManoObraItem(item.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Eliminar ítem"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario agregar mano de obra manual */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Agregar ítem de mano de obra manual:</p>
                    <form onSubmit={handleAddManualManoObra} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-gray-600">Descripción del servicio</label>
                        <input 
                          type="text" value={newItemNombre} onChange={(e) => setNewItemNombre(e.target.value)}
                          placeholder="Ej: Instalación eléctrica" 
                          className="h-10 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-600">Precio Unitario</label>
                        <input 
                          type="number" value={newItemPrecio} onChange={(e) => setNewItemPrecio(parseInt(e.target.value) || 0)}
                          className="h-10 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-xs"
                        />
                      </div>
                      <button type="submit" className="bg-[#00355f] hover:bg-[#0f4c81] text-white h-10 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1">
                        <PlusCircle className="w-4 h-4" /> Agregar
                      </button>
                    </form>
                  </div>

                  {/* Subtotal MO + Botones */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Subtotal Mano de Obra:</span>
                      <span className="ml-2 text-lg font-black text-[#00355f]">${Math.round(subtotalManoObra).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleShareWhatsAppManoObra}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button 
                        onClick={() => { setPrintIncluirManoObra(true); setPrintIncluirMateriales(false); setPrintIncluirMatCalculados(false); setShowPrintModal(true); }}
                        className="bg-slate-100 hover:bg-slate-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 border border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===== SECCIÓN MATERIALES ===== */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-[#00355f] flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded-full inline-block"></span>
                      Lista de Materiales
                    </h4>
                    {listaMaterialesUnificada.length > 0 && (
                      <button 
                        onClick={() => setPresupuestoMateriales([])} 
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Vaciar
                      </button>
                    )}
                  </div>

                  {listaMaterialesUnificada.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 font-medium text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Sin materiales. Al cargar Mano de Obra o agregar desde el catálogo sugerido se sumarán aquí.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Cabecera de columnas */}
                      <div className="hidden sm:grid grid-cols-12 gap-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <span className="col-span-6">Material / Insumo</span>
                        <span className="col-span-3 text-center">Cantidad</span>
                        <span className="col-span-2 text-center">Unidad / Mts</span>
                        <span className="col-span-1"></span>
                      </div>
                      {listaMaterialesUnificada.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all">
                          <div className="col-span-12 sm:col-span-6 min-w-0 flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[#00355f] truncate">{item.nombre}</span>
                            {item.isAuto && (
                              <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase shrink-0">MO</span>
                            )}
                          </div>
                          <div className="col-span-6 sm:col-span-3 flex justify-center">
                            <input 
                              type="number" step="any" min="0" value={item.cantidad}
                              onChange={(e) => handleUpdateMaterialCantidad(item.id, parseFloat(e.target.value) || 0)}
                              className="w-full h-9 text-center border border-gray-250 rounded-xl text-xs font-extrabold focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            <select
                              value={item.unidad || 'u.'}
                              onChange={(e) => handleUpdateMaterialUnidad(item.id, e.target.value)}
                              className="w-full h-9 px-2 text-center border border-gray-250 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none bg-white cursor-pointer"
                            >
                              <option value="u.">u.</option>
                              <option value="mts">mts</option>
                              <option value="m²">m²</option>
                              <option value="m³">m³</option>
                              <option value="bolsas">bolsas</option>
                              <option value="litros">litros</option>
                              <option value="kg">kg</option>
                              <option value="rollos">rollos</option>
                              <option value="cajas">cajas</option>
                              <option value="paquetes">paquetes</option>
                            </select>
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex justify-end">
                            <button onClick={() => handleDeleteMaterialItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Catálogo sugerido */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-xs font-bold text-[#00355f] uppercase tracking-wider">Añadir del catálogo sugerido:</p>
                    <div className="flex flex-wrap gap-2">
                      {CATALOGO_SUGERIDO.map(i => (
                        <button 
                          key={i.id} 
                          onClick={() => handleAddCatalogoItem(i)}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 transition-colors active:scale-95"
                        >
                          + {i.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formulario agregar material manual */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Agregar material manual:</p>
                    <form onSubmit={handleAddMaterialManual} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                      <div className="flex flex-col gap-1 sm:col-span-6">
                        <label className="text-xs font-bold text-gray-600">Nombre del material</label>
                        <input 
                          type="text" value={newMatNombre} onChange={(e) => setNewMatNombre(e.target.value)}
                          placeholder="Ej: Caño PVC 110mm" 
                          className="h-10 px-4 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-3">
                        <label className="text-xs font-bold text-gray-600">Cantidad</label>
                        <input 
                          type="number" step="any" min="0" value={newMatCantidad} onChange={(e) => setNewMatCantidad(parseFloat(e.target.value) || 0)}
                          className="h-10 px-3 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-xs text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-3">
                        <label className="text-xs font-bold text-gray-600">Unidad</label>
                        <select 
                          value={newMatUnidad} onChange={(e) => setNewMatUnidad(e.target.value)}
                          className="h-10 px-2 border border-gray-250 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-xs bg-white cursor-pointer"
                        >
                          <option value="u.">u. (unidades)</option>
                          <option value="mts">mts (metros)</option>
                          <option value="m²">m²</option>
                          <option value="m³">m³</option>
                          <option value="bolsas">bolsas</option>
                          <option value="litros">litros</option>
                          <option value="kg">kg</option>
                          <option value="rollos">rollos</option>
                          <option value="cajas">cajas</option>
                          <option value="paquetes">paquetes</option>
                        </select>
                      </div>
                      <button type="submit" className="sm:col-span-12 bg-[#00355f] hover:bg-[#0f4c81] text-white h-10 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 mt-1">
                        <PlusCircle className="w-4 h-4" /> Agregar material
                      </button>
                    </form>
                  </div>

                  {/* Subtotal materiales + Botones */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Total de materiales:</span>
                      <span className="ml-2 text-sm font-extrabold text-[#00355f]">
                        {listaMaterialesUnificada.filter(i => i.cantidad > 0).length} ítems en lista
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleShareWhatsAppMateriales}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button 
                        onClick={() => { setPrintIncluirManoObra(false); setPrintIncluirMateriales(true); setShowPrintModal(true); }}
                        className="bg-slate-100 hover:bg-slate-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 border border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Summary Panel */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-[#00355f]">Resumen del Presupuesto</h4>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Mano de Obra + Lista de Materiales</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500 font-medium">Mano de Obra</span>
                      <span className="font-extrabold text-[#00355f] text-base">${Math.round(subtotalManoObra).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500 font-medium">Lista de Materiales</span>
                      <span className="font-extrabold text-blue-600 text-sm">
                        {listaMaterialesUnificada.filter(i => i.cantidad > 0).length} ítems
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base text-gray-900 font-extrabold">Total General</span>
                      <span className="font-black text-green-600 text-2xl">${Math.round(totalGeneral).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Botones globales */}
                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={handleOpenSaveModal}
                      className="w-full bg-[#00355f] hover:bg-[#0f4c81] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-[#fc8127]" />
                      Guardar y Asociar Obra
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { setPrintIncluirManoObra(true); setPrintIncluirMateriales(true); setPrintIncluirMatCalculados(true); handleShareWhatsAppManoObra(); }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-4 h-4" /> WhatsApp
                      </button>
                      <button 
                        onClick={() => { setPrintIncluirManoObra(true); setPrintIncluirMateriales(true); setPrintIncluirMatCalculados(true); setShowPrintModal(true); }}
                        className="bg-slate-100 hover:bg-slate-200 text-gray-700 py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                      >
                        <Printer className="w-4 h-4" /> PDF / Imprimir
                      </button>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* TAB 3: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h4 className="text-lg font-black text-[#00355f] mb-4 flex items-center gap-2">
                <span className="w-2 h-5 bg-[#fc8127] rounded-full inline-block"></span>
                Historial de Presupuestos Guardados
              </h4>
              {historialPresupuestos.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-medium">
                  No hay presupuestos guardados todavía. Usá el botón "Guardar y Asociar Obra" en el presupuesto.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200">
                        <th className="py-3 px-4 font-bold text-[#00355f]">Obra / Presupuesto</th>
                        <th className="py-3 px-4 font-bold text-[#00355f]">Cliente</th>
                        <th className="py-3 px-4 font-bold text-[#00355f]">Fecha</th>
                        <th className="py-3 px-4 font-bold text-[#00355f]">Total</th>
                        <th className="py-3 px-4 font-bold text-[#00355f] text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialPresupuestos.map((pres) => (
                        <tr key={pres.id} className="border-b border-gray-100 hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <p className="font-extrabold text-gray-900">{pres.nombre}</p>
                            {pres.nota && <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{pres.nota}</p>}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-600">
                            <p>{pres.cliente}</p>
                            {pres.telefono && <p className="text-xs text-gray-400">{pres.telefono}</p>}
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-gray-400">{pres.fecha}</td>
                          <td className="py-3 px-4 font-black text-green-600">${Math.round(pres.total).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleCargarPresupuestoHistorial(pres)}
                                className="bg-slate-100 hover:bg-[#00355f] hover:text-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all"
                              >
                                Cargar
                              </button>
                              <button 
                                onClick={() => handleEliminarPresupuestoHistorial(pres.id)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* MODAL GUARDAR / ASOCIAR A CLIENTE / OBRA */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-[#00355f]">Guardar presupuesto</h3>
              <button onClick={() => setShowSaveModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              
              {/* Nombre del presupuesto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nombre del Presupuesto</label>
                <input
                  required
                  type="text"
                  value={presupuestoNombre}
                  onChange={(e) => setPresupuestoNombre(e.target.value)}
                  placeholder="Ej: Ampliación cocina"
                  className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-slate-50/50"
                />
              </div>

              {/* ¿Asociar a un cliente? */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">¿Asociar a un cliente?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAsociarCliente(true)}
                    className={`h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                      asociarCliente
                        ? 'bg-orange-50 text-[#fc8127] border-[#fc8127] shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-slate-50'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setAsociarCliente(false)}
                    className={`h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                      !asociarCliente
                        ? 'bg-orange-50 text-[#fc8127] border-[#fc8127] shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-slate-50'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Si Asociar Cliente es SÍ */}
              {asociarCliente && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoClienteOption('nuevo')}
                      className={`h-9 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all border ${
                        tipoClienteOption === 'nuevo'
                          ? 'bg-white text-[#fc8127] border-[#fc8127] shadow-xs'
                          : 'bg-transparent text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      Cliente nuevo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoClienteOption('existente')}
                      className={`h-9 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all border ${
                        tipoClienteOption === 'existente'
                          ? 'bg-white text-[#fc8127] border-[#fc8127] shadow-xs'
                          : 'bg-transparent text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      Ya existente
                    </button>
                  </div>

                  {tipoClienteOption === 'nuevo' ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Nombre y Apellido</label>
                        <input
                          required={asociarCliente && tipoClienteOption === 'nuevo'}
                          type="text"
                          value={nuevoClienteNombre}
                          onChange={(e) => setNuevoClienteNombre(e.target.value)}
                          placeholder="Nombre y apellido"
                          className="h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Teléfono (WhatsApp)</label>
                        <input
                          type="text"
                          value={nuevoClienteTelefono}
                          onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                          placeholder="11 5555 5555"
                          className="h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Dirección (opcional)</label>
                        <input
                          type="text"
                          value={nuevoClienteDireccion}
                          onChange={(e) => setNuevoClienteDireccion(e.target.value)}
                          placeholder="Calle 123, Córdoba"
                          className="h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Seleccionar Cliente</label>
                      {listaClientesExistentes.length === 0 ? (
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                          No hay clientes creados. Cambiá a "Cliente nuevo" para crearlo.
                        </p>
                      ) : (
                        <select
                          value={clienteExistenteId}
                          onChange={(e) => setClienteExistenteId(e.target.value)}
                          className="h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white cursor-pointer"
                        >
                          {listaClientesExistentes.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre} {c.telefono ? `(${c.telefono})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notas adicionales */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Notas adicionales de la obra</label>
                <textarea
                  value={presupuestoNota}
                  onChange={(e) => setPresupuestoNota(e.target.value)}
                  placeholder="Observaciones, detalles de pago..."
                  className="h-16 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-xs resize-none bg-slate-50/50"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 h-12 border border-gray-200 hover:bg-slate-50 text-gray-600 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-[#fc8127] hover:bg-[#e67320] text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl max-w-5xl w-full mx-4 h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-[#00355f]">Configuración de Impresión / PDF</h3>
                <p className="text-xs text-gray-500 mt-0.5">Elegí las secciones a incluir en el documento final.</p>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              
              <div className="w-full md:w-80 border-r border-gray-200 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
                <span className="text-xs font-black text-[#00355f] uppercase tracking-wider block border-b border-gray-200 pb-2">Información del Membrete</span>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Nombre del Profesional</label>
                  <input type="text" value={printNombrePro} onChange={(e) => setPrintNombrePro(e.target.value)} className="h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Nombre del Cliente</label>
                  <input type="text" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Consumidor Final" className="h-10 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
                </div>

                <span className="text-xs font-black text-[#00355f] uppercase tracking-wider block border-b border-gray-200 pb-2 pt-2">Secciones del Documento</span>
                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={printIncluirManoObra} onChange={(e) => setPrintIncluirManoObra(e.target.checked)} className="w-4 h-4 text-[#00355f] border-gray-300 rounded focus:ring-[#00355f]" />
                    <div className="text-xs">
                      <p className="font-bold text-gray-700">Incluir Mano de Obra</p>
                      <p className="text-[10px] text-gray-400">Items, cantidades y precio total</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={printIncluirMateriales} onChange={(e) => setPrintIncluirMateriales(e.target.checked)} className="w-4 h-4 text-[#00355f] border-gray-300 rounded focus:ring-[#00355f]" />
                    <div className="text-xs">
                      <p className="font-bold text-gray-700">Incluir Lista de Materiales</p>
                      <p className="text-[10px] text-gray-400">Insumos calculados y materiales adicionales</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Vista previa */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-200 flex justify-center items-start">
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300 max-w-[21cm] w-full min-h-[29.7cm] flex flex-col text-xs text-black">
                  <div className="flex justify-between items-start border-b-2 border-[#00355f] pb-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <img src="/mascot.png" alt="Mascota" className="w-8 h-8 object-contain" />
                      <span className="text-base font-black text-[#00355f]">Oficios<span className="text-[#fc8127]">Ya</span></span>
                    </div>
                    <span className="text-gray-400">Fecha: {fechaStr}</span>
                  </div>

                  <div className="text-center my-4">
                    <h2 className="text-lg font-black tracking-wider text-[#00355f] uppercase border-y border-gray-150 py-1">PRESUPUESTO</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-3 bg-slate-50 p-3 rounded-xl border border-gray-150">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Profesional</p>
                      <p className="font-extrabold text-gray-900 mt-0.5">{printNombrePro}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Presupuestado Para</p>
                      <p className="font-extrabold text-gray-900 mt-0.5">{clienteNombre || 'Consumidor Final'}</p>
                    </div>
                  </div>

                  {printIncluirManoObra && (
                    <div className="my-3">
                      <p className="font-extrabold text-xs text-[#00355f] mb-1.5 pb-1 border-b border-gray-100">Desglose de Mano de Obra</p>
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-gray-250">
                            <th className="py-1 px-2 font-bold text-gray-600">Servicio</th>
                            <th className="py-1 px-2 font-bold text-gray-600 text-right">Cant.</th>
                            <th className="py-1 px-2 font-bold text-gray-600 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presupuestoManoObra.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-1.5 px-2 font-bold text-gray-700">{item.nombre}</td>
                              <td className="py-1.5 px-2 text-right text-gray-500">{item.cantidad} {item.unidad}</td>
                              <td className="py-1.5 px-2 text-right font-bold text-gray-800">${Math.round(item.cantidad * item.precioUnitario).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end mt-2">
                        <div className="w-48 text-[11px] text-right">
                          <div className="flex justify-between border-t border-gray-200 pt-1">
                            <span className="font-extrabold text-gray-700">Total Mano de Obra:</span>
                            <span className="font-black text-[#00355f]">${Math.round(subtotalManoObra).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {printIncluirMateriales && listaMaterialesUnificada.filter(i => i.cantidad > 0).length > 0 && (
                    <div className="my-3">
                      <p className="font-extrabold text-xs text-[#00355f] mb-1.5 pb-1 border-b border-gray-100">Lista de Materiales</p>
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-gray-250">
                            <th className="py-1 px-2 font-bold text-gray-600">Material / Insumo</th>
                            <th className="py-1 px-2 font-bold text-gray-600 text-right">Cant.</th>
                            <th className="py-1 px-2 font-bold text-gray-600 text-right">Unidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaMaterialesUnificada.filter(i => i.cantidad > 0).map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-1.5 px-2 font-bold text-gray-700">{item.nombre}</td>
                              <td className="py-1.5 px-2 text-right font-bold text-gray-800">{item.cantidad}</td>
                              <td className="py-1.5 px-2 text-right text-gray-500">{item.unidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end mt-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">
                          {listaMaterialesUnificada.filter(i => i.cantidad > 0).length} ítems en lista
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Totales finales */}
                  <div className="flex justify-end mt-4">
                    <div className="w-56 text-[11px] space-y-1 bg-slate-50 p-3 rounded-xl border border-gray-200">
                      {printIncluirManoObra && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-bold">Mano de Obra:</span>
                          <span className="font-black text-[#00355f]">${Math.round(subtotalManoObra).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                        <span className="font-extrabold text-gray-800">Total General:</span>
                        <span className="font-black text-green-600 text-sm">${Math.round(totalGeneral).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowPrintModal(false)} className="bg-white hover:bg-slate-100 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm">Cancelar</button>
              <button 
                onClick={() => { setShowPrintModal(false); setTimeout(() => { window.print(); }, 300); }}
                className="bg-[#00355f] hover:bg-[#0f4c81] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#fc8127]" />
                Confirmar e Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR CALCULADORA */}
      {showCreateCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#00355f]">Crear Nueva Calculadora</h3>
              <button onClick={() => setShowCreateCalcModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateCalculator} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Nombre de la Calculadora</label>
                <input required type="text" value={newCalcNombre} onChange={(e) => setNewCalcNombre(e.target.value)} placeholder="Ej: Revoque Fino, Cerámicos..." className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Tipo de Cálculo / Dimensionamiento</label>
                <select 
                  value={newCalcTipo} 
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setNewCalcTipo(val);
                    if (val === 'area') setNewCalcUnidad('m²');
                    else if (val === 'volumen') setNewCalcUnidad('m³');
                    else setNewCalcUnidad('unid.');
                  }}
                  className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm bg-white"
                >
                  <option value="area">Superficie (Largo x Alto) - m²</option>
                  <option value="volumen">Volumen (Largo x Ancho x Espesor) - m³</option>
                  <option value="unidades">Cantidad simple (Conteo) - unidades</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Unidad de Medida del Cómputo</label>
                <input required type="text" value={newCalcUnidad} onChange={(e) => setNewCalcUnidad(e.target.value)} placeholder="Ej: m², m³, u., bocas" className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Mano de Obra base por unidad (ARS)</label>
                <input required type="number" value={newCalcManoObra} onChange={(e) => setNewCalcManoObra(parseInt(e.target.value) || 0)} className="h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-bold text-sm text-green-600" />
              </div>
              <button type="submit" className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all mt-4">
                Crear Calculadora
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
