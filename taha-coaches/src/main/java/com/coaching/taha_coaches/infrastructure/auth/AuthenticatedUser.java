package com.coaching.taha_coaches.infrastructure.auth;

import com.coaching.taha_coaches.domain.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class AuthenticatedUser implements OAuth2User, OidcUser, UserDetails {

    private final User user;
    private final Map<String, Object> attributes;
    private final Collection<? extends GrantedAuthority> authorities;

    public AuthenticatedUser(User user,
                             Map<String, Object> attributes,
                             Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.attributes = attributes;
        this.authorities = authorities;
    }

    public User getUser() {
        return user;
    }

    // ===== OAuth2 / OIDC =====
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return user.getId().toString();
    }

    // ===== Spring Security =====
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null; // OAuth users don’t have password
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    // ===== OIDC (optional, safe defaults) =====
    @Override public Map<String, Object> getClaims() { return attributes; }
    @Override public OidcUserInfo getUserInfo() { return null; }
    @Override public OidcIdToken getIdToken() { return null; }
}