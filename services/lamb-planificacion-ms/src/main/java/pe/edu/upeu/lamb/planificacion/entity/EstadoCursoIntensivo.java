package pe.edu.upeu.lamb.planificacion.entity;

// Un curso intensivo de vacaciones se abre solo si se inscriben suficientes estudiantes que lo desaprobaron
public enum EstadoCursoIntensivo {
    // Se reciben inscripciones de estudiantes que desaprobaron el curso
    EN_CONVOCATORIA,
    // Llego al cupo minimo: se dicta
    ABIERTO,
    // No llego al cupo minimo: los interesados lo llevan en el ciclo regular
    NO_APERTURADO
}
