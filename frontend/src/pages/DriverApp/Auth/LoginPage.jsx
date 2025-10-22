import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Giả sử AuthContext nằm ở src/context/
import "./LoginPage.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading: authLoading, error: authError, isAuthenticated } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [localError, setLocalError] = useState("");
    const [formProcessing, setFormProcessing] = useState(false);

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRememberMeChange = () => {
        setRememberMe(!rememberMe);
    };

    const validateUsername = (inputUsername) => {
        if (!inputUsername.trim()) {
            return "Tài khoản không được để trống.";
        }
        return "";
    };

    const validatePassword = (inputPassword) => {
        if (!inputPassword.trim()) {
            return "Mật khẩu không được để trống.";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        setUsernameError("");
        setPasswordError("");
        setFormProcessing(true);

        const uError = validateUsername(usernameInput);
        const pError = validatePassword(passwordInput);

        if (uError) setUsernameError(uError);
        if (pError) setPasswordError(pError);

        if (uError || pError) {
            setFormProcessing(false);
            return;
        }

        try {
            await login({ username: usernameInput, password: passwordInput });
        } catch (err) {
            const errorMessage = authError || err.message || "Tài khoản hoặc mật khẩu không đúng.";
            setLocalError(errorMessage);
        } finally {
            setFormProcessing(false);
        }
    };

    useEffect(() => {
        document.title = "Đăng Nhập";
    }, []);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate("/");
        }
    }, [isAuthenticated, authLoading, navigate]);

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-neutral-100 px-4"
            style={{
                backgroundImage: "url('/images/123123123.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 login-container">
                <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
                    ĐĂNG NHẬP
                </h1>

                <p className="text-center text-sm text-gray-600 mb-6 description">
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline cursor-pointer">
                        Tạo tài khoản ngay!
                    </Link>
                </p>

                <form onSubmit={handleSubmit}>
                    {(localError || authError) && (
                        <div className="message error-message" role="alert">
                            <span className="block sm:inline">{localError || authError}</span>
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Tài khoản
                        </label>
                        <input
                            id="username"
                            type="text"
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                usernameError ? "invalid" : ""
                            }`}
                            value={usernameInput}
                            onChange={(e) => {
                                setUsernameInput(e.target.value);
                                if (usernameError) setUsernameError("");
                            }}
                        />
                        {usernameError && (
                            <p className="text-red-500 text-xs italic mt-1">{usernameError}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                    passwordError ? "invalid" : ""
                                }`}
                                value={passwordInput}
                                onChange={(e) => {
                                    setPasswordInput(e.target.value);
                                    if (passwordError) setPasswordError("");
                                }}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                Duy trì đăng nhập
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link to="/forgot-password" className="text-blue-500 hover:underline cursor-pointer">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" className="primary-btn" disabled={formProcessing || authLoading}>
                        {formProcessing || authLoading ? "Đang xử lý..." : "Đăng Nhập"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;