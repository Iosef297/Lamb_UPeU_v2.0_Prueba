package pe.edu.upeu.lamb.planificacion.entity;

import java.time.LocalTime;

/** Turno del LAMB (Manana / Tarde / Noche): se calcula por la hora de inicio, no se guarda en el horario. */
public enum Turno {
    MANANA,
    TARDE,
    NOCHE;

    public static Turno de(LocalTime inicio) {
        if (inicio == null) {
            return null;
        }
        if (inicio.isBefore(LocalTime.of(13, 0))) {
            return MANANA;
        }
        return inicio.isBefore(LocalTime.of(17, 55)) ? TARDE : NOCHE;
    }
}
