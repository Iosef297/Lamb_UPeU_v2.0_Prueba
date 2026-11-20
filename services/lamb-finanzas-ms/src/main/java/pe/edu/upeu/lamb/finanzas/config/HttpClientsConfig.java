package pe.edu.upeu.lamb.finanzas.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class HttpClientsConfig {

    @Bean
    @LoadBalanced
    public RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    // Llamada directa via Eureka (nombre de servicio), sin pasar por el Gateway: comunicacion M2M.
    @Bean
    public RestClient ingresosPagosRestClient(RestClient.Builder loadBalancedRestClientBuilder) {
        return loadBalancedRestClientBuilder.baseUrl("http://ingresos-pagos-ms").build();
    }
}
