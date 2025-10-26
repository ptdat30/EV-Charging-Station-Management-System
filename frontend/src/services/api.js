import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Mock data for development
const mockData = {
    dashboard: {
        stats: {
            totalStations: 156,
            activeSessions: 89,
            monthlyRevenue: 2400000000,
            totalUsers: 12500
        },
        revenueChart: [
            { name: 'T1', revenue: 40 },
            { name: 'T2', revenue: 45 },
            { name: 'T3', revenue: 52 },
            { name: 'T4', revenue: 48 },
            { name: 'T5', revenue: 60 },
            { name: 'T6', revenue: 65 },
            { name: 'T7', revenue: 70 },
            { name: 'T8', revenue: 68 },
            { name: 'T9', revenue: 75 },
            { name: 'T10', revenue: 80 },
            { name: 'T11', revenue: 78 },
            { name: 'T12', revenue: 85 }
        ]
    }
}

// Mock API functions for development
const createMockResponse = (data, delay = 500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data })
        }, delay)
    })
}

export const authAPI = {
    login: (credentials) => {
        // Mock login - in real app, this would be actual API call
        if (credentials.email === 'admin@ev.com' && credentials.password === 'admin') {
            return createMockResponse({
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@ev.com',
                    role: 'ADMIN'
                }
            })
        }
        return Promise.reject({ response: { data: { message: 'Invalid credentials' } } })
    },

    register: (userData) => createMockResponse({ message: 'User registered successfully' }),
    verifyToken: () => createMockResponse({
        id: 1,
        name: 'Admin User',
        email: 'admin@ev.com',
        role: 'ADMIN'
    })
}

export const stationAPI = {
    getStations: (filters = {}) => createMockResponse([
        {
            id: 1,
            name: 'Trạm Landmark 81',
            address: '720A Điện Biên Phủ, Bình Thạnh, TP.HCM',
            latitude: 10.7966,
            longitude: 106.7216,
            status: 'AVAILABLE',
            chargerType: 'CCS2',
            pricePerKwh: 4500,
            availableChargers: 4,
            totalChargers: 6
        },
        {
            id: 2,
            name: 'Trạm AEON Mall Tân Phú',
            address: '30.86 Bão Tân Thắng, Tân Phú, TP.HCM',
            latitude: 10.7902,
            longitude: 106.6281,
            status: 'MAINTENANCE',
            chargerType: 'TYPE2',
            pricePerKwh: 3800,
            availableChargers: 0,
            totalChargers: 8
        }
    ]),

    getStationDetail: (id) => createMockResponse({
        id: 1,
        name: 'Trạm Landmark 81',
        address: '720A Điện Biên Phủ, VinHomes Tân Cảng, Bình Thạnh, TP.HCM',
        bannerImage: 'https://i.imgur.com/gA2OlYc.png',
        status: 'AVAILABLE',
        rating: 4.8,
        reviewCount: 127,
        pricePerKwh: 4500,
        chargers: [
            { id: 1, type: 'CCS2', power: 150, price: 4500, status: 'available' },
            { id: 2, type: 'CCS2', power: 150, price: 4500, status: 'charging' },
            { id: 3, type: 'TYPE2', power: 22, price: 3800, status: 'available' }
        ],
        amenities: [
            { id: 1, name: 'WiFi', icon: '📶' },
            { id: 2, name: 'Nhà vệ sinh', icon: '🚻' },
            { id: 3, name: 'Quán cà phê', icon: '☕' }
        ],
        reviews: [
            {
                id: 1,
                author: 'Nguyễn Minh Tuấn',
                avatar: 'N',
                rating: 5,
                date: '2024-01-15',
                text: 'Trạm sạc rất tốt, tốc độ sạc nhanh và có nhiều tiện ích xung quanh.'
            }
        ]
    })
}

export const adminAPI = {
    getDashboardStats: () => createMockResponse(mockData.dashboard),
    getStations: () => stationAPI.getStations(),
    getUsers: () => createMockResponse([]),
    getReports: () => createMockResponse([])
}

export const sessionAPI = {
    startSession: (data) => createMockResponse({
        sessionId: 'session-' + Date.now(),
        ...data
    }),
    stopSession: (id) => createMockResponse({
        sessionId: id,
        energyConsumed: 35.2,
        totalCost: 158400,
        duration: '45 phút'
    }),
    getSession: (id) => createMockResponse({
        id: id,
        stationName: 'Trạm Landmark 81',
        chargerType: 'CCS2',
        chargerPower: 150,
        pricePerKwh: 4500,
        startTime: new Date().toISOString()
    }),
    getRealTimeData: (id) => createMockResponse({
        soc: 85,
        energyConsumed: 28.7,
        currentPower: 120
    })
}

export const paymentAPI = {
    processPayment: (data) => createMockResponse({
        success: true,
        transactionId: 'txn-' + Date.now(),
        ...data
    })
}

export default api