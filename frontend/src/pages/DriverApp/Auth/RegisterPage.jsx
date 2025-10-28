import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config/config";

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

    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [authMessage, setAuthMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MIN_PASSWORD_LENGTH = 6;
    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
            case "password":
                if (!value.trim()) error = "Mật khẩu không được để trống.";
                else if (value.length < MIN_PASSWORD_LENGTH) error = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
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

    const handleInputChange = (setter, errorSetter) => (e) => {
        setter(e.target.value);
        if (errorSetter) errorSetter("");
        setGeneralError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError("");
        setAuthMessage("");
        setIsSubmitting(true);

        const uError = validateField("username", username);
        const eError = validateField("email", email);
        const pError = validateField("password", password);
        const cPError = validateField("confirmPassword", confirmPassword);

        setUsernameError(uError);
        setEmailError(eError);
        setPasswordError(pError);
        setConfirmPasswordError(cPError);

        if (uError || eError || pError || cPError || !firstName.trim() || !lastName.trim()) {
            setGeneralError("Vui lòng điền đầy đủ và chính xác các thông tin.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}${config.endpoints.register}`, {
                username,
                email,
                firstName,
                lastName,
                password,
            });

            if (response.data) {
                setAuthMessage("Đăng ký thành công! Sẽ chuyển đến trang đăng nhập sau 3 giây.");
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (err) {
            const backendMessage = err.response?.data?.message || "Đã có lỗi xảy ra khi đăng ký.";
            setGeneralError(backendMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        document.title = "Đăng Ký Tài Khoản";
    }, []);

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-100"
            style={{
                backgroundImage: "url('/images/123123123.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
                    ĐĂNG KÝ
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {generalError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            {generalError}
                        </div>
                    )}
                    {authMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">
                            {authMessage}
                        </div>
                    )}

                    <div>
                        <input type="text" value={username} onChange={handleInputChange(setUsername, setUsernameError)} className={`w-full px-4 py-3 border-2 rounded-lg ${usernameError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Tên đăng nhập" />
                        {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
                    </div>
                    <div>
                        <input type="email" value={email} onChange={handleInputChange(setEmail, setEmailError)} className={`w-full px-4 py-3 border-2 rounded-lg ${emailError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Email" />
                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>
                    <div className="flex gap-4">
                        <input type="text" value={firstName} onChange={handleInputChange(setFirstName)} className="w-1/2 px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Họ" />
                        <input type="text" value={lastName} onChange={handleInputChange(setLastName)} className="w-1/2 px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Tên" />
                    </div>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={handleInputChange(setPassword, setPasswordError)} className={`w-full px-4 py-3 border-2 rounded-lg ${passwordError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Mật khẩu" />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={togglePasswordVisibility}>
                            <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
                        </button>
                    </div>
                    {passwordError && <p className="text-red-500 text-xs -mt-2 mb-2">{passwordError}</p>}
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={handleInputChange(setConfirmPassword, setConfirmPasswordError)} className={`w-full px-4 py-3 border-2 rounded-lg ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Xác nhận mật khẩu" />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={toggleConfirmPasswordVisibility}>
                            <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
                        </button>
                    </div>
                    {confirmPasswordError && <p className="text-red-500 text-xs -mt-2 mb-2">{confirmPasswordError}</p>}

                    <button type="submit" className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-emerald-600 text-white disabled:opacity-70" disabled={isSubmitting}>
                        {isSubmitting ? "Đang đăng ký..." : "Đăng Ký Tài Khoản"}
                    </button>
                </form>
                <p className="mt-8 text-center text-base text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-800">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;