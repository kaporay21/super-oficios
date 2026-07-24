"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Briefcase, MapPin, 
  FileText, CheckCircle2, AlertCircle,
  Zap, Calendar, DollarSign, Loader2,
  Users
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
  'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán', 'CABA'
];

const OFICIOS = [
  'Plomería', 'Electricidad', 'Pintura', 'Carpintería',
  'Albañilería', 'Herrería', 'Jardinería', 'Limpieza', 'Otro'
];

const TIPOS = ['Permanente', 'Por obra', 'Temporal', 'Part-time'];

export default function PublicarEmpleoPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    titulo: '',
    oficio: 'Plomería',
    tipo: 'Por obra',
    provincia: 'Tucumán',
    ciudad: '',
    salario: '',
    descripcion: '',
    vacantes: '1'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_profesional_perfil');
    if (stored) {
      setPerfil(JSON.parse(stored));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.titulo.trim() || !formData.ciudad.trim() || !formData.descripcion.trim()) {
      setError('Por favor completá los campos obligatorios (Título, Ciudad, Descripción).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const jobData = {
        ...formData,
        empleador: perfil?.nombre || 'Usuario Profesional',
        empleadorAvatar: perfil?.fotoPerfil || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJFksOrbm_vwGQaTq5Vuqr1acUBEH2jxptCR5CusLDf2Sb5qZ8fqxqznYXUigT9dEfKpCENJlHaLhC_WoPDhEQJYKRkRbxGiFrH2Jf4hrRkaq4pffxxwX2ietvZfajbBEyvOb665wnkChMjc88JXD3dUq70dprcIy22fOVZalBnuC390ApdZb18RNQjeSD56KQnd4KnVj3W9Vf6W_rfyL2JkZDhnRQLKr0smIh2slCZIjrr0crl5Ri-6h1zRMK70Hxc9PXqDijgpuj',
        postulantes: 0,
        urgente: false,
        nuevo: true,
      };
      
      await dbHelper.createJob(jobData);
      
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/bolsa-empleo?publicado=true');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al publicar el empleo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-[#181c1e] min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* Columna Izquierda: Fotografía Hero (Desktop) / Banner (Mobile) */}
      <div className="w-full md:w-5/12 lg:w-1/2 relative bg-[#00355f] flex-shrink-0 h-48 md:h-screen md:sticky md:top-0 overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=2000')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#00355f] via-[#00355f]/40 to-transparent md:bg-gradient-to-r md:from-[#00355f]/90 md:via-[#00355f]/50"></div>
        
        {/* Botón Volver flotante en la imagen */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-4 left-4 md:top-6 md:left-6 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Textos sobre la imagen (Solo Desktop) */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 hidden md:block">
          <div className="w-12 h-12 bg-[#fc8127] rounded-xl flex items-center justify-center shadow-lg mb-6">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-md">
            Encuentra al talento <br/> que tu obra necesita.
          </h1>
          <p className="text-blue-100 font-medium max-w-sm drop-shadow-sm">
            Publica tu oferta de empleo en minutos y recibe postulaciones de profesionales verificados en tu zona.
          </p>
        </div>
      </div>

      {/* Columna Derecha: Formulario (Scrollable) */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col bg-[#f7fafc] min-h-screen">
        
        {/* Encabezado Mobile */}
        <div className="md:hidden bg-white p-6 shadow-sm border-b border-gray-100 flex items-center gap-4 relative z-10 -mt-6 rounded-t-3xl">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 text-[#fc8127]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#00355f]">Publicar Empleo</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Completá los datos para tu búsqueda</p>
          </div>
        </div>

        <main className="flex-grow p-6 md:p-12 lg:p-16 max-w-2xl mx-auto w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative">
            
            {/* Sección 1: Info Principal */}
            <div>
              <h3 className="text-sm font-black text-[#00355f] uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#fc8127]" /> 1. Detalles del Puesto
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Título del empleo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Ayudante de electricista para obra"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Oficio requerido</label>
                    <select
                      name="oficio"
                      value={formData.oficio}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                    >
                      {OFICIOS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo de contratación</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                    >
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Sección 2: Ubicación y Detalles */}
            <div>
              <h3 className="text-sm font-black text-[#00355f] uppercase tracking-wider mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fc8127]" /> 2. Ubicación y Condiciones
              </h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Provincia</label>
                    <select
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                    >
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ciudad / Localidad <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ej: San Miguel de Tucumán"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Rango salarial (Opcional)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="salario"
                        value={formData.salario}
                        onChange={handleChange}
                        placeholder="Ej: $150k - $200k / mes"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Vacantes disponibles</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="vacantes"
                        value={formData.vacantes}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all shadow-inner"
                      >
                        {[1,2,3,4,5,'5+'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Sección 3: Descripción */}
            <div>
              <h3 className="text-sm font-black text-[#00355f] uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#fc8127]" /> 3. Descripción del Perfil
              </h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">¿Qué estás buscando? <span className="text-red-500">*</span></label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Detallá responsabilidades, requisitos, horarios y beneficios..."
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none bg-gray-50 hover:bg-white text-sm font-medium transition-all resize-y shadow-inner"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-14 rounded-xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden group
                  ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#00355f] to-[#0f4c81] hover:shadow-xl active:scale-[0.98]'}`}
              >
                {!isSubmitting && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl"></div>}
                
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Publicando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-[#fc8127] relative z-10" /> <span className="relative z-10">Publicar Empleo Ahora</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4">
                El anuncio estará visible por 30 días.
              </p>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}
