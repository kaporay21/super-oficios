"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bell, Search, Calculator, Plus, Trash2,
  Share2, Printer, PlusCircle, CheckCircle2, CheckCircle,
  HelpCircle, User, Phone, FileText, ChevronRight, Settings,
  Wrench, Hammer, Folder, ClipboardCheck, ArrowRight, X,
  RotateCcw, Check, Sparkles, Copy, PlusIcon, Pencil, Package,
  MessageCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

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
  return (
    <AuthGuard requiredRole="profesional">
      <PresupuestadorObrasContent />
    </AuthGuard>
  );
}

function PresupuestadorObrasContent() {
  const router = useRouter();
  const { user, profile } = useAuth();

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

  // --- FORMULARIO MANO DE OBRA MANUAL (con autocompletar + ratios de materiales) ---
  const [newItemNombre, setNewItemNombre] = useState('');
  const [newItemUnidad, setNewItemUnidad] = useState('m²');
  const [newItemPrecio, setNewItemPrecio] = useState<number>(2000);
  const [newItemCantidad, setNewItemCantidad] = useState<number>(1);
  const [showRatiosForm, setShowRatiosForm] = useState(false);
  const [itemRatios, setItemRatios] = useState<{ name: string; factor: number; unit: string }[]>([]);
  const [newRatioNombre, setNewRatioNombre] = useState('');
  const [newRatioFactor, setNewRatioFactor] = useState<number>(0);
  const [newRatioUnidad, setNewRatioUnidad] = useState('u.');

  // --- MODAL COMPARTIR POR WHATSAPP (configurable) ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareIncluirManoObra, setShareIncluirManoObra] = useState(true);
  const [shareIncluirMateriales, setShareIncluirMateriales] = useState(true);

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

  // --- PLAN & MODO DE PRESUPUESTADOR (PLAN GRATIS vs PRO) ---
  const [userPlan, setUserPlan] = useState<'Gratis' | 'Pro' | 'Master'>('Gratis');
  const [modoPresupuestador, setModoPresupuestador] = useState<'basico' | 'pro'>('basico');
  const [modoTabsBasico, setModoTabsBasico] = useState<'presupuesto' | 'materiales'>('presupuesto');

  // --- ESTADOS PRESUPUESTADOR BÁSICO ---
  const [tituloBasico, setTituloBasico] = useState('Presupuesto de Obra');
  const [clienteBasico, setClienteBasico] = useState('');
  const [itemsBasico, setItemsBasico] = useState<any[]>([
    { id: '1', concepto: 'Mano de Obra / Servicio principal', cantidad: 1, unidad: 'Global', precioUnitario: 35000 },
    { id: '2', concepto: 'Materiales e insumos para trabajo', cantidad: 1, unidad: 'Global', precioUnitario: 18000 }
  ]);

  // --- HYDRATION STATES ---
  const [refNo, setRefNo] = useState(1000);
  const [fechaStr, setFechaStr] = useState('');

  useEffect(() => {
    setRefNo(Math.floor(Math.random() * 9000) + 1000);
    setFechaStr(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Plan real del perfil (antes se leía de una key de localStorage
    // paralela que solo se llenaba si el usuario había pasado por
    // Configuración -- quedaba en "Gratis" para cualquier otro).
    if (profile?.plan === 'Pro' || profile?.plan === 'Master') {
      setUserPlan(profile.plan);
      setModoPresupuestador('pro');
    } else {
      setUserPlan('Gratis');
      setModoPresupuestador('basico');
    }
    if (profile?.nombre) setPrintNombrePro(profile.nombre);

    const cargarDatos = async () => {
      const [calcs, presupuestosGuardados] = await Promise.all([
        dbHelper.getCalculadoras(user.id),
        dbHelper.getPresupuestos(user.id),
      ]);
      if (calcs && calcs.length > 0) {
        setCalculadoras(calcs);
      } else {
        setCalculadoras(DEFAULT_CALCULADORAS);
        dbHelper.saveCalculadoras(user.id, DEFAULT_CALCULADORAS);
      }
      setHistorialPresupuestos(presupuestosGuardados);
    };
    cargarDatos();
  }, [user?.id, profile]);

  const addItemBasico = () => {
    setItemsBasico(prev => [
      ...prev,
      { id: Date.now().toString(), concepto: '', cantidad: 1, unidad: 'Unidad', precioUnitario: 0 }
    ]);
  };

  const updateItemBasico = (id: string, field: string, value: any) => {
    setItemsBasico(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteItemBasico = (id: string) => {
    setItemsBasico(prev => prev.filter(item => item.id !== id));
  };

  const totalBasico = useMemo(() => {
    return itemsBasico.reduce((acc, item) => acc + (Number(item.cantidad || 0) * Number(item.precioUnitario || 0)), 0);
  }, [itemsBasico]);

  const handleShareWhatsAppBasico = () => {
    let text = `📋 *${tituloBasico.toUpperCase()}* — OficiosYa\n`;
    text += `👤 *Emisor:* ${printNombrePro || 'Profesional'}\n`;
    if (clienteBasico) text += `👤 *Cliente:* ${clienteBasico}\n`;
    text += `-----------------------------------\n`;
    text += `*${modoTabsBasico === 'presupuesto' ? 'DETALLE DEL PRESUPUESTO' : 'LISTA DE MATERIALES'}*\n`;

    itemsBasico.forEach((item, i) => {
      if (modoTabsBasico === 'presupuesto') {
        const sub = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0);
        text += `${i + 1}. ${item.concepto || 'Item'} (${item.cantidad} ${item.unidad}) — $${sub.toLocaleString('es-AR')}\n`;
      } else {
        text += `${i + 1}. ${item.concepto || 'Material'} (${item.cantidad} ${item.unidad})\n`;
      }
    });

    text += `-----------------------------------\n`;
    if (modoTabsBasico === 'presupuesto') {
      text += `💰 *TOTAL ESTIMADO:* $${totalBasico.toLocaleString('es-AR')}\n`;
    }
    text += `\n_Presupuesto generado con OficiosYa_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareChatBasico = () => {
    let text = `📋 *${tituloBasico.toUpperCase()}* — OficiosYa\n`;
    text += `👤 *Emisor:* ${printNombrePro || 'Profesional'}\n`;
    if (clienteBasico) text += `👤 *Cliente:* ${clienteBasico}\n`;
    text += `\n*Detalle:*\n`;
    itemsBasico.forEach((item, i) => {
      const sub = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0);
      text += `• ${item.concepto || 'Item'} (${item.cantidad} ${item.unidad}) - $${sub.toLocaleString('es-AR')}\n`;
    });
    if (modoTabsBasico === 'presupuesto') {
      text += `\n💰 *Total:* $${totalBasico.toLocaleString('es-AR')}`;
    }

    navigator.clipboard.writeText(text);
    alert('¡Presupuesto copiado al portapapeles! Abrí tu chat con el cliente para pegarlo y enviarlo.');
    router.push('/chat');
  };

  const updateAndSaveCalculadoras = (newList: any[]) => {
    setCalculadoras(newList);
    if (user?.id) dbHelper.saveCalculadoras(user.id, newList);
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

  // Busca en el catálogo personal (calculadoras) un ítem por nombre exacto, sin
  // distinguir mayúsculas/emoji -- es la base del autocompletar.
  const buscarEnCatalogo = (nombre: string) => {
    const limpio = nombre.trim().toLowerCase();
    if (!limpio) return null;
    return calculadoras.find((c: any) => c.nombre.replace(/^[^\w\s]+\s*/u, '').trim().toLowerCase() === limpio) || null;
  };

  const handleNombreManoObraChange = (val: string) => {
    setNewItemNombre(val);
    const match = buscarEnCatalogo(val);
    if (match) {
      setNewItemPrecio(match.manoObra || 0);
      setNewItemUnidad(match.unidad || 'u.');
      setItemRatios(match.items || []);
      setShowRatiosForm(false);
    }
  };

  const handleAddRatio = () => {
    if (!newRatioNombre.trim()) return;
    setItemRatios(prev => [...prev, { name: newRatioNombre, factor: newRatioFactor, unit: newRatioUnidad }]);
    setNewRatioNombre('');
    setNewRatioFactor(0);
  };

  const handleRemoveRatio = (idx: number) => {
    setItemRatios(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddManualManoObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNombre.trim()) return;
    const cantidad = newItemCantidad || 1;
    const materiales: Record<string, number> = {};
    itemRatios.forEach(r => {
      if (r.name.trim()) materiales[r.name] = Math.ceil(cantidad * r.factor);
    });
    const nuevoItem = {
      id: 'man_' + Date.now(),
      nombre: newItemNombre,
      cantidad,
      unidad: newItemUnidad,
      precioUnitario: newItemPrecio,
      materiales
    };
    setPresupuestoManoObra([...presupuestoManoObra, nuevoItem]);

    // Aprendizaje: si el nombre es nuevo, lo guardamos en el catálogo
    // personal para que la próxima vez aparezca en el autocompletar. Si ya
    // existía, no lo pisamos -- un precio puntual de este trabajo no debe
    // ensuciar la tarifa general del profesional.
    if (!buscarEnCatalogo(newItemNombre)) {
      const nuevaCalc = {
        id: 'custom_' + Date.now(),
        nombre: newItemNombre,
        tipo: 'unidades' as const,
        unidad: newItemUnidad,
        cantidad: 10,
        manoObra: newItemPrecio,
        items: itemRatios.filter(r => r.name.trim()),
      };
      updateAndSaveCalculadoras([...calculadoras, nuevaCalc]);
    }

    setNewItemNombre('');
    setNewItemPrecio(2000);
    setNewItemCantidad(1);
    setItemRatios([]);
    setShowRatiosForm(false);
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
  const handleOpenSaveModal = async () => {
    const existingClientes = user?.id ? await dbHelper.getClientes(user.id) : [];
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
      const existingClientes = listaClientesExistentes;

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
        if (user?.id) dbHelper.saveCliente(newCliente, user.id);
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

      if (user?.id) dbHelper.saveObra(newObra, user.id);
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

    if (user?.id) dbHelper.savePresupuesto(nuevoPresupuesto, user.id);
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
      dbHelper.deletePresupuesto(id);
      setHistorialPresupuestos(historialPresupuestos.filter(p => p.id !== id));
    }
  };

  // --- COMPARTIR POR WHATSAPP, CONFIGURABLE (mano de obra / materiales / ambos) ---
  const buildTextoManoObra = () => {
    let mensaje = `*Mano de Obra*\n---------------------------\n`;
    presupuestoManoObra.forEach(i => {
      mensaje += `• ${i.nombre} (${i.cantidad} ${i.unidad}) — $${Math.round(i.cantidad * i.precioUnitario).toLocaleString()}\n`;
    });
    mensaje += `---------------------------\n*Total Mano de Obra: $${Math.round(subtotalManoObra).toLocaleString()}*\n`;
    return mensaje;
  };

  const buildTextoMateriales = () => {
    let mensaje = `*Lista de Materiales*\n---------------------------\n`;
    listaMaterialesUnificada.filter(i => i.cantidad > 0).forEach(i => {
      const totalItem = Math.round(i.cantidad * i.precioUnitario);
      mensaje += `• ${i.nombre}: ${i.cantidad} ${i.unidad}${totalItem > 0 ? ` — $${totalItem.toLocaleString()}` : ''}\n`;
    });
    mensaje += `---------------------------\n`;
    if (subtotalMateriales > 0) mensaje += `*Total Materiales: $${Math.round(subtotalMateriales).toLocaleString()}*\n`;
    return mensaje;
  };

  const handleConfirmShareWhatsApp = () => {
    let mensaje = `*${presupuestoNombre}*\n`;
    if (clienteNombre) mensaje += `Cliente: ${clienteNombre}\n`;
    mensaje += `\n`;
    if (shareIncluirManoObra) mensaje += buildTextoManoObra() + '\n';
    if (shareIncluirMateriales) mensaje += buildTextoMateriales() + '\n';
    mensaje += `_Presupuesto generado con OficiosYa_`;
    const url = `https://wa.me/${clienteTelefono ? '54' + clienteTelefono : ''}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  const handleOpenShareModal = (incluirMO: boolean, incluirMat: boolean) => {
    setShareIncluirManoObra(incluirMO);
    setShareIncluirMateriales(incluirMat);
    setShowShareModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white pb-8 print:bg-white print:p-0 print:text-black">

      {/* TopAppBar */}
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shadow-xl print:hidden">
        <button onClick={() => router.push('/panel-profesional')} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-[#fc8127] to-amber-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Presupuestador de Obras</h1>
            <p className="text-[10px] text-slate-400">Mano de obra, materiales y presupuestos</p>
          </div>
        </div>
        <button onClick={() => router.push('/notificaciones')} className="text-slate-400 hover:bg-slate-800 p-2 rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#001529]"></span>
        </button>
      </header>

      {/* PRINT-ONLY DOCUMENT */}
      <div className="hidden print:block w-full text-black">
        {modoPresupuestador === 'basico' ? (
          /* PLANTILLA DE IMPRESIÓN BÁSICA (PLAN GRATIS) */
          <div>
            <div className="flex justify-between items-start border-b-4 border-[#00355f] pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <img src="/mascot.png" alt="Mascota" className="w-12 h-12 object-contain" />
                  <span className="text-2xl font-black text-[#00355f] tracking-tight">Oficios<span className="text-[#fc8127]">Ya</span></span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Presupuestos y Listas de Materiales</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-extrabold">Fecha: {fechaStr}</p>
                <p className="text-gray-500 mt-0.5">Nº Ref: #{refNo}</p>
              </div>
            </div>

            <div className="text-center my-6">
              <h1 className="text-2xl font-black uppercase tracking-wider text-[#00355f] border-y border-gray-200 py-2">
                {modoTabsBasico === 'presupuesto' ? (tituloBasico || 'PRESUPUESTO DE OBRA').toUpperCase() : 'LISTA DE MATERIALES E INSUMOS'}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-8 my-6 bg-slate-50 p-4 rounded-2xl border border-gray-150">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Profesional Emisor</p>
                <p className="text-base font-black text-[#00355f] mt-1">{printNombrePro}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Presupuestado Para</p>
                <p className="text-base font-black text-gray-900 mt-1">{clienteBasico || 'Consumidor Final'}</p>
              </div>
            </div>

            <div className="my-8">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-gray-300">
                    <th className="py-2.5 px-3 font-bold text-gray-600">Concepto / Material</th>
                    <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Cantidad / Unidad</th>
                    {modoTabsBasico === 'presupuesto' && (
                      <>
                        <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Precio Unitario</th>
                        <th className="py-2.5 px-3 font-bold text-gray-600 text-right">Subtotal</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemsBasico.map((item, idx) => {
                    const sub = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0);
                    return (
                      <tr key={idx} className="border-b border-gray-150">
                        <td className="py-2.5 px-3 font-bold text-gray-800">{item.concepto || 'Item sin nombre'}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{item.cantidad} {item.unidad}</td>
                        {modoTabsBasico === 'presupuesto' && (
                          <>
                            <td className="py-2.5 px-3 text-right text-gray-600">${Number(item.precioUnitario || 0).toLocaleString('es-AR')}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-900">${sub.toLocaleString('es-AR')}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {modoTabsBasico === 'presupuesto' && (
              <div className="flex justify-end mt-6">
                <div className="w-72 space-y-2 text-right bg-slate-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between pt-1">
                    <span className="text-base text-gray-900 font-extrabold">Total General:</span>
                    <span className="text-xl font-black text-green-600">${totalBasico.toLocaleString('es-AR')}</span>
                  </div>
                </div>
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
                <p className="text-xs font-bold text-gray-700 mt-0.5">{clienteBasico || 'Consumidor Final'}</p>
              </div>
            </div>
          </div>
        ) : (
          /* PLANTILLA DE IMPRESIÓN PRO FLEX */
          <div>
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
              <h1 className="text-3xl font-black uppercase tracking-wider text-[#00355f] border-y border-gray-200 py-2">PRESUPUESTO DE OBRA</h1>
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
        )}
      </div>

      {/* SCREEN VIEWPORT */}
      <main className="px-4 md:px-8 py-6 max-w-6xl mx-auto w-full print:hidden">

        {/* Selector de Modo: Básico (Plan Gratis) vs Pro Flex */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#001529] border border-slate-800 p-4 md:p-6 rounded-3xl shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#fc8127]/10 rounded-2xl flex items-center justify-center text-[#fc8127]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                {modoPresupuestador === 'basico' ? 'Presupuestador Básico' : 'Presupuestador de Obras Pro Flex'}
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  modoPresupuestador === 'basico' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#fc8127]/10 text-[#fc8127]'
                }`}>
                  {modoPresupuestador === 'basico' ? 'Plan Gratis' : 'Plan Pro'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {modoPresupuestador === 'basico'
                  ? 'Generá presupuestos o listas de materiales para enviar por WhatsApp, chat o PDF.'
                  : 'Cómputos automáticos por m² y módulos avanzados de mano de obra e insumos.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-2xl text-xs font-bold w-full md:w-auto">
            <button
              onClick={() => setModoPresupuestador('basico')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition-all ${
                modoPresupuestador === 'basico' ? 'bg-[#00355f] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Presupuestador Básico
            </button>
            <button
              onClick={() => {
                if (userPlan === 'Pro' || userPlan === 'Master') {
                  setModoPresupuestador('pro');
                } else {
                  alert('El Presupuestador de Obras por m² y módulos avanzados pertenece a los Planes Pro / Master. Podés actualizar tu plan en la sección Planes.');
                  router.push('/planes');
                }
              }}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modoPresupuestador === 'pro' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Presupuestador Pro
            </button>
          </div>
        </div>

        {modoPresupuestador === 'basico' ? (
          /* VISTA PRESUPUESTADOR BÁSICO (PLAN GRATIS) */
          <div className="space-y-8">
            
            {/* Pestañas Arriba: Presupuesto vs Lista de Materiales */}
            <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setModoTabsBasico('presupuesto')}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  modoTabsBasico === 'presupuesto' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Presupuesto
              </button>
              <button
                onClick={() => setModoTabsBasico('materiales')}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  modoTabsBasico === 'materiales' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                Lista de Materiales
              </button>
            </div>

            {/* Cabecera del Documento Básico */}
            <div className="bg-[#001529] border border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre del Presupuesto / Trabajo</label>
                  <input
                    type="text"
                    value={tituloBasico}
                    onChange={(e) => setTituloBasico(e.target.value)}
                    placeholder="Ej: Instalación de Baño y Cañerías"
                    className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700 rounded-xl font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fc8127] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cliente / Destinatario (Opcional)</label>
                  <input
                    type="text"
                    value={clienteBasico}
                    onChange={(e) => setClienteBasico(e.target.value)}
                    placeholder="Ej: Sra. María Gómez"
                    className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700 rounded-xl font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fc8127] transition-all text-sm"
                  />
                </div>
              </div>

              {/* Ficha Emisor Auto-completado */}
              <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00355f] text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                  {printNombrePro.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-blue-300/80 font-semibold uppercase">Profesional Emisor (Auto-completado)</p>
                  <p className="text-sm font-black text-white">{printNombrePro || 'Profesional de OficiosYa'}</p>
                </div>
              </div>

              {/* Tabla de Ítems / Materiales */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-300 text-xs uppercase tracking-wider">
                    {modoTabsBasico === 'presupuesto' ? 'Ítems del Presupuesto' : 'Materiales e Insumos'}
                  </h3>
                  <button
                    onClick={addItemBasico}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#fc8127] hover:text-white bg-[#fc8127]/10 hover:bg-[#fc8127] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Ítem
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase">
                        <th className="py-3 px-3">Concepto / Material</th>
                        <th className="py-3 px-3 w-28 text-center">Cantidad</th>
                        <th className="py-3 px-3 w-36">Unidad</th>
                        {modoTabsBasico === 'presupuesto' && (
                          <>
                            <th className="py-3 px-3 w-36 text-right">Precio Unit ($)</th>
                            <th className="py-3 px-3 w-36 text-right">Subtotal ($)</th>
                          </>
                        )}
                        <th className="py-3 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {itemsBasico.map((item) => {
                        const sub = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.concepto}
                                onChange={(e) => updateItemBasico(item.id, 'concepto', e.target.value)}
                                placeholder="Ej. Instalación de cañerías"
                                className="w-full px-3 py-2 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fc8127]"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => updateItemBasico(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-2 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-center text-white focus:outline-none focus:ring-2 focus:ring-[#fc8127]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={item.unidad}
                                onChange={(e) => updateItemBasico(item.id, 'unidad', e.target.value)}
                                className="w-full px-2 py-2 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#fc8127]"
                              >
                                <option value="Unidad">Unidad</option>
                                <option value="Metros">Metros</option>
                                <option value="m²">m²</option>
                                <option value="m³">m³</option>
                                <option value="Litros">Litros</option>
                                <option value="Bolsas">Bolsas</option>
                                <option value="Horas">Horas</option>
                                <option value="Global">Global</option>
                              </select>
                            </td>
                            {modoTabsBasico === 'presupuesto' && (
                              <>
                                <td className="py-2.5 px-3 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.precioUnitario}
                                    onChange={(e) => updateItemBasico(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                    className="w-28 px-2 py-2 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-right text-white focus:outline-none focus:ring-2 focus:ring-[#fc8127]"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-right font-black text-white text-xs">
                                  ${sub.toLocaleString('es-AR')}
                                </td>
                              </>
                            )}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => deleteItemBasico(item.id)}
                                className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {modoTabsBasico === 'presupuesto' && (
                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-right space-y-1 min-w-[240px]">
                      <span className="text-xs text-slate-400 font-bold uppercase block">Total del Presupuesto</span>
                      <span className="text-2xl font-black text-emerald-400">${totalBasico.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Exportar / Compartir */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleShareWhatsAppBasico}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir por WhatsApp
                  </button>

                  <button
                    onClick={handleShareChatBasico}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4 text-[#fc8127]" />
                    Enviar por Chat
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Descargar PDF / Imprimir
                </button>
              </div>

            </div>

            {/* Banner CTA Promocional Pro */}
            <div className="bg-gradient-to-r from-[#fc8127]/10 to-amber-500/5 border border-[#fc8127]/20 p-6 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#fc8127]" />
                  <h4 className="font-extrabold text-base">¿Querés automatizar cómputos por m² y guardar obras sin límites?</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Con los Planes Pro y Master accedés a calculadoras inteligentes para muros, losas, pintura y presupuestador de obras.
                </p>
              </div>
              <button
                onClick={() => router.push('/planes')}
                className="bg-[#fc8127] hover:bg-[#e06d19] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shrink-0 transition-all shadow-sm"
              >
                Conocer Plan Pro
              </button>
            </div>

          </div>
        ) : (
          /* VISTA PRESUPUESTADOR PRO FLEX */
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Presupuestador de Obras
                  <span className="text-xs font-black bg-[#fc8127]/10 text-[#fc8127] px-2 py-0.5 rounded-full uppercase">Flex</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">Calculador de materiales con módulos personalizables y agregables.</p>
              </div>
              <button
                onClick={() => setActiveTab('presupuestador')}
                className="flex items-center gap-2 bg-[#fc8127] hover:bg-[#e67320] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <ClipboardCheck className="w-4 h-4" />
                Ver Presupuesto ({presupuestoManoObra.length + presupuestoMateriales.length})
              </button>
            </div>

            {/* Tabs Pro */}
            <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-2xl mb-6 w-fit overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('calculadoras')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all uppercase flex items-center gap-2 shrink-0 ${activeTab === 'calculadoras' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Calculator className="w-4 h-4" />
                Calculadoras de Insumos
              </button>
              <button
                onClick={() => setActiveTab('presupuestador')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all uppercase flex items-center gap-2 shrink-0 ${activeTab === 'presupuestador' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Folder className="w-4 h-4" />
                Presupuesto & Ítems ({presupuestoManoObra.length + presupuestoMateriales.length})
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all uppercase flex items-center gap-2 shrink-0 ${activeTab === 'historial' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
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
              <div className="bg-[#001529] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 lg:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Módulos de Cómputo</span>
                  <button onClick={handleResetToStandard} className="text-[9px] text-slate-500 hover:text-red-400 font-bold" title="Restablece las calculadoras de fábrica">
                    Restablecer
                  </button>
                </div>
                <div className="space-y-2">
                  {calculadoras.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => { setActiveCalculatorId(c.id); setShowRendimientoConfig(false); }}
                      className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex justify-between items-center ${activeCalculatorId === c.id ? 'border-[#fc8127] bg-[#fc8127]/10 shadow-sm' : 'border-slate-800 hover:border-slate-700 bg-slate-800/30'}`}
                    >
                      <div>
                        <p className="font-extrabold text-sm text-white">{c.nombre}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Cálculo por {c.unidad}</p>
                      </div>
                      {c.id !== 'muro' && c.id !== 'losa' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCalculator(c.id); }}
                          className="text-red-400 hover:text-red-300 p-2 print:hidden"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowCreateCalcModal(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4 text-[#fc8127]" />
                  Crear Nueva Calculadora
                </button>
              </div>

              {/* Right Columns: Active calculator */}
              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Calculator inputs */}
                <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-white">{activeCalc.nombre}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Calculando mano de obra y materiales por {activeCalc.unidad}</p>
                    </div>
                    <button
                      onClick={() => setShowRendimientoConfig(!showRendimientoConfig)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${showRendimientoConfig ? 'bg-[#fc8127]/10 border-[#fc8127]/30 text-[#fc8127]' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      {showRendimientoConfig ? 'Ocultar Insumos' : 'Ajustar Insumos'}
                    </button>
                  </div>

                  {showRendimientoConfig && (
                    <div className="bg-[#fc8127]/5 border border-[#fc8127]/20 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
                      <div>
                        <p className="text-xs font-extrabold text-white">🛠️ Dosificación de Materiales (Rendimiento por 1 {activeCalc.unidad})</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Editá las proporciones por cada unidad de cómputo.</p>
                      </div>
                      <div className="space-y-2">
                        {activeCalc.items && activeCalc.items.length === 0 ? (
                          <p className="text-xs text-slate-500 italic text-center py-4">No hay materiales agregados a este módulo.</p>
                        ) : (
                          activeCalc.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-slate-800/40 border border-slate-700 rounded-xl">
                              <span className="text-xs font-bold text-slate-200">{item.name}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number" step="any" value={item.factor}
                                  onChange={(e) => handleUpdateInsumoFactor(idx, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-8 text-center bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:ring-2 focus:ring-[#fc8127] outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-bold w-12">{item.unit}</span>
                                <button onClick={() => handleDeleteInsumo(idx)} className="text-red-400 hover:text-red-300 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="pt-3 border-t border-[#fc8127]/20 space-y-3">
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">Añadir otro material al cálculo:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400">Nombre del material</label>
                            <input type="text" placeholder="Ej: Cal, Pegamento..." value={newInsumoNombre} onChange={(e) => setNewInsumoNombre(e.target.value)} className="h-9 px-3 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#fc8127] outline-none" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400">Consumo por {activeCalc.unidad}</label>
                            <input type="number" step="any" value={newInsumoFactor} onChange={(e) => setNewInsumoFactor(parseFloat(e.target.value) || 0)} className="h-9 px-3 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-white focus:ring-2 focus:ring-[#fc8127] outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1 flex-1">
                              <label className="text-[9px] font-bold text-slate-400">Unidad</label>
                              <input type="text" value={newInsumoUnidad} onChange={(e) => setNewInsumoUnidad(e.target.value)} className="h-9 px-3 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-white focus:ring-2 focus:ring-[#fc8127] outline-none" />
                            </div>
                            <button type="button" onClick={handleAddNewInsumo} className="bg-[#fc8127] text-white px-3 h-9 rounded-lg font-bold text-xs shadow hover:bg-[#e67320]">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {activeCalc.tipo === 'area' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Largo (metros)</label>
                          <input type="number" value={activeCalc.largo ?? 4} onChange={(e) => handleUpdateCalcField('largo', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Alto / Ancho (metros)</label>
                          <input type="number" value={activeCalc.alto ?? 3} onChange={(e) => handleUpdateCalcField('alto', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Aberturas a descontar ({activeCalc.unidad})</label>
                          <input type="number" value={activeCalc.aberturas ?? 0} onChange={(e) => handleUpdateCalcField('aberturas', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" placeholder="Ej: Puertas o ventanas" />
                        </div>
                      </div>
                    )}
                    {activeCalc.tipo === 'volumen' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Largo (metros)</label>
                          <input type="number" value={activeCalc.largo ?? 5} onChange={(e) => handleUpdateCalcField('largo', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Ancho (metros)</label>
                          <input type="number" value={activeCalc.ancho ?? 4} onChange={(e) => handleUpdateCalcField('ancho', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Espesor (centímetros)</label>
                          <input type="number" value={activeCalc.espesor ?? 10} onChange={(e) => handleUpdateCalcField('espesor', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" />
                        </div>
                      </div>
                    )}
                    {activeCalc.tipo === 'unidades' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400">Cantidad Total ({activeCalc.unidad})</label>
                        <input type="number" value={activeCalc.cantidad ?? 10} onChange={(e) => handleUpdateCalcField('cantidad', parseFloat(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-white" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-400">Mano de Obra por unidad {activeCalc.unidad} (ARS)</label>
                      <input type="number" value={activeCalc.manoObra || 0} onChange={(e) => handleUpdateCalcField('manoObra', parseInt(e.target.value) || 0)} className="h-11 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-emerald-400" />
                    </div>
                  </div>

                  {activeCalculatorId === 'muro' && (
                    <div className="space-y-2 mt-4">
                      <span className="text-xs font-bold text-slate-400">Representación del Muro:</span>
                      <div className="h-40 w-full">{renderSVGWall()}</div>
                    </div>
                  )}
                </div>

                {/* Results card */}
                <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 shadow-md space-y-6 lg:col-span-1">
                  <div>
                    <h4 className="text-lg font-black text-white">Insumos Calculados</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Módulo: {activeCalc.nombre}</p>
                    <p className="text-xs text-[#fc8127] font-black mt-1">Cómputo Neto: {activeCalculos.cantidad.toFixed(2)} {activeCalc.unidad}</p>
                  </div>
                  <div className="space-y-4">
                    {Object.keys(activeCalculos.materiales).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No hay materiales asociados al cálculo.</p>
                    ) : (
                      Object.entries(activeCalculos.materiales).map(([name, val], idx) => {
                        const itemData = activeCalc.items.find((i: any) => i.name === name);
                        const unitLabel = itemData ? itemData.unit : 'unid.';
                        return (
                          <div key={idx} className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <span className="text-xs text-slate-400 font-medium">{name}</span>
                            <span className="font-black text-white text-sm">{val} {unitLabel}</span>
                          </div>
                        );
                      })
                    )}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 pt-1">
                      <span className="text-xs text-slate-400 font-medium">Mano de Obra Subtotal</span>
                      <span className="font-black text-emerald-400 text-base">${Math.round(activeCalculos.manoObraTotal).toLocaleString()}</span>
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
                <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span className="w-2 h-5 bg-[#fc8127] rounded-full inline-block"></span>
                      Mano de Obra
                    </h4>
                    <button
                      onClick={() => { setPresupuestoManoObra([]); setMaterialesEditados(null); }}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Vaciar
                    </button>
                  </div>

                  {presupuestoManoObra.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-medium text-sm bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                      Sin ítems de mano de obra. Calculá módulos o agregá manualmente.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {presupuestoManoObra.map((item) => (
                        <div key={item.id} className="bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all overflow-hidden">
                          {editingManoObraId === item.id ? (
                            // MODO EDICIÓN
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre del servicio</label>
                                  <input
                                    type="text" value={editMONombre} onChange={(e) => setEditMONombre(e.target.value)}
                                    className="h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-[#fc8127] outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Precio unitario (ARS)</label>
                                  <input
                                    type="number" value={editMOPrecio} onChange={(e) => setEditMOPrecio(parseInt(e.target.value) || 0)}
                                    className="h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 focus:ring-2 focus:ring-[#fc8127] outline-none"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cantidad</label>
                                  <input
                                    type="number" step="any" value={editMOCantidad} onChange={(e) => setEditMOCantidad(parseFloat(e.target.value) || 0)}
                                    className="h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-[#fc8127] outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Unidad</label>
                                  <input
                                    type="text" value={editMOUnidad} onChange={(e) => setEditMOUnidad(e.target.value)}
                                    className="h-9 px-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-[#fc8127] outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handleSaveEditManoObra(item.id)}
                                  className="flex-1 bg-[#fc8127] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" /> Guardar
                                </button>
                                <button
                                  onClick={() => setEditingManoObraId(null)}
                                  className="flex-1 bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-bold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            // MODO VISTA
                            <div className="flex justify-between items-center gap-4 p-4">
                              <div className="min-w-0 flex-1">
                                <p className="font-extrabold text-sm text-white truncate">{item.nombre}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                  {item.cantidad} {item.unidad} @ ${item.precioUnitario.toLocaleString()} c/u
                                  {item.materiales && Object.keys(item.materiales).length > 0 && (
                                    <span className="ml-1.5 text-blue-400">· {Object.keys(item.materiales).length} materiales</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number" value={item.cantidad} min="0" step="any"
                                  onChange={(e) => handleUpdateManoObraCantidad(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-8 text-center bg-slate-900 border border-slate-700 rounded-lg text-xs font-extrabold text-white"
                                />
                                <span className="text-xs text-slate-400 font-bold hidden sm:block">{item.unidad}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-extrabold text-sm text-white">${Math.round(item.cantidad * item.precioUnitario).toLocaleString()}</p>
                                <div className="flex items-center gap-2 justify-end mt-1">
                                  <button
                                    onClick={() => handleStartEditManoObra(item)}
                                    className="text-blue-400 hover:text-blue-300 p-1"
                                    title="Editar ítem"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteManoObraItem(item.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
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

                  {/* Formulario agregar mano de obra manual: con autocompletar del catálogo personal
                      y materiales por unidad (se calculan solos y se guardan para la próxima vez). */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agregar ítem de mano de obra:</p>
                    <form onSubmit={handleAddManualManoObra} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400">Descripción del servicio</label>
                          <input
                            type="text" value={newItemNombre} onChange={(e) => handleNombreManoObraChange(e.target.value)}
                            placeholder="Ej: Colocación de cerámico"
                            list="catalogo-mano-obra"
                            className="h-10 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-white placeholder:text-slate-500"
                          />
                          <datalist id="catalogo-mano-obra">
                            {calculadoras.map((c: any) => (
                              <option key={c.id} value={c.nombre.replace(/^[^\w\s]+\s*/u, '').trim()} />
                            ))}
                          </datalist>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Cantidad</label>
                          <input
                            type="number" step="any" min="0" value={newItemCantidad} onChange={(e) => setNewItemCantidad(parseFloat(e.target.value) || 0)}
                            className="h-10 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400">Unidad</label>
                          <input
                            type="text" value={newItemUnidad} onChange={(e) => setNewItemUnidad(e.target.value)}
                            placeholder="m², u., ml..."
                            className="h-10 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400">Precio por {newItemUnidad || 'unidad'} (ARS)</label>
                          <input
                            type="number" value={newItemPrecio} onChange={(e) => setNewItemPrecio(parseInt(e.target.value) || 0)}
                            className="h-10 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-emerald-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRatiosForm(!showRatiosForm)}
                          className={`h-10 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 border ${
                            showRatiosForm || itemRatios.length > 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" /> Materiales por unidad {itemRatios.length > 0 ? `(${itemRatios.length})` : ''}
                        </button>
                        <button type="submit" className="bg-[#fc8127] hover:bg-[#e67320] text-white h-10 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1">
                          <PlusCircle className="w-4 h-4" /> Agregar
                        </button>
                      </div>

                      {showRatiosForm && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <p className="text-[10px] text-slate-400">
                            Materiales que se calculan solos por cada {newItemUnidad || 'unidad'} de <strong className="text-slate-200">{newItemNombre || 'este ítem'}</strong>. Se guardan en tu catálogo para la próxima vez.
                          </p>
                          {itemRatios.length > 0 && (
                            <div className="space-y-2">
                              {itemRatios.map((r, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-slate-800/40 border border-slate-700 rounded-xl">
                                  <span className="text-xs font-bold text-slate-200">{r.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-blue-400 font-bold">{r.factor} {r.unit} / {newItemUnidad || 'u.'}</span>
                                    <button type="button" onClick={() => handleRemoveRatio(idx)} className="text-red-400 hover:text-red-300 p-1">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-400">Material</label>
                              <input type="text" placeholder="Ej: Pegamento" value={newRatioNombre} onChange={(e) => setNewRatioNombre(e.target.value)} className="h-9 px-3 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-white placeholder:text-slate-500 outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-400">Cantidad por {newItemUnidad || 'unidad'}</label>
                              <input type="number" step="any" value={newRatioFactor} onChange={(e) => setNewRatioFactor(parseFloat(e.target.value) || 0)} className="h-9 px-3 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[9px] font-bold text-slate-400">Unidad del material</label>
                                <input type="text" value={newRatioUnidad} onChange={(e) => setNewRatioUnidad(e.target.value)} className="h-9 px-3 bg-slate-800/40 border border-slate-700 rounded-lg text-xs font-bold text-white outline-none" />
                              </div>
                              <button type="button" onClick={handleAddRatio} className="bg-blue-500 text-white px-3 h-9 rounded-lg font-bold text-xs shadow hover:bg-blue-600">+</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Subtotal MO + Botones */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase">Subtotal Mano de Obra:</span>
                      <span className="ml-2 text-lg font-black text-emerald-400">${Math.round(subtotalManoObra).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenShareModal(true, false)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button
                        onClick={() => { setPrintIncluirManoObra(true); setPrintIncluirMateriales(false); setPrintIncluirMatCalculados(false); setShowPrintModal(true); }}
                        className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===== SECCIÓN MATERIALES ===== */}
                <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span className="w-2 h-5 bg-blue-500 rounded-full inline-block"></span>
                      Lista de Materiales
                    </h4>
                    {listaMaterialesUnificada.length > 0 && (
                      <button
                        onClick={() => setPresupuestoMateriales([])}
                        className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Vaciar
                      </button>
                    )}
                  </div>

                  {listaMaterialesUnificada.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-medium text-sm bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                      Sin materiales. Al cargar Mano de Obra (con materiales por unidad) o agregar desde el catálogo sugerido se sumarán aquí.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Cabecera de columnas */}
                      <div className="hidden sm:grid grid-cols-12 gap-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <span className="col-span-6">Material / Insumo</span>
                        <span className="col-span-3 text-center">Cantidad</span>
                        <span className="col-span-2 text-center">Unidad / Mts</span>
                        <span className="col-span-1"></span>
                      </div>
                      {listaMaterialesUnificada.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-blue-500/40 transition-all">
                          <div className="col-span-12 sm:col-span-6 min-w-0 flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white truncate">{item.nombre}</span>
                            {item.isAuto && (
                              <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase shrink-0">MO</span>
                            )}
                          </div>
                          <div className="col-span-6 sm:col-span-3 flex justify-center">
                            <input
                              type="number" step="any" min="0" value={item.cantidad}
                              onChange={(e) => handleUpdateMaterialCantidad(item.id, parseFloat(e.target.value) || 0)}
                              className="w-full h-9 text-center bg-slate-900 border border-slate-700 rounded-xl text-xs font-extrabold text-white focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            <select
                              value={item.unidad || 'u.'}
                              onChange={(e) => handleUpdateMaterialUnidad(item.id, e.target.value)}
                              className="w-full h-9 px-2 text-center bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
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
                            <button onClick={() => handleDeleteMaterialItem(item.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Catálogo sugerido */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Añadir del catálogo sugerido:</p>
                    <div className="flex flex-wrap gap-2">
                      {CATALOGO_SUGERIDO.map(i => (
                        <button
                          key={i.id}
                          onClick={() => handleAddCatalogoItem(i)}
                          className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 transition-colors active:scale-95"
                        >
                          + {i.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formulario agregar material manual */}
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Agregar material manual:</p>
                    <form onSubmit={handleAddMaterialManual} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                      <div className="flex flex-col gap-1 sm:col-span-6">
                        <label className="text-xs font-bold text-slate-400">Nombre del material</label>
                        <input
                          type="text" value={newMatNombre} onChange={(e) => setNewMatNombre(e.target.value)}
                          placeholder="Ej: Caño PVC 110mm"
                          className="h-10 px-4 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-3">
                        <label className="text-xs font-bold text-slate-400">Cantidad</label>
                        <input
                          type="number" step="any" min="0" value={newMatCantidad} onChange={(e) => setNewMatCantidad(parseFloat(e.target.value) || 0)}
                          className="h-10 px-3 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-white text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-3">
                        <label className="text-xs font-bold text-slate-400">Unidad</label>
                        <select
                          value={newMatUnidad} onChange={(e) => setNewMatUnidad(e.target.value)}
                          className="h-10 px-2 bg-slate-800/40 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#fc8127] outline-none font-bold text-xs text-slate-200 cursor-pointer"
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
                      <button type="submit" className="sm:col-span-12 bg-[#fc8127] hover:bg-[#e67320] text-white h-10 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 mt-1">
                        <PlusCircle className="w-4 h-4" /> Agregar material
                      </button>
                    </form>
                  </div>

                  {/* Subtotal materiales + Botones */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase">Total de materiales:</span>
                      <span className="ml-2 text-sm font-extrabold text-white">
                        {listaMaterialesUnificada.filter(i => i.cantidad > 0).length} ítems en lista
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenShareModal(false, true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button
                        onClick={() => { setPrintIncluirManoObra(false); setPrintIncluirMateriales(true); setShowPrintModal(true); }}
                        className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Summary Panel */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 shadow-md space-y-6 lg:sticky lg:top-20">
                  <div>
                    <h4 className="text-lg font-black text-white">Resumen del Presupuesto</h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Mano de Obra + Lista de Materiales</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-sm text-slate-400 font-medium">Mano de Obra</span>
                      <span className="font-extrabold text-white text-base">${Math.round(subtotalManoObra).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-sm text-slate-400 font-medium">Lista de Materiales</span>
                      <span className="font-extrabold text-blue-400 text-sm">
                        {listaMaterialesUnificada.filter(i => i.cantidad > 0).length} ítems
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base text-white font-extrabold">Total General</span>
                      <span className="font-black text-emerald-400 text-2xl">${Math.round(totalGeneral).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Botones globales */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleOpenSaveModal}
                      className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Guardar y Asociar Obra
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleOpenShareModal(true, true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-4 h-4" /> WhatsApp
                      </button>
                      <button
                        onClick={() => { setPrintIncluirManoObra(true); setPrintIncluirMateriales(true); setPrintIncluirMatCalculados(true); setShowPrintModal(true); }}
                        className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
            <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-5 bg-[#fc8127] rounded-full inline-block"></span>
                Historial de Presupuestos Guardados
              </h4>
              {historialPresupuestos.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium">
                  No hay presupuestos guardados todavía. Usá el botón "Guardar y Asociar Obra" en el presupuesto.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800">
                        <th className="py-3 px-4 font-bold text-slate-300">Obra / Presupuesto</th>
                        <th className="py-3 px-4 font-bold text-slate-300">Cliente</th>
                        <th className="py-3 px-4 font-bold text-slate-300">Fecha</th>
                        <th className="py-3 px-4 font-bold text-slate-300">Total</th>
                        <th className="py-3 px-4 font-bold text-slate-300 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialPresupuestos.map((pres) => (
                        <tr key={pres.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <p className="font-extrabold text-white">{pres.nombre}</p>
                            {pres.nota && <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{pres.nota}</p>}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-300">
                            <p>{pres.cliente}</p>
                            {pres.telefono && <p className="text-xs text-slate-500">{pres.telefono}</p>}
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-slate-500">{pres.fecha}</td>
                          <td className="py-3 px-4 font-black text-emerald-400">${Math.round(pres.total).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleCargarPresupuestoHistorial(pres)}
                                className="bg-slate-800 hover:bg-[#fc8127] hover:text-white text-slate-200 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all"
                              >
                                Cargar
                              </button>
                              <button
                                onClick={() => handleEliminarPresupuestoHistorial(pres.id)}
                                className="text-red-400 hover:text-red-300 p-2"
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
      </div>
    )}
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

      {/* MODAL COMPARTIR POR WHATSAPP (configurable: mano de obra / materiales / ambos) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-[#00355f] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" /> Compartir por WhatsApp
              </h3>
              <button onClick={() => setShowShareModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Elegí qué secciones incluir en el mensaje.</p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-3">
                <input type="checkbox" checked={shareIncluirManoObra} onChange={(e) => setShareIncluirManoObra(e.target.checked)} className="w-4 h-4 text-[#fc8127] border-gray-300 rounded focus:ring-[#fc8127]" />
                <div className="text-xs">
                  <p className="font-bold text-gray-700">Mano de Obra</p>
                  <p className="text-[10px] text-gray-400">Servicios, cantidades y total</p>
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-3">
                <input type="checkbox" checked={shareIncluirMateriales} onChange={(e) => setShareIncluirMateriales(e.target.checked)} className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500" />
                <div className="text-xs">
                  <p className="font-bold text-gray-700">Lista de Materiales</p>
                  <p className="text-[10px] text-gray-400">Insumos calculados y agregados a mano</p>
                </div>
              </label>
            </div>
            <button
              onClick={handleConfirmShareWhatsApp}
              disabled={!shareIncluirManoObra && !shareIncluirMateriales}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Enviar por WhatsApp
            </button>
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
