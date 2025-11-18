const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  endpoints: {
    // Authentication
    register: "/api/auth/register",
    login: "/api/auth/login",
    googleLogin: "/api/auth/google-login",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",

    // User Management
    userProfile: "/api/user/profile",
    updateProfile: "/api/user/profile",

    // Smoking Status
    smokingStatus: "/api/smoking-status",

    // Quit Plans
    quitPlans: "/api/quit-plans",

    // Daily Progress
    dailyProgress: "/api/daily-progress",

    // Achievements
    achievements: "/api/achievements",
    userAchievements: "/api/achievements/my",
    shareAchievement: "/api/achievements/share",
    sharedAchievements: "/api/achievements/shared",
    checkAchievements: "/api/achievements/check",
    achievementStats: "/api/achievements/stats",

    // Community
    communityPosts: "/api/community/posts",
    communityComments: "/api/community/comments",

    // Coach Consultation
    consultations: "/api/coach-consultations",
    chatMessages: "/api/chat/messages",

    // Membership
    membershipPlans: "/api/membership/plans",
    membership: "/api/membership",
    freeMembership: "/api/membership/free-trial",
    upgradeMembership: "/api/membership/upgrade",

    // Notifications
    notifications: "/api/notifications",

    // Settings
    userSettings: "/api/user-settings",

    // Admin
    admin: "/api/admin",
  },

  // Default pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // File upload limits
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  },
};

export default config;
