package pe.edu.upeu.lamb.finanzas.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MercadoPagoProperties.class)
@RequiredArgsConstructor
public class MercadoPagoSdkConfig {

    private final MercadoPagoProperties properties;

    @PostConstruct
    public void init() {
        com.mercadopago.MercadoPagoConfig.setAccessToken(properties.getAccessToken());
    }
}
