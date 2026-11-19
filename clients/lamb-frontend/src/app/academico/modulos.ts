// Mapa del portal academico (Modulo 02): curriculo, planificacion y evaluacion.
// Cada seccion del menu lateral agrupa recursos del catalogo generado del backend
// (features/microservicios/ms-catalogo.ts) por su ruta /api/v1/...

export type ClaveModulo = 'curriculo' | 'planificacion' | 'evaluacion';
// Microservicios de otros modulos que solo se leen para mostrar nombres (programa, sede, persona)
export type ClaveMs = ClaveModulo | 'institucional' | 'personas' | 'matricula';

export interface RecursoMenu {
  ruta: string;
  etiqueta: string;
}

export interface SeccionMenu {
  clave: string;
  icono: string;
  etiqueta: string;
  descripcion: string;
  // Pagina propia (plan de estudios, grupos, actas, reportes) en vez de la tabla generica
  pagina?: string;
  recursos: RecursoMenu[];
}

export interface ModuloAcademico {
  clave: ClaveModulo;
  nombre: string;
  titulo: string;
  descripcion: string;
  icono: 'curriculo' | 'planificacion' | 'evaluacion';
  // Roles que pueden escribir (mismo criterio que el Gateway en /ms/<servicio>/**)
  rolesEscritura: string[];
  secciones: SeccionMenu[];
}

const r = (ruta: string, etiqueta: string): RecursoMenu => ({ ruta: `/api/v1/${ruta}`, etiqueta });

