package com.quitsmoking.model;

public enum Role  {
    GUEST("Guest"),
    COACH("Coach"),
    ADMIN("Admin"),
    MEMBER("Member");

    private final String roleName;

    Role(String roleName) {
        this.roleName = roleName;
    }

    public String getRoleName() {
        return roleName;
    }

    @Override
    public String toString() {
        return roleName;
    }
}
