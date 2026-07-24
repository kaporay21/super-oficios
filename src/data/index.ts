// src/data/index.ts
import { Professional, Job } from '../types';

export const MAP_IMAGE_URL = ""; // Placeholder por si luego quieres poner un mapa

export const PROFESSIONALS: Professional[] = [
  { id: 1, name: "Ricardo Méndez", category: "plomeria", trade: "Plomero Matriculado", location: "Palermo, CABA", rating: 4.9, avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Lucía Ferreyra", category: "electricidad", trade: "Electricista Industrial", location: "San Isidro, GBA", rating: 5.0, avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Jorge Rossi", category: "albanileria", trade: "Albañilería y Reformas", location: "Avellaneda, GBA", rating: 4.8, avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Martín Sosa", category: "pintura", trade: "Pintura de Interiores", location: "Caballito, CABA", rating: 4.7, avatar: "https://i.pravatar.cc/150?u=4" }
];

export const MOCK_JOBS: Job[] = [
  { id: 1, title: "Fuga de agua en baño", description: "Necesito arreglar una pérdida urgente en el lavamanos.", urgency: "urgent", timeAgo: "Hace 1 hora" },
  { id: 2, title: "Instalar ventilador", description: "Instalación de ventilador de techo en living.", urgency: "normal", timeAgo: "Hace 3 horas" }
];