package com.coaching.taha_coaches.infrastructure.security;

import com.coaching.taha_coaches.infrastructure.auth.CustomOidcUserService;
import com.coaching.taha_coaches.infrastructure.auth.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class
SecurityConfig {

    private final CustomOidcUserService customOidcUserService;
    private final OAuth2LoginSuccessHandler successHandler;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(
                        auth ->
//                                auth.requestMatchers("/**").permitAll()
//                                .requestMatchers("/api/oauth2/**", "/api/public/**").permitAll()
//                                .anyRequest().authenticated()
                                auth.requestMatchers("/api/public/**", "/login/**", "/oauth2/**").permitAll()
                                .anyRequest().authenticated()


                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOidcUserService))
                        .successHandler(successHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/api/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                );

        return http.build();

    }
}