export const MODULOS: ModuloAcademico[] = [
  {
    clave: 'curriculo',
    nombre: 'Currículo',
    titulo: 'CURRÍCULO',
    descripcion: 'Planes de estudio, cursos, perfiles, requisitos y convalidaciones',
    icono: 'curriculo',
    rolesEscritura: ['ADMIN', 'COORDINADOR'],
    secciones: [
      {
        clave: 'cursos',
        icono: '',
        etiqueta: 'Catálogo de cursos',
        descripcion: 'Modalidades, tipos de curso, cursos, sumillas, sílabos base y unidades de aprendizaje',
        recursos: [
          r('modalidades', 'Modalidades'),
          r('tipos-curso', 'Tipos de curso'),
          r('cursos-catalogo', 'Cursos'),
          r('sumillas-curso', 'Sumillas'),
          r('silabos-base', 'Sílabos base'),
          r('unidades-aprendizaje', 'Unidades de aprendizaje'),
          r('resultados-aprendizaje', 'Resultados de aprendizaje'),
        ],
      },
      {
        clave: 'plan-estudios',
        icono: '',
        etiqueta: 'Plan de estudios',
        descripcion: 'Plan de estudios por ciclos, cursos y prerrequisitos',
        pagina: 'plan-estudios',
        recursos: [],
      },
      {
        clave: 'estructura',
        icono: '',
        etiqueta: 'Estructura curricular',
        descripcion: 'Áreas, ciclos, créditos, ejes, electivos, vigencia y documentos del plan',
        recursos: [
          r('areas-curriculares', 'Áreas curriculares'),
          r('ciclos-plan', 'Ciclos del plan'),
          r('creditos-ciclo', 'Créditos por ciclo'),
          r('ejes-curriculares', 'Ejes curriculares'),
          r('grupos-electivos', 'Grupos de electivos'),
          r('menciones', 'Menciones'),
          r('vigencias-cohorte', 'Vigencia por cohorte'),
          r('resoluciones-plan', 'Resoluciones del plan'),
          r('mallas-curriculares', 'Mallas curriculares'),
        ],
      },
      {
        clave: 'perfiles',
        icono: '',
        etiqueta: 'Perfiles y grados',
        descripcion: 'Denominación, grados y títulos; perfiles de ingreso y egreso y sus competencias',
        recursos: [
          r('denominaciones-programa', 'Denominaciones'),
          r('grados-academicos', 'Grados académicos'),
          r('titulos-profesionales', 'Títulos profesionales'),
          r('perfiles-ingreso', 'Perfil de ingreso'),
          r('perfiles-egreso', 'Perfil de egreso'),
          r('competencias-generales', 'Competencias generales'),
          r('competencias-especificas', 'Competencias específicas'),
          r('dimensiones-competencia', 'Dimensiones de competencia'),
          r('modalidades-titulacion', 'Modalidades de titulación'),
        ],
      },
      {
        clave: 'requisitos',
        icono: '',
        etiqueta: 'Requisitos y formación',
        descripcion: 'Formación integral e investigación; requisitos de matrícula y egreso',
        recursos: [
          r('actividades-formacion', 'Formación integral'),
          r('voluntariados', 'Voluntariado'),
          r('proyecciones-sociales', 'Responsabilidad social'),
          r('lineas-investigacion', 'Líneas de investigación'),
          r('requisitos-matricula', 'Matrícula'),
          r('requisitos-egreso', 'Egreso'),
          r('requisitos-idioma', 'Idioma'),
          r('requisitos-practicas', 'Prácticas'),
          r('requisitos-investigacion', 'Investigación'),
          r('requisitos-extracurriculares', 'Extracurriculares'),
        ],
      },
      {
        clave: 'convalidacion',
        icono: '',
        etiqueta: 'Convalidaciones',
        descripcion: 'Equivalencias entre planes y tablas de convalidación (traslados y convalidaciones)',
        recursos: [
          r('equivalencias-plan', 'Equivalencias entre planes'),
          r('universidades-origen', 'Universidades de origen'),
          r('tablas-convalidacion', 'Tablas de convalidación'),
          r('cursos-externos-convalidables', 'Cursos externos'),
        ],
      },
      {
        clave: 'gestion',
        icono: '',
        etiqueta: 'Gestión curricular',
        descripcion: 'Comisiones, evaluación periódica y solicitudes de cambio',
        recursos: [
          r('comisiones-curriculares', 'Comisiones'),
          r('miembros-comision', 'Miembros de comisión'),
          r('evaluaciones-curriculares', 'Evaluación curricular'),
          r('solicitudes-modificacion-curricular', 'Solicitudes de modificación'),
        ],
      },
      {
        clave: 'bandeja',
        icono: '',
        etiqueta: 'Bandeja de solicitudes',
        descripcion: 'Solicitudes de modificación curricular por aprobar o rechazar',
        pagina: 'bandeja',
        recursos: [],
      },
    ],
  },
  {
    clave: 'planificacion',
    nombre: 'Planificación',
    titulo: 'PLANIFICACIÓN',
    descripcion: 'Periodos, oferta académica, grupos, horarios, ambientes y carga docente',
    icono: 'planificacion',
    rolesEscritura: ['ADMIN', 'COORDINADOR'],
    secciones: [
      {
        clave: 'ambientes',
        icono: '',
        etiqueta: 'Ambientes',
        descripcion: 'Tipos de ambiente, pabellones, aulas, laboratorios y equipamiento',
        recursos: [
          r('tipos-ambiente', 'Tipos de ambiente'),
          r('pabellones', 'Pabellones'),
          r('ambientes', 'Aulas / ambientes'),
          r('equipamientos-ambiente', 'Equipamiento'),
        ],
      },
      {
        clave: 'periodos',
        icono: '',
        etiqueta: 'Periodos y calendario',
        descripcion: 'Periodos académicos, franjas, módulos, calendario, hitos y días no lectivos',
        recursos: [
          r('tipos-periodo', 'Tipos de periodo'),
          r('periodos-academicos', 'Periodos académicos'),
          r('franjas-horarias', 'Franjas horarias'),
          r('modulos-periodo', 'Módulos (Regular / Modular)'),
          r('calendarios-academicos', 'Calendarios'),
          r('hitos-calendario', 'Hitos'),
          r('dias-no-lectivos', 'Días no lectivos'),
        ],
      },
      {
        clave: 'oferta',
        icono: '',
        etiqueta: 'Oferta académica',
        descripcion: 'Cursos, oferta por periodo, parámetros de matrícula, equivalencias, intensivos y talleres',
        recursos: [
          r('cursos', 'Cursos'),
          r('ofertas-academicas', 'Oferta académica'),
          r('parametros-matricula', 'Parámetros de matrícula'),
          r('limites-creditos', 'Límite de créditos'),
          r('equivalencias-curso', 'Equivalencias de curso'),
          r('cursos-intensivos', 'Cursos intensivos'),
          r('grupos-taller', 'Talleres'),
          r('cupos-taller', 'Cupos de talleres'),
        ],
      },
      {
        clave: 'docentes',
        icono: '',
        etiqueta: 'Docentes (registros)',
        descripcion: 'Carga lectiva y no lectiva, disponibilidad y preferencias (antes de armar los grupos)',
        recursos: [
          r('cargas-lectivas', 'Carga lectiva'),
          r('cargas-no-lectivas', 'Carga no lectiva'),
          r('disponibilidades-docente', 'Disponibilidad horaria'),
          r('preferencias-curso-docente', 'Preferencias de curso'),
        ],
      },
      {
        clave: 'grupos',
        icono: '',
        etiqueta: 'Grupos y horarios',
        descripcion: 'Apertura transaccional de grupos con horario y docentes',
        pagina: 'grupos',
        recursos: [],
      },
      {
        clave: 'detalle-grupos',
        icono: '',
        etiqueta: 'Detalle de grupos',
        descripcion: 'Horarios, docentes asignados, cupos y grupos habilitados por equivalencia',
        recursos: [
          r('horarios-grupo', 'Horarios de grupo'),
          r('asignaciones-docente', 'Asignaciones'),
          r('cupos-grupo', 'Cupos por grupo'),
          r('grupos-habilitados-equivalencia', 'Grupos por equivalencia'),
        ],
      },
      {
        clave: 'sesiones',
        icono: '',
        etiqueta: 'Sesiones y sílabos',
        descripcion: 'Sílabo del grupo, plan de clase por sesión, cronograma, conformidad y aulas virtuales',
        recursos: [
          r('silabos-grupo', 'Sílabos de grupo'),
          r('sesiones-clase', 'Sesiones de clase'),
          r('cronogramas-sesion', 'Cronograma de sesiones'),
          r('conformidades-silabo', 'Conformidad del sílabo'),
          r('aulas-virtuales', 'Aulas virtuales'),
        ],
      },
      {
        clave: 'carga-docente',
        icono: '',
        etiqueta: 'Carga docente',
        descripcion: 'Horas asignadas frente a la carga máxima por docente',
        pagina: 'carga-docente',
        recursos: [],
      },
      {
        clave: 'horarios',
        icono: '',
        etiqueta: 'Horarios en calendario',
        descripcion: 'Horario de un grupo, ambiente, docente o alumno en Semana / Mes / Día',
        pagina: 'horarios',
        recursos: [],
      },
      {
        clave: 'actividades',
        icono: '',
        etiqueta: 'Calendario de actividades',
        descripcion: 'Hitos, no lectivos, evaluaciones y pagos; documento oficial y vista como alumno',
        pagina: 'actividades',
        recursos: [],
      },
      {
        clave: 'solicitudes',
        icono: '',
        etiqueta: 'Solicitudes (registro)',
        descripcion: 'Apertura de grupos, cambios de aula, horario o docente, cierre o fusión',
        recursos: [
          r('solicitudes-apertura-grupo', 'Apertura de grupo'),
          r('solicitudes-cambio-aula', 'Cambio de aula'),
          r('solicitudes-cambio-horario', 'Cambio de horario'),
          r('solicitudes-cambio-docente', 'Cambio de docente'),
          r('solicitudes-cierre-fusion', 'Cierre o fusión'),
          r('solicitudes-grupo-equivalente', 'Grupo equivalente'),
        ],
      },
      {
        clave: 'bandeja',
        icono: '',
        etiqueta: 'Bandeja de solicitudes',
        descripcion: 'Apertura de grupo, cambios de aula, docente u horario, cierre o fusión',
        pagina: 'bandeja',
        recursos: [],
      },
    ],
  },
  {
    clave: 'evaluacion',
    nombre: 'Evaluación',
    titulo: 'EVALUACIÓN',
    descripcion: 'Notas, actas, asistencia, rúbricas y evaluación docente',
    icono: 'evaluacion',
    rolesEscritura: ['ADMIN', 'COORDINADOR', 'DOCENTE'],
    secciones: [
      {
        clave: 'actas',
        icono: '',
        etiqueta: 'Actas de notas',
        descripcion: 'Actas por grupo (se abren al abrir el grupo), notas finales, estadística y cierre',
        pagina: 'actas',
        recursos: [],
      },
      {
        clave: 'notas',
        icono: '',
        etiqueta: 'Notas y evaluaciones',
        descripcion: 'Escalas, componentes, pesos, evaluaciones programadas y notas',
        recursos: [
          r('escalas-calificacion', 'Escalas'),
          r('componentes-evaluacion', 'Componentes'),
          r('configuraciones-evaluacion', 'Pesos por componente'),
          r('evaluaciones-programadas', 'Evaluaciones programadas'),
          r('notas', 'Notas'),
        ],
      },
      {
        clave: 'rubricas',
        icono: '',
        etiqueta: 'Rúbricas',
        descripcion: 'Rúbricas, criterios y calificación por criterio',
        recursos: [
          r('rubricas', 'Rúbricas'),
          r('criterios-rubrica', 'Criterios'),
          r('calificaciones-criterio', 'Calificación por criterio'),
        ],
      },
      {
        clave: 'registro-notas',
        icono: '',
        etiqueta: 'Registro de notas',
        descripcion: 'Grilla por grupo: estudiantes × evaluaciones con nota final en vivo',
        pagina: 'registro-notas',
        recursos: [],
      },
      {
        clave: 'control-asistencia',
        icono: '',
        etiqueta: 'Control de asistencia',
        descripcion: 'Marcación por sesión y riesgo de inhabilitación',
        pagina: 'control-asistencia',
        recursos: [],
      },
      {
        clave: 'asistencia',
        icono: '',
        etiqueta: 'Asistencia (registros)',
        descripcion: 'Registro de asistencia, justificaciones e inhabilitación (30 %)',
        recursos: [
          r('registros-asistencia', 'Asistencia'),
          r('justificaciones-inasistencia', 'Justificaciones'),
          r('inhabilitaciones-inasistencia', 'Inhabilitaciones'),
        ],
      },
      {
        clave: 'rectificacion',
        icono: '',
        etiqueta: 'Firmas y rectificación',
        descripcion: 'Firmas del acta cerrada, actas complementarias y de rectificación',
        recursos: [
          r('firmas-acta', 'Firmas / visado'),
          r('actas-complementarias', 'Actas complementarias'),
          r('actas-rectificacion', 'Actas de rectificación'),
        ],
      },
      {
        clave: 'rezagadas',
        icono: '',
        etiqueta: 'Notas rezagadas',
        descripcion: 'Solicitudes de apertura, respuestas y plazos habilitados',
        recursos: [
          r('solicitudes-apertura-notas', 'Solicitudes de apertura'),
          r('respuestas-solicitud-apertura', 'Respuestas'),
          r('plazos-apertura', 'Plazos habilitados'),
        ],
      },
      {
        clave: 'encuesta',
        icono: '',
        etiqueta: 'Evaluación docente',
        descripcion: 'Encuestas, preguntas y respuestas de la evaluación docente',
        recursos: [
          r('encuestas-docente', 'Encuestas'),
          r('preguntas-encuesta', 'Preguntas'),
          r('respuestas-encuesta', 'Respuestas'),
        ],
      },
      {
        clave: 'reportes',
        icono: '',
        etiqueta: 'Reportes',
        descripcion: 'Cuadro de méritos, nota final y resultado de la evaluación docente',
        pagina: 'reportes',
        recursos: [],
      },
      {
        clave: 'bandeja',
        icono: '',
        etiqueta: 'Bandeja de solicitudes',
        descripcion: 'Rectificaciones de acta, justificaciones de inasistencia y apertura de notas',
        pagina: 'bandeja',
        recursos: [],
      },
    ],
  },
];

