package com.pulsepass.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

class AccessPolicyTest {

    private final AccessPolicy policy = new AccessPolicy();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void login(String username, String email, String role) {
        AppUserDetails user = new AppUserDetails(1L, username, email, "hash", true, role);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(user, null, user.getAuthorities()));
    }

    @Test
    void anonymousHasNoIdentityAndNoRoles() {
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken(
                "key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")));

        assertThat(policy.currentUser()).isEmpty();
        assertThat(policy.isOperator()).isFalse();
        assertThat(policy.isOwnEmail("andrea@example.com")).isFalse();
    }

    @Test
    void noAuthenticationAtAll_isDenied() {
        assertThat(policy.isOperator()).isFalse();
        assertThat(policy.hasRole("ADMIN")).isFalse();
        assertThatThrownBy(() -> policy.requireOwnEmail("andrea@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void operatorsAreStaffAndAdminOnly() {
        login("andrea", "andrea@example.com", "USER");
        assertThat(policy.isOperator()).isFalse();

        login("staff", "staff@example.com", "STAFF");
        assertThat(policy.isOperator()).isTrue();

        login("admin", "admin@example.com", "ADMIN");
        assertThat(policy.isOperator()).isTrue();
        assertThat(policy.hasRole("ADMIN")).isTrue();
    }

    @Test
    void ownEmailIsCaseInsensitive_andOtherEmailIsDenied() {
        login("andrea", "Andrea@Example.com", "USER");

        assertThat(policy.isOwnEmail("andrea@example.com")).isTrue();
        assertThat(policy.isOwnEmail("carlos@example.com")).isFalse();
        assertThat(policy.isOwnEmail(null)).isFalse();
        assertThatCode(() -> policy.requireOwnEmail("andrea@example.com")).doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.requireOwnEmail("carlos@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void ownUsernameIsExact() {
        login("andrea", "andrea@example.com", "USER");

        assertThat(policy.isOwnUsername("andrea")).isTrue();
        assertThat(policy.isOwnUsername("Andrea")).isFalse();
        assertThat(policy.isOwnUsername("carlos")).isFalse();
    }

    @Test
    void ownerOrOperator_allowsOwnerStaffAndAdmin_butNotOtherUsers() {
        login("andrea", "andrea@example.com", "USER");
        assertThatCode(() -> policy.requireOwnerOrOperator("andrea@example.com")).doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.requireOwnerOrOperator("carlos@example.com"))
                .isInstanceOf(AccessDeniedException.class);

        login("staff", "staff@example.com", "STAFF");
        assertThatCode(() -> policy.requireOwnerOrOperator("carlos@example.com")).doesNotThrowAnyException();
    }
}
