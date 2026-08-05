"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Menu, CheckCircle, TrendingUp, DollarSign, 
  User, Wrench, MapPin, Phone, Mail, ArrowRight, Lock
} from 'lucide-react';
import Logo from '@/components/Logo';
import { CrecimientoIcon, DolarIcon } from '@/components/ModernIcons';
import { dbHelper } from '@/lib/supabase';
import { OFICIOS_CORE, PROVINCIAS_Y_CIUDADES } from '@/lib/constants';



export default function RegistroProfesionalPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados del Formulario Estructurado
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [pais, setPais] = useState('Argentina');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [selectedOficios, setSelectedOficios] = useState<string[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');

  const handleOficioToggle = (oficio: string) => {
    if (selectedOficios.includes(oficio)) {
      setSelectedOficios(selectedOficios.filter(o => o !== oficio));
    } else {
      setSelectedOficios([...selectedOficios, oficio]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOficios.length === 0) {
      alert('Por favor selecciona al menos un oficio.');
      return;
    }
    if (!selectedProvincia || !selectedCiudad) {
      alert('Por favor selecciona tu Provincia y tu Ciudad.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Las contraseñas ingresadas no coinciden. Por favor verifica.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const nombreCompleto = apellido ? `${nombre} ${apellido}`.trim() : nombre;
      await dbHelper.registerProfesional(
        nombreCompleto, 
        email, 
        telefono, 
        password, 
        selectedOficios, 
        selectedProvincia, 
        selectedCiudad,
        { apellido, fechaNacimiento, pais, experiencia }
      );
      
      setTimeout(() => {
        setIsSubmitting(false);
        setShowModal(true);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Error al registrar profesional.');
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      localStorage.setItem('show_confetti', 'true');
      router.push('/panel-profesional'); 
    }, 1500);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto h-16 md:h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="md" theme="light" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-4">
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >Inicio</button>
              <button 
                onClick={() => router.push('/servicios-profesional')}
                className="text-gray-600 font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >Servicios</button>
              <button 
                className="text-[#00355f] font-bold px-3 py-2 rounded-lg bg-blue-50"
              >Para Profesionales</button>
            </nav>
            <button 
              onClick={() => router.push('/login')}
              className="text-[#00355f] p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>
          <button className="md:hidden text-gray-600 p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d2e4ff] opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffdbc8] opacity-40 blur-3xl rounded-full"></div>
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          
          {/* Left Side: Value Proposition with top image and clear text below */}
          <div className="hidden md:flex flex-col gap-6 pr-6">
            {/* Image Card: Visible, clean and beautiful without dark overlays */}
            <div className="w-full h-64 rounded-3xl overflow-hidden border border-gray-200 shadow-md relative group">
              <img 
                src="/images/handyman_client_handshake.png" 
                alt="Crecimiento laboral" 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#10b981] text-white px-3 py-1.5 rounded-full font-bold text-[10px] shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" />
                Únete a la red más grande
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-[#00355f] px-3.5 py-1.5 rounded-2xl font-bold text-xs shadow-md border border-white/20">
                🚀 +10,000 profesionales activos
              </div>
            </div>

            {/* Clear Typography with high contrast */}
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-[#00355f] leading-tight">
                Haz crecer tu oficio con Oficios<span className="text-[#fc8127]">Ya</span>
              </h2>
              <p className="text-base text-gray-600 leading-relaxed font-medium">
                Conectamos tu talento con miles de clientes que necesitan soluciones hoy mismo. Sé parte de la comunidad de profesionales más confiable del país.
              </p>
            </div>
            
            {/* Benefit cards in clear theme */}
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex items-center gap-4 p-4 bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="shrink-0">
                  <CrecimientoIcon className="w-12 h-12" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-[#00355f]">Más Trabajo</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Recibe solicitudes directas de clientes en tu zona y maneja tus propios tiempos.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="shrink-0">
                  <DolarIcon className="w-12 h-12" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-[#00355f]">Pagos Seguros</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Gestiona tus presupuestos y cobros de forma profesional y con total garantía.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="w-full">
            <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/50 shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#00355f] mb-2">Registro de Profesional</h3>
                <p className="text-sm text-gray-600">Completa tus datos para empezar a recibir ofertas.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="nombre">Nombre</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input 
                        required 
                        id="nombre" 
                        type="text" 
                        placeholder="Ej: Juan" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="apellido">Apellido</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input 
                        required 
                        id="apellido" 
                        type="text" 
                        placeholder="Ej: Pérez" 
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha de Nacimiento y País */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                    <input 
                      type="date" 
                      id="fechaNacimiento" 
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full h-12 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all text-sm font-medium text-gray-800" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="pais">País</label>
                    <input 
                      type="text" 
                      id="pais" 
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      className="w-full h-12 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all text-sm font-medium text-gray-800" 
                    />
                  </div>
                </div>

                {/* Seleccionar Múltiples Oficios */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 px-1">Oficios o Especialidades (Selecciona una o más)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    {OFICIOS_CORE.map((oficio) => (
                      <label 
                        key={oficio} 
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-xs font-semibold select-none transition-all ${
                          selectedOficios.includes(oficio)
                            ? 'bg-blue-50 border-[#00355f] text-[#00355f]'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100/50'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedOficios.includes(oficio)}
                          onChange={() => handleOficioToggle(oficio)}
                          className="w-3.5 h-3.5 accent-[#00355f]"
                        />
                        {oficio}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dropdowns vinculados: Provincia y Localidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="provincia">Provincia</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select 
                        required
                        id="provincia"
                        value={selectedProvincia}
                        onChange={(e) => {
                          setSelectedProvincia(e.target.value);
                          setSelectedCiudad(''); // Reseteamos localidad al cambiar provincia
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

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="ciudad">Ciudad / Localidad</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select 
                        required
                        id="ciudad"
                        value={selectedCiudad}
                        disabled={!selectedProvincia}
                        onChange={(e) => setSelectedCiudad(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all appearance-none text-gray-800 text-sm font-medium disabled:opacity-50"
                      >
                        <option value="" disabled>Selecciona Localidad</option>
                        {selectedProvincia && PROVINCIAS_Y_CIUDADES[selectedProvincia].map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Teléfono */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="phone">Teléfono</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input 
                        required 
                        id="phone" 
                        type="tel" 
                        placeholder="+54 9..." 
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" 
                      />
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="email">Correo electrónico</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input 
                        required 
                        id="email" 
                        type="email" 
                        placeholder="nombre@ejemplo.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Experiencia */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 px-1" htmlFor="experience">Breve descripción de experiencia</label>
                  <textarea 
                    required 
                    id="experience" 
                    rows={2} 
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value)}
                    placeholder="Cuéntanos sobre tus años de experiencia y trabajos destacados..." 
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all resize-none text-xs leading-relaxed"
                  ></textarea>
                </div>

                {/* Contraseña y Confirmar Contraseña */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="password">Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input 
                        required 
                        id="password" 
                        type="password" 
                        placeholder="Mínimo 6 caracteres" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="confirmPassword">Confirmar Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input 
                        required 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Repite tu contraseña" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Botón y Login */}
                <div className="mt-4 flex flex-col gap-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full h-14 bg-[#fc8127] text-white font-bold text-lg rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Procesando...' : 'Registrarme como Profesional'}
                    {!isSubmitting && <ArrowRight className="w-6 h-6" />}
                  </button>
                  <p className="text-center text-gray-600 text-sm">
                    Ya tengo cuenta, <button type="button" onClick={() => router.push('/login')} className="text-[#00355f] font-bold hover:underline">ingresar</button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal - Modificado */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">¡Registro exitoso!</h4>
              <p className="text-sm text-gray-500 mt-2">Ya eres parte de nuestra comunidad. Serás redirigido a tu panel profesional.</p>
            </div>
            <button 
              onClick={handleCloseModal}
              className="w-full h-12 bg-[#00355f] text-white rounded-xl font-bold hover:bg-[#0f4c81] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-6 px-4 border-t border-gray-200 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-bold">© 2026 OficiosYa - Conectando Talento</p>
          <div className="flex gap-6">
            <button onClick={() => router.push('/terminos')} className="text-xs text-gray-500 hover:text-[#00355f] font-bold">Términos y Condiciones</button>
            <button onClick={() => router.push('/privacidad')} className="text-xs text-gray-500 hover:text-[#00355f] font-bold">Privacidad</button>
            <button onClick={() => router.push('/soporte')} className="text-xs text-gray-500 hover:text-[#00355f] font-bold">Soporte</button>
          </div>
        </div>
      </footer>
    </div>
  );
}