"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Camera, Save, CheckCircle, Briefcase } from 'lucide-react';
import { uploadImageToSupabase } from '@/lib/supabaseStorage';

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

export default function ConfiguracionClientePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [provincia, setProvincia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alertasEmpleo, setAlertasEmpleo] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('oficiosya_cliente_perfil');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNombre(parsed.nombre || 'Diego Martínez');
        setDescripcion(parsed.descripcion || '');
        setAvatar(parsed.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxtS7RKDHLyY5y6lNafj3BeDhG6IkxEq9VqlAXNANvWQ0SDvyNg94IhrR7NRCH5ipJoHo-ctwaJAmv5swv96O-FKX13VwDYhVA7svtWDswJpd_GgvEvGZ2kobHqyW59sVXYLQijNtWB1mibdA-N4IwLEP7cqf3Pb_3NUsJU3Yh-tx-hpOfZwKqGR20Dm2ulgvMhMPYTc9gxHnptp4OxVKkIgJoTBpASBRrRy5nVKP5AIfU3iuTa-K100p7Pvb_fXmD1yrqla1Jas');
        
        // Tratar de parsear ubicación (ej: "Palermo, CABA (Ciudad Autónoma de Buenos Aires)")
        if (parsed.ubicacion) {
          const parts = parsed.ubicacion.split(', ');
          if (parts.length === 2) {
            setCiudad(parts[0]);
            setProvincia(parts[1]);
          } else {
            setProvincia('CABA (Ciudad Autónoma de Buenos Aires)');
            setCiudad('Palermo');
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Valores por defecto
      setNombre('Diego Martínez');
      setProvincia('CABA (Ciudad Autónoma de Buenos Aires)');
      setCiudad('Palermo');
      setDescripcion('Contratista recurrente con excelente historial de pagos y claridad en los requerimientos.');
      setAvatar('https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxtS7RKDHLyY5y6lNafj3BeDhG6IkxEq9VqlAXNANvWQ0SDvyNg94IhrR7NRCH5ipJoHo-ctwaJAmv5swv96O-FKX13VwDYhVA7svtWDswJpd_GgvEvGZ2kobHqyW59sVXYLQijNtWB1mibdA-N4IwLEP7cqf3Pb_3NUsJU3Yh-tx-hpOfZwKqGR20Dm2ulgvMhMPYTc9gxHnptp4OxVKkIgJoTBpASBRrRy5nVKP5AIfU3iuTa-K100p7Pvb_fXmD1yrqla1Jas');
    }

    const storedAlertas = localStorage.getItem('oficiosya_alertas_empleo_cliente');
    if (storedAlertas !== null) setAlertasEmpleo(JSON.parse(storedAlertas));
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSaving(true);
      const path = `clients/${Date.now()}_${file.name}`;
      const { publicUrl, error } = await uploadImageToSupabase('avatars', path, file);
      setSaving(false);
      
      if (error) {
        alert(`Error al subir la imagen: ${error.message || error}`);
        return;
      }
      if (publicUrl) {
        setAvatar(publicUrl);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updated = {
      nombre,
      ubicacion: `${ciudad}, ${provincia}`,
      verificado: true,
      trabajosSolicitados: 24,
      presupuestosRecibidos: 12,
      avatar,
      miembroDesde: 'Octubre 2022',
      descripcion
    };

    localStorage.setItem('oficiosya_cliente_perfil', JSON.stringify(updated));
    localStorage.setItem('oficiosya_alertas_empleo_cliente', JSON.stringify(alertasEmpleo));

    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/perfil-cliente');
      }, 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12 text-gray-900 selection:bg-[#0f4c81] selection:text-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-50 border-b border-gray-100 flex items-center shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-[#00355f] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold text-xl text-[#00355f] ml-2">Configuración de Perfil</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50">
                  {avatar ? (
                    <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-[#fc8127] text-white p-2 rounded-full border-2 border-white cursor-pointer shadow-md hover:bg-[#e06b16] transition-colors active:scale-90 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <span className="text-xs text-gray-500 font-medium">Subir foto de perfil (JPG/PNG)</span>
            </div>

            {/* Nombre Completo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 px-1" htmlFor="nombre">Nombre Completo</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                <input
                  required
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Diego Martínez"
                  className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Provincia */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 px-1" htmlFor="provincia">Provincia</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  id="provincia"
                  value={provincia}
                  onChange={(e) => {
                    setProvincia(e.target.value);
                    setCiudad(''); // Reseteamos localidad al cambiar provincia
                  }}
                  className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all appearance-none text-gray-800 text-sm font-medium"
                >
                  <option value="" disabled>Selecciona Provincia</option>
                  {Object.keys(PROVINCIAS_Y_CIUDADES).map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Localidad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 px-1" htmlFor="ciudad">Ciudad / Localidad</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  id="ciudad"
                  value={ciudad}
                  disabled={!provincia}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all appearance-none text-gray-800 text-sm font-medium disabled:opacity-50"
                >
                  <option value="" disabled>Selecciona Localidad</option>
                  {provincia && PROVINCIAS_Y_CIUDADES[provincia]?.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Breve Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 px-1" htmlFor="descripcion">Breve Descripción</label>
              <textarea
                required
                id="descripcion"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cuéntanos un poco sobre ti..."
                className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all resize-none text-sm font-medium leading-relaxed"
              />
            </div>

            {/* Configuración Bolsa de Empleo */}
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#00355f] flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#fc8127]" /> Alertas de Empleo</span>
                <span className="text-xs text-gray-500 mt-0.5">Recibir notificaciones cuando se publiquen empleos nuevos.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={alertasEmpleo} onChange={() => setAlertasEmpleo(!alertasEmpleo)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fc8127]"></div>
              </label>
            </div>

            {/* Mensajes de feedback */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-bold">¡Cambios guardados con éxito! Redirigiendo...</span>
              </div>
            )}

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#fc8127] text-white py-3.5 rounded-xl font-bold hover:bg-[#e06b16] transition-all active:scale-95 shadow-md flex justify-center items-center gap-2 text-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            
          </form>
        </div>
      </main>
    </div>
  );
}
