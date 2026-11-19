export type FieldType = 'text' | 'number' | 'decimal' | 'date' | 'datetime' | 'enum' | 'boolean' | 'textarea' | 'id' | 'reniec' | 'ref' | 'file' | 'multiref';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];     // para enum
  listed?: boolean;       // se muestra en la tabla
  editable?: boolean;     // se puede editar en el formulario (false para campos calculados)
  default?: any;
  refPath?: string;       // para 'ref': endpoint GET que lista las opciones (FK)
  refLabelKey?: string;   // para 'ref': campo a mostrar de cada opción (default 'nombre')
  refResponseKey?: string;// para 'ref': cuando el GET devuelve el objeto anidado (ej. "facultad") en vez del id plano
  refSourceHint?: string; // nota visible debajo del campo indicando de qué microservicio/módulo debe venir el dato (uso: campos todavía sin integrar a otro microservicio)
  disabled?: boolean;     // deshabilita el control en el formulario (uso: campo pendiente de integración externa)
  fileNameTarget?: string;// para 'file': key del campo donde se guarda el nombre del archivo elegido
  fileUrlTarget?: string; // para 'file': key del campo donde se guarda la URL (blob local) del archivo elegido
  suggestOnChange?: {     // para 'ref': al elegir una opción, sugiere (no bloquea) un valor en otro campo 'ref'
    targetKey: string;        // key del campo a sugerir
    labelMap: Record<string, string>; // nombre de la opción elegida -> nombre de la opción a sugerir en targetKey
  };
  multiRef?: {            // para 'multiref': relación N:M vía tabla de union, key del campo debe empezar con "__" (no va en el body de la entidad principal)
    refPath: string;          // endpoint GET que lista las opciones
    refLabelKey?: string;     // campo a mostrar de cada opción (default 'nombre')
    joinPath: string;         // endpoint CRUD de la tabla de union
    ownerKey: string;         // nombre del campo (query param y body) que referencia a esta entidad en la tabla de union
    valueKey: string;         // nombre del campo (body) que referencia a la opción elegida en la tabla de union
  };
}

export interface CrudDef {
  slug: string;
  label: string;
  icon: string;
  path: string;
  group: 'Admisión' | 'Trayectoria' | 'Institucional' | 'Personas' | 'Currículo' | 'Finanzas';
  subgroup?: string;
  description: string;
  fields: FieldDef[];
  /** Slugs de un mismo conjunto que se muestran como tabs dentro de una sola pantalla (UI only, no fusiona entidades de backend). */
  tabGroup?: string[];
  /** No aparece como link propio en el sidebar; solo accesible como tab de otro CrudDef de su tabGroup. */
  hidden?: boolean;
  /** Catálogo cerrado por norma/ley: oculta "Nuevo" y "eliminar", solo se puede editar la descripción de los registros existentes. */
  lockedCatalog?: boolean;
}

// Helper
const f = (key: string, label: string, type: FieldType, opts: Partial<FieldDef> = {}): FieldDef =>
  ({ key, label, type, listed: true, editable: true, ...opts });

