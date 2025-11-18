package com.quitsmoking.dto.request;

// import com.smokingcessation.model.Role; // Nếu bạn muốn truyền role từ frontend, nhưng không nên cho đăng ký công khai

public class AuthRequest {
    private String username;
    private String password;
    private String email;      // Thêm trường email
    private String firstName;  // Thêm trường firstName
    private String lastName;   // Thêm trường lastName

    // Constructor trống là cần thiết cho JSON deserialization
    public AuthRequest() {
    }

    // Constructor đầy đủ (có thể có hoặc không tùy theo nhu cầu của bạn)
    public AuthRequest(String username, String password, String email, String firstName, String lastName) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getters và Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}