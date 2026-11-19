package pe.edu.upeu.lamb.curriculo.entity;

public enum EstadoPlan {
    BORRADOR,
    // Abierto a nuevo ingreso: el plan de las cohortes que ingresan ahora
    VIGENTE,
    // Cerrado a nuevo ingreso, pero lo siguen las cohortes que ingresaron con el
    EN_EXTINCION,
    // Cierre definitivo: ya no quedan estudiantes con este plan
    DEROGADO
}
