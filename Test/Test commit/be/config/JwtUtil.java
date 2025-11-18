package com.quitsmoking.config;

import com.quitsmoking.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys; // This import is correct for newer versions
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.slf4j.Logger;         // Thêm dòng này
import org.slf4j.LoggerFactory;

@Component
public class JwtUtil {

    // Secret key for JWT signing, loaded from application.properties
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    // thời gian hiệu lực của JWT token
    public static final long JWT_TOKEN_VALIDITY = 1 * 60 * 60 * 1000; // thời gian 1 giờ

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    /**
     * Extracts the username (subject) from the given JWT token.
     *
     * @param token The JWT token string.
     * @return The username.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from the given JWT token.
     *
     * @param token The JWT token string.
     * @return The expiration Date.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from the JWT token using a claims resolver function.
     *
     * @param token The JWT token string.
     * @param claimsResolver A function to resolve the specific claim from Claims.
     * @param <T> The type of the claim.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims (payload) from the given JWT token.
     *
     * @param token The JWT token string.
     * @return The Claims object containing all payload data.
     */
    private Claims extractAllClaims(String token) {
        // Jwts.parserBuilder() is available in JJWT 0.10.0 and later
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Set the signing key
                .build()
                .parseClaimsJws(token) // Parse the JWT
                .getBody(); // Get the claims body
    }

    /**
     * Checks if the JWT token is expired.
     *
     * @param token The JWT token string.
     * @return True if the token is expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a JWT token for the given UserDetails.
     *
     * @param userDetails The UserDetails object representing the user.
     * @return The generated JWT token string.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        // Thêm các thông tin khác của user vào claims nếu cần
        claims.put("id", user.getId()); // Vẫn có thể giữ ID trong claims
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        claims.put("pictureUrl", user.getPictureUrl());

        // Sử dụng username của model User làm subject
        return createToken(claims, user.getUsername());
    }

    /**
     * Builds and signs the JWT token.
     *
     * @param claims Additional claims to be included in the token.
     * @param subject The subject of the token (typically the username).
     * @return The compact JWT token string.
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims) // Set custom claims
                .setSubject(subject) // Set the subject (username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set issued at time
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY)) // Set expiration time
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sign the token with and secret key
                .compact(); // Compact the token to a URL-safe string
    }

    /**
     * Validates the given JWT token against the UserDetails.
     *
     * @param token The JWT token string.
     * @param userDetails The UserDetails object for validation.
     * @return True if the token is valid (username matches and not expired), false otherwise.
     */
public Boolean validateToken(String token, UserDetails userDetails) {
    final String username = extractUsername(token); // Tên người dùng từ token

    // 1. So sánh tên người dùng từ token với tên người dùng được tải từ DB
    // Đây là điểm có khả năng cao gây ra lỗi nếu chúng không khớp.
    if (!username.equals(userDetails.getUsername())) {
        logger.warn("Validation failed: Username in token '{}' does not match UserDetails username '{}'.", username, userDetails.getUsername());
        return false;
    }

    // 2. Kiểm tra xem token đã hết hạn chưa
    // Bạn đã xác nhận nó chưa hết hạn khi phân tích token, nhưng kiểm tra lại code.
    if (isTokenExpired(token)) {
        logger.warn("Validation failed: Token for user '{}' has expired.", username);
        return false;
    }

    // Các kiểm tra khác nếu có (ví dụ: audience, issuer)

    logger.debug("JWT Token for user '{}' is valid.", username);
    return true; // Nếu tất cả các kiểm tra đều qua
}

    /**
     * Decodes the base64 secret key and creates an HMAC-SHA key.
     *
     * @return The Key object used for signing and verifying tokens.
     */
    private Key getSigningKey() {
        // Sử dụng secret key dạng chuỗi thường, không decode base64
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }
}
