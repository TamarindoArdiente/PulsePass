package com.pulsepass.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.pulsepass.validation.Utf8MaxBytes;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterUserRequest(
        @NotBlank(message = "Username is required")
        @Size(max = 100, message = "Username must have at most 100 characters")
        String username,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 100, message = "Email must have at most 100 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 12, message = "Password must have at least 12 characters")
        @Utf8MaxBytes(value = 72, message = "Password must not exceed 72 bytes (UTF-8)")
        String password,

        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must have at most 50 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must have at most 50 characters")
        String lastName,

        @Size(max = 20, message = "Phone must have at most 20 characters")
        String phone,

        @Size(max = 50, message = "City must have at most 50 characters")
        String city,

        @NotNull(message = "Birth date is required")
        LocalDate birthDate
) {

    @Override
    public String toString() {
        return "RegisterUserRequest[username=" + username + ", email=" + email + ", password=***]";
    }
}
