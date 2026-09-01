"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Camera, CheckCircle, User, ChevronRight, 
  Wrench, Settings, Shield, LogOut, LayoutDashboard, 
  Briefcase, MessageSquare, Edit2, Save, Loader2, 
  Zap, Clock, ShieldAlert, Award, Grid, Star, MapPin, Eye,
  HelpCircle, ShieldCheck, Timer, UploadCloud, X, Smartphone, Plus, Trash2, FileCheck, Key, Info
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
  'Plomería',
  'Durlock / Yeso',
  'Jardinería',
  'Fumigación',
  'Techista / Impermeabilización',
  'Fletes y Mudanzas'
];

const PROVINCIAS_Y_CIUDADES: Record<string, string[]> = {
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Pilar', 'Campana'],
  'CABA (Ciudad Autónoma de Buenos Aires)': ['Palermo', 'Caballito', 'Belgrano', 'Recoleta', 'Flores', 'Almagro', 'Villa Urquiza'],
  'Catamarca': ['San Fernando del Valle de Catamarca', 'Andalgalá', 'Tinogasta'],
  'Chaco': ['Resistencia', 'Sáenz Peña', 'Villa Ángela'],
  'Chubut': ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'],
  'Córdoba': ['Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'San Francisco'],
  'Corrientes': ['Corrientes Capital', 'Goya', 'Paso de los Libres'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
  'Formosa': ['Formosa Capital', 'Clorinda'],
  'Jujuy': ['San Salvador de Jujuy', 'San Pedro', 'Libertador General San Martín'],
  'La Pampa': ['Santa Rosa', 'General Pico'],
  'La Rioja': ['La Rioja Capital', 'Chilecito'],
  'Mendoza': ['Mendoza Capital', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo'],
  'Misiones': ['Posadas', 'Eldorado', 'Oberá'],
  'Neuquén': ['Neuquén Capital', 'San Martín de los Andes', 'Villa La Angostura'],
  'Río Negro': ['Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti'],
  'Salta': ['Salta Capital', 'San Ramón de la Nueva Orán', 'Tartagal'],
  'San Juan': ['San Juan Capital', 'Caucete', 'Chimbas'],
  'San Luis': ['San Luis Capital', 'Villa Mercedes', 'Merlo'],
  'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate'],
  'Santa Fe': ['Rosario', 'Santa Fe Capital', 'Rafaela', 'Venado Tuerto', 'Reconquista'],
  'Santiago del Estero': ['Santiago del Estero Capital', 'La Banda', 'Termas de Río Hondo'],
  'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
  'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción', 'Aguilares', 'Banda del Río Salí']
};

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { useNotification } from '@/providers/NotificationProvider';
import { dbHelper } from '@/lib/supabase';

export default function PerfilProfesionalPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <PerfilProfesionalContent />
    </AuthGuard>
  );
}