export const CRUDS: CrudDef[] = [
  // ============ ADMISIÓN (8) ============
  {
    group: 'Admisión', slug: 'convocatorias', label: 'Convocatoria y oferta',
    icon: 'campaign', path: '/api/v1/convocatorias',
    description: 'Proceso de admisión, modalidad, vacantes y cronograma del periodo',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('codigo', 'Código', 'text', { required: true }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('periodo', 'Periodo', 'text', { required: true, default: '2026-2' }),
      f('fechaInicio', 'Inicio', 'date', { required: true }),
      f('fechaFin', 'Fin', 'date', { required: true }),
      f('fechaExamen', 'Fecha examen', 'date'),
      f('vacantesTotales', 'Vacantes', 'number', { required: true, default: 0 }),
      f('estado', 'Estado', 'enum', { required: true, options: ['PLANIFICADA','ABIERTA','CERRADA','ANULADA'], default: 'PLANIFICADA' }),
      f('observacion', 'Observación', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Admisión', slug: 'postulantes', label: 'Postulante',
    icon: 'person', path: '/api/v1/postulantes',
    description: 'Datos del postulante, apoderado y colegio de procedencia',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('__reniec', 'Buscar por DNI (RENIEC)', 'reniec', { listed: false }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('idConvocatoria', 'ID Convocatoria', 'number', { required: true }),
      f('idPrograma', 'ID Programa', 'number', { required: true }),
      f('idModalidad', 'ID Modalidad', 'number', { required: true }),
      // Código autogenerado por backend: POS-{periodo}-{correlativo}. No se edita.
      f('codigoPostulante', 'Código', 'text', { editable: false }),
      f('colegioProcedencia', 'Colegio', 'text'),
      f('anioEgresoColegio', 'Año egreso', 'number'),
      f('promedioColegio', 'Promedio', 'decimal'),
      f('telefonoContacto', 'Teléfono', 'text'),
      f('correoContacto', 'Correo', 'text'),
      f('nombreApoderado', 'Apoderado', 'text'),
      f('telefonoApoderado', 'Tel. apoderado', 'text', { listed: false }),
      f('estado', 'Estado', 'enum', { required: true, options: ['REGISTRADO','INSCRITO','EVALUADO','ADMITIDO','RECHAZADO','DESISTIDO'], default: 'REGISTRADO' })
    ]
  },
  {
    group: 'Admisión', slug: 'inscripciones', label: 'Inscripción',
    icon: 'how_to_reg', path: '/api/v1/inscripciones',
    description: 'Solicitud de admisión con sus documentos presentados',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('idPrograma', 'ID Programa', 'number', { required: true }),
      f('idModalidad', 'ID Modalidad', 'number', { required: true }),
      f('periodo', 'Periodo', 'text', { required: true, default: '2026-2' }),
      f('estado', 'Estado', 'enum', { required: true, options: ['PENDIENTE','OBSERVADA','APROBADA','RECHAZADA'], default: 'PENDIENTE' }),
      f('observacion', 'Observación', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Admisión', slug: 'examenes-admision', label: 'Examen de admisión',
    icon: 'quiz', path: '/api/v1/examenes-admision',
    description: 'Examen, aula asignada, aforo y estado',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idConvocatoria', 'ID Convocatoria', 'number', { required: true }),
      f('codigo', 'Código', 'text', { required: true }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('fechaExamen', 'Fecha', 'datetime', { required: true }),
      f('duracionMinutos', 'Duración (min)', 'number', { required: true, default: 120 }),
      f('idAula', 'ID Aula', 'number'),
      f('aforoMaximo', 'Aforo máx.', 'number', { required: true, default: 30 }),
      f('aforoAsignado', 'Aforo asignado', 'number', { required: true, default: 0 }),
      f('estado', 'Estado', 'enum', { required: true, options: ['PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO'], default: 'PROGRAMADO' })
    ]
  },
  {
    group: 'Admisión', slug: 'seguimientos', label: 'Seguimiento y cierre',
    icon: 'timeline', path: '/api/v1/seguimientos',
    description: 'Contactos, medios de captación y reclamos',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idPostulante', 'ID Postulante', 'number', { required: true }),
      f('canal', 'Canal', 'enum', { required: true, options: ['LLAMADA','WHATSAPP','CORREO','PRESENCIAL'], default: 'LLAMADA' }),
      f('medioCaptacion', 'Medio captación', 'text'),
      f('asunto', 'Asunto', 'text', { required: true }),
      f('detalle', 'Detalle', 'textarea', { listed: false }),
      f('resultado', 'Resultado', 'enum', { required: true, options: ['CONTACTADO','SIN_RESPUESTA','INTERESADO','DESCARTADO'], default: 'CONTACTADO' }),
      f('idResponsable', 'ID Responsable', 'number'),
      f('fechaContacto', 'Fecha contacto', 'datetime', { required: true }),
      f('proximoContacto', 'Próximo contacto', 'datetime', { listed: false })
    ]
  },
  {
    group: 'Admisión', slug: 'calificaciones', label: 'Examen y calificación',
    icon: 'grade', path: '/api/v1/calificaciones',
    description: 'Puntajes del examen, supervisor y encargado',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idExamen', 'ID Examen', 'number', { required: true }),
      f('idPostulante', 'ID Postulante', 'number', { required: true }),
      f('puntajeTotal', 'Puntaje total', 'decimal', { required: true }),
      f('puntajeAptitud', 'Aptitud', 'decimal'),
      f('puntajeConocimiento', 'Conocimiento', 'decimal'),
      f('respuestasCorrectas', 'Correctas', 'number'),
      f('respuestasIncorrectas', 'Incorrectas', 'number'),
      f('respuestasBlanco', 'Blanco', 'number', { listed: false }),
      f('ordenMerito', 'Orden mérito', 'number'),
      f('idSupervisor', 'ID Supervisor', 'number'),
      f('idEncargado', 'ID Encargado', 'number'),
      f('observacion', 'Observación', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Admisión', slug: 'adjudicaciones', label: 'Vacantes e ingreso',
    icon: 'verified', path: '/api/v1/adjudicaciones',
    description: 'Adjudicación de vacantes y lista de ingresantes',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idPostulante', 'ID Postulante', 'number', { required: true }),
      f('idModalidad', 'ID Modalidad', 'number', { required: true }),
      f('idPrograma', 'ID Programa', 'number', { required: true }),
      f('puntajeFinal', 'Puntaje final', 'decimal', { required: true }),
      f('ordenMerito', 'Orden mérito', 'number'),
      f('estado', 'Estado', 'enum', { required: true, options: ['PENDIENTE','ADJUDICADA','PUBLICADA','ANULADA'], default: 'PENDIENTE' }),
      f('numeroResolucion', 'N° Resolución', 'text'),
      f('fechaPublicacion', 'Publicación', 'datetime', { listed: false }),
      f('observacion', 'Observación', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Admisión', slug: 'casos-especiales', label: 'Casos especiales',
    icon: 'warning', path: '/api/v1/casos-especiales',
    description: 'Ficha socioeconómica, discapacidad, prórrogas, convalidación, anulación',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idPostulante', 'ID Postulante', 'number', { required: true }),
      f('tipoCaso', 'Tipo', 'enum', { required: true, options: ['FICHA_SOCIOECONOMICA','DISCAPACIDAD','PRORROGA_EXAMEN','CONVALIDACION_TRASLADO','ANULACION_INSCRIPCION','CARGA_MASIVA','RECLAMO_APELACION'], default: 'FICHA_SOCIOECONOMICA' }),
      f('descripcion', 'Descripción', 'textarea', { required: true }),
      f('requiereAjuste', 'Requiere ajuste', 'boolean', { required: true, default: false }),
      f('ajusteOtorgado', 'Ajuste otorgado', 'textarea', { listed: false }),
      f('nivelSocioeconomico', 'Nivel socioec.', 'enum', { options: ['A','B','C','D','E'], listed: false }),
      f('idResponsable', 'ID Responsable', 'number'),
      f('estado', 'Estado', 'enum', { required: true, options: ['ABIERTO','EN_REVISION','RESUELTO','RECHAZADO'], default: 'ABIERTO' })
    ]
  },

  // ============ TRAYECTORIA (6) ============
  {
    group: 'Trayectoria', slug: 'trayectorias', label: 'Estudiante en el plan',
    icon: 'route', path: '/api/v1/trayectorias',
    description: 'Estado académico, cambios de plan, traslados internos y reincorporaciones',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('idPrograma', 'ID Programa', 'number', { required: true }),
      f('idPostulacion', 'ID Postulación', 'number', { required: true }),
      f('idPlan', 'ID Plan', 'number'),
      f('idEscuela', 'ID Escuela', 'number', { listed: false }),
      f('idSede', 'ID Sede', 'number', { listed: false }),
      f('periodoIngreso', 'Periodo ingreso', 'text', { required: true, default: '2026-2' }),
      f('estado', 'Estado', 'enum', { required: true, options: ['ACTIVO','RESERVA','RETIRADO','SEPARADO','EGRESADO','REINCORPORADO'], default: 'ACTIVO' }),
      f('creditosTotalesPlan', 'Cr. plan', 'number', { listed: false }),
      f('creditosAprobados', 'Cr. aprob.', 'number', { required: true, default: 0 }),
      f('promedioPonderado', 'Promedio', 'decimal')
    ]
  },
  {
    group: 'Trayectoria', slug: 'cumplimientos-requisito', label: 'Avance y requisitos',
    icon: 'checklist', path: '/api/v1/cumplimientos-requisito',
    description: 'Convalidaciones, cumplimiento de requisitos de egreso, formación integral y prácticas',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idTrayectoria', 'ID Trayectoria', 'number', { required: true }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('tipoRequisito', 'Tipo', 'enum', { required: true, options: ['REQUISITO_EGRESO','IDIOMA','PRACTICAS','INVESTIGACION','EXTRACURRICULAR','FORMACION_INTEGRAL','CONVALIDACION'], default: 'REQUISITO_EGRESO' }),
      f('idRequisitoExterno', 'ID Req. externo', 'number'),
      f('codigoExterno', 'Código', 'text'),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('cumplido', 'Cumplido', 'boolean', { required: true, default: false }),
      f('valorCumplimiento', 'Valor', 'text', { listed: false }),
      f('creditosReconocidos', 'Cr. reconocidos', 'number'),
      f('fechaCumplimiento', 'Fecha', 'date'),
      f('evidenciaUrl', 'Evidencia', 'text', { listed: false })
    ]
  },
  {
    group: 'Trayectoria', slug: 'alertas-riesgo', label: 'Riesgo académico',
    icon: 'warning', path: '/api/v1/alertas-riesgo',
    description: 'Alertas, planes de refuerzo, reglas, niveles, casos de seguimiento y control de repitencia',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idTrayectoria', 'ID Trayectoria', 'number', { required: true }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('nivelRiesgo', 'Nivel', 'enum', { required: true, options: ['BAJO','MEDIO','ALTO','CRITICO'], default: 'MEDIO' }),
      f('tipoAlerta', 'Tipo', 'enum', { required: true, options: ['PROMEDIO_BAJO','REPITENCIA','INASISTENCIA','ABANDONO','DESEMPENIO','OTRO'], default: 'PROMEDIO_BAJO' }),
      f('descripcion', 'Descripción', 'textarea', { required: true }),
      f('valorDetectado', 'Valor', 'decimal'),
      f('umbralRegla', 'Umbral', 'decimal', { listed: false }),
      f('numeroRepitencia', 'N° repitencia', 'number', { listed: false }),
      f('codigoCurso', 'Curso', 'text'),
      f('estado', 'Estado', 'enum', { required: true, options: ['ACTIVA','EN_INTERVENCION','CERRADA','DESCARTADA'], default: 'ACTIVA' }),
      f('fechaDeteccion', 'Detectada', 'datetime', { required: true })
    ]
  },
  {
    group: 'Trayectoria', slug: 'tutorias', label: 'Tutoría y bienestar',
    icon: 'school', path: '/api/v1/tutorias',
    description: 'Programa de tutoría, asignación de tutor, sesiones, observaciones y derivación a bienestar',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idTrayectoria', 'ID Trayectoria', 'number', { required: true }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('idTutor', 'ID Tutor', 'number', { required: true }),
      f('idProgramaTutoria', 'ID Programa', 'number'),
      f('programaTutoria', 'Programa', 'text'),
      f('periodo', 'Periodo', 'text', { required: true, default: '2026-2' }),
      f('estado', 'Estado', 'enum', { required: true, options: ['ACTIVA','CERRADA','DERIVADA_BIENESTAR'], default: 'ACTIVA' }),
      f('fechaInicio', 'Inicio', 'date', { required: true }),
      f('fechaFin', 'Fin', 'date', { listed: false })
    ]
  },
  {
    group: 'Trayectoria', slug: 'reconocimientos', label: 'Logros y evidencias',
    icon: 'military_tech', path: '/api/v1/reconocimientos',
    description: 'Reconocimientos (tercio superior, beca de excelencia, mención) y portafolio de competencias',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idTrayectoria', 'ID Trayectoria', 'number', { required: true }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('tipoReconocimiento', 'Tipo', 'enum', { required: true, options: ['TERCIO_SUPERIOR','BECA_EXCELENCIA','MENCION_HONROSA','PORTAFOLIO','COMPETENCIA','OTRO'], default: 'TERCIO_SUPERIOR' }),
      f('descripcion', 'Descripción', 'textarea', { required: true }),
      f('periodo', 'Periodo', 'text'),
      f('idCompetencia', 'ID Competencia', 'number', { listed: false }),
      f('autoevaluacion', 'Autoevaluación', 'textarea', { listed: false }),
      f('evidenciaUrl', 'Evidencia', 'text', { listed: false })
    ]
  },
  {
    group: 'Trayectoria', slug: 'egresos', label: 'Cierre y egreso',
    icon: 'workspace_premium', path: '/api/v1/egresos',
    description: 'Egreso con verificación de requisitos, solicitud de constancia, situación al cierre e informe',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idTrayectoria', 'ID Trayectoria', 'number', { required: true }),
      f('idPersona', 'ID Persona', 'number', { required: true }),
      f('periodoEgreso', 'Periodo', 'text', { required: true, default: '2026-2' }),
      f('fechaEgreso', 'Fecha egreso', 'date', { required: true }),
      f('creditosTotales', 'Cr. totales', 'number', { required: true, default: 0 }),
      f('promedioFinal', 'Promedio final', 'decimal'),
      f('todosRequisitosCumplidos', 'Req. OK', 'boolean', { required: true, default: false }),
      f('numeroResolucion', 'N° Resolución', 'text'),
      f('observacion', 'Observación', 'textarea', { listed: false })
    ]
  },
  // ============ INSTITUCIONAL (46) ============
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-niveles-academicos", label: "Nivel académico",
    hidden: true,
    icon: "stairs", path: "/api/v1/programa-academico/niveles-academicos",
    description: "Niveles académicos (pregrado, posgrado, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-grados-academicos", label: "Grado académico",
    hidden: true,
    icon: "workspace_premium", path: "/api/v1/programa-academico/grados-academicos",
    description: "Grados académicos (bachiller, licenciatura, maestría, doctorado, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-programas", label: "Programa académico",
    icon: "school", path: "/api/v1/programas",
    description: "Programa académico: nombre, grado y facultad",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("nivelAcademicoId", "Nivel académico", "ref", { refPath: "/api/v1/programa-academico/niveles-academicos", refLabelKey: "nombre", refResponseKey: "nivelAcademico", default: 1, disabled: true, refSourceHint: "Pendiente: debe jalarse del microservicio Currículo (lamb-curriculo-ms, GET /api/v1/niveles-academicos)." }),
      f("gradoAcademicoCatalogoId", "Grado académico", "ref", { refPath: "/api/v1/programa-academico/grados-academicos", refLabelKey: "nombre", refResponseKey: "gradoAcademicoCatalogo", default: 1, disabled: true, refSourceHint: "Pendiente: debe jalarse del microservicio Currículo (lamb-curriculo-ms, GET /api/v1/grados-academicos)." }),
      f("duracionSemestres", "Duración (semestres)", "number"),
      f("facultadId", "Facultad", "ref", { required: true, refPath: "/api/v1/facultades", refLabelKey: "nombre", refResponseKey: "facultad" })
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-modalidades-estudio", label: "Modalidad de estudio",
    lockedCatalog: true, hidden: true,
    icon: "laptop", path: "/api/v1/programa-academico/modalidades-estudio",
    description: "Modalidades de estudio: solo las 3 reconocidas por SUNEDU/Ley Universitaria 30220 (Presencial, Semipresencial, A Distancia).",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-regimenes-academicos", label: "R\u00e9gimen académico",
    icon: "rule", path: "/api/v1/programa-academico/regimenes-academicos",
    description: "",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea"),
      f("periodosPorAnio", "Periodos por año", "number"),
      f("activo", "Activo", "boolean", { default: true }),
      f("__modalidades", "Modalidades aplicables", "multiref", {
        listed: true,
        multiRef: {
          refPath: "/api/v1/programa-academico/modalidades-estudio",
          refLabelKey: "nombre",
          joinPath: "/api/v1/programa-academico/regimen-modalidad",
          ownerKey: "idRegimenAcademico",
          valueKey: "idModalidadEstudio"
        }
      })
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-programa-sede", label: "Programa por sede",
    icon: "location_city", path: "/api/v1/programa-academico/programa-sede",
    description: "Vigencia de un programa académico en una sede, con su modalidad y régimen académico",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPrograma", "Programa", "ref", { required: true, refPath: "/api/v1/programas", refLabelKey: "nombre" }),
      f("idSede", "Sede", "ref", { required: true, refPath: "/api/v1/campus-sede/sedes", refLabelKey: "nombre" }),
      f("vigente", "Vigente", "boolean", { default: true }),
      f("idModalidadEstudio", "Modalidad de estudio", "ref", { refPath: "/api/v1/programa-academico/modalidades-estudio", refLabelKey: "nombre", refResponseKey: "modalidadEstudio",
        suggestOnChange: { targetKey: "idRegimenAcademico", labelMap: { "Presencial": "Semestral", "Semipresencial": "Modular", "A Distancia": "Modular" } }
      }),
      f("idRegimenAcademico", "Régimen académico", "ref", { refPath: "/api/v1/programa-academico/regimenes-academicos", refLabelKey: "nombre", refResponseKey: "regimenAcademico" })
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-grados-titulos", label: "Grado y t\u00edtulo",
    icon: "workspace_premium", path: "/api/v1/programa-academico/grados-titulos",
    description: "Grados y t\u00edtulos otorgados por programa",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPrograma", "ID Programa", "number", { required: true }),
      f("grado", "Grado", "text", { required: true }),
      f("titulo", "T\u00edtulo", "text")
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-resoluciones-programa", label: "Resoluci\u00f3n de programa",
    icon: "description", path: "/api/v1/programa-academico/resoluciones-programa",
    description: "Resoluciones de creaci\u00f3n/modificaci\u00f3n de programas",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPrograma", "ID Programa", "number", { required: true }),
      f("numeroResolucion", "N\u00b0 Resoluci\u00f3n", "text", { required: true }),
      f("tipoResolucion", "Tipo", "text"),
      f("fechaEmision", "Fecha emisi\u00f3n", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-menciones-especialidad", label: "Menci\u00f3n / especialidad",
    icon: "star", path: "/api/v1/programa-academico/menciones-especialidad",
    description: "Menciones y especialidades dentro de un programa",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idPrograma", "ID Programa", "number", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Programa académico", slug: "inst-acreditaciones-programa", label: "Acreditaci\u00f3n de programa",
    icon: "verified", path: "/api/v1/programa-academico/acreditaciones-programa",
    description: "Acreditaciones obtenidas por un programa académico",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPrograma", "ID Programa", "number", { required: true }),
      f("entidadAcreditadora", "Entidad acreditadora", "text", { required: true }),
      f("fechaAcreditacion", "Fecha acreditaci\u00f3n", "date"),
      f("fechaVigencia", "Vigencia", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Periodo académico", slug: "inst-anios-academicos", label: "A\u00f1o académico",
    icon: "event", path: "/api/v1/periodo-academico/anios-academicos",
    description: "A\u00f1os académicos institucionales",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("anio", "A\u00f1o", "number", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Periodo académico", slug: "inst-tipos-periodo", label: "Tipo de periodo",
    icon: "category", path: "/api/v1/periodo-academico/tipos-periodo",
    description: "Tipos de periodo académico (semestre, verano, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Periodo académico", slug: "inst-periodos", label: "Periodo académico",
    icon: "date_range", path: "/api/v1/periodo-academico/periodos",
    description: "Periodos académicos con a\u00f1o y tipo. Regimen Modular: el módulo lleva como periodo padre el periodo regular (p.ej. 2026-I).",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idAnioAcademico", "ID A\u00f1o académico", "number", { required: true }),
      f("idTipoPeriodo", "ID Tipo periodo", "number", { required: true }),
      f("fechaInicio", "Inicio", "date", { required: true }),
      f("fechaFin", "Fin", "date", { required: true }),
      f("idPeriodoPadre", "Periodo padre (módulo)", "ref", { refPath: "/api/v1/periodo-academico/periodos", refLabelKey: "nombre", refResponseKey: "periodoPadre" })
    ]
  },
  {
    group: "Institucional", subgroup: "Periodo académico", slug: "inst-estados-periodo", label: "Estado de periodo",
    icon: "flag", path: "/api/v1/periodo-academico/estados-periodo",
    description: "Historial de estados de un periodo académico",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPeriodoAcademico", "ID Periodo", "number", { required: true }),
      f("estado", "Estado", "text", { required: true }),
      f("fechaCambio", "Fecha cambio", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Periodo académico", slug: "inst-periodo-programa-sede", label: "Periodo x programa x sede",
    icon: "grid_view", path: "/api/v1/periodo-academico/periodo-programa-sede",
    description: "Vigencia de un programa en una sede durante un periodo",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPeriodoAcademico", "ID Periodo", "number", { required: true }),
      f("idPrograma", "ID Programa", "number", { required: true }),
      f("idSede", "ID Sede", "number", { required: true }),
      f("vigente", "Vigente", "boolean", { default: true })
    ]
  },
  {
    group: "Institucional", subgroup: "Periodo académico", slug: "inst-ampliaciones-cierre", label: "Ampliaci\u00f3n / cierre de periodo",
    icon: "update", path: "/api/v1/periodo-academico/ampliaciones-cierre",
    description: "Ampliaciones o cierres excepcionales de un periodo académico",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPeriodoAcademico", "ID Periodo", "number", { required: true }),
      f("tipoAccion", "Tipo de acci\u00f3n", "text", { required: true }),
      f("numeroResolucion", "N\u00b0 Resoluci\u00f3n", "text"),
      f("fechaAccion", "Fecha acci\u00f3n", "date"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Parámetros y auditoría", slug: "inst-parametros-institucionales", label: "Par\u00e1metro institucional",
    icon: "settings", path: "/api/v1/parametro-auditoria/parametros-institucionales",
    description: "Par\u00e1metros de configuraci\u00f3n a nivel instituci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("clave", "Clave", "text", { required: true }),
      f("valor", "Valor", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Parámetros y auditoría", slug: "inst-parametros-sede-escuela", label: "Par\u00e1metro de sede/escuela",
    icon: "tune", path: "/api/v1/parametro-auditoria/parametros-sede-escuela",
    description: "Par\u00e1metros de configuraci\u00f3n por sede y escuela",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("clave", "Clave", "text", { required: true }),
      f("valor", "Valor", "text", { required: true }),
      f("idSede", "ID Sede", "number"),
      f("idEscuela", "ID Escuela", "number")
    ]
  },
  {
    group: "Institucional", subgroup: "Parámetros y auditoría", slug: "inst-bitacora-cambios", label: "Bit\u00e1cora de cambios estructurales",
    icon: "history", path: "/api/v1/parametro-auditoria/bitacora-cambios-estructura",
    description: "Auditor\u00eda de cambios en la estructura institucional",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("entidadAfectada", "Entidad afectada", "text", { required: true }),
      f("idEntidadAfectada", "ID entidad afectada", "number"),
      f("accion", "Acci\u00f3n", "text", { required: true }),
      f("detalle", "Detalle", "textarea"),
      f("fechaCambio", "Fecha cambio", "datetime")
    ]
  },
  {
    group: "Institucional", subgroup: "Institución", slug: "inst-facultades", label: "Facultad", tabGroup: ["inst-facultades", "inst-fe-facultades"],
    icon: "account_balance", path: "/api/v1/facultades",
    description: "Facultades de la instituci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("decano", "Decano", "text")
    ]
  },
  {
    group: "Institucional", subgroup: "Institución", slug: "inst-instituciones", label: "Instituci\u00f3n",
    icon: "domain", path: "/api/v1/institucion/instituciones",
    description: "Datos generales de la instituci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("razonSocial", "Raz\u00f3n social", "text", { required: true }),
      f("ruc", "RUC", "text", { required: true }),
      f("nombreComercial", "Nombre comercial", "text"),
      f("idTipoInstitucion", "ID Tipo instituci\u00f3n", "number"),
      f("direccion", "Direcci\u00f3n", "text"),
      f("telefono", "Tel\u00e9fono", "text"),
      f("email", "Email", "text"),
      f("sitioWeb", "Sitio web", "text"),
      f("fechaFundacion", "Fundaci\u00f3n", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Institución", slug: "inst-tipos-institucion", label: "Tipo de instituci\u00f3n",
    icon: "category", path: "/api/v1/institucion/tipos-institucion",
    description: "Tipos de instituci\u00f3n (universidad, instituto, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Institución", slug: "inst-autoridades", label: "Autoridad institucional",
    icon: "badge", path: "/api/v1/institucion/autoridades",
    description: "Autoridades a nivel institucional (rector, vicerrector, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("cargo", "Cargo", "text", { required: true }),
      f("idInstitucion", "ID Instituci\u00f3n", "number"),
      f("fechaInicio", "Inicio", "date"),
      f("fechaFin", "Fin", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Institución", slug: "inst-resoluciones-licenciamiento", label: "Resoluci\u00f3n de licenciamiento",
    icon: "gavel", path: "/api/v1/institucion/resoluciones-licenciamiento",
    description: "Resoluciones de licenciamiento institucional (SUNEDU, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("numeroResolucion", "N\u00b0 Resoluci\u00f3n", "text", { required: true }),
      f("idInstitucion", "ID Instituci\u00f3n", "number"),
      f("tipoLicenciamiento", "Tipo", "text"),
      f("fechaEmision", "Emisi\u00f3n", "date"),
      f("fechaVigencia", "Vigencia", "date"),
      f("entidadEmisora", "Entidad emisora", "text"),
      f("observaciones", "Observaciones", "textarea", { listed: false })
    ]
  },
  {
    group: "Institucional", subgroup: "Institución", slug: "inst-convenios", label: "Convenio institucional",
    icon: "handshake", path: "/api/v1/institucion/convenios",
    description: "Convenios interinstitucionales",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idInstitucion", "ID Instituci\u00f3n", "number"),
      f("nombreConvenio", "Nombre", "text", { required: true }),
      f("institucionSocia", "Instituci\u00f3n socia", "text"),
      f("fechaInicio", "Inicio", "date"),
      f("fechaFin", "Fin", "date"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Campus y sede", slug: "inst-campus", label: "Campus",
    icon: "location_city", path: "/api/v1/campus-sede/campus",
    description: "Campus de la instituci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idInstitucion", "ID Instituci\u00f3n", "number"),
      f("ciudad", "Ciudad", "text"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Campus y sede", slug: "inst-sedes", label: "Sede",
    icon: "apartment", path: "/api/v1/campus-sede/sedes",
    description: "Sedes dentro de un campus",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idCampus", "ID Campus", "number", { required: true }),
      f("idTipoSede", "ID Tipo sede", "number"),
      f("direccion", "Direcci\u00f3n", "text")
    ]
  },
  {
    group: "Institucional", subgroup: "Campus y sede", slug: "inst-tipos-sede", label: "Tipo de sede",
    icon: "category", path: "/api/v1/campus-sede/tipos-sede",
    description: "Tipos de sede (principal, filial, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Campus y sede", slug: "inst-direcciones-sede", label: "Direcci\u00f3n de sede",
    icon: "pin_drop", path: "/api/v1/campus-sede/direcciones-sede",
    description: "Direcciones f\u00edsicas de las sedes",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idSede", "ID Sede", "number", { required: true }),
      f("idUbigeo", "ID Ubigeo", "number"),
      f("direccionDetalle", "Direcci\u00f3n detallada", "text"),
      f("referencia", "Referencia", "text")
    ]
  },
  {
    group: "Institucional", subgroup: "Campus y sede", slug: "inst-pabellones", label: "Pabell\u00f3n",
    icon: "domain", path: "/api/v1/campus-sede/pabellones",
    description: "Pabellones de una sede",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idSede", "ID Sede", "number", { required: true }),
      f("numeroPisos", "N\u00b0 pisos", "number"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Campus y sede", slug: "inst-ambientes", label: "Ambiente",
    icon: "meeting_room", path: "/api/v1/campus-sede/ambientes",
    description: "Ambientes/aulas dentro de un pabell\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idPabellon", "ID Pabell\u00f3n", "number", { required: true }),
      f("idSede", "ID Sede", "number"),
      f("tipoAmbiente", "Tipo de ambiente", "text"),
      f("capacidad", "Capacidad", "number")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-fe-facultades", label: "Facultad (gesti\u00f3n acad\u00e9mica)", hidden: true, tabGroup: ["inst-facultades", "inst-fe-facultades"],
    icon: "account_balance", path: "/api/v1/facultad-escuela/facultades",
    description: "Facultades gestionadas desde el m\u00f3dulo facultad-escuela (solo lectura y creaci\u00f3n)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("decano", "Decano", "text")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-escuelas-profesionales", label: "Escuela profesional",
    icon: "school", path: "/api/v1/facultad-escuela/escuelas-profesionales",
    description: "Escuelas profesionales de una facultad",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idFacultad", "ID Facultad", "number", { required: true }),
      f("director", "Director", "text"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-departamentos-academicos", label: "Departamento académico",
    icon: "corporate_fare", path: "/api/v1/facultad-escuela/departamentos-academicos",
    description: "Departamentos académicos de una facultad",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idFacultad", "ID Facultad", "number", { required: true }),
      f("jefeDepartamento", "Jefe de departamento", "text"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-autoridades-facultad", label: "Autoridad de facultad",
    icon: "badge", path: "/api/v1/facultad-escuela/autoridades-facultad",
    description: "Autoridades a nivel de facultad",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idFacultad", "ID Facultad", "number", { required: true }),
      f("cargo", "Cargo", "text", { required: true }),
      f("fechaInicio", "Inicio", "date"),
      f("fechaFin", "Fin", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-cambios-unidad-academica", label: "Cambio de unidad acad\u00e9mica",
    icon: "change_circle", path: "/api/v1/facultad-escuela/cambios-unidad-academica",
    description: "Cambios estructurales entre facultad y escuela",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idFacultad", "ID Facultad", "number"),
      f("idEscuela", "ID Escuela", "number"),
      f("tipoCambio", "Tipo de cambio", "text", { required: true }),
      f("numeroResolucion", "N\u00b0 Resoluci\u00f3n", "text"),
      f("fechaCambio", "Fecha cambio", "date"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-unidades-administrativas", label: "Unidad administrativa",
    icon: "business_center", path: "/api/v1/facultad-escuela/unidades-administrativas",
    description: "Unidades administrativas de una facultad",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idFacultad", "ID Facultad", "number"),
      f("responsable", "Responsable", "text"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Facultad y escuela", slug: "inst-organigramas", label: "Organigrama institucional",
    icon: "account_tree", path: "/api/v1/facultad-escuela/organigramas",
    description: "Organigramas vigentes de la instituci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idInstitucion", "ID Instituci\u00f3n", "number"),
      f("urlDocumento", "URL documento", "text"),
      f("vigente", "Vigente", "boolean", { default: true })
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-calendarios", label: "Calendario académico",
    icon: "calendar_month", path: "/api/v1/calendario/calendarios",
    description: "Calendarios académicos por periodo",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idPeriodoAcademico", "ID Periodo", "number"),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-tipos-evento", label: "Tipo de evento",
    icon: "label", path: "/api/v1/calendario/tipos-evento",
    description: "Tipos de evento de calendario",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-eventos", label: "Evento de calendario",
    icon: "event_note", path: "/api/v1/calendario/eventos",
    description: "Eventos dentro de un calendario académico",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("idCalendarioAcademico", "ID Calendario", "number", { required: true }),
      f("idTipoEvento", "ID Tipo evento", "number"),
      f("fechaInicio", "Inicio", "date", { required: true }),
      f("fechaFin", "Fin", "date")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-feriados", label: "Feriado / no laborable",
    icon: "beach_access", path: "/api/v1/calendario/feriados",
    description: "D\u00edas feriados o no laborables",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("fecha", "Fecha", "date", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-calendario-facultad-escuela", label: "Calendario x facultad/escuela",
    icon: "schema", path: "/api/v1/calendario/calendario-facultad-escuela",
    description: "Asociaci\u00f3n de un calendario a una facultad y escuela",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idCalendarioAcademico", "ID Calendario", "number", { required: true }),
      f("idFacultad", "ID Facultad", "number"),
      f("idEscuela", "ID Escuela", "number")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-reprogramaciones-evento", label: "Reprogramaci\u00f3n de evento",
    icon: "event_repeat", path: "/api/v1/calendario/reprogramaciones-evento",
    description: "Reprogramaciones de eventos de calendario",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idEventoCalendario", "ID Evento", "number", { required: true }),
      f("numeroResolucion", "N\u00b0 Resoluci\u00f3n", "text"),
      f("fechaInicioNueva", "Nueva fecha inicio", "date"),
      f("fechaFinNueva", "Nueva fecha fin", "date"),
      f("motivo", "Motivo", "textarea")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-publicaciones", label: "Publicaci\u00f3n de calendario",
    icon: "publish", path: "/api/v1/calendario/publicaciones",
    description: "Publicaciones oficiales de un calendario académico",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idCalendarioAcademico", "ID Calendario", "number", { required: true }),
      f("fechaPublicacion", "Fecha publicaci\u00f3n", "datetime"),
      f("urlDocumento", "URL documento", "text")
    ]
  },
  {
    group: "Institucional", subgroup: "Calendario académico", slug: "inst-recordatorios", label: "Recordatorio de evento",
    icon: "notifications", path: "/api/v1/calendario/recordatorios",
    description: "Recordatorios asociados a eventos de calendario",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idEventoCalendario", "ID Evento", "number", { required: true }),
      f("mensaje", "Mensaje", "textarea", { required: true }),
      f("fechaEnvio", "Fecha de env\u00edo", "datetime")
    ]
  },
  // ============ PERSONAS (50) ============
  {
    group: "Personas", subgroup: "Relación y responsables", slug: "per-tipos-parentesco", label: "Tipo de parentesco", hidden: true, tabGroup: ["per-relaciones-familiares", "per-tipos-parentesco"],
    icon: "family_restroom", path: "/api/v1/relacion-responsable/tipos-parentesco",
    description: "Tipos de parentesco entre personas",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Relación y responsables", slug: "per-relaciones-familiares", label: "Relaci\u00f3n familiar", tabGroup: ["per-relaciones-familiares", "per-tipos-parentesco"],
    icon: "groups", path: "/api/v1/relacion-responsable/relaciones-familiares",
    description: "Relaciones familiares entre personas",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idPersonaRelacionada", "ID Persona relacionada", "number", { required: true }),
      f("idTipoParentesco", "ID Tipo parentesco", "number", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Relación y responsables", slug: "per-responsables-pago", label: "Responsable de pago",
    icon: "payments", path: "/api/v1/relacion-responsable/responsables-pago",
    description: "Persona responsable del pago de otra persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idPersonaResponsable", "ID Persona responsable", "number", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-personas", label: "Persona",
    icon: "person", path: "/api/v1/persona/personas",
    description: "Ficha b\u00e1sica de persona (dato maestro)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("tipoDocumento", "Tipo de documento", "text"),
      f("numeroDocumento", "N\u00b0 documento", "text", { required: true }),
      f("nombres", "Nombres", "text", { required: true }),
      f("apellidos", "Apellidos", "text", { required: true }),
      f("email", "Email", "text"),
      f("telefono", "Tel\u00e9fono", "text"),
      f("fechaNacimiento", "Fecha nacimiento", "date"),
      f("tipo", "Tipo de persona", "text")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-persona-tipos-documento", label: "Tipo de documento (persona)",
    icon: "badge", path: "/api/v1/persona/tipos-documento",
    description: "Tipos de documento de identidad usados por persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-vinculos-institucion", label: "V\u00ednculo con instituci\u00f3n",
    icon: "link", path: "/api/v1/persona/vinculos-institucion",
    description: "V\u00ednculo de una persona con la instituci\u00f3n (alumno, docente, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("tipoVinculo", "Tipo de v\u00ednculo", "text", { required: true }),
      f("observacion", "Observaci\u00f3n", "textarea"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-estados", label: "Estado de persona",
    icon: "flag", path: "/api/v1/persona/estados",
    description: "Estado vigente de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("estado", "Estado", "text", { required: true }),
      f("motivo", "Motivo", "textarea"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-historial-estados", label: "Historial de estados",
    icon: "history", path: "/api/v1/persona/historial-estados",
    description: "Historial de cambios de estado de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("estadoAnterior", "Estado anterior", "text"),
      f("estadoNuevo", "Estado nuevo", "text"),
      f("observacion", "Observaci\u00f3n", "textarea"),
      f("fechaCambio", "Fecha cambio", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-fusiones", label: "Fusi\u00f3n de personas",
    icon: "merge", path: "/api/v1/persona/fusiones",
    description: "Fusi\u00f3n de registros duplicados de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersonaOrigen", "ID Persona origen", "number", { required: true }),
      f("idPersonaDestino", "ID Persona destino", "number", { required: true }),
      f("motivo", "Motivo", "textarea"),
      f("fechaFusion", "Fecha fusi\u00f3n", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-fotografias", label: "Fotograf\u00eda de persona",
    icon: "photo_camera", path: "/api/v1/persona/fotografias",
    description: "Fotograf\u00edas registradas de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("urlArchivo", "URL archivo", "text", { required: true }),
      f("fechaCarga", "Fecha carga", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Persona", slug: "per-bajas-anonimizacion", label: "Baja / anonimizaci\u00f3n",
    icon: "block", path: "/api/v1/persona/bajas-anonimizacion",
    description: "Bajas y anonimizaciones de datos de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("tipo", "Tipo", "text", { required: true }),
      f("motivo", "Motivo", "textarea"),
      f("fechaAplicacion", "Fecha aplicaci\u00f3n", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-doc-tipos-documento", label: "Tipo de documento (archivo)",
    icon: "description", path: "/api/v1/documento-persona/tipos-documento",
    description: "Tipos de documento archivable de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-documentos-persona", label: "Documento de persona",
    icon: "folder", path: "/api/v1/documento-persona/documentos-persona",
    description: "Documentos archivados de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idTipoDocumento", "ID Tipo documento", "number", { required: true }),
      f("urlArchivo", "URL archivo", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-estados-documento", label: "Estado de documento",
    icon: "flag", path: "/api/v1/documento-persona/estados-documento",
    description: "Estado de un documento de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idDocumentoPersona", "ID Documento", "number", { required: true }),
      f("estado", "Estado", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-requisitos-documentarios", label: "Requisito documentario",
    icon: "checklist", path: "/api/v1/documento-persona/requisitos-documentarios",
    description: "Requisitos documentarios por tipo de documento",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idTipoDocumento", "ID Tipo documento", "number", { required: true }),
      f("descripcion", "Descripción", "textarea"),
      f("obligatorio", "Obligatorio", "boolean", { default: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-historiales-revision-documento", label: "Historial de revisi\u00f3n",
    icon: "history_edu", path: "/api/v1/documento-persona/historiales-revision-documento",
    description: "Historial de revisiones de un documento de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idDocumentoPersona", "ID Documento", "number", { required: true }),
      f("comentario", "Comentario", "textarea"),
      f("fechaRevision", "Fecha revisi\u00f3n", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-vigencias-vencimiento-documento", label: "Vigencia / vencimiento",
    icon: "event_busy", path: "/api/v1/documento-persona/vigencias-vencimiento-documento",
    description: "Vigencia y vencimiento de documentos de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idDocumentoPersona", "ID Documento", "number", { required: true }),
      f("fechaVigenciaDesde", "Vigente desde", "date"),
      f("fechaVencimiento", "Vence", "date"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-reemplazos-version-documento", label: "Reemplazo de versi\u00f3n",
    icon: "sync_alt", path: "/api/v1/documento-persona/reemplazos-version-documento",
    description: "Reemplazo de versiones de un documento de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idDocumentoPersona", "ID Documento nuevo", "number", { required: true }),
      f("idDocumentoPersonaAnterior", "ID Documento anterior", "number"),
      f("motivo", "Motivo", "textarea"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-observaciones-documento", label: "Observaci\u00f3n de documento",
    icon: "comment", path: "/api/v1/documento-persona/observaciones-documento",
    description: "Observaciones registradas sobre un documento",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idDocumentoPersona", "ID Documento", "number", { required: true }),
      f("observacion", "Observaci\u00f3n", "textarea", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-firmas-validacion-documento", label: "Firma de validaci\u00f3n",
    icon: "draw", path: "/api/v1/documento-persona/firmas-validacion-documento",
    description: "Firmas de validaci\u00f3n de documentos de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idDocumentoPersona", "ID Documento", "number", { required: true }),
      f("firmante", "Firmante", "text", { required: true }),
      f("fechaFirma", "Fecha firma", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Documentos de persona", slug: "per-expedientes-legajo", label: "Expediente / legajo",
    icon: "folder_special", path: "/api/v1/documento-persona/expedientes-legajo",
    description: "Expedientes o legajos de persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("codigo", "C\u00f3digo", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-id-tipos-documento", label: "Tipo de documento de identidad",
    icon: "badge", path: "/api/v1/identificacion/tipos-documento",
    description: "Tipos de documento de identidad (DNI, CE, pasaporte)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true }),
      f("descripcion", "Descripción", "textarea")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-id-documentos", label: "Documento de identidad",
    icon: "fingerprint", path: "/api/v1/identificacion/documentos",
    description: "Documentos de identidad registrados de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idTipoDocumentoIdentidad", "ID Tipo documento", "number", { required: true }),
      f("numero", "N\u00famero", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-codigos-institucionales", label: "C\u00f3digo institucional",
    icon: "qr_code", path: "/api/v1/identificacion/codigos-institucionales",
    description: "C\u00f3digos institucionales asignados a una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("tipo", "Tipo", "text", { required: true }),
      f("codigo", "C\u00f3digo", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-historial-documentos", label: "Historial de documentos",
    icon: "history", path: "/api/v1/identificacion/historial-documentos",
    description: "Historial de cambios de documentos de identidad",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("tipoCambio", "Tipo de cambio", "text", { required: true }),
      f("numeroAnterior", "N\u00famero anterior", "text"),
      f("numeroNuevo", "N\u00famero nuevo", "text"),
      f("fechaCambio", "Fecha cambio", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-validaciones", label: "Validaci\u00f3n de identidad",
    icon: "verified_user", path: "/api/v1/identificacion/validaciones",
    description: "Validaciones de identidad realizadas (RENIEC, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("fuente", "Fuente", "text", { required: true }),
      f("resultado", "Resultado", "text"),
      f("observacion", "Observaci\u00f3n", "textarea"),
      f("fechaValidacion", "Fecha validaci\u00f3n", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-tributarias", label: "Identificaci\u00f3n tributaria",
    icon: "receipt_long", path: "/api/v1/identificacion/tributarias",
    description: "Identificaci\u00f3n tributaria (RUC) de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("ruc", "RUC", "text", { required: true }),
      f("razonSocial", "Raz\u00f3n social", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Identificación", slug: "per-correcciones", label: "Correcci\u00f3n de identificaci\u00f3n",
    icon: "edit_note", path: "/api/v1/identificacion/correcciones",
    description: "Correcciones realizadas sobre datos de identificaci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("campoCorregido", "Campo corregido", "text", { required: true }),
      f("valorAnterior", "Valor anterior", "text"),
      f("valorNuevo", "Valor nuevo", "text"),
      f("sustento", "Sustento", "textarea"),
      f("fechaCorreccion", "Fecha correcci\u00f3n", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-tipos-contacto", label: "Tipo de contacto",
    icon: "contact_phone", path: "/api/v1/contacto-direccion/tipos-contacto",
    description: "Tipos de contacto (celular, fijo, correo, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-contactos", label: "Contacto",
    icon: "call", path: "/api/v1/contacto-direccion/contactos",
    description: "Contactos registrados de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idTipoContacto", "ID Tipo contacto", "number", { required: true }),
      f("valor", "Valor", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-tipos-direccion", label: "Tipo de direcci\u00f3n",
    icon: "signpost", path: "/api/v1/contacto-direccion/tipos-direccion",
    description: "Tipos de direcci\u00f3n (domicilio, laboral, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-direcciones", label: "Direcci\u00f3n",
    icon: "home", path: "/api/v1/contacto-direccion/direcciones",
    description: "Direcciones registradas de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idTipoDireccion", "ID Tipo direcci\u00f3n", "number"),
      f("idUbigeo", "ID Ubigeo", "number"),
      f("direccion", "Direcci\u00f3n", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-correos-institucionales", label: "Correo institucional",
    icon: "mail", path: "/api/v1/contacto-direccion/correos-institucionales",
    description: "Correos institucionales asignados a una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("correo", "Correo", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-contactos-emergencia", label: "Contacto de emergencia",
    icon: "emergency", path: "/api/v1/contacto-direccion/contactos-emergencia",
    description: "Contactos de emergencia de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("nombreContacto", "Nombre contacto", "text", { required: true }),
      f("telefono", "Tel\u00e9fono", "text"),
      f("parentesco", "Parentesco", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-verificaciones-contacto", label: "Verificaci\u00f3n de contacto",
    icon: "task_alt", path: "/api/v1/contacto-direccion/verificaciones-contacto",
    description: "Verificaciones de contacto (correo/tel\u00e9fono confirmado)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idContacto", "ID Contacto", "number", { required: true }),
      f("verificado", "Verificado", "boolean", { default: false }),
      f("fechaVerificacion", "Fecha verificaci\u00f3n", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-preferencias-comunicacion", label: "Preferencia de comunicaci\u00f3n",
    icon: "tune", path: "/api/v1/contacto-direccion/preferencias-comunicacion",
    description: "Preferencias de canal y horario de comunicaci\u00f3n",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("canal", "Canal", "text", { required: true }),
      f("horario", "Horario", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Contacto y dirección", slug: "per-redes-sociales", label: "Red social",
    icon: "share", path: "/api/v1/contacto-direccion/redes-sociales",
    description: "Redes sociales registradas de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("red", "Red", "text", { required: true }),
      f("url", "URL", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-datos", label: "Datos personales",
    icon: "badge", path: "/api/v1/datos-personales/datos",
    description: "Datos personales base (nacimiento, sexo, estado civil, etc.)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("fechaNacimiento", "Fecha nacimiento", "date"),
      f("lugarNacimiento", "Lugar nacimiento", "text"),
      f("idSexo", "ID Sexo", "number"),
      f("idEstadoCivil", "ID Estado civil", "number"),
      f("idNacionalidad", "ID Nacionalidad", "number"),
      f("idUbigeoNacimiento", "ID Ubigeo nacimiento", "number")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-sexos", label: "Sexo",
    icon: "wc", path: "/api/v1/datos-personales/sexos",
    description: "Cat\u00e1logo de sexo",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-estados-civiles", label: "Estado civil",
    icon: "favorite", path: "/api/v1/datos-personales/estados-civiles",
    description: "Cat\u00e1logo de estado civil",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-nacionalidades", label: "Nacionalidad",
    icon: "flag", path: "/api/v1/datos-personales/nacionalidades",
    description: "Cat\u00e1logo de nacionalidades",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("nombre", "Nombre", "text", { required: true })
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-ubigeos", label: "Ubigeo",
    icon: "map", path: "/api/v1/datos-personales/ubigeos",
    description: "Cat\u00e1logo de ubigeo (pa\u00eds/departamento/provincia/distrito)",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("pais", "Pa\u00eds", "text", { required: true }),
      f("departamento", "Departamento", "text"),
      f("provincia", "Provincia", "text"),
      f("distrito", "Distrito", "text")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-discapacidades", label: "Discapacidad / condici\u00f3n",
    icon: "accessible", path: "/api/v1/datos-personales/discapacidades",
    description: "Discapacidades o condiciones registradas de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("tipo", "Tipo", "text", { required: true }),
      f("observacion", "Observaci\u00f3n", "textarea"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-cambios-nombre-apellido", label: "Cambio de nombre/apellido",
    icon: "edit", path: "/api/v1/datos-personales/cambios-nombre-apellido",
    description: "Cambios de nombre o apellido de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("nombreAnterior", "Nombre anterior", "text"),
      f("nombreNuevo", "Nombre nuevo", "text", { required: true }),
      f("sustento", "Sustento", "textarea"),
      f("fechaCambio", "Fecha cambio", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-consentimientos", label: "Consentimiento de datos",
    icon: "fact_check", path: "/api/v1/datos-personales/consentimientos",
    description: "Consentimientos de tratamiento de datos personales",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("tipoConsentimiento", "Tipo de consentimiento", "text", { required: true }),
      f("aceptado", "Aceptado", "boolean", { default: false }),
      f("fechaConsentimiento", "Fecha consentimiento", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-lenguas-idiomas", label: "Lengua / idioma",
    icon: "translate", path: "/api/v1/datos-personales/lenguas-idiomas",
    description: "Lenguas o idiomas que domina una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("idioma", "Idioma", "text", { required: true }),
      f("nivel", "Nivel", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-autoidentificaciones-etnicas", label: "Autoidentificaci\u00f3n \u00e9tnica",
    icon: "groups", path: "/api/v1/datos-personales/autoidentificaciones-etnicas",
    description: "Autoidentificaci\u00f3n \u00e9tnica de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("etnia", "Etnia", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-confesiones-religiosas", label: "Confesi\u00f3n religiosa",
    icon: "self_improvement", path: "/api/v1/datos-personales/confesiones-religiosas",
    description: "Confesi\u00f3n religiosa de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("religion", "Religi\u00f3n", "text", { required: true }),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-colegios-procedencia", label: "Colegio de procedencia",
    icon: "school", path: "/api/v1/datos-personales/colegios-procedencia",
    description: "Colegio de procedencia de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("nombreColegio", "Colegio", "text", { required: true }),
      f("nivelInstruccion", "Nivel de instrucci\u00f3n", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Personas", subgroup: "Datos personales", slug: "per-socioeconomicos", label: "Dato socioecon\u00f3mico",
    icon: "savings", path: "/api/v1/datos-personales/socioeconomicos",
    description: "Datos socioecon\u00f3micos de una persona",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPersona", "ID Persona", "number", { required: true }),
      f("nivelSocioeconomico", "Nivel socioecon\u00f3mico", "text"),
      f("ingresoFamiliar", "Ingreso familiar", "text"),
      f("fechaRegistro", "Fecha registro", "datetime")
    ]
  },
  {
    group: "Currículo", subgroup: "Plan de estudio", slug: "curr-mallas-curriculares", label: "Malla curricular",
    icon: "schema", path: "/api/v1/mallas-curriculares",
    description: "Documento de malla curricular (archivo adjunto) asociado a un plan de estudio",
    fields: [
      f("id", "ID", "id", { editable: false }),
      f("idPlan", "Plan de estudio", "ref", { required: true, refPath: "/api/v1/planes-estudio", refLabelKey: "nombre" }),
      f("nombreArchivo", "Archivo de la malla", "file", { required: true, fileUrlTarget: "url" }),
      f("url", "URL del documento", "text", { required: true }),
      f("version", "Versión", "number", { required: true }),
      f("fechaCarga", "Fecha de carga", "date", { required: true })
    ]
  },

  // ============ FINANZAS (21) ============
  {
    group: 'Finanzas', subgroup: 'Caja y Transacciones', slug: 'fin-arqueos-caja', label: 'Arqueo de caja',
    icon: 'point_of_sale', path: '/api/v1/arqueos-caja',
    description: 'Arqueo de una sesión de caja: monto contado vs. monto de sistema',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('sesionCajaId', 'Sesión Caja', 'ref', { required: true, refPath: '/api/v1/sesiones-caja', refLabelKey: 'idCajero' }),
      f('montoContado', 'Monto contado', 'decimal', { required: true }),
      f('montoSistema', 'Monto sistema', 'decimal', { required: true }),
      f('observaciones', 'Observaciones', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Convenios y Becas', slug: 'fin-becas', label: 'Beca',
    icon: 'school', path: '/api/v1/becas',
    description: 'Catálogo de becas y su porcentaje de descuento',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('porcentajeDescuento', 'Porcentaje descuento', 'number', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Convenios y Becas', slug: 'fin-becas-asignadas', label: 'Beca asignada',
    icon: 'card_giftcard', path: '/api/v1/becas-asignadas',
    description: 'Asignación de una beca a un estudiante',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('becaId', 'Beca', 'ref', { required: true, refPath: '/api/v1/becas', refLabelKey: 'nombre' }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Auditoría y Sistema', slug: 'fin-bitacoras-auditoria-pago', label: 'Bitácora de auditoría de pago',
    icon: 'history', path: '/api/v1/bitacoras-auditoria-pago',
    description: 'Registro de acciones realizadas sobre un pago',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('pagoId', 'Pago', 'ref', { required: true, refPath: '/api/v1/pagos', refLabelKey: 'estado' }),
      f('accion', 'Acción', 'text', { required: true }),
      f('idUsuario', 'Usuario', 'text', { required: true }),
      f('observaciones', 'Observaciones', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Caja y Transacciones', slug: 'fin-cajas', label: 'Caja',
    icon: 'inventory_2', path: '/api/v1/cajas',
    description: 'Puntos de cobro físicos',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('ubicacion', 'Ubicación', 'text'),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-conceptos-pago', label: 'Concepto de pago',
    icon: 'sell', path: '/api/v1/conceptos-pago',
    description: 'Catálogo de conceptos de pago (matrícula, pensión, etc.)',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('monto', 'Monto', 'decimal'),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Convenios y Becas', slug: 'fin-convenios-institucionales', label: 'Convenio institucional',
    icon: 'handshake', path: '/api/v1/convenios-institucionales',
    description: 'Convenio con empresas para descuentos institucionales',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombreEmpresa', 'Empresa', 'text', { required: true }),
      f('ruc', 'RUC', 'text', { required: true }),
      f('porcentajeDescuento', 'Porcentaje descuento', 'number', { required: true }),
      f('fechaInicio', 'Inicio', 'date', { required: true }),
      f('fechaFin', 'Fin', 'date'),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Convenios y Becas', slug: 'fin-entidades-financieras', label: 'Entidad financiera',
    icon: 'account_balance', path: '/api/v1/entidades-financieras',
    description: 'Bancos y entidades que otorgan financiamiento educativo',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('codigo', 'Código', 'text', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Convenios y Becas', slug: 'fin-financiamientos-educativos', label: 'Financiamiento educativo',
    icon: 'request_quote', path: '/api/v1/financiamientos-educativos',
    description: 'Crédito educativo otorgado a un estudiante por una entidad financiera',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('entidadFinancieraId', 'Entidad financiera', 'ref', { required: true, refPath: '/api/v1/entidades-financieras', refLabelKey: 'nombre' }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('montoFinanciado', 'Monto financiado', 'decimal', { required: true }),
      f('numeroCuotas', 'N° cuotas', 'number', { required: true }),
      f('fechaInicio', 'Inicio', 'date', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Auditoría y Sistema', slug: 'fin-logs-transaccion-pasarela', label: 'Log de pasarela de pago',
    icon: 'receipt_long', path: '/api/v1/logs-transaccion-pasarela',
    description: 'Registro de transacciones con la pasarela de pago externa',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('pagoId', 'Pago', 'ref', { required: true, refPath: '/api/v1/pagos', refLabelKey: 'estado' }),
      f('proveedor', 'Proveedor', 'text', { required: true }),
      f('referenciaExterna', 'Referencia externa', 'text', { required: true }),
      f('estado', 'Estado', 'text', { required: true }),
      f('payloadRespuesta', 'Payload respuesta', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-metodos-pago', label: 'Método de pago',
    icon: 'credit_card', path: '/api/v1/metodos-pago',
    description: 'Catálogo de métodos de pago disponibles',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-notas-credito-debito', label: 'Nota de crédito/débito',
    icon: 'difference', path: '/api/v1/notas-credito-debito',
    description: 'Ajuste contable sobre un pago (crédito o débito)',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('pagoId', 'Pago', 'ref', { required: true, refPath: '/api/v1/pagos', refLabelKey: 'estado' }),
      f('tipo', 'Tipo', 'text', { required: true }),
      f('motivo', 'Motivo', 'textarea', { required: true }),
      f('monto', 'Monto', 'decimal', { required: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Convenios y Becas', slug: 'fin-pagadores-terceros', label: 'Pagador tercero',
    icon: 'person_pin', path: '/api/v1/pagadores-terceros',
    description: 'Tercero autorizado para pagar en nombre de un estudiante',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('nombres', 'Nombres', 'text', { required: true }),
      f('apellidos', 'Apellidos', 'text', { required: true }),
      f('tipoDocumento', 'Tipo documento', 'text', { required: true }),
      f('numeroDocumento', 'N° documento', 'text', { required: true }),
      f('telefono', 'Teléfono', 'text', { listed: false }),
      f('email', 'Email', 'text', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Auditoría y Sistema', slug: 'fin-plantillas-notificacion', label: 'Plantilla de notificación',
    icon: 'mark_email_read', path: '/api/v1/plantillas-notificacion',
    description: 'Plantilla de mensaje para notificaciones de pago',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('codigo', 'Código', 'text', { required: true }),
      f('asunto', 'Asunto', 'text', { required: true }),
      f('cuerpo', 'Cuerpo', 'textarea', { required: true }),
      f('canal', 'Canal', 'text', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-recargos-mora', label: 'Recargo por mora',
    icon: 'event_busy', path: '/api/v1/recargos-mora',
    description: 'Configuración de recargos por pago atrasado',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('tipoCalculo', 'Tipo cálculo', 'text', { required: true }),
      f('valor', 'Valor', 'decimal', { required: true }),
      f('diasGracia', 'Días gracia', 'number', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-series-comprobante', label: 'Serie de comprobante',
    icon: 'format_list_numbered', path: '/api/v1/series-comprobante',
    description: 'Serie y correlativo vigente de un tipo de comprobante',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('tipoComprobanteId', 'Tipo comprobante', 'ref', { required: true, refPath: '/api/v1/tipos-comprobante', refLabelKey: 'nombre' }),
      f('serie', 'Serie', 'text', { required: true }),
      f('correlativoActual', 'Correlativo actual', 'number', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Caja y Transacciones', slug: 'fin-sesiones-caja', label: 'Sesión de caja',
    icon: 'schedule', path: '/api/v1/sesiones-caja',
    description: 'Apertura y cierre de una sesión de caja',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cajaId', 'Caja', 'ref', { required: true, refPath: '/api/v1/cajas', refLabelKey: 'nombre' }),
      f('idCajero', 'Cajero', 'text', { required: true }),
      f('fechaApertura', 'Apertura', 'datetime', { required: true }),
      f('fechaCierre', 'Cierre', 'datetime'),
      f('montoInicial', 'Monto inicial', 'decimal', { required: true }),
      f('montoFinal', 'Monto final', 'decimal')
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-tarifarios-programa', label: 'Tarifario de programa',
    icon: 'price_change', path: '/api/v1/tarifarios-programa',
    description: 'Monto de un concepto de pago vigente para un programa',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('programa', 'Programa', 'text', { required: true }),
      f('conceptoPagoId', 'Concepto de pago', 'ref', { required: true, refPath: '/api/v1/conceptos-pago', refLabelKey: 'nombre' }),
      f('monto', 'Monto', 'decimal', { required: true }),
      f('vigenteDesde', 'Vigente desde', 'date', { required: true }),
      f('vigenteHasta', 'Vigente hasta', 'date'),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-tipos-cambio', label: 'Tipo de cambio',
    icon: 'currency_exchange', path: '/api/v1/tipos-cambio',
    description: 'Tipo de cambio entre monedas por fecha',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('fecha', 'Fecha', 'date', { required: true }),
      f('monedaOrigen', 'Moneda origen', 'text', { required: true }),
      f('monedaDestino', 'Moneda destino', 'text', { required: true }),
      f('valor', 'Valor', 'decimal', { required: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Configuración Financiera', slug: 'fin-tipos-comprobante', label: 'Tipo de comprobante',
    icon: 'description', path: '/api/v1/tipos-comprobante',
    description: 'Catálogo de tipos de comprobante de pago',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('codigo', 'Código', 'text', { required: true }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Finanzas', subgroup: 'Caja y Transacciones', slug: 'fin-pagos', label: 'Pago',
    icon: 'payments', path: '/api/v1/pagos',
    description: 'Pagos registrados (solo lectura y edición de estado; no se crean ni eliminan desde aquí)',
    lockedCatalog: true,
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('matriculaId', 'Matrícula', 'number', { editable: false }),
      f('monto', 'Monto', 'decimal', { editable: false }),
      f('estado', 'Estado', 'text'),
      f('fechaPago', 'Fecha pago', 'datetime', { editable: false })
    ]
  },

  // ============ LMS (27, de 29: se omiten "mallas-curriculares" y "periodos-academicos" que ya existen en Currículo/Institucional) ============
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-anuncios-curso', label: 'Anuncio de curso',
    icon: 'campaign', path: '/api/v1/anuncios-curso',
    description: 'Anuncios publicados por el docente en un curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('titulo', 'Título', 'text', { required: true }),
      f('mensaje', 'Mensaje', 'textarea', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-asistencias', label: 'Asistencia',
    icon: 'fact_check', path: '/api/v1/asistencias',
    description: 'Asistencia de un estudiante a una sesión de clase',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('sesionClaseId', 'Sesión de clase', 'ref', { required: true, refPath: '/api/v1/sesiones-clase', refLabelKey: 'fecha' }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('presente', 'Presente', 'boolean', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-avances-contenido', label: 'Avance de contenido',
    icon: 'trending_up', path: '/api/v1/avances-contenido',
    description: 'Avance del estudiante sobre un recurso complementario',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('idRecurso', 'Recurso', 'ref', { required: true, refPath: '/api/v1/recursos-complementarios', refLabelKey: 'nombre' }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('consumido', 'Consumido', 'boolean', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-calificaciones', label: 'Calificación',
    icon: 'grade', path: '/api/v1/calificaciones',
    description: 'Nota de un estudiante en una evaluación del curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('evaluacionId', 'Evaluación', 'number', { required: true }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('nota', 'Nota', 'number', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-categorias-curso', label: 'Categoría de curso',
    icon: 'category', path: '/api/v1/categorias-curso',
    description: 'Catálogo de categorías de curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-convalidaciones-curso', label: 'Convalidación de curso',
    icon: 'rule_folder', path: '/api/v1/convalidaciones-curso',
    description: 'Convalidación de un curso por estudios externos',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('institucionOrigen', 'Institución origen', 'text', { required: true }),
      f('cursoOrigen', 'Curso origen', 'text', { required: true }),
      f('fechaConvalidacion', 'Fecha convalidación', 'date', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-cursos', label: 'Curso',
    icon: 'menu_book', path: '/api/v1/cursos',
    description: 'Catálogo de cursos del LMS',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-docentes', label: 'Docente',
    icon: 'person', path: '/api/v1/docentes',
    description: 'Catálogo de docentes del LMS',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombres', 'Nombres', 'text', { required: true }),
      f('apellidos', 'Apellidos', 'text', { required: true }),
      f('email', 'Email', 'text', { required: true }),
      f('especialidad', 'Especialidad', 'text', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-encuestas-satisfaccion', label: 'Encuesta de satisfacción',
    icon: 'reviews', path: '/api/v1/encuestas-satisfaccion',
    description: 'Encuesta de satisfacción de un estudiante sobre un curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('calificacion', 'Calificación', 'number', { required: true }),
      f('comentario', 'Comentario', 'textarea', { listed: false })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-entregas-tarea', label: 'Entrega de tarea',
    icon: 'upload_file', path: '/api/v1/entregas-tarea',
    description: 'Entrega de un estudiante para una tarea del curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('tareaId', 'Tarea', 'number', { required: true }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('urlArchivo', 'Archivo', 'file', { fileUrlTarget: 'urlArchivo' }),
      f('nota', 'Nota', 'number')
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-estados-matricula', label: 'Estado de matrícula (catálogo)',
    icon: 'flag', path: '/api/v1/estados-matricula',
    description: 'Catálogo de estados de matrícula del LMS',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('codigo', 'Código', 'text', { required: true }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-evaluaciones', label: 'Evaluación',
    icon: 'assignment', path: '/api/v1/evaluaciones',
    description: 'Evaluación programada de un curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('titulo', 'Título', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('fechaEvaluacion', 'Fecha evaluación', 'datetime'),
      f('puntajeMaximo', 'Puntaje máximo', 'text', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-foros-hilo', label: 'Hilo de foro',
    icon: 'forum', path: '/api/v1/foros-hilo',
    description: 'Hilo de discusión en el foro de un curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('titulo', 'Título', 'text', { required: true }),
      f('idEstudianteCreador', 'ID Estudiante creador', 'text', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-horarios-clase', label: 'Horario de clase',
    icon: 'schedule', path: '/api/v1/horarios-clase',
    description: 'Horario semanal de una sección de curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('seccionCursoId', 'Sección de curso', 'number', { required: true }),
      f('diaSemana', 'Día de la semana', 'text', { required: true }),
      f('horaInicio', 'Hora inicio', 'text', { required: true, placeholder: '08:00' } as any),
      f('horaFin', 'Hora fin', 'text', { required: true, placeholder: '10:00' } as any)
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-insignias', label: 'Insignia',
    icon: 'military_tech', path: '/api/v1/insignias',
    description: 'Catálogo de insignias (logros) del LMS',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('criterio', 'Criterio', 'textarea', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-insignias-estudiante', label: 'Insignia de estudiante',
    icon: 'workspace_premium', path: '/api/v1/insignias-estudiante',
    description: 'Insignia otorgada a un estudiante',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('insigniaId', 'Insignia', 'ref', { required: true, refPath: '/api/v1/insignias', refLabelKey: 'nombre' }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-listas-espera', label: 'Lista de espera',
    icon: 'hourglass_bottom', path: '/api/v1/listas-espera',
    description: 'Lista de espera de un estudiante para una sección llena',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('seccionCursoId', 'Sección de curso', 'number', { required: true }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('posicion', 'Posición', 'number', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-plantillas-certificado', label: 'Plantilla de certificado',
    icon: 'workspace_premium', path: '/api/v1/plantillas-certificado',
    description: 'Plantilla de contenido para certificados emitidos',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('contenidoPlantilla', 'Contenido de plantilla', 'textarea', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-preguntas-banco', label: 'Pregunta de banco',
    icon: 'quiz', path: '/api/v1/preguntas-banco',
    description: 'Banco de preguntas reutilizables para evaluaciones',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('enunciado', 'Enunciado', 'textarea', { required: true }),
      f('tipo', 'Tipo', 'text', { required: true }),
      f('puntajeSugerido', 'Puntaje sugerido', 'number', { required: true }),
      f('categoria', 'Categoría', 'text', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-prerequisitos-curso', label: 'Prerequisito de curso',
    icon: 'link', path: '/api/v1/prerequisitos-curso',
    description: 'Relación de prerequisito entre dos cursos',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('cursoPrerequisitoId', 'Curso prerequisito', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-recursos-complementarios', label: 'Recurso complementario',
    icon: 'folder_open', path: '/api/v1/recursos-complementarios',
    description: 'Material complementario (PDF, video o enlace) de un curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('tipo', 'Tipo', 'enum', { required: true, options: ['PDF', 'VIDEO', 'LINK'] }),
      f('url', 'URL', 'textarea', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-respuestas-foro', label: 'Respuesta de foro',
    icon: 'reply', path: '/api/v1/respuestas-foro',
    description: 'Respuesta de un estudiante a un hilo del foro',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('foroHiloId', 'Hilo de foro', 'number', { required: true }),
      f('idEstudiante', 'ID Estudiante', 'text', { required: true }),
      f('mensaje', 'Mensaje', 'textarea', { required: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-rubricas-evaluacion', label: 'Rúbrica de evaluación',
    icon: 'checklist', path: '/api/v1/rubricas-evaluacion',
    description: 'Rúbrica de criterios para calificar una evaluación',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('nombre', 'Nombre', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('puntajeMaximo', 'Puntaje máximo', 'number', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-secciones-curso', label: 'Sección de curso',
    icon: 'groups', path: '/api/v1/secciones-curso',
    description: 'Sección de un curso para un periodo, con docente y cupo',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('docenteId', 'Docente', 'ref', { required: true, refPath: '/api/v1/docentes', refLabelKey: 'nombres' }),
      f('periodoAcademicoId', 'Periodo académico', 'number', { required: true }),
      f('nombreSeccion', 'Nombre de sección', 'text', { required: true }),
      f('cupoMaximo', 'Cupo máximo', 'number', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-sesiones-clase', label: 'Sesión de clase',
    icon: 'event', path: '/api/v1/sesiones-clase',
    description: 'Sesión concreta de clase de una sección, con fecha y horario',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('seccionCursoId', 'Sección de curso', 'ref', { required: true, refPath: '/api/v1/secciones-curso', refLabelKey: 'nombreSeccion' }),
      f('fecha', 'Fecha', 'date', { required: true }),
      f('horaInicio', 'Hora inicio', 'text', { required: true, placeholder: '08:00' } as any),
      f('horaFin', 'Hora fin', 'text', { required: true, placeholder: '10:00' } as any),
      f('enlaceVirtual', 'Enlace virtual', 'textarea', { listed: false }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-tareas', label: 'Tarea',
    icon: 'assignment_turned_in', path: '/api/v1/tareas',
    description: 'Tarea asignada a los estudiantes de un curso',
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('cursoId', 'Curso', 'ref', { required: true, refPath: '/api/v1/cursos', refLabelKey: 'nombre' }),
      f('titulo', 'Título', 'text', { required: true }),
      f('descripcion', 'Descripción', 'textarea', { listed: false }),
      f('fechaLimite', 'Fecha límite', 'datetime', { required: true }),
      f('puntajeMaximo', 'Puntaje máximo', 'number', { required: true }),
      f('activo', 'Activo', 'boolean', { required: true, default: true })
    ]
  },
  {
    group: 'Currículo', subgroup: 'LMS', slug: 'lms-matriculas', label: 'Matrícula (LMS)',
    icon: 'how_to_reg', path: '/api/v1/matriculas',
    description: 'Matrícula del estudiante (solo lectura; no se crea ni elimina desde aquí)',
    lockedCatalog: true,
    fields: [
      f('id', 'ID', 'id', { editable: false }),
      f('periodoAcademico', 'Periodo académico', 'text', { editable: false }),
      f('metodoPago', 'Método de pago', 'text', { editable: false }),
      f('detalles', 'Detalles', 'text', { editable: false })
    ]
  }
];

export const CRUD_BY_SLUG = new Map(CRUDS.map(c => [c.slug, c]));
