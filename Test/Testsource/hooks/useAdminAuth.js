import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook tùy chỉnh để kiểm tra quyền admin
 * @returns {Object} - { isAdmin, loading, user }
 */
export const useAdminAuth = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      alert("Bạn không có quyền truy cập trang quản trị!");
      navigate("/");
      return;
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  return {
    isAdmin,
    loading: authLoading,
    user,
    isAuthenticated
  };
}; 