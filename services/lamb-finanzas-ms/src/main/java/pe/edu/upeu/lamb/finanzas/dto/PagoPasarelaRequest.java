package pe.edu.upeu.lamb.finanzas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PagoPasarelaRequest {

    @NotBlank
    private String cardToken;

    @NotBlank
    @Email
    private String payerEmail;
}
