# PulsePass

Plataforma de eventos, artistas y entradas. Java 21 · Spring Boot 4 · PostgreSQL · Flyway · MapStruct · Spring Security + JWT (JJWT).


## Arquitectura

```
HTTP Request → JwtAuthenticationFilter → reglas de autorización → Controller → Service → Repository → PostgreSQL
HTTP Response ← Controller / GlobalExceptionHandler / RestAuthenticationEntryPoint / RestAccessDeniedHandler
```

- `controller/`: capa HTTP delgada; delega en los Services y retorna `ResponseEntity<DTO>`.
- `exception/GlobalExceptionHandler`: único `@RestControllerAdvice`; traduce excepciones a `ResponseEntity<ErrorResponse>`.
- `config/SecurityConfig`: `PasswordEncoder` (BCrypt), `AuthenticationProvider`, `AuthenticationManager`, `SecurityFilterChain` (stateless) y matriz de acceso.
- `security/`: `JwtProperties`, `JwtService` (JJWT, HS256), `JwtAuthenticationFilter`, `JpaUserDetailsService`, `RestAuthenticationEntryPoint` (401), `RestAccessDeniedHandler` (403), `AdminBootstrapRunner`.
- `auth/`: `POST /api/auth/login` (`AuthenticationController`, `AuthenticationService`, `LoginRequest`, `TokenResponse`).

## Seguridad

### Configuración

El secreto JWT **no** está en el repositorio. Genéralo y entrégalo por variable de entorno:

```bash
export JWT_SECRET=$(openssl rand -base64 32)
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `JWT_SECRET` | Sí | Clave HMAC (Base64, ≥ 32 bytes). Sin ella la aplicación no arranca. |
| `BOOTSTRAP_ADMIN_ENABLED` | No | `true` crea un ADMIN inicial al arrancar (idempotente). |
| `BOOTSTRAP_ADMIN_USERNAME` / `_EMAIL` / `_PASSWORD` | Si lo anterior es `true` | Credenciales del ADMIN inicial. |

Expiración del token (15 min) y issuer (`pulsepass-api`) en `application.properties` (`security.jwt.*`).

### Roles y matriz de acceso

El registro público (`POST /api/users`) siempre crea usuarios con rol `USER`. Los roles `ORGANIZER` y `ADMIN` se asignan fuera de la API (el primer `ADMIN` se crea con las variables `BOOTSTRAP_ADMIN_*`).

| Acceso | Endpoints |
|---|---|
| Público | `POST /api/auth/login`, `POST /api/users`, `GET /api/venues/**`, `GET /api/artists/**`, `GET /api/events/published`, `GET /api/events/by-artist` |
| Autenticado (cualquier rol) | `GET /api/profile`, `GET /api/events/{eventCode}`, `POST /api/tickets`, `GET /api/tickets/{code}`, `GET /api/tickets/by-user`, `PATCH /api/tickets/{code}/cancel` |
| Autenticado + propietario o ADMIN | `GET /api/users/by-username` (`@PreAuthorize`) |
| ORGANIZER o ADMIN | `POST /api/events`, `POST /api/events/{code}/artists/{id}`, `PATCH /api/events/{code}/publish`, `PATCH /api/tickets/{code}/use` |
| ADMIN | `GET /api/events/{code}/tickets/paid`, `GET /api/users/by-email` |

Sin token o con token inválido/expirado → **401**. Token válido sin el rol requerido → **403**. Ambos con el contrato `ErrorResponse`.


### Base de datos

`V4__add_security_columns_to_users.sql` agrega `users.password` (hash BCrypt, nullable: los usuarios anteriores a esta fase no tienen credenciales y no pueden iniciar sesión) y `users.role` (`USER` por defecto).

## Endpoints de negocio

| Método | Endpoint | Service | Éxito |
|---|---|---|---|
| GET | `/api/venues/{code}` | `VenueService.findByCode` | 200 |
| GET | `/api/venues/active` | `VenueService.findActiveVenues` | 200 |
| POST | `/api/events` | `EventService.create` | 201 |
| GET | `/api/events/{eventCode}` | `EventService.findByCode` | 200 |
| GET | `/api/events/published` | `EventService.findPublishedEvents` | 200 |
| PATCH | `/api/events/{eventCode}/publish` | `EventService.publish` | 200 |
| POST | `/api/events/{eventCode}/artists/{artistId}` | `EventService.addArtist` | 200 |
| GET | `/api/events/by-artist?stageName=` | `EventService.findByArtist` | 200 |
| GET | `/api/events/{eventCode}/tickets/paid` | `TicketService.findPaidTicketsByEvent` | 200 |
| GET | `/api/artists/{id}` | `ArtistService.findById` | 200 |
| GET | `/api/artists/by-stage-name?stageName=` | `ArtistService.findByStageName` | 200 |
| GET | `/api/artists/active` | `ArtistService.findActiveArtists` | 200 |
| POST | `/api/users` | `UserService.register` | 201 |
| GET | `/api/users/by-email?email=` | `UserService.findByEmail` | 200 |
| GET | `/api/users/by-username?username=` | `UserService.findByUsername` | 200 |
| GET | `/api/profile` | `UserService.findByUsername` (usuario del token) | 200 |
| POST | `/api/tickets` | `TicketService.purchase` | 201 |
| GET | `/api/tickets/{ticketCode}` | `TicketService.findByCode` | 200 |
| GET | `/api/tickets/by-user?email=` | `TicketService.findByUserEmail` | 200 |
| PATCH | `/api/tickets/{ticketCode}/cancel` | `TicketService.cancel` | 200 |
| PATCH | `/api/tickets/{ticketCode}/use` | `TicketService.markAsUsed` | 200 |

## Contrato de errores

| Condición | HTTP |
|---|---|
| Bean Validation / JSON mal formado / parámetro faltante o inválido | 400 |
| Sin token, token inválido/expirado o login fallido | 401 |
| Rol insuficiente | 403 |
| `ResourceNotFoundException` | 404 |
| `DuplicateResourceException`, `BusinessRuleException` | 409 |
| Error inesperado (sin exponer detalles internos) | 500 |

```json
{
  "timestamp": "2026-10-04T20:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "details": {}
}
```

## Ejecutar

```bash
export JWT_SECRET=$(openssl rand -base64 32)

# Aplicación (requiere PostgreSQL configurado)
./mvnw spring-boot:run

# Todas las pruebas
./mvnw clean test

# Solo pruebas sin Docker (controladores, seguridad y servicios con mocks)
./mvnw test -Dtest='*ControllerTest,SecurityRulesTest,Jwt*Test,JpaUserDetailsServiceTest,AdminBootstrapRunnerTest,*ServiceImplTest'
```

- `*ControllerTest`: `@WebMvcTest` con filtros de seguridad desactivados; verifican el contrato HTTP.
- `SecurityRulesTest`: cadena de seguridad real (login, 401, 403, token expirado/manipulado, roles, `@PreAuthorize`) con los Services mockeados.
- `JwtServiceTest`: generación/validación de tokens, expirado, otra clave, otro issuer, payload manipulado.
- Las pruebas de persistencia (`PulsePassIntegrationTest`, `PulsepassApplicationTests`) usan Testcontainers y requieren Docker. El secreto JWT de pruebas está en `src/test/resources/config/application.properties`.

README generado a traves de IA