export function buscarModulo(clave: string | null | undefined): ModuloAcademico | undefined {
  return MODULOS.find((m) => m.clave === clave);
}

/**
 * Campos id que apuntan a otro recurso: el formulario los muestra como lista desplegable.
 * ms indica el microservicio dueño (idGrupo en evaluacion es un grupo de planificacion).
 */
export interface Referencia {
  ms: ClaveMs;
  ruta: string;
}

const ref = (ms: ClaveMs, ruta: string): Referencia => ({ ms, ruta: `/api/v1/${ruta}` });

// IDs de otros modulos (institucional y personas): iguales en los tres microservicios
export const REF_PROGRAMA = ref('institucional', 'programas');
export const REF_PERSONA = ref('personas', 'persona/personas');
const EXTERNAS: Record<string, Referencia> = {
  idPrograma: REF_PROGRAMA,
  idProgramaOrigen: REF_PROGRAMA,
  idProgramaEquivalente: REF_PROGRAMA,
  idFacultad: ref('institucional', 'facultades'),
  idSede: ref('institucional', 'campus-sede/sedes'),
  idPersona: REF_PERSONA,
  idDocente: REF_PERSONA,
  idDocenteNuevo: REF_PERSONA,
  idSolicitante: REF_PERSONA,
};

/**
 * Ids que no son de un CRUD propio sino de datos de la misma pantalla (no hay lista global).
 * Se muestran con el mismo aviso "se jala de..." que las referencias.
 */
