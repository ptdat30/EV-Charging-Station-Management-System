import axios from "axios";
import config from "../config/config";

// Tạo axios instance với base configuration
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Định nghĩa các khóa lưu trữ trong localStorage
const TOKEN_KEY = "jwt_token"; // Đổi tên cho rõ ràng
const USER_KEY = "user_data"; // Đổi tên cho rõ ràng

// Hàm tiện ích để lưu token vào localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY); // Xóa nếu token là null/undefined
  }
};

// Hàm tiện ích để lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Hàm tiện ích để lưu thông tin người dùng vào localStorage
const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

// Hàm tiện ích để lấy thông tin người dùng từ localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      const parsedUser = JSON.parse(userStr);
      // Ensure that parsedUser has all expected fields, provide defaults if missing
      const userWithDefaults = {
        id: parsedUser.id || null, // Sử dụng null cho id nếu không có
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        role: parsedUser.role || "GUEST", // Mặc định là GUEST nếu không có vai trò
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        pictureUrl: parsedUser.pictureUrl || "",
        membership: parsedUser.membership || null,
      };
      return userWithDefaults;
    } catch (e) {
      localStorage.removeItem(USER_KEY); // Xóa user lỗi
      return null;
    }
  }
  return null;
};

// Hàm tiện ích để xóa token khỏi localStorage
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Hàm tiện ích để xóa user khỏi localStorage
const removeCurrentUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Request interceptor để thêm JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken(); // Sử dụng hàm tiện ích
    if (token) {
      // Đảm bảo luôn set đúng chữ hoa 'Authorization'
      config.headers['Authorization'] = `Bearer ${token}`;
      // XÓA mọi dòng set 'authorization' (chữ thường) nếu có
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn và quyền truy cập
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Kiểm tra nếu là lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
      if (error.response.status === 401) {
        // Chỉ logout nếu message thực sự chứa từ khóa token expired/invalid
        const isTokenExpiredError = error.response.data?.message?.toLowerCase().includes('token expired') || 
                                   error.response.data?.message?.toLowerCase().includes('expired') ||
                                   error.response.data?.message?.toLowerCase().includes('hết hạn') ||
                                   error.response.data?.message?.toLowerCase().includes('invalid token') ||
                                   error.response.data?.message?.toLowerCase().includes('không hợp lệ') ||
                                   error.response.data?.message?.toLowerCase().includes('unauthorized') ||
                                   error.response.data?.message?.toLowerCase().includes('authentication failed');
        
        // Kiểm tra nếu là lỗi membership-related (không logout)
        const isMembershipError = error.response.data?.message?.toLowerCase().includes('membership') || 
                                 error.response.data?.message?.toLowerCase().includes('upgrade') ||
                                 error.response.data?.message?.toLowerCase().includes('nâng cấp') ||
                                 error.response.data?.message?.toLowerCase().includes('thành viên') ||
                                 error.response.data?.message?.toLowerCase().includes('access') ||
                                 error.response.data?.message?.toLowerCase().includes('plan') ||
                                 error.response.data?.message?.toLowerCase().includes('trial') ||
                                 error.response.data?.message?.toLowerCase().includes('guest') ||
                                 error.response.data?.message?.toLowerCase().includes('restricted');
        
        if (isTokenExpiredError && !isMembershipError) {
          authService.logout();
        }
      }
      
      // Kiểm tra nếu là lỗi 403 (Forbidden) - không có quyền truy cập
      if (error.response.status === 403) {
        // Không logout cho lỗi 403, để component xử lý hiển thị thông báo nâng cấp
      }
    }
    return Promise.reject(error);
  }
);

// Hàm tiện ích để giải mã JWT (Id Token của Google)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const authService = {
  // Đăng nhập (Local login)
  login: async (credentials) => {
    try {
      const response = await apiClient.post(
        config.endpoints.login,
        credentials
      );
      if (response.data.token) {
        setToken(response.data.token); // Sử dụng hàm tiện ích

        // SỬA LỖI ÁNH XẠ: Đảm bảo các trường được gán đúng
        const user = {
          id: response.data.userId || null, // Lấy userId từ backend
          username: response.data.username || "", // Lấy username từ backend
          email: response.data.email || "",
          role: response.data.role || "GUEST", // Lấy role từ backend
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          pictureUrl: response.data.pictureUrl || "",
          membership: response.data.membership || null,
        };
        setCurrentUser(user); // Sử dụng hàm tiện ích
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      const response = await apiClient.post(
        config.endpoints.register,
        userData
      );
      // Nếu đăng ký tự động đăng nhập và trả về token, lưu nó
      if (response.data.token) {
        setToken(response.data.token);
        const user = {
          id: response.data.userId || null,
          username: response.data.username || "",
          email: response.data.email || "",
          role: response.data.role || "GUEST",
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          pictureUrl: response.data.pictureUrl || "",
          membership: response.data.membership || null,
        };
        setCurrentUser(user);
        return {
          ...user,
          token: response.data.token,
        };
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập Google
  googleLogin: async (idTokenFromGoogle) => {
    try {
      const decodedIdToken = decodeJwt(idTokenFromGoogle);

      const response = await apiClient.post(config.endpoints.googleLogin, {
        idToken: idTokenFromGoogle,
      });

      if (response.data.token) {
        setToken(response.data.token); // Sử dụng hàm tiện ích

        // ÁNH XẠ CHO GOOGLE LOGIN:
        // Ưu tiên dữ liệu từ backend, nếu thiếu thì lấy từ decodedIdToken
        const user = {
          id: response.data.userId || decodedIdToken?.sub || null, // userId từ backend, fallback sub từ token
          username:
            response.data.username ||
            decodedIdToken?.name ||
            decodedIdToken?.email ||
            "", // username từ backend, fallback name/email từ token
          email: response.data.email || decodedIdToken?.email || "", // email từ backend, fallback email từ token
          role: response.data.role || "GUEST", // role từ backend, mặc định là GUEST
          firstName:
            response.data.firstName || decodedIdToken?.given_name || "", // firstName từ backend, fallback given_name từ token
          lastName: response.data.lastName || decodedIdToken?.family_name || "", // lastName từ backend, fallback family_name từ token
          pictureUrl: response.data.pictureUrl || decodedIdToken?.picture || "", // pictureUrl từ backend, fallback từ token
          membership: response.data.membership || null,
        };
        setCurrentUser(user); // Sử dụng hàm tiện ích
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    removeToken(); // Sử dụng hàm tiện ích
    removeCurrentUser(); // Sử dụng hàm tiện ích
    // KHÔNG CÒN window.location.href ở đây.
    // AuthContext sẽ xử lý việc cập nhật trạng thái và ProtectedRoute sẽ điều hướng.
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post(config.endpoints.forgotPassword, {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post(config.endpoints.resetPassword, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kiểm tra authentication
  isAuthenticated: () => {
    return !!getToken() && !!getCurrentUser()?.id; // Kiểm tra cả token và user.id
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: getCurrentUser, // Trả về hàm tiện ích
  // Lấy token hiện tại
  getToken: getToken, // Trả về hàm tiện ích
  // EXPORT setCurrentUser
  setCurrentUser: setCurrentUser,
};

export default authService;
export { apiClient };
