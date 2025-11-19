package com.quitsmoking.services.interfaces;

import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;

// import com.smokingcessation.model.Role;
// import com.smokingcessation.model.User;

public interface iRegistrableService {
    User register(String username, String password, String email, String fisrtname, String lastname , Role role);
}