export const ORIGENES_LOCALES: Record<ClaveModulo, Record<string, { crud: string; ms: ClaveMs }>> = {
  curriculo: {
    idPlanCursoRequisito: { crud: 'Cursos del plan (malla de este plan de estudios)', ms: 'curriculo' },
    idPlanCursos: { crud: 'Cursos del plan (ids de la malla, en JSON)', ms: 'curriculo' },
    idCursosCatalogo: { crud: 'Cursos catalogo', ms: 'curriculo' },
    idPlanCurso: { crud: 'Cursos del plan (malla de este plan de estudios)', ms: 'curriculo' },
    idCursoRequisito: { crud: 'Cursos del plan (malla de este plan de estudios)', ms: 'curriculo' },
    idPlanCursoOrigen: { crud: 'Cursos del plan origen (malla)', ms: 'curriculo' },
    idPlanCursoDestino: { crud: 'Cursos del plan destino (malla)', ms: 'curriculo' },
    idCompetencia: { crud: 'Competencias generales o Competencias específicas (según el tipo)', ms: 'curriculo' },
  },
  planificacion: {
    idProgramas: { crud: 'Programas (lista de ids en JSON)', ms: 'institucional' },
  },
  evaluacion: {},
};

/** Texto de ayuda por recurso y campo para las tablas CRUD genericas (clave: ruta del recurso). */
export const AYUDAS_RECURSO: Record<string, Record<string, string>> = {
  '/api/v1/cursos-catalogo': {
    codigo: 'Código oficial y único del curso, p. ej. 15181 o IS101 (máx. 20).',
    horasTeoria: 'HT: horas semanales de teoría (0 a 20). Puede ser 0 en cursos solo de práctica, p. ej. Talleres para la Vida.',
    horasPractica: 'HP: horas semanales de práctica (0 a 20). HT + HP debe ser al menos 1; TH = HT + HP.',
    horasNoPresenciales: 'HNP: horas no presenciales (0 si el curso es totalmente presencial).',
    horasAprendizajeAutonomo: 'HAA: horas de aprendizaje autónomo del estudiante.',
    creditosTeoria: 'CT: créditos de teoría. Opcional; si llenas CT y CP deben sumar los créditos del curso.',
    creditosPractica: 'CP: créditos de práctica. Opcional; con CT debe sumar los créditos del curso.',
    idDepartamento: 'Departamento académico que dicta el curso (p. ej. Ciencias Básicas), no la facultad ni la carrera.',
  },
};

