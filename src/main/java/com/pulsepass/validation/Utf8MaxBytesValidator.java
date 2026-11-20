package com.pulsepass.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.nio.charset.StandardCharsets;

public class Utf8MaxBytesValidator implements ConstraintValidator<Utf8MaxBytes, String> {

    private int max;

    @Override
    public void initialize(Utf8MaxBytes annotation) {
        this.max = annotation.value();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null lo valida @NotBlank
        return value == null || value.getBytes(StandardCharsets.UTF_8).length <= max;
    }
}
