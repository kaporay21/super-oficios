"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Camera, CheckCircle, User, ChevronRight, 
  Wrench, Settings, Shield, LogOut, LayoutDashboard, 
  Briefcase, MessageSquare, Edit2, Save, Loader2, 
  Zap, Clock, ShieldAlert, Award, Grid, Star, MapPin, Eye,
  HelpCircle, ShieldCheck, Timer, UploadCloud, X, Smartphone, Plus, Trash2, FileCheck, Key
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, HerramientasIcon } from '@/components/ModernIcons';
import Logo from '@/components/Logo';
import { uploadImageToSupabase } from '@/lib/supabaseStorage';

// Lista cerrada de oficios para estandarizar el buscador
const OFICIOS_PRECARGADOS = [
  'Aire Acondicionado',
  'Albañilería',
  'Carpintería',
  'Cerrajería',
  'Electricidad',
  'Gasista Matriculado',
  'Herrería',
  'Pintura',
  'Plomería'
];

export default function PerfilProfesionalPage() {
  const router = useRouter();
  
  // Referencias para inputs de archivos ocultos
  const fotoPerfilRef = useRef<HTMLInputElement>(null);
  const certificadoRef = useRef<HTMLInputElement>(null);
  const dniFrenteRef = useRef<HTMLInputElement>(null);
  const dniDorsoRef = useRef<HTMLInputElement>(null);

  // Estados de Configuración y Edición
  const [notificaciones, setNotificaciones] = useState(true);
  const [alertasEmpleo, setAlertasEmpleo] = useState(true);
  const [tooltipsDisabled, setTooltipsDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');

  // Estados para Ventanas Modales
  const [modalPassword, setModalPassword] = useState(false);
  const [modal2FA, setModal2FA] = useState(false);
  const [modalDevices, setModalDevices] = useState(false);
  const [modalDNI, setModalDNI] = useState(false);

  // Estados para archivos del DNI temporal
  const [dniFrenteFile, setDniFrenteFile] = useState<File | null>(null);
  const [dniDorsoFile, setDniDorsoFile] = useState<File | null>(null);

  // Estado con los datos del usuario (Roberto Gómez, profesional logueado en la simulación)
  const [perfil, setPerfil] = useState({
    nombre: 'Roberto Gómez',
    correo: 'roberto@gmail.com',
    telefono: '+54 9 381 123 4567',
    cobertura: 'Radio de 15km - San Miguel de Tucumán',
    especialidades: ['Plomería', 'Electricidad'],
    estadoDNI: 'Pendiente', // 'Pendiente', 'En Revisión', 'Validado'
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85pw1lweYxj9ZY758PmA-0PGM0q1wtL0dMOXlgKBD-eceH1UryKCy1mEoZ5jUVDHFU8WoXTd4EqiDhNzyh7eo-lvfyk9fk2EFupZ6Zvt_3y1dK2Hx72DsYSXEULFtCIOGfXFOQOyufsmHsfNTu3VL6NYRVMZ1WZzXYsCXr60o_ZHYewQ7-aozdL2YFUpmfxCHyFH4p7HMIjdTONG31bA0JhNzewarvNNZ_clLNY6vsyuFnGQL_lm3EW5Oz-SKQYNPYBh4oU178oXy',
    certificados: [
      { id: '1', nombre: 'Matrícula Gasista Profesional.pdf', archivoBase64: '' },
      { id: '2', nombre: 'Curso Especialización Electricidad.png', archivoBase64: '' }
    ],
    plan: 'Gratis',
    postulacionesUsadas: 0,
    bio: 'Soy un profesional con más de 10 años de experiencia en plomería y gas. Me especializo en instalaciones de termotanques y reparaciones de urgencia. Trabajo limpio, rápido y con garantía en todos mis arreglos.',
    bannerUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2070&auto=format&fit=crop',
    portafolio: [
      { id: 1, url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop' },
      { id: 2, url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop' },
      { id: 3, url: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=1000&auto=format&fit=crop' }
    ]
  });

  // Cargar perfil desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_profesional_perfil');
    const defaultProfile = {
      nombre: 'Roberto Gómez',
      correo: 'roberto@gmail.com',
      telefono: '+54 9 381 123 4567',
      cobertura: 'Radio de 15km - San Miguel de Tucumán',
      especialidades: ['Plomería', 'Electricidad'],
      estadoDNI: 'Pendiente',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD85pw1lweYxj9ZY758PmA-0PGM0q1wtL0dMOXlgKBD-eceH1UryKCy1mEoZ5jUVDHFU8WoXTd4EqiDhNzyh7eo-lvfyk9fk2EFupZ6Zvt_3y1dK2Hx72DsYSXEULFtCIOGfXFOQOyufsmHsfNTu3VL6NYRVMZ1WZzXYsCXr60o_ZHYewQ7-aozdL2YFUpmfxCHyFH4p7HMIjdTONG31bA0JhNzewarvNNZ_clLNY6vsyuFnGQL_lm3EW5Oz-SKQYNPYBh4oU178oXy',
      certificados: [
        { id: '1', nombre: 'Matrícula Gasista Profesional.pdf', archivoBase64: '' },
        { id: '2', nombre: 'Curso Especialización Electricidad.png', archivoBase64: '' }
      ],
      plan: 'Gratis',
      postulacionesUsadas: 0,
      bio: 'Soy un profesional con más de 10 años de experiencia en plomería y gas. Me especializo en instalaciones de termotanques y reparaciones de urgencia. Trabajo limpio, rápido y con garantía en todos mis arreglos.',
      bannerUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2070&auto=format&fit=crop',
      portafolio: [
        { id: 1, url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop' },
        { id: 2, url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop' },
        { id: 3, url: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=1000&auto=format&fit=crop' }
      ]
    };

    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = { ...defaultProfile, ...parsed };
      setPerfil(merged);
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(merged));
    } else {
      setPerfil(defaultProfile);
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(defaultProfile));
    }

    const storedAlertas = localStorage.getItem('oficiosya_alertas_empleo_pro');
    if (storedAlertas !== null) setAlertasEmpleo(JSON.parse(storedAlertas));

    const disabledVal = localStorage.getItem('oficiosya_disable_tooltips') === 'true';
    setTooltipsDisabled(disabledVal);
  }, []);

  const handleToggleTooltips = () => {
    const newVal = !tooltipsDisabled;
    setTooltipsDisabled(newVal);
    localStorage.setItem('oficiosya_disable_tooltips', String(newVal));
    window.dispatchEvent(new Event('oficiosya_tooltips_changed'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardar = () => {
    setIsSaving(true);
    setTimeout(() => {
      // Guardamos la configuración de forma persistente
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(perfil));
      localStorage.setItem('oficiosya_alertas_empleo_pro', JSON.stringify(alertasEmpleo));
      setIsSaving(false);
      setIsEditing(false);
      alert('Perfil guardado exitosamente.');
    }, 1000);
  };

  // Manejo de Especialidades (Ahora desde lista precargada y persistido)
  const agregarEspecialidad = () => {
    if (nuevaEspecialidad !== '' && !perfil.especialidades.includes(nuevaEspecialidad)) {
      const nuevoPerfil = { ...perfil, especialidades: [...perfil.especialidades, nuevaEspecialidad] };
      setPerfil(nuevoPerfil);
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
      setNuevaEspecialidad(''); // Limpiar el select
    }
  };

  const eliminarEspecialidad = (index: number) => {
    const actualizadas = [...perfil.especialidades];
    actualizadas.splice(index, 1);
    const nuevoPerfil = { ...perfil, especialidades: actualizadas };
    setPerfil(nuevoPerfil);
    localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
  };

  // Subida de archivos real (Certificados y Foto Perfil)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    
    try {
      const bucket = tipo === 'avatar' ? 'avatars' : 'certificates';
      const path = `${perfil.correo || 'anonymous'}/${Date.now()}_${file.name}`;
      
      const { publicUrl, error } = await uploadImageToSupabase(bucket, path, file);
      
      if (error) {
        alert(`Error al subir el archivo: ${error.message || error}`);
        setIsSaving(false);
        return;
      }
      
      if (publicUrl) {
        if (tipo === 'avatar') {
          const nuevoPerfil = { ...perfil, avatar: publicUrl };
          setPerfil(nuevoPerfil);
          localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
          alert('Foto de perfil actualizada correctamente.');
        } else if (tipo === 'certificado') {
          const nuevoCert = {
            id: Date.now().toString(),
            nombre: file.name,
            archivoBase64: publicUrl
          };
          const nuevoPerfil = { 
            ...perfil, 
            certificados: [...perfil.certificados, nuevoCert] 
          };
          setPerfil(nuevoPerfil);
          localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
          alert('Certificado subido correctamente.');
        }
      }
    } catch (err: any) {
      alert(`Error en el proceso de subida: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarCertificado = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este certificado?')) {
      const actualizados = perfil.certificados.filter(c => c.id !== id);
      const nuevoPerfil = { ...perfil, certificados: actualizados };
      setPerfil(nuevoPerfil);
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
    }
  };

  // Captura de archivos de DNI en el modal
  const handleDNIFrenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDniFrenteFile(e.target.files[0]);
    }
  };

  const handleDNIDorsoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDniDorsoFile(e.target.files[0]);
    }
  };

  const handleSubirDNI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniFrenteFile || !dniDorsoFile) {
      alert("Por favor, sube ambas fotos (Frente y Dorso) del DNI.");
      return;
    }
    
    // Al subir DNI, actualizamos el estado del perfil
    const nuevoPerfil = { ...perfil, estadoDNI: 'En Revisión' };
    setPerfil(nuevoPerfil);
    localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
    
    // Inyectamos también una solicitud de verificación en localStorage para el panel de administración
    const verificaciones = JSON.parse(localStorage.getItem('oficiosya_verificaciones') || '[]');
    const nuevaSol = {
      id: Date.now().toString(),
      nombre: perfil.nombre,
      email: perfil.correo,
      oficio: perfil.especialidades[0] || 'Profesional',
      fecha: new Date().toLocaleDateString('es-AR'),
      estado: 'Pendiente'
    };
    verificaciones.unshift(nuevaSol);
    localStorage.setItem('oficiosya_verificaciones', JSON.stringify(verificaciones));

    setModalDNI(false);
    setDniFrenteFile(null);
    setDniDorsoFile(null);
    alert('DNI enviado para verificación. Te notificaremos cuando sea validado.');
  };

  // Oficios disponibles que el usuario aún NO ha agregado
  const oficiosDisponibles = OFICIOS_PRECARGADOS.filter(
    (oficio) => !perfil.especialidades.includes(oficio)
  );

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen font-sans selection:bg-[#0f4c81] selection:text-white md:pl-24 pb-24 md:pb-0">
      
      {/* Inputs de archivo ocultos generales */}
      <input type="file" ref={fotoPerfilRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
      <input type="file" ref={certificadoRef} className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, 'certificado')} />

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer md:pl-24" onClick={() => router.push('/panel-profesional')}>
          <Logo size="md" theme="light" />
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
            <button onClick={() => router.push('/notificaciones')} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </Tooltip>
          <Tooltip title="Mi Perfil" text="Actualizá tus datos personales, especialidades, coberturas y subí certificados profesionales." position="bottom">
            <div className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold text-sm border border-gray-200 cursor-pointer">
              JP
            </div>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
        
        <Tooltip title="Panel" text="Hacé clic para ver el resumen de tu actividad, trabajos activos y ganancias del mes." position="right">
          <button 
            onClick={() => router.push('/panel-profesional')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <PanelIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Panel</span>
          </button>
        </Tooltip>

        <Tooltip title="Muro de trabajos" text="Explorá el muro de solicitudes publicadas por clientes y postulá tus presupuestos." position="right">
          <button 
            onClick={() => router.push('/muro-trabajos')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <MuroIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Muro</span>
          </button>
        </Tooltip>

        <Tooltip title="Mis trabajos" text="Revisá y gestioná tus trabajos en curso, presupuestados o finalizados." position="right">
          <button 
            onClick={() => router.push('/mis-trabajos')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <TrabajosIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Trabajos</span>
          </button>
        </Tooltip>

        <Tooltip title="Mensajes" text="Chateá directamente con tus clientes para coordinar visitas y detalles de los trabajos." position="right">
          <button 
            onClick={() => router.push('/chat')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <MensajesIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Mensajes</span>
          </button>
        </Tooltip>

        <Tooltip title="Buzón de Soporte" text="¿Tenés dudas o sugerencias? Escribinos y nuestro equipo te responderá directamente." position="right">
          <button 
            onClick={() => router.push('/panel-profesional?support=true')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <SoporteIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Soporte</span>
          </button>
        </Tooltip>

        <Tooltip title="Herramientas" text="Calculadora de materiales, mano de obra y cómputos para albañilería y cuadrillas." position="right">
          <button 
            onClick={() => router.push('/presupuestador-obras')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <HerramientasIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Herramientas</span>
          </button>
        </Tooltip>

        <div className="mt-auto mb-6">
          <Tooltip title="Configuración" text="Editá tus datos, cambia tu contraseña y activa o desactiva estos globitos aclaratorios." position="right">
            <button className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:shadow-md transition-all">
                <ConfiguracionIcon className="w-6 h-6" active={true} />
              </div>
              <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Configurar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <main className="pt-24 pb-8 max-w-2xl mx-auto px-4">
        
        {/* Profile Header */}
        <section className="flex flex-col items-center mb-8 relative">
          
          <div className="absolute top-0 right-0 z-10">
            {isEditing ? (
              <button 
                onClick={handleGuardar}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#00355f] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#0f4c81] transition-all active:scale-95 shadow-md"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-[#00355f] px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
            )}
          </div>

          <div className="relative">
            <div className={`w-24 h-24 rounded-full border-4 shadow-md overflow-hidden bg-gray-100 ${perfil.estadoDNI === 'Validado' ? 'border-green-400' : 'border-white'}`}>
              <img src={perfil.avatar} alt={perfil.nombre} className={`w-full h-full object-cover ${isSaving ? 'opacity-50' : 'opacity-100'}`} />
            </div>
            {isEditing && (
              <button 
                onClick={() => fotoPerfilRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[#fc8127] text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <input 
              type="text" name="nombre" value={perfil.nombre} onChange={handleChange}
              className="mt-4 text-2xl font-bold text-center text-gray-900 bg-white border-b-2 border-[#00355f] outline-none focus:bg-blue-50 px-2 py-1 rounded-t-md transition-colors"
            />
          ) : (
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{perfil.nombre}</h2>
          )}

          {perfil.estadoDNI === 'Validado' ? (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Identidad Verificada</span>
            </div>
          ) : perfil.estadoDNI === 'En Revisión' ? (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">DNI en Revisión</span>
            </div>
          ) : null}
        </section>

        {/* Account Sections */}
        <div className="space-y-6 relative z-0">
          
          {/* Identidad */}
          <SectionCard title="Validación de Identidad" icon={FileCheck}>
            {perfil.estadoDNI === 'Validado' ? (
              <ListItem title="Documento Nacional de Identidad" subtitle="Verificado correctamente" iconRight={<CheckCircle className="w-5 h-5 text-green-500" />} />
            ) : perfil.estadoDNI === 'En Revisión' ? (
              <ListItem title="Documento Nacional de Identidad" subtitle="Tu DNI está siendo validado por nuestro equipo" />
            ) : (
              <button onClick={() => setModalDNI(true)} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left group">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-red-600">Subir DNI (Requerido)</span>
                  <span className="text-sm text-gray-500">Sube frente y dorso para activar tu perfil público</span>
                </div>
                <UploadCloud className="w-5 h-5 text-[#fc8127]" />
              </button>
            )}
          </SectionCard>

          <SectionCard title="Mi Perfil" icon={User}>
            {isEditing ? (
              <div className="p-4 space-y-4 bg-gray-50 border-b border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Correo Electrónico</label>
                  <input type="email" name="correo" value={perfil.correo} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00355f]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Teléfono</label>
                  <input type="tel" name="telefono" value={perfil.telefono} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00355f]" />
                </div>
              </div>
            ) : (
              <ListItem title="Información Personal" subtitle={`${perfil.correo} • ${perfil.telefono}`} />
            )}
            <ListItem title="Contraseña" subtitle="Cambia tu clave de acceso" onClick={() => setModalPassword(true)} />
          </SectionCard>

          <SectionCard title="Mi Oficio" icon={Wrench}>
            <div className="w-full flex flex-col px-4 py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-[#00355f] mb-2">Especialidades</span>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {perfil.especialidades.map((esp, i) => (
                  <span key={i} className="flex items-center gap-1 bg-[#d2e4ff] text-[#00355f] px-2 py-1 rounded-md text-[11px] font-extrabold uppercase">
                    {esp}
                    {isEditing && (
                      <button onClick={() => eliminarEspecialidad(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <select 
                    value={nuevaEspecialidad} 
                    onChange={(e) => setNuevaEspecialidad(e.target.value)}
                    className="flex-1 h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00355f]"
                  >
                    <option value="" disabled>Selecciona un oficio...</option>
                    {oficiosDisponibles.map((oficio) => (
                      <option key={oficio} value={oficio}>{oficio}</option>
                    ))}
                  </select>
                  <button 
                    onClick={agregarEspecialidad}
                    disabled={!nuevaEspecialidad}
                    className="bg-[#00355f] text-white px-3 rounded-lg flex items-center justify-center hover:bg-[#0f4c81] disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="w-full flex flex-col border-b border-gray-100">
              {isEditing ? (
                <button 
                  onClick={() => certificadoRef.current?.click()} 
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100/70 transition-colors text-left group border-b border-gray-150"
                >
                  <div className="flex flex-col pr-4">
                    <span className="text-sm font-bold text-[#00355f]">Certificaciones y Títulos</span>
                    <span className="text-xs text-[#fc8127] font-bold">Subir archivo (PDF / Imagen)</span>
                  </div>
                  <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-[#00355f]" />
                </button>
              ) : (
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-150">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mis Certificados ({perfil.certificados.length})</span>
                </div>
              )}

              {/* Lista dinámica de certificados */}
              <div className="divide-y divide-gray-100 bg-white">
                {perfil.certificados.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No se han subido certificados aún.</p>
                ) : (
                  perfil.certificados.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div className="flex items-center gap-2.5 truncate flex-1 pr-4">
                        <Award className="w-4 h-4 text-[#fc8127] shrink-0" />
                        {cert.archivoBase64 ? (
                          <a 
                            href={cert.archivoBase64} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="font-bold text-gray-700 hover:text-[#00355f] hover:underline truncate text-xs"
                          >
                            {cert.nombre}
                          </a>
                        ) : (
                          <span className="font-bold text-gray-500 truncate text-xs">{cert.nombre}</span>
                        )}
                      </div>
                      
                      {isEditing && (
                        <button 
                          onClick={() => eliminarCertificado(cert.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Eliminar certificado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Área de Cobertura</label>
                <input type="text" name="cobertura" value={perfil.cobertura} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00355f]" />
              </div>
            ) : (
              <ListItem title="Área de Cobertura" subtitle={perfil.cobertura} />
            )}
          </SectionCard>

          <SectionCard title="Preferencias" icon={Settings}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#00355f]">Notificaciones</span>
                <span className="text-sm text-gray-500">Push y correo electrónico</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notificaciones} onChange={() => setNotificaciones(!notificaciones)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fc8127]"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-orange-50/50">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#00355f] flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#fc8127]" /> Alertas de Empleo</span>
                <span className="text-xs text-gray-500 mt-0.5">Recibir notificaciones cuando se publiquen empleos afines a mis especialidades.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={alertasEmpleo} onChange={() => setAlertasEmpleo(!alertasEmpleo)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fc8127]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#00355f] flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-[#fc8127]" /> Globitos de Ayuda</span>
                <span className="text-xs text-gray-500 mt-0.5">Activar los textos aclaratorios estilo historieta en los botones de navegación.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!tooltipsDisabled} onChange={handleToggleTooltips} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fc8127]"></div>
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Seguridad" icon={Shield}>
            <ListItem title="Autenticación en dos pasos" subtitle="Añade una capa extra de seguridad" onClick={() => setModal2FA(true)} />
            <ListItem title="Dispositivos Activos" subtitle="Gestiona dónde has iniciado sesión" onClick={() => setModalDevices(true)} />
          </SectionCard>

          <div className="mt-10 flex flex-col gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="w-full py-4 bg-white border border-gray-200 text-gray-700 font-bold text-lg rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        </div>
      </main>

      {/* --- MODALES --- */}

      {/* Modal Cambiar Contraseña */}
      {modalPassword && (
        <ModalWrapper title="Cambiar Contraseña" onClose={() => setModalPassword(false)}>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña Actual</label>
              <input type="password" placeholder="••••••••" className="w-full h-11 px-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00355f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Contraseña</label>
              <input type="password" placeholder="••••••••" className="w-full h-11 px-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#00355f]" />
            </div>
            <button onClick={() => setModalPassword(false)} className="w-full h-12 bg-[#00355f] text-white font-bold rounded-xl mt-2 hover:bg-[#0f4c81]">Actualizar Contraseña</button>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Autenticación Dos Pasos */}
      {modal2FA && (
        <ModalWrapper title="Autenticación en 2 Pasos" onClose={() => setModal2FA(false)}>
          <div className="text-center mt-4">
            <div className="w-16 h-16 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8" />
            </div>
            <p className="text-sm text-gray-600 mb-6">Protege tu cuenta con un código adicional generado por tu aplicación de autenticación (ej. Google Authenticator).</p>
            <button onClick={() => setModal2FA(false)} className="w-full h-12 bg-[#fc8127] text-white font-bold rounded-xl hover:bg-[#e67320]">Vincular Autenticador</button>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Dispositivos Activos */}
      {modalDevices && (
        <ModalWrapper title="Dispositivos Activos" onClose={() => setModalDevices(false)}>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex gap-3 items-center">
                <Smartphone className="w-6 h-6 text-[#00355f]" />
                <div>
                  <p className="font-bold text-sm text-[#00355f]">iPhone 13 - Chrome</p>
                  <p className="text-xs text-green-600 font-bold">Activo ahora • Tucumán, AR</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-xl">
              <div className="flex gap-3 items-center">
                <LayoutDashboard className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-bold text-sm text-gray-700">Windows PC - Chrome</p>
                  <p className="text-xs text-gray-500">Ayer, 15:30 • Tucumán, AR</p>
                </div>
              </div>
              <button className="text-xs font-bold text-red-500 hover:text-red-700">Cerrar Sesión</button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Subir DNI */}
      {modalDNI && (
        <ModalWrapper title="Verificar Identidad" onClose={() => setModalDNI(false)}>
          {/* Inputs ocultos para el modal */}
          <input type="file" ref={dniFrenteRef} className="hidden" accept="image/*,application/pdf" onChange={handleDNIFrenteChange} />
          <input type="file" ref={dniDorsoRef} className="hidden" accept="image/*,application/pdf" onChange={handleDNIDorsoChange} />

          <form onSubmit={handleSubirDNI} className="space-y-4 mt-4 text-center">
            <p className="text-sm text-gray-600 mb-4">Sube fotos claras de tu DNI (Frente y Dorso). Asegúrate de que los textos sean legibles.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => dniFrenteRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group ${dniFrenteFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {dniFrenteFile ? (
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#fc8127] mb-2" />
                )}
                <span className={`text-xs font-bold ${dniFrenteFile ? 'text-green-700' : 'text-gray-600'}`}>Frente DNI</span>
              </div>
              
              <div 
                onClick={() => dniDorsoRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group ${dniDorsoFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {dniDorsoFile ? (
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#fc8127] mb-2" />
                )}
                <span className={`text-xs font-bold ${dniDorsoFile ? 'text-green-700' : 'text-gray-600'}`}>Dorso DNI</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!dniFrenteFile || !dniDorsoFile}
              className={`w-full h-12 text-white font-bold rounded-xl mt-4 transition-all ${(!dniFrenteFile || !dniDorsoFile) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#00355f] hover:bg-[#0f4c81]'}`}
            >
              Enviar para Revisión
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><LayoutDashboard className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Dashboard</span></button>
        <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><Briefcase className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Trabajos</span></button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><MessageSquare className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Mensajes</span></button>
        <button className="flex flex-col items-center text-[#fc8127]"><User className="w-5 h-5 fill-current" /><span className="text-[10px] font-bold mt-1">Perfil</span></button>
      </nav>

    </div>
  );
}

// COMPONENTES AUXILIARES
function SectionCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 flex items-center gap-2 border-b border-gray-200">
        <Icon className="w-5 h-5 text-[#00355f]" />
        <h3 className="font-bold text-[#00355f] text-lg">{title}</h3>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function ListItem({ title, subtitle, onClick, iconRight }: any) {
  return (
    <button onClick={onClick} disabled={!onClick} className={`w-full flex items-center justify-between px-4 py-4 text-left group border-b border-gray-100 last:border-0 ${onClick ? 'hover:bg-gray-50 transition-colors cursor-pointer' : 'cursor-default'}`}>
      <div className="flex flex-col pr-4">
        <span className="text-sm font-bold text-[#181c1e]">{title}</span>
        <span className="text-sm text-gray-500 truncate">{subtitle}</span>
      </div>
      {iconRight ? iconRight : (onClick && <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />)}
    </button>
  );
}

function ModalWrapper({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-lg text-[#00355f]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}