function PerfilProfesionalContent() {
  const router = useRouter();
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const { unreadNotificationsCount } = useNotification();
  
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
  const [modalPersonalInfo, setModalPersonalInfo] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [modal2FA, setModal2FA] = useState(false);
  const [modalDevices, setModalDevices] = useState(false);
  const [modalDNI, setModalDNI] = useState(false);

  // Estados para archivos del DNI temporal
  const [dniFrenteFile, setDniFrenteFile] = useState<File | null>(null);
  const [dniDorsoFile, setDniDorsoFile] = useState<File | null>(null);

  // Estado con los datos del usuario real
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    fechaNacimiento: '',
    pais: 'Argentina',
    provincia: '',
    ciudad: '',
    cobertura: '',
    especialidades: [] as string[],
    estadoDNI: 'Pendiente',
    avatar: 'https://i.pravatar.cc/150?u=default',
    certificados: [] as any[],
    nroMatricula: '',
    plan: 'Gratis',
    postulacionesUsadas: 0,
    bio: '',
    experiencia: '',
    montoMinimo: '',
    bannerUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2070&auto=format&fit=crop',
    portafolio: [] as any[]
  });

  // Cargar perfil real desde AuthContext
  useEffect(() => {
    if (authProfile) {
      const nombreCompleto = authProfile.nombre || '';
      const partesNombre = nombreCompleto.trim().split(' ');
      const pNombre = authProfile.nombre ? partesNombre[0] : 'Profesional';
      const pApellido = authProfile.apellido || (partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : '');

      setPerfil({
        nombre: pNombre,
        apellido: pApellido,
        correo: authProfile.email || user?.email || '',
        telefono: authProfile.telefono || '',
        fechaNacimiento: authProfile.fechaNacimiento || authProfile.fecha_nacimiento || '',
        pais: authProfile.pais || 'Argentina',
        provincia: authProfile.provincia || '',
        ciudad: authProfile.ciudad || '',
        cobertura: authProfile.ciudad && authProfile.provincia ? `${authProfile.ciudad}, ${authProfile.provincia}` : (authProfile.provincia || 'Argentina'),
        especialidades: authProfile.oficios || [],
        estadoDNI: authProfile.estado_dni || (authProfile.verificado ? 'Validado' : 'Pendiente'),
        avatar: authProfile.foto_perfil || authProfile.fotoPerfil || ('https://i.pravatar.cc/150?u=' + (authProfile.id || 'profesional')),
        certificados: authProfile.certificados || [],
        nroMatricula: authProfile.nroMatricula || authProfile.nro_matricula || '',
        plan: authProfile.plan || 'Gratis',
        postulacionesUsadas: 0,
        bio: authProfile.biografia || '',
        experiencia: authProfile.experiencia || '',
        montoMinimo: authProfile.montoMinimo || authProfile.monto_minimo || '',
        bannerUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2070&auto=format&fit=crop',
        portafolio: authProfile.portafolio || []
      });
    }

    const disabledVal = localStorage.getItem('oficiosya_disable_tooltips') === 'true';
    setTooltipsDisabled(disabledVal);
  }, [authProfile, user]);

  const handleToggleTooltips = () => {
    const newVal = !tooltipsDisabled;
    setTooltipsDisabled(newVal);
    localStorage.setItem('oficiosya_disable_tooltips', String(newVal));
    window.dispatchEvent(new Event('oficiosya_tooltips_changed'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`.trim();
      await dbHelper.updateProfile(user.id, {
        nombre: nombreCompleto,
        apellido: perfil.apellido,
        telefono: perfil.telefono,
        fecha_nacimiento: perfil.fechaNacimiento,
        pais: perfil.pais,
        provincia: perfil.provincia,
        ciudad: perfil.ciudad,
        biografia: perfil.bio,
        experiencia: perfil.experiencia,
        monto_minimo: perfil.montoMinimo,
        nro_matricula: perfil.nroMatricula,
        foto_perfil: perfil.avatar,
        oficios: perfil.especialidades,
        certificados: perfil.certificados,
        portafolio: perfil.portafolio
      });
      await refreshProfile();
      setIsSaving(false);
      setIsEditing(false);
      setModalPersonalInfo(false);
      alert('¡Información guardada exitosamente!');
    } catch (err: any) {
      console.error("Error guardando perfil profesional:", err);
      alert("Error al guardar perfil: " + (err.message || err));
      setIsSaving(false);
    }
  };

  // Manejo de Especialidades
  const agregarEspecialidad = () => {
    if (nuevaEspecialidad !== '' && !perfil.especialidades.includes(nuevaEspecialidad)) {
      const nuevas = [...perfil.especialidades, nuevaEspecialidad];
      const nuevoPerfil = { ...perfil, especialidades: nuevas };
      setPerfil(nuevoPerfil);
      setNuevaEspecialidad('');
      if (user) {
        dbHelper.updateProfile(user.id, { oficios: nuevas }).catch(console.error);
      }
    }
  };

  const eliminarEspecialidad = (index: number) => {
    const actualizadas = [...perfil.especialidades];
    actualizadas.splice(index, 1);
    const nuevoPerfil = { ...perfil, especialidades: actualizadas };
    setPerfil(nuevoPerfil);
    if (user) {
      dbHelper.updateProfile(user.id, { oficios: actualizadas }).catch(console.error);
    }
  };

  // Subida de archivos (Certificados y Foto Perfil)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileBase64 = reader.result as string;
        let publicUrl = fileBase64;
        
        try {
          const bucket = tipo === 'avatar' ? 'avatars' : 'certificates';
          const path = `${perfil.correo || 'anonymous'}/${Date.now()}_${file.name}`;
          const res = await uploadImageToSupabase(bucket, path, file);
          if (res.publicUrl) publicUrl = res.publicUrl;
        } catch {
          // Usa Base64 si falla Supabase storage
        }

        if (tipo === 'avatar') {
          const nuevoPerfil = { ...perfil, avatar: publicUrl };
          setPerfil(nuevoPerfil);
          if (user) await dbHelper.updateProfile(user.id, { foto_perfil: publicUrl });
          alert('Foto de perfil actualizada correctamente.');
        } else if (tipo === 'certificado') {
          const nuevoCert = {
            id: Date.now().toString(),
            nombre: file.name,
            archivoBase64: publicUrl
          };
          const nuevosCerts = [...perfil.certificados, nuevoCert];
          const nuevoPerfil = { ...perfil, certificados: nuevosCerts };
          setPerfil(nuevoPerfil);
          if (user) await dbHelper.updateProfile(user.id, { certificados: nuevosCerts });
          alert('Certificado / Matrícula guardado correctamente.');
        }
        setIsSaving(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Error en la subida: ${err.message || err}`);
      setIsSaving(false);
    }
  };

  const eliminarCertificado = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este certificado?')) {
      const actualizados = perfil.certificados.filter(c => c.id !== id);
      const nuevoPerfil = { ...perfil, certificados: actualizados };
      setPerfil(nuevoPerfil);
      if (user) {
        await dbHelper.updateProfile(user.id, { certificados: actualizados });
      }
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
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
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

        {(perfil?.plan === 'Pro' || perfil?.plan === 'Master') && (
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
        )}

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

        <Tooltip title="Presupuestador" text="Calculadora de materiales, mano de obra y cómputos de obra." position="right">
          <button 
            onClick={() => router.push('/presupuestador-obras')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <HerramientasIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Presupuestador</span>
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
        
        {/* Inputs Ocultos para Archivos */}
        <input 
          type="file" 
          ref={fotoPerfilRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileUpload(e, 'avatar')} 
        />
        <input 
          type="file" 
          ref={certificadoRef} 
          className="hidden" 
          accept="image/*,application/pdf" 
          onChange={(e) => handleFileUpload(e, 'certificado')} 
        />

        {/* Profile Header */}
        <section className="flex flex-col items-center mb-8 relative">
          
          <div className="absolute top-0 right-0 z-10">
            {isEditing ? (
              <button 
                onClick={handleGuardar}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#00355f] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#0f4c81] transition-all active:scale-95 shadow-md"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Cambios
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-[#00355f] px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                <Edit2 className="w-4 h-4" /> Editar Perfil
              </button>
            )}
          </div>

          <div className="relative">
            <div className={`w-24 h-24 rounded-full border-4 shadow-md overflow-hidden bg-gray-100 ${perfil.estadoDNI === 'Validado' ? 'border-green-400' : 'border-white'}`}>
              <img src={perfil.avatar || 'https://i.pravatar.cc/150?u=profesional'} alt={perfil.nombre || 'Perfil'} className={`w-full h-full object-cover ${isSaving ? 'opacity-50' : 'opacity-100'}`} />
            </div>
            <button 
              onClick={() => fotoPerfilRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-[#fc8127] text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              title="Cambiar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{perfil.nombre} {perfil.apellido}</h2>
          {perfil.cobertura && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#fc8127]" /> {perfil.cobertura}
            </p>
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

            {/* Globito Informativo Insignia DNI */}
            <div className="p-3.5 bg-blue-50 border-t border-gray-100 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#00355f] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#00355f] leading-relaxed">
                <strong>Insignia "Identidad Verificada":</strong> Al subir tu DNI y ser verificado por la administración, se te asignará automáticamente el sello verde de <strong>Identidad Verificada</strong> en tu perfil público.
              </p>
            </div>
          </SectionCard>

          {/* Mi Perfil / Información Personal */}
          <SectionCard title="Mi Perfil" icon={User}>
            <button 
              onClick={() => setModalPersonalInfo(true)}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 group cursor-pointer"
            >
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-[#00355f] group-hover:text-[#fc8127] transition-colors flex items-center gap-2">
                  Información Personal
                  <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#fc8127]" />
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {perfil.nombre} {perfil.apellido} • {perfil.correo} • {perfil.telefono} • {perfil.ciudad ? `${perfil.ciudad}, ` : ''}{perfil.provincia}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
            <ListItem title="Contraseña" subtitle="Cambia tu clave de acceso" onClick={() => setModalPassword(true)} />
          </SectionCard>

          {/* Mi Oficio y Certificados */}
          <SectionCard title="Mi Oficio" icon={Wrench}>
            
            {/* Especialidades */}
            <div className="w-full flex flex-col px-4 py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-[#00355f] mb-2">Especialidades</span>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {perfil.especialidades.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">No tienes especialidades seleccionadas.</span>
                ) : (
                  perfil.especialidades.map((esp, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-[#d2e4ff] text-[#00355f] px-3 py-1.5 rounded-full text-xs font-extrabold uppercase">
                      {esp}
                      <button onClick={() => eliminarEspecialidad(i)} className="hover:text-red-600 transition-colors" title="Eliminar especialidad"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2 mt-1">
                <select 
                  value={nuevaEspecialidad} 
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  className="flex-1 h-10 px-3 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00355f]"
                >
                  <option value="" disabled>Selecciona un oficio para agregar...</option>
                  {OFICIOS_PRECARGADOS.map((oficio) => (
                    <option key={oficio} value={oficio}>{oficio}</option>
                  ))}
                </select>
                <button 
                  onClick={agregarEspecialidad}
                  disabled={!nuevaEspecialidad}
                  className="bg-[#00355f] text-white px-4 rounded-xl flex items-center gap-1 font-bold text-xs hover:bg-[#0f4c81] disabled:opacity-50 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
            
            {/* Certificaciones y Títulos */}
            <div className="w-full flex flex-col border-b border-gray-100">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-150">
                <span className="text-xs font-bold text-[#00355f] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#fc8127]" /> Mis Certificados y Matrículas ({perfil.certificados.length})
                </span>
              </div>

              {/* Número de Matrícula */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <label className="text-xs font-bold text-gray-700 whitespace-nowrap">N° Matrícula:</label>
                <input 
                  type="text" 
                  name="nroMatricula" 
                  placeholder="Ej: MAT-129482" 
                  value={perfil.nroMatricula} 
                  onChange={handleChange}
                  onBlur={handleGuardar}
                  className="flex-1 h-9 px-3 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                />
              </div>

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
                      
                      <button 
                        onClick={() => eliminarCertificado(cert.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Eliminar certificado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Botón para cargar certificados de manera sucesiva */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => certificadoRef.current?.click()} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-[#fc8127] text-[#fc8127] hover:bg-orange-50 rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  {perfil.certificados.length === 0 ? '+ Agregar Certificado / Matrícula (PDF o Imagen)' : '+ Agregar otro certificado'}
                </button>
              </div>

              {/* Globito Informativo Insignia Matriculado */}
              <div className="p-3.5 bg-orange-50 border-t border-gray-100 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[#fc8127] shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-950 leading-relaxed">
                  <strong>Insignia "Profesional Matriculado / Certificado":</strong> Al subir tu comprobante de matrícula o certificados y ser validados por la administración, obtendrás la insignia dorada de <strong>Profesional Matriculado / Certificado</strong> visible públicamente.
                </p>
              </div>
            </div>
            
            {/* Área de Cobertura */}
            <div className="p-4 bg-white space-y-3">
              <span className="block text-xs font-bold text-[#00355f] uppercase tracking-wider">Área de Cobertura</span>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Provincia de Cobertura</label>
                <select 
                  name="provincia" 
                  value={perfil.provincia} 
                  onChange={(e) => {
                    const prov = e.target.value;
                    setPerfil({ ...perfil, provincia: prov, cobertura: prov });
                  }}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]"
                >
                  <option value="">Seleccionar Provincia</option>
                  {Object.keys(PROVINCIAS_Y_CIUDADES).map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Tu perfil figurará como disponible en toda la provincia seleccionada.</p>
              </div>
            </div>

          </SectionCard>

          {/* Información Profesional Adicional */}
          <SectionCard title="Información Comercial & Presentación" icon={Briefcase}>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Biografía / Presentación Profesional</label>
                <textarea 
                  name="bio" 
                  rows={3} 
                  placeholder="Escribe una breve descripción de tus servicios, años de experiencia y valores de trabajo para tus clientes..." 
                  value={perfil.bio} 
                  onChange={handleChange} 
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Años de Experiencia</label>
                  <input 
                    type="text" 
                    name="experiencia" 
                    placeholder="Ej: 5 años" 
                    value={perfil.experiencia} 
                    onChange={handleChange} 
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Presupuesto / Visita Mínima ($)</label>
                  <input 
                    type="text" 
                    name="montoMinimo" 
                    placeholder="Ej: $ 15.000" 
                    value={perfil.montoMinimo} 
                    onChange={handleChange} 
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                  />
                </div>
              </div>
            </div>
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

      {/* Modal Editar Información Personal */}
      {modalPersonalInfo && (
        <ModalWrapper title="Editar Información Personal" onClose={() => setModalPersonalInfo(false)}>
          <div className="space-y-4 mt-2 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={perfil.nombre} 
                  onChange={handleChange} 
                  className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apellido</label>
                <input 
                  type="text" 
                  name="apellido" 
                  value={perfil.apellido} 
                  onChange={handleChange} 
                  className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                name="correo" 
                value={perfil.correo} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  name="fechaNacimiento" 
                  value={perfil.fechaNacimiento} 
                  onChange={handleChange} 
                  className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Celular / Teléfono</label>
                <input 
                  type="tel" 
                  name="telefono" 
                  value={perfil.telefono} 
                  onChange={handleChange} 
                  className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">País</label>
              <input 
                type="text" 
                name="pais" 
                value={perfil.pais} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Provincia</label>
                <select 
                  name="provincia" 
                  value={perfil.provincia} 
                  onChange={(e) => {
                    const prov = e.target.value;
                    setPerfil({ ...perfil, provincia: prov, ciudad: '', cobertura: prov });
                  }}
                  className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f]"
                >
                  <option value="">Seleccionar provincia</option>
                  {Object.keys(PROVINCIAS_Y_CIUDADES).map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ciudad / Localidad</label>
                <select 
                  name="ciudad" 
                  value={perfil.ciudad} 
                  disabled={!perfil.provincia}
                  onChange={(e) => {
                    const ciu = e.target.value;
                    setPerfil({ ...perfil, ciudad: ciu, cobertura: `${ciu}, ${perfil.provincia}` });
                  }}
                  className="w-full h-10 px-3 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00355f] disabled:opacity-50"
                >
                  <option value="">Seleccionar ciudad</option>
                  {perfil.provincia && PROVINCIAS_Y_CIUDADES[perfil.provincia]?.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleGuardar} 
              disabled={isSaving}
              className="w-full h-12 bg-[#00355f] text-white font-bold rounded-xl mt-4 hover:bg-[#0f4c81] flex items-center justify-center gap-2 shadow-md"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Información Personal'}
            </button>
          </div>
        </ModalWrapper>
      )}

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