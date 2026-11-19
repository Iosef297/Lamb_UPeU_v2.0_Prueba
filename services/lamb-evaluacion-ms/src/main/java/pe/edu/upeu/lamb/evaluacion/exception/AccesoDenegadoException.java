package pe.edu.upeu.lamb.evaluacion.exception;

// El usuario esta autenticado pero no tiene permiso sobre ese grupo (403)
public class AccesoDenegadoException extends RuntimeException {
    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
