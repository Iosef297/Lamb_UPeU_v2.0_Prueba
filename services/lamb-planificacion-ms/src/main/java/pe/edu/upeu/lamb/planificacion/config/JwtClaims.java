package pe.edu.upeu.lamb.planificacion.config;

import pe.edu.upeu.lamb.planificacion.exception.BusinessRuleException;
import org.springframework.security.oauth2.jwt.Jwt;

// idPersona es un claim propio de Keycloak (atributo del usuario), separado del sub
public final class JwtClaims {

    private JwtClaims() {
    }

    public static Long idPersona(Jwt jwt) {
        Number idPersona = jwt == null ? null : jwt.getClaim("idPersona");
        if (idPersona == null) {
            throw new BusinessRuleException("El token no trae idPersona: el usuario no esta vinculado a una persona");
        }
        return idPersona.longValue();
    }

    /**
     * true si quien llama es ADMIN o COORDINADOR (claim realm_access.roles de Keycloak).
     * Los permisos por grupo (editar notas, asistencia, silabo) solo restringen al docente.
     */
    @SuppressWarnings("unchecked")
    public static boolean esGestion() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (!(auth != null && auth.getPrincipal() instanceof Jwt jwt)) {
            return true; // llamadas internas (Kafka, pruebas) no tienen usuario
        }
        java.util.Map<String, Object> realm = jwt.getClaim("realm_access");
        java.util.Collection<String> roles = realm == null ? java.util.List.of()
                : (java.util.Collection<String>) realm.getOrDefault("roles", java.util.List.of());
        return roles.contains("ADMIN") || roles.contains("COORDINADOR");
    }
}
