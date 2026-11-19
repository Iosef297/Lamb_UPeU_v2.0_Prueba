package pe.edu.upeu.lamb.curriculo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.type.classreading.CachingMetadataReaderFactory;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Valores de los enums del modelo (estados, tipos, roles, dias) para que el front no los escriba a mano.
 * Se leen una sola vez del paquete entity al arrancar.
 */
@RestController
@RequestMapping("/api/v1/catalogos")
@Tag(name = "Catalogos", description = "Valores permitidos de los enums del microservicio")
public class CatalogoEnumsController {

    private static final String PAQUETE = "pe/edu/upeu/lamb/curriculo/entity";

    private final Map<String, List<String>> enums = cargar();

    @GetMapping("/enums")
    @Operation(summary = "Enums del modelo: nombre del enum -> valores")
    public Map<String, List<String>> enums() {
        return enums;
    }

    private static Map<String, List<String>> cargar() {
        Map<String, List<String>> resultado = new TreeMap<>();
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            CachingMetadataReaderFactory lectores = new CachingMetadataReaderFactory(resolver);
            for (Resource r : resolver.getResources("classpath*:" + PAQUETE + "/*.class")) {
                MetadataReader lector = lectores.getMetadataReader(r);
                if (!"java.lang.Enum".equals(lector.getClassMetadata().getSuperClassName())) {
                    continue;
                }
                Class<?> clase = Class.forName(lector.getClassMetadata().getClassName());
                resultado.put(clase.getSimpleName(),
                        Arrays.stream(clase.getEnumConstants()).map(c -> ((Enum<?>) c).name()).toList());
            }
        } catch (IOException | ClassNotFoundException e) {
            throw new IllegalStateException("No se pudieron leer los enums del modelo", e);
        }
        return resultado;
    }
}
