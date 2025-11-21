import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config/config";
// Đã loại bỏ: import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States để quản lý lỗi validation cho từng trường
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState(""); // Lỗi chung từ backend hoặc logic tổng thể
  const [authMessage, setAuthMessage] = useState(""); // Thông báo thành công
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái đang gửi form

  const MIN_PASSWORD_LENGTH = 6;

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Hàm validate từng trường và cập nhật state lỗi
  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "username":
        if (!value.trim()) error = "Tên đăng nhập không được để trống.";
        else if (value.trim().length < 4) error = "Tên đăng nhập phải có ít nhất 4 ký tự.";
        break;
      case "email":
        if (!value.trim()) error = "Email không được để trống.";
        else if (!isValidEmail(value)) error = "Email không hợp lệ.";
        break;
      case "firstName":
        if (!value.trim()) error = "Họ không được để trống.";
        break;
      case "lastName":
        if (!value.trim()) error = "Tên không được để trống.";
        break;
      case "password":
        if (!value.trim()) error = "Mật khẩu không được để trống.";
        else if (value.length < MIN_PASSWORD_LENGTH)
          error = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
        break;
      case "confirmPassword":
        if (!value.trim()) error = "Xác nhận mật khẩu không được để trống.";
        else if (value !== password) error = "Mật khẩu xác nhận không khớp.";
        break;
      default:
        break;
    }
    return error;
  };

  // Hàm xử lý thay đổi input và xóa lỗi tức thì
  const handleInputChange = (setter, errorSetter, fieldName) => (e) => {
    setter(e.target.value);
    // Chỉ cập nhật errorSetter nếu nó được cung cấp
    if (errorSetter) {
      errorSetter(""); // Xóa lỗi khi người dùng bắt đầu gõ
    }
    setGeneralError(""); // Xóa lỗi chung nếu có
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(""); // Reset lỗi chung
    setAuthMessage(""); // Reset thông báo thành công
    setIsSubmitting(true);

    // Reset tất cả các lỗi cục bộ trước khi validate lại
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate tất cả các trường trước khi gửi
    const uError = validateField("username", username);
    const eError = validateField("email", email);
    const fNError = validateField("firstName", firstName); // Kiểm tra luôn để hiển thị lỗi tổng nếu thiếu
    const lNError = validateField("lastName", lastName); // Kiểm tra luôn để hiển thị lỗi tổng nếu thiếu
    const pError = validateField("password", password);
    const cPError = validateField("confirmPassword", confirmPassword);

    // Cập nhật state lỗi cụ thể
    setUsernameError(uError);
    setEmailError(eError);
    setPasswordError(pError);
    setConfirmPasswordError(cPError);

    if (uError || eError || fNError || lNError || pError || cPError) {
      setGeneralError("Vui lòng kiểm tra lại thông tin đăng ký.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
          `${config.API_BASE_URL}${config.endpoints.register}`,
          {
            username,
            email,
            firstName,
            lastName,
            password,
          }
      );

      if (response.data.success) {
        setAuthMessage("Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.");
        setTimeout(() => {
          navigate("/login");
        }, 3000); // Tăng thời gian chờ để người dùng đọc thông báo
      }
    } catch (err) {
      console.error("Lỗi đăng ký từ Backend:", err.response);

      const backendErrorMessage = err.response?.data?.message;
      const backendErrors = err.response?.data?.errors;

      if (backendErrors) {
        // Xử lý các lỗi cụ thể từ backend cho từng trường
        if (backendErrors.username) setUsernameError(backendErrors.username);
        if (backendErrors.email) setEmailError(backendErrors.email);
        if (backendErrors.password) setPasswordError(backendErrors.password);
        // Có thể thêm cho firstName, lastName nếu backend trả về lỗi riêng cho chúng

        // Tạo thông báo lỗi chung từ backend errors
        const errorMessages = Object.values(backendErrors).join(" | ");
        setGeneralError(`Lỗi từ máy chủ: ${errorMessages}`);

      } else if (backendErrorMessage) {
        setGeneralError(backendErrorMessage);
      } else {
        setGeneralError("Đã có lỗi xảy ra khi đăng ký.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.getElementById("title").innerText = "Đăng Ký Tài Khoản";
  }, []);

  return (
      <div
          className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-100" // Added bg-gray-100 for consistency
          style={{
            backgroundImage: "url('/images/123123123.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
      >
        <div
            className="
          bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
          transform transition-all duration-500 ease-in-out
          hover:shadow-3xl hover:-translate-y-1
        "
            // Applying more advanced Tailwind classes for a modern look
        >
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-tight"> {/* Increased font-bold to font-extrabold, added tracking-tight */}
            ĐĂNG KÝ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative transition-all duration-300 ease-in-out transform scale-95 animate-slide-in" // Added rounded-lg, transition, transform, animate-slide-in
                    role="alert"
                >
                  <span className="block sm:inline">{generalError}</span>
                </div>
            )}
            {authMessage && (
                <div
                    className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative transition-all duration-300 ease-in-out transform scale-95 animate-slide-in" // Added rounded-lg, transition, transform, animate-slide-in
                    role="alert"
                >
                  <span className="block sm:inline">{authMessage}</span>
                </div>
            )}

            {/* Username Input */}
            <div>
              <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên đăng nhập
              </label>
              <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleInputChange(setUsername, setUsernameError, "username")}
                  className={`
                block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm
                focus:ring-emerald-500 focus:border-emerald-500 text-base /* Changed to emerald */
                transition duration-300 ease-in-out
                ${usernameError ? "border-red-500 bg-red-50" : ""}
              `} // Adjusted padding, border, rounded, text-base, added focus styles and error styles
                  placeholder="Nhập tên đăng nhập của bạn"
              />
              {usernameError && (
                  <p className="text-red-500 text-xs italic mt-1">{usernameError}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleInputChange(setEmail, setEmailError, "email")}
                  className={`
                block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm
                focus:ring-emerald-500 focus:border-emerald-500 text-base /* Changed to emerald */
                transition duration-300 ease-in-out
                ${emailError ? "border-red-500 bg-red-50" : ""}
              `}
                  placeholder="Nhập email của bạn"
              />
              {emailError && (
                  <p className="text-red-500 text-xs italic mt-1">{emailError}</p>
              )}
            </div>

            {/* First Name Input */}
            <div>
              <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ
              </label>
              <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={handleInputChange(setFirstName, null, "firstName")} // No specific error state for firstName
                  className="
                block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm
                focus:ring-emerald-500 focus:border-emerald-500 text-base /* Changed to emerald */
                transition duration-300 ease-in-out
              "
                  placeholder="Nhập họ của bạn"
              />
            </div>

            {/* Last Name Input */}
            <div>
              <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên
              </label>
              <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={handleInputChange(setLastName, null, "lastName")} // No specific error state for lastName
                  className="
                block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm
                focus:ring-emerald-500 focus:border-emerald-500 text-base /* Changed to emerald */
                transition duration-300 ease-in-out
              "
                  placeholder="Nhập tên của bạn"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative"> {/* Essential for positioning the eye icon */}
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={handleInputChange(setPassword, setPasswordError, "password")}
                    className={`
                  block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm
                  focus:ring-emerald-500 focus:border-emerald-500 text-base pr-10 /* Changed to emerald */
                  transition duration-300 ease-in-out
                  ${passwordError ? "border-red-500 bg-red-50" : ""}
                `} // Added pr-10 for icon space
                    placeholder="Nhập mật khẩu"
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200" // Styled icon button
                    onClick={togglePasswordVisibility}
                >
                  <i
                      className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                  ></i>
                </button>
              </div>
              {passwordError && (
                  <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative"> {/* Essential for positioning the eye icon */}
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword, setConfirmPasswordError, "confirmPassword")}
                    className={`
                  block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm
                  focus:ring-emerald-500 focus:border-emerald-500 text-base pr-10 /* Changed to emerald */
                  transition duration-300 ease-in-out
                  ${confirmPasswordError ? "border-red-500 bg-red-50" : ""}
                `} // Added pr-10 for icon space
                    placeholder="Nhập lại mật khẩu"
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200" // Styled icon button
                    onClick={toggleConfirmPasswordVisibility}
                >
                  <i
                      className={`fas ${
                          showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                  ></i>
                </button>
              </div>
              {confirmPasswordError && (
                  <p className="text-red-500 text-xs italic mt-1">{confirmPasswordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                  type="submit"
                  className={`
                w-full py-3 px-6 rounded-lg font-semibold text-lg
                bg-gradient-to-r from-emerald-600 to-emerald-800 text-white /* Changed to emerald gradient */
                shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 /* Changed to emerald ring */
                transform transition-all duration-300 ease-in-out
                ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1 hover:scale-105"}
              `} // Extensive styling with gradients, shadow, transform, and disabled states
                  disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đăng ký..." : "Đăng Ký Tài Khoản"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                  to="/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors duration-200" /* Changed to emerald */
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;
