package com.pulsepass.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.RECORD_COMPONENT;

/**
 * El texto no puede ocupar más de {@code value} bytes en UTF-8. BCrypt ignora/rechaza lo que supere
 * 72 bytes, y {@code @Size} cuenta caracteres, no bytes (una contraseña con tildes o emojis ocupa más).
 */
@Documented
@Constraint(validatedBy = Utf8MaxBytesValidator.class)
@Target({FIELD, PARAMETER, RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface Utf8MaxBytes {

    int value();

    String message() default "Value is too long";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