export const REFERENCIAS: Record<ClaveModulo, Record<string, Referencia>> = {
  curriculo: {
    ...EXTERNAS,
    idPlan: ref('curriculo', 'planes-estudio'),
    idPlanOrigen: ref('curriculo', 'planes-estudio'),
    idPlanDestino: ref('curriculo', 'planes-estudio'),
    idPerfilEgreso: ref('curriculo', 'perfiles-egreso'),
    idCicloPlan: ref('curriculo', 'ciclos-plan'),
    // Departamento que dicta el curso: lo administra institucional (facultad-escuela)
    idDepartamento: ref('institucional', 'facultad-escuela/departamentos-academicos'),
    idModalidad: ref('curriculo', 'modalidades'),
    idTabla: ref('curriculo', 'tablas-convalidacion'),
    idLinea: ref('curriculo', 'lineas-investigacion'),
    idCurso: ref('curriculo', 'cursos-catalogo'),
    idCursoCatalogo: ref('curriculo', 'cursos-catalogo'),
    idCursoRequisito: ref('curriculo', 'cursos-catalogo'),
    idComision: ref('curriculo', 'comisiones-curriculares'),
    idTipoCurso: ref('curriculo', 'tipos-curso'),
    idAreaCurricular: ref('curriculo', 'areas-curriculares'),
    idUniversidad: ref('curriculo', 'universidades-origen'),
    idSilabo: ref('curriculo', 'silabos-base'),
    idCompetenciaEspecifica: ref('curriculo', 'competencias-especificas'),
    idCompetenciaGeneral: ref('curriculo', 'competencias-generales'),
    // Evaluacion curricular por periodo: el periodo lo administra planificacion
    idPeriodo: ref('planificacion', 'periodos-academicos'),
  },
  planificacion: {
    ...EXTERNAS,
    idPabellon: ref('planificacion', 'pabellones'),
    idTipoAmbiente: ref('planificacion', 'tipos-ambiente'),
    idGrupo: ref('planificacion', 'grupos'),
    idGrupoDestino: ref('planificacion', 'grupos'),
    idPeriodo: ref('planificacion', 'periodos-academicos'),
    idSesion: ref('planificacion', 'sesiones-clase'),
    idGrupoTaller: ref('planificacion', 'grupos-taller'),
    idCurso: ref('planificacion', 'cursos'),
    idCursoEquivalente: ref('planificacion', 'cursos'),
    idCalendario: ref('planificacion', 'calendarios-academicos'),
    idAmbiente: ref('planificacion', 'ambientes'),
    idAmbienteNuevo: ref('planificacion', 'ambientes'),
    idOferta: ref('planificacion', 'ofertas-academicas'),
    idEquivalencia: ref('planificacion', 'equivalencias-curso'),
    idTipoPeriodo: ref('planificacion', 'tipos-periodo'),
    idSilabo: ref('planificacion', 'silabos-grupo'),
    idHorario: ref('planificacion', 'horarios-grupo'),
    idAsignacion: ref('planificacion', 'asignaciones-docente'),
    idGrupoHabilitado: ref('planificacion', 'grupos-habilitados-equivalencia'),
    idModulo: ref('planificacion', 'modulos-periodo'),
    idAsignacionDocente: ref('planificacion', 'asignaciones-docente'),
    // Del curriculo: el silabo de grupo parte del silabo base y la sesion de una unidad
    idSilaboBase: ref('curriculo', 'silabos-base'),
    idUnidadAprendizaje: ref('curriculo', 'unidades-aprendizaje'),
  },
  evaluacion: {
    ...EXTERNAS,
    idActa: ref('evaluacion', 'actas'),
    idGrupo: ref('planificacion', 'grupos'),
    idCriterio: ref('evaluacion', 'criterios-rubrica'),
    idComponente: ref('evaluacion', 'componentes-evaluacion'),
    idRubrica: ref('evaluacion', 'rubricas'),
    idRegistro: ref('evaluacion', 'registros-asistencia'),
    idSolicitud: ref('evaluacion', 'solicitudes-apertura-notas'),
    idEncuesta: ref('evaluacion', 'encuestas-docente'),
    idPregunta: ref('evaluacion', 'preguntas-encuesta'),
    idEvaluacionProgramada: ref('evaluacion', 'evaluaciones-programadas'),
    idPeriodo: ref('planificacion', 'periodos-academicos'),
    idSesionClase: ref('planificacion', 'sesiones-clase'),
  },
};
