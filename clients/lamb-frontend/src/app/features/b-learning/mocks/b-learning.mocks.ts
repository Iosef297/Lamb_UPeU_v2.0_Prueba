export interface Periodo {
  id: string;
  nombre: string;
}

export interface Curso {
  id: string;
  numero: number;
  nombre: string;
  programa: string;
  ciclo: string;
  grupo: string;
  nivel: string;
  docente: string;
  color: string;
  periodoId: string;
}

export interface SesionHoy {
  id: string;
  cursoId: string;
  cursoNombre: string;
  numero: number;
  titulo: string;
}

export interface Pendiente {
  id: string;
  cursoNombre: string;
  tipo: 'Tarea' | 'Evaluación' | 'Foro';
  titulo: string;
  fecha: string;
  hora: string;
}

export interface Comunicado {
  id: string;
  cursoNombre: string;
  titulo: string;
  fecha: string;
}

export const PERIODOS_MOCK: Periodo[] = [
  { id: '2026-2', nombre: '2026-2' },
  { id: '2026-1', nombre: '2026-1' },
  { id: '2025-2', nombre: '2025-2' },
  { id: '2025-1', nombre: '2025-1' },
  { id: '2024-2', nombre: '2024-2' },
];

export const CURSOS_MOCK: Curso[] = [
  { id: 'c1', numero: 1, nombre: 'Formación cristiana V', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'Miguel Angel Aguilar Blancas', color: '#8B6F47', periodoId: '2026-2' },
  { id: 'c2', numero: 2, nombre: 'Arquitectura de computadoras', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'John Carlos Quispe Chambi', color: '#6B8E5A', periodoId: '2026-2' },
  { id: 'c3', numero: 3, nombre: 'Contabilidad', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'Marleny Huanca Galindo', color: '#B8923B', periodoId: '2026-2' },
  { id: 'c4', numero: 4, nombre: 'Matemática discreta', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'Ciro William Taipe Huaman', color: '#C77A5A', periodoId: '2026-2' },
  { id: 'c5', numero: 5, nombre: 'Desarrollo de aplicaciones distribuidas', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'Abel Angel Sullon Macalupu', color: '#7B5EA7', periodoId: '2026-2' },
  { id: 'c6', numero: 6, nombre: 'Ingeniería administrativa', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'Marleny Huanca Galindo', color: '#4A7BA8', periodoId: '2026-2' },
  { id: 'c7', numero: 7, nombre: 'Estadística para la Investigación', programa: 'Programa Ingeniería de Sistemas', ciclo: 'Ciclo V', grupo: 'G1', nivel: 'Pregrado', docente: 'Milton Edward Humpiri Flores', color: '#2E7D8F', periodoId: '2026-2' },
];

export const SESIONES_HOY_MOCK: SesionHoy[] = [
  { id: 's1', cursoId: 'c3', cursoNombre: 'Contabilidad', numero: 7, titulo: 'RETROALIMENTACIÓN: registro de ventas, compras, caja, bancos, planilla de remuneraciones' },
];

export const PENDIENTES_MOCK: Pendiente[] = [
  { id: 'p1', cursoNombre: 'Formación cristiana V', tipo: 'Tarea', titulo: 'yo en el universo', fecha: 'Vie 27 de Nov', hora: '12:00 PM' },
];

export const COMUNICADOS_MOCK: Comunicado[] = [];
