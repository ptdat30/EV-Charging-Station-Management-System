import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!email.trim()) {
            setError("Vui lòng nhập địa chỉ email của bạn.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Địa chỉ email không hợp lệ.");
            return;
        }

        setIsSubmitting(true);
        console.log("Gửi yêu cầu reset mật khẩu cho email:", email);
        setTimeout(() => {
            setMessage("Nếu tài khoản tồn tại, một email hướng dẫn sẽ được gửi đến bạn.");
            setIsSubmitting(false);
        }, 2000);
    };

    useEffect(() => {
        document.title = "Quên Mật Khẩu";
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
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
                    QUÊN MẬT KHẨU
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để lấy lại mật khẩu.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">
                            {message}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                                setMessage("");
                            }}
                            className={`w-full px-4 py-3 border-2 rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-emerald-600 text-white disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi Hướng Dẫn"}
                    </button>
                </form>
                <p className="mt-8 text-center text-base text-gray-600">
                    Nhớ lại mật khẩu?{" "}
                    <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-800">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;