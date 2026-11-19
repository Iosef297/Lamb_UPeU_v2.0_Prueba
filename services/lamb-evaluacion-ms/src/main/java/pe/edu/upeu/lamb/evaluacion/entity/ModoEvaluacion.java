package pe.edu.upeu.lamb.evaluacion.entity;

/**
 * COMPETENCIA: formula del LAMB real (ES/EP/ECG por unidad; si EP < umbral, NF = EP).
 * PONDERADO: promedio ponderado por componente (o simple si el grupo no tiene pesos).
 */
public enum ModoEvaluacion {
    COMPETENCIA,
    PONDERADO
}
