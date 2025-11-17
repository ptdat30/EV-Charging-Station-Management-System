// src/components/admin/RevenueReport.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getAllTransactions } from '../../services/adminService';
import { getAllStations } from '../../services/stationService';
import { getRevenue, getUsage, getPeakHours, getForecast, triggerDataSync, chatWithAI } from '../../services/analyticsService';
import apiClient from '../../config/api';
import '../../styles/AdminRevenueReport.css';

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  // Bộ lọc
  const [dateRange, setDateRange] = useState('month'); // day, week, month, quarter, year, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Dữ liệu thô & mapping
  const [stations, setStations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stationRegionMap, setStationRegionMap] = useState({});

  // Dữ liệu hiển thị
  const [revenueData, setRevenueData] = useState([]);
  const [stationRevenue, setStationRevenue] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });
  const [topStations, setTopStations] = useState([]);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage or default to false
    const saved = localStorage.getItem('revenueReportDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    fetchReportData();

    // Tự động refresh để gần real-time hơn
    const interval = setInterval(() => {
      fetchReportData();
    }, 60000); // 60s

    return () => clearInterval(interval);
  }, [dateRange, selectedStation, selectedRegion, customStart, customEnd]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('revenueReportDarkMode', JSON.stringify(darkMode));
    // Apply dark mode class to body for global styles
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Helper: Calculate date range based on dateRange filter
  const getDateRange = () => {
    const now = new Date();
    let from, to;

    if (dateRange === 'custom' && customStart && customEnd) {
      from = new Date(customStart);
      to = new Date(customEnd);
      to.setHours(23, 59, 59, 999);
    } else if (dateRange === 'day') {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
    } else if (dateRange === 'week') {
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
      from = new Date(to);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
    } else if (dateRange === 'month') {
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
      from = new Date(to);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
    } else if (dateRange === 'quarter') {
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
      from = new Date(to);
      from.setDate(from.getDate() - 89);
      from.setHours(0, 0, 0, 0);
    } else if (dateRange === 'year') {
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
      from = new Date(to);
      from.setMonth(from.getMonth() - 11, 1);
      from.setHours(0, 0, 0, 0);
    } else {
      // Default: month
      to = new Date(now);
      to.setHours(23, 59, 59, 999);
      from = new Date(to);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
    }

    return { from, to };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get date range
      const { from, to } = getDateRange();
      const fromISO = from.toISOString();
      const toISO = to.toISOString();

      // Get stations list for filters
      const stationsResponse = await getAllStations().catch(() => ({ data: [] }));
      const stationsList = Array.isArray(stationsResponse.data) ? stationsResponse.data : [];
      setStations(stationsList);

      // Build region map
      const regionMap = {};
      const regionSet = new Set();
      stationsList.forEach(station => {
        const id = station.stationId || station.id;
        if (!id) return;

        let region = station.region || station.area || station.city || null;
        if (!region && station.location) {
          try {
            const loc = typeof station.location === 'string'
              ? JSON.parse(station.location)
              : station.location;
            region = loc?.region || loc?.city || loc?.province || loc?.area || null;
          } catch {
            // ignore parse errors
          }
        }
        region = region || 'Khác';
        regionMap[id] = region;
        regionSet.add(region);
      });
      setStationRegionMap(regionMap);
      setRegions(Array.from(regionSet));

      // Prepare filter params
      const stationId = selectedStation && selectedStation !== 'all' 
        ? parseInt(selectedStation, 10) 
        : null;
      const region = selectedRegion && selectedRegion !== 'all' ? selectedRegion : null;

      // Determine granularity based on dateRange
      let granularity = 'day';
      if (dateRange === 'day') granularity = 'hour';
      else if (dateRange === 'year') granularity = 'month';
      else if (dateRange === 'quarter') granularity = 'week';

      // Fetch analytics data from analytics-service
      try {
        const [revenueResponse, usageResponse, peakHoursResponse, forecastResponse] = await Promise.all([
          getRevenue({
            stationId,
            region,
            from: fromISO,
            to: toISO,
            granularity
          }).catch(err => {
            console.warn('Revenue API failed, using fallback:', err);
            return null;
          }),
          getUsage({
            stationId,
            region,
            from: fromISO,
            to: toISO
          }).catch(err => {
            console.warn('Usage API failed, using fallback:', err);
            return null;
          }),
          getPeakHours({
            stationId,
            region,
            from: fromISO,
            to: toISO
          }).catch(err => {
            console.warn('Peak hours API failed, using fallback:', err);
            return null;
          }),
          getForecast({
            stationId,
            region,
            horizonMonths: 3
          }).catch(err => {
            console.warn('Forecast API failed, using fallback:', err);
            return null;
          })
        ]);

        // Process revenue data
        if (revenueResponse) {
          // Map API response to chart data format
          const revenueDataPoints = revenueResponse.dataPoints?.map(dp => ({
            time: dp.timeLabel,
            revenue: parseFloat(dp.revenue) || 0,
            sessions: dp.sessions || 0,
            energy: parseFloat(dp.energyKwh) || 0
          })) || [];
          setRevenueData(revenueDataPoints);

          // Fetch transactions to get accurate status counts
          try {
            const transactionsResponse = await getAllTransactions();
            
            // getAllTransactions returns axios response object, extract data
            const responseData = transactionsResponse?.data || transactionsResponse;
            
            // Handle paginated response: {content: [...], totalElements: ...}
            // Or direct array response
            let transactions = [];
            if (Array.isArray(responseData)) {
              transactions = responseData;
            } else if (responseData?.content && Array.isArray(responseData.content)) {
              transactions = responseData.content;
            } else if (responseData?.data && Array.isArray(responseData.data)) {
              transactions = responseData.data;
            } else if (responseData && typeof responseData === 'object') {
              // Try to find any array property (for paginated responses)
              const arrayKeys = Object.keys(responseData).find(key => Array.isArray(responseData[key]));
              if (arrayKeys) {
                transactions = responseData[arrayKeys];
              }
            }
            
            // If still no transactions, use fallback but don't throw error
            if (!Array.isArray(transactions) || transactions.length === 0) {
              console.warn('No transactions found in response, using revenue summary. Response structure:', responseData);
              throw new Error('No transactions found');
            }

            // Debug: Log first transaction to check structure
            if (transactions.length > 0) {
              console.log('🔍 Sample transaction data:', {
                paymentId: transactions[0].paymentId || transactions[0].id,
                status: transactions[0].status,
                paymentStatus: transactions[0].paymentStatus,
                statusType: typeof transactions[0].status,
                paymentStatusType: typeof transactions[0].paymentStatus,
                fullTransaction: transactions[0]
              });
            }

            // Normalize status - handle both 'status' and 'paymentStatus' fields
            // Backend returns paymentStatus as enum (lowercase: completed, pending, failed, etc.)
            const normalizeStatus = (transaction) => {
              const status = transaction.status || transaction.paymentStatus;
              if (!status) return 'pending';
              // Handle string (already normalized or enum name)
              if (typeof status === 'string') {
                return status.toLowerCase();
              }
              // Handle enum object
              if (status.name) {
                return status.name.toLowerCase();
              }
              return String(status).toLowerCase();
            };

            const completed = transactions.filter(t => {
              const status = normalizeStatus(t);
              return status === 'completed' || status === 'success';
            }).length;
            
            const pending = transactions.filter(t => {
              const status = normalizeStatus(t);
              return status === 'pending' || status === 'processing';
            }).length;
            
            const failed = transactions.filter(t => {
              const status = normalizeStatus(t);
              return status === 'failed' || status === 'cancelled' || status === 'error';
            }).length;
            
            const totalAmount = transactions
              .filter(t => {
                const status = normalizeStatus(t);
                return status === 'completed' || status === 'success';
              })
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

            setTransactionStats({
              total: transactions.length,
              completed: completed,
              pending: pending,
              failed: failed,
              totalAmount: totalAmount || parseFloat(revenueResponse.totalRevenue) || 0
            });
          } catch (txError) {
            console.warn('Could not fetch transactions, using revenue summary:', txError);
            // Fallback: Use revenue summary
            setTransactionStats({
              total: revenueResponse.totalSessions || 0,
              completed: revenueResponse.totalSessions || 0,
              pending: 0,
              failed: 0,
              totalAmount: parseFloat(revenueResponse.totalRevenue) || 0
            });
          }
        } else {
          // Fallback to old logic
          await fetchReportDataFallback();
          return;
        }

        // Process usage data for top stations
        if (usageResponse && usageResponse.topStations) {
          // Create a map of stationId -> station info for quick lookup
          const stationMap = new Map();
          stationsList.forEach(station => {
            const id = station.stationId || station.id;
            if (id) {
              const name = station.stationName || station.stationCode || station.name || `Trạm ${id}`;
              stationMap.set(id, name);
            }
          });

          const totalRevenue = parseFloat(revenueResponse?.totalRevenue) || transactionStats.totalAmount || 1;
          
          const stationRevenueData = usageResponse.topStations.map(station => {
            const stationId = station.stationId;
            const stationName = stationMap.get(stationId) || station.stationName || `Trạm ${stationId}`;
            const revenue = parseFloat(station.revenue) || 0;
            const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
            
            return {
              id: stationId,
              name: stationName,
              revenue: revenue,
              sessions: station.sessions || 0,
              energy: parseFloat(station.energyKwh) || 0,
              percentage: percentage
            };
          });
          
          setStationRevenue(stationRevenueData);
          setTopStations(stationRevenueData.slice(0, 5));
        }

        // Process peak hours data
        if (peakHoursResponse && peakHoursResponse.hourlyData) {
          const peakData = peakHoursResponse.hourlyData.map(h => ({
            hour: h.hourLabel,
            sessions: h.sessions || 0
          }));
          setPeakHoursData(peakData);
        }

        // Process AI suggestions from forecast
        if (forecastResponse && forecastResponse.suggestions && forecastResponse.suggestions.length > 0) {
          const suggestions = forecastResponse.suggestions.map(s => 
            s.message || s.description || JSON.stringify(s)
          );
          setAiSuggestions(suggestions);
        } else {
          // Fallback: Generate suggestions from current data
          // Wait for data to be set before generating suggestions
          setTimeout(() => {
            const suggestions = generateAISuggestions({
              revenueData: revenueResponse?.dataPoints || revenueData || [],
              stationRevenue: usageResponse?.topStations || stationRevenue || [],
              peakHoursData: peakHoursResponse?.hourlyData || peakHoursData || [],
              stationRegionMap: stationRegionMap
            });
            setAiSuggestions(suggestions);
          }, 100);
        }

      } catch (apiError) {
        console.error('Analytics API error, falling back to local calculation:', apiError);
        // Fallback to old calculation method
        await fetchReportDataFallback();
      }

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Không thể tải dữ liệu báo cáo. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggestionClick = async (suggestion) => {
    setAiChatInput(suggestion);
    await handleAIChatSend(suggestion);
  };

  const handleAIChatSend = async (messageOverride = null) => {
    const message = messageOverride || aiChatInput.trim();
    if (!message || aiChatLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: message };
    setAiChatMessages(prev => [...prev, userMessage]);
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      // Prepare analytics data for context
      const analyticsData = {
        totalRevenue: transactionStats.totalAmount,
        totalSessions: transactionStats.total,
        topStations: topStations.slice(0, 5).map(s => ({
          id: s.id,
          name: s.name,
          revenue: s.revenue,
          sessions: s.sessions
        })),
        peakHours: peakHoursData.slice(0, 5).map(h => ({
          hour: h.hour,
          hourLabel: h.hour,
          sessions: h.sessions
        }))
      };

      // Prepare conversation history
      const conversationHistory = aiChatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call AI chat API
      const response = await chatWithAI({
        message: message,
        context: 'general',
        analyticsData: analyticsData,
        conversationHistory: conversationHistory
      });

      // Add AI response
      const aiMessage = { role: 'assistant', content: response.response };
      setAiChatMessages(prev => [...prev, aiMessage]);

      // Update suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        setAiSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error chatting with AI:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.' 
      };
      setAiChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await triggerDataSync();
      if (result.success) {
        alert(`Đồng bộ thành công! Đã sync ${result.syncedCount || 0} sessions.`);
        // Refresh data after sync
        await fetchReportData();
      } else {
        setError(result.message || 'Đồng bộ thất bại');
      }
    } catch (err) {
      console.error('Error syncing data:', err);
      setError('Không thể đồng bộ dữ liệu. Vui lòng kiểm tra charging-service có đang chạy không.');
    } finally {
      setSyncing(false);
    }
  };

  // Fallback method: Use old calculation logic if API fails
  const fetchReportDataFallback = async () => {
    try {
      const [paymentsResponse, sessionsResponse] = await Promise.all([
        getAllTransactions({ page: 0, size: 1000 }).catch(() => ({ data: { content: [] } })),
        apiClient.get('/sessions').catch(() => ({ data: [] }))
      ]);

      const payments = paymentsResponse.data?.content || 
                      (Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];

      const transactionStats = {
        total: payments.length,
        completed: payments.filter(p => p.paymentStatus?.toLowerCase() === 'completed').length,
        pending: payments.filter(p => p.paymentStatus?.toLowerCase() === 'pending').length,
        failed: payments.filter(p => p.paymentStatus?.toLowerCase() === 'failed').length,
        totalAmount: payments
          .filter(p => p.paymentStatus?.toLowerCase() === 'completed')
          .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      };
      setTransactionStats(transactionStats);

      const { from, to } = getDateRange();
      const revenueData = generateRevenueData(dateRange, payments, sessions, {
        stationRegionMap: {},
        selectedStation,
        selectedRegion,
        customStart,
        customEnd,
      });
      setRevenueData(revenueData);
    } catch (err) {
      console.error('Fallback calculation failed:', err);
    }
  };

  const generateRevenueData = (range, payments, sessions, {
    stationRegionMap,
    selectedStation,
    selectedRegion,
    customStart,
    customEnd,
  }) => {
    const data = [];
    const now = new Date();

    // Filter completed payments only
    const completedPayments = payments.filter(p => 
      p.paymentStatus?.toLowerCase() === 'completed'
    );

    const parseSelectedStationId = () => {
      if (!selectedStation || selectedStation === 'all') return null;
      const id = parseInt(selectedStation, 10);
      return Number.isNaN(id) ? null : id;
    };

    const stationFilterId = parseSelectedStationId();

    const withinFilters = (session) => {
      const stationId = session.stationId;
      if (stationFilterId && stationId !== stationFilterId) return false;
      if (selectedRegion !== 'all') {
        const region = stationRegionMap[stationId];
        if (region !== selectedRegion) return false;
      }
      return true;
    };

    const withinCustomRange = (date) => {
      if (range !== 'custom' || !customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
      const d = new Date(date);
      return d >= start && d <= new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
    };

    if (range === 'day') {
      // Hourly data for today
      for (let i = 0; i < 24; i++) {
        const hour = new Date(now);
        hour.setHours(i, 0, 0, 0);
        const nextHour = new Date(hour);
        nextHour.setHours(i + 1, 0, 0, 0);

        const hourPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          if (!(paymentTime >= hour && paymentTime < nextHour)) return false;
          const session = sessions.find(s => s.sessionId === p.sessionId);
          if (!session) return false;
          if (!withinFilters(session)) return false;
          if (!withinCustomRange(paymentTime)) return false;
          return true;
        });

        const hourSessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          if (!(startTime >= hour && startTime < nextHour)) return false;
          if (!withinFilters(s)) return false;
          if (!withinCustomRange(startTime)) return false;
          return true;
        });

        const revenue = hourPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = hourSessions.length;
        const energy = hourSessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: `${String(i).padStart(2, '0')}:00`,
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'week') {
      // Daily data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          if (!(paymentTime >= date && paymentTime < nextDate)) return false;
          const session = sessions.find(s => s.sessionId === p.sessionId);
          if (!session) return false;
          if (!withinFilters(session)) return false;
          if (!withinCustomRange(paymentTime)) return false;
          return true;
        });

        const daySessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          if (!(startTime >= date && startTime < nextDate)) return false;
          if (!withinFilters(s)) return false;
          if (!withinCustomRange(startTime)) return false;
          return true;
        });

        const revenue = dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = daySessions.length;
        const energy = daySessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'month' || range === 'quarter') {
      // Daily data for last 30 (month) hoặc 90 ngày (quarter)
      const days = range === 'quarter' ? 89 : 29;
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          if (!(paymentTime >= date && paymentTime < nextDate)) return false;
          const session = sessions.find(s => s.sessionId === p.sessionId);
          if (!session) return false;
          if (!withinFilters(session)) return false;
          if (!withinCustomRange(paymentTime)) return false;
          return true;
        });

        const daySessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          if (!(startTime >= date && startTime < nextDate)) return false;
          if (!withinFilters(s)) return false;
          if (!withinCustomRange(startTime)) return false;
          return true;
        });

        const revenue = dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = daySessions.length;
        const energy = daySessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'year') {
      // Monthly data for last 12 months
      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i, 1);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setMonth(nextDate.getMonth() + 1);

        const monthPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          if (!(paymentTime >= date && paymentTime < nextDate)) return false;
          const session = sessions.find(s => s.sessionId === p.sessionId);
          if (!session) return false;
          if (!withinFilters(session)) return false;
          if (!withinCustomRange(paymentTime)) return false;
          return true;
        });

        const monthSessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          if (!(startTime >= date && startTime < nextDate)) return false;
          if (!withinFilters(s)) return false;
          if (!withinCustomRange(startTime)) return false;
          return true;
        });

        const revenue = monthPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = monthSessions.length;
        const energy = monthSessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: monthNames[date.getMonth()],
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    } else if (range === 'custom' && customStart && customEnd) {
      // Daily data cho khoảng thời gian tùy chỉnh
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return data;
      }

      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const current = new Date(date);
        const nextDate = new Date(current);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayPayments = completedPayments.filter(p => {
          const paymentTime = new Date(p.paymentTime || p.createdAt);
          if (!(paymentTime >= current && paymentTime < nextDate)) return false;
          const session = sessions.find(s => s.sessionId === p.sessionId);
          if (!session) return false;
          if (!withinFilters(session)) return false;
          return true;
        });

        const daySessions = sessions.filter(s => {
          const startTime = new Date(s.startTime || s.createdAt);
          if (!(startTime >= current && startTime < nextDate)) return false;
          if (!withinFilters(s)) return false;
          return true;
        });

        const revenue = dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const sessionCount = daySessions.length;
        const energy = daySessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumed) || 0), 0);

        data.push({
          time: current.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue,
          sessions: sessionCount,
          energy,
        });
      }
    }

    return data;
  };

  const calculateStationRevenue = (stationsList, payments, sessions, {
    stationRegionMap,
    selectedStation,
    selectedRegion,
  }) => {
    // Filter completed payments with sessionId
    const completedPayments = payments.filter(p => 
      p.paymentStatus?.toLowerCase() === 'completed' && p.sessionId
    );

    // Create map: stationId -> { revenue, sessions, energy }
    const stationMap = {};

    // Initialize all stations
    const parseSelectedStationId = () => {
      if (!selectedStation || selectedStation === 'all') return null;
      const id = parseInt(selectedStation, 10);
      return Number.isNaN(id) ? null : id;
    };
    const stationFilterId = parseSelectedStationId();

    stationsList.forEach(station => {
      const id = station.stationId || station.id;
      if (!id) return;

      if (stationFilterId && id !== stationFilterId) return;
      if (selectedRegion !== 'all') {
        const region = stationRegionMap[id];
        if (region !== selectedRegion) return;
      }

      stationMap[id] = {
        id,
        name: station.stationName || station.stationCode || `Trạm ${id}`,
        revenue: 0,
        sessions: 0,
        energy: 0,
      };
    });

    // Aggregate revenue and sessions by station
    sessions.forEach(session => {
      const stationId = session.stationId;
      if (!stationMap[stationId]) return;
        stationMap[stationId].sessions += 1;
        stationMap[stationId].energy += parseFloat(session.energyConsumed) || 0;
    });

    completedPayments.forEach(payment => {
      const session = sessions.find(s => s.sessionId === payment.sessionId);
      if (!session || !stationMap[session.stationId]) return;
        stationMap[session.stationId].revenue += parseFloat(payment.amount) || 0;
    });

    // Convert to array and sort by revenue
    return Object.values(stationMap)
      .filter(s => s.sessions > 0 || s.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  };

  const calculatePeakHours = (range, sessions, {
    stationRegionMap,
    selectedStation,
    selectedRegion,
    customStart,
    customEnd,
  }) => {
    const now = new Date();

    const parseSelectedStationId = () => {
      if (!selectedStation || selectedStation === 'all') return null;
      const id = parseInt(selectedStation, 10);
      return Number.isNaN(id) ? null : id;
    };
    const stationFilterId = parseSelectedStationId();

    let start = null;
    let end = null;

    if (range === 'day') {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 1);
    } else if (range === 'week') {
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'quarter') {
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setDate(end.getDate() - 89);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'year') {
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setMonth(end.getMonth() - 11, 1);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      sessions: 0,
    }));

    const filteredSessions = sessions.filter(s => {
      const startTime = new Date(s.startTime || s.createdAt);
      if (start && end && !(startTime >= start && startTime <= end)) return false;

      const stationId = s.stationId;
      if (stationFilterId && stationId !== stationFilterId) return false;
      if (selectedRegion !== 'all') {
        const region = stationRegionMap[stationId];
        if (region !== selectedRegion) return false;
      }
      return true;
    });

    filteredSessions.forEach(s => {
      const time = new Date(s.startTime || s.createdAt);
      const h = time.getHours();
      if (h >= 0 && h < 24) {
        hourly[h].sessions += 1;
      }
    });

    return hourly;
  };

  const generateAISuggestions = ({ revenueData, stationRevenue, peakHoursData, stationRegionMap = {} }) => {
    const suggestions = [];

    // Handle empty or invalid data
    if (!revenueData || revenueData.length === 0) {
      suggestions.push('Chưa có đủ dữ liệu để đưa ra gợi ý. Vui lòng đồng bộ dữ liệu hoặc chờ thêm thời gian.');
      return suggestions;
    }

    const totalRevenue = revenueData.reduce((sum, d) => sum + (parseFloat(d.revenue) || 0), 0);
    const totalSessions = revenueData.reduce((sum, d) => sum + (parseInt(d.sessions) || 0), 0);

    // Gợi ý nâng cấp trạm nếu 1 trạm chiếm > 30% doanh thu
    if (stationRevenue && stationRevenue.length > 0 && totalRevenue > 0) {
      const topStation = stationRevenue[0];
      const stationRevenueValue = parseFloat(topStation.revenue) || 0;
      if (stationRevenueValue > 0) {
        const share = stationRevenueValue / totalRevenue;
        if (share > 0.3) {
          suggestions.push(
            `Trạm "${topStation.name || `Trạm ${topStation.id}`}" đang chiếm ${(share * 100).toFixed(1)}% doanh thu hiện tại, ` +
            `đề xuất xem xét nâng cấp công suất hoặc bổ sung thêm điểm sạc.`
          );
        }
      }
    }

    // Xác định peak hours dựa trên top 3 giờ có nhiều phiên nhất
    if (peakHoursData && peakHoursData.length > 0) {
      const sortedHours = [...peakHoursData].sort((a, b) => {
        const aSessions = parseInt(a.sessions) || parseInt(a.value) || 0;
        const bSessions = parseInt(b.sessions) || parseInt(b.value) || 0;
        return bSessions - aSessions;
      });
      const topHours = sortedHours.slice(0, 3).filter(h => {
        const sessions = parseInt(h.sessions) || parseInt(h.value) || 0;
        return sessions > 0;
      });
      const totalPeakSessions = topHours.reduce((sum, h) => {
        return sum + (parseInt(h.sessions) || parseInt(h.value) || 0);
      }, 0);

      if (topHours.length > 0 && totalSessions > 0) {
        const percent = (totalPeakSessions / totalSessions) * 100;
        const hourLabels = topHours.map(h => h.hour || h.hourLabel || h.name || 'N/A').join(', ');
        suggestions.push(
          `Khung giờ cao điểm hiện tại: ${hourLabels} (chiếm khoảng ${percent.toFixed(1)}% tổng số phiên), ` +
          `có thể áp dụng giá cao điểm hoặc điều phối tải tốt hơn.`
        );
      }
    }

    // Gợi ý mở rộng khu vực nếu nhiều trạm trong một region có doanh thu cao
    if (stationRevenue && stationRevenue.length > 0) {
      const regionRevenueMap = {};
      stationRevenue.forEach(s => {
        const region = stationRegionMap[s.id] || 'Khác';
        const revenue = parseFloat(s.revenue) || 0;
        regionRevenueMap[region] = (regionRevenueMap[region] || 0) + revenue;
      });
      const regionsArray = Object.entries(regionRevenueMap)
        .map(([region, revenue]) => ({ region, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      if (regionsArray.length > 0 && totalRevenue > 0) {
        const topRegion = regionsArray[0];
        const share = topRegion.revenue / totalRevenue;
        if (share > 0.4) {
          suggestions.push(
            `Khu vực "${topRegion.region}" đang tạo ra ${(share * 100).toFixed(1)}% doanh thu, ` +
            `cân nhắc bổ sung thêm trạm sạc mới trong 3–6 tháng tới.`
          );
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Hệ thống hoạt động ổn định, chưa phát hiện rủi ro quá tải rõ rệt trong giai đoạn hiện tại.');
    }

    return suggestions;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const formatShortCurrency = (amount) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M ₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K ₫';
    }
    return amount + ' ₫';
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const transactionTypeData = [
    { name: 'Thành công', value: transactionStats.completed, color: '#10b981' },
    { name: 'Chờ xử lý', value: transactionStats.pending, color: '#f59e0b' },
    { name: 'Thất bại', value: transactionStats.failed, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="revenue-report">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`revenue-report ${darkMode ? 'dark-mode' : ''}`}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Báo cáo Doanh thu & Sử dụng</h2>
          <p>Phân tích doanh thu, tần suất sử dụng và khung giờ cao điểm theo trạm/khu vực</p>
        </div>
        <div className="header-actions">
          {/* Dark Mode Toggle */}
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            style={{
              padding: '10px 16px',
              border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: darkMode ? '#1e293b' : '#fff',
              color: darkMode ? '#f1f5f9' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            <span>{darkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
          </button>
          <select
            className="date-range-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">12 tháng qua</option>
            <option value="custom">Tùy chỉnh</option>
          </select>

          {dateRange === 'custom' && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span>-</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          <select
            className="date-range-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="all">Tất cả khu vực</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <select
            className="date-range-select"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="all">Tất cả trạm</option>
            {stations.map(station => {
              const id = station.stationId || station.id;
              const name = station.stationName || station.stationCode || `Trạm ${id}`;
              return (
                <option key={id} value={id}>{name}</option>
              );
            })}
          </select>

          <button className="btn-secondary" onClick={fetchReportData}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleSyncData}
            disabled={syncing}
            title="Đồng bộ dữ liệu từ charging-service"
          >
            <i className={`fas fa-sync ${syncing ? 'fa-spin' : ''}`}></i>
            {syncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
          </button>
          <button className="btn-secondary" onClick={() => alert('Tính năng export đang phát triển')}>
            <i className="fas fa-download"></i>
            Xuất PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchReportData}>
            Thử lại
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue">
          <div className="card-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Tổng doanh thu</div>
            <div className="card-value">{formatCurrency(transactionStats.totalAmount)}</div>
            <div className="card-trend">
              <i className="fas fa-arrow-up"></i>
              <span>+12.5% so với kỳ trước</span>
            </div>
          </div>
        </div>

        <div className="summary-card transactions">
          <div className="card-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Tổng giao dịch</div>
            <div className="card-value">{transactionStats.total.toLocaleString('vi-VN')}</div>
            <div className="card-trend">
              <i className="fas fa-check-circle"></i>
              <span>{transactionStats.completed} thành công</span>
            </div>
          </div>
        </div>

        <div className="summary-card sessions">
          <div className="card-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Phiên sạc</div>
            <div className="card-value">
              {revenueData.reduce((sum, d) => sum + d.sessions, 0).toLocaleString('vi-VN')}
            </div>
            <div className="card-trend">
              <i className="fas fa-arrow-up"></i>
              <span>Tăng 8.2%</span>
            </div>
          </div>
        </div>

        <div className="summary-card energy">
          <div className="card-icon">
            <i className="fas fa-battery-three-quarters"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Năng lượng (kWh)</div>
            <div className="card-value">
              {revenueData.reduce((sum, d) => sum + d.energy, 0).toLocaleString('vi-VN')}
            </div>
            <div className="card-trend">
              <i className="fas fa-arrow-up"></i>
              <span>Tăng 15.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh thu theo thời gian</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ background: '#10b981' }}></span>
                Doanh thu
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickFormatter={formatShortCurrency} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff', 
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Số phiên sạc</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff', 
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
              />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Status Bar Chart with Stats */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Trạng thái giao dịch</h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Tổng: {transactionStats.total.toLocaleString('vi-VN')} giao dịch
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
                data={transactionTypeData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis type="number" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke={darkMode ? '#94a3b8' : '#64748b'} 
                fontSize={12}
                width={100}
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${value.toLocaleString('vi-VN')} (${((value / transactionStats.total) * 100).toFixed(1)}%)`,
                  'Số lượng'
                ]}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff', 
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  padding: '12px',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
              />
              <Bar 
                dataKey="value"
                radius={[0, 8, 8, 0]}
                label={{ 
                  position: 'right', 
                  formatter: (value) => `${value.toLocaleString('vi-VN')}`,
                  fill: '#475569',
                  fontSize: 12
                }}
              >
                {transactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Detailed Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px', 
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            {transactionTypeData.map((entry, index) => {
              const percentage = transactionStats.total > 0 
                ? ((entry.value / transactionStats.total) * 100).toFixed(1) 
                : 0;
              return (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    backgroundColor: darkMode ? '#334155' : '#f8fafc',
                    borderRadius: '8px',
                    border: darkMode 
                      ? `2px solid ${entry.color}40` 
                      : `2px solid ${entry.color}20`,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: entry.color,
                    marginBottom: '4px'
                  }}>
                    {entry.value.toLocaleString('vi-VN')}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: darkMode ? '#94a3b8' : '#64748b',
                    marginBottom: '4px'
                  }}>
                    {entry.name}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: darkMode ? '#f1f5f9' : '#475569'
                  }}>
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Energy Consumption Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Tiêu thụ năng lượng</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <Tooltip 
                formatter={(value) => `${value} kWh`}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff', 
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
              />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Khung giờ cao điểm (Peak Hours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="hour" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <Tooltip
                formatter={(value) => `${value} phiên`}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff', 
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
              />
              <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </div>

        {/* AI Chat Assistant */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>
              <i className="fas fa-robot" style={{ color: '#8b5cf6', marginRight: '8px' }}></i>
              AI Assistant - Gợi ý Nâng Cấp Hạ Tầng
            </h3>
            <button 
              className="btn-secondary" 
              onClick={() => setShowAIChat(!showAIChat)}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              <i className={`fas ${showAIChat ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              {showAIChat ? 'Thu gọn' : 'Mở Chat'}
            </button>
          </div>
          
          {!showAIChat ? (
            <div className="ai-suggestions-list">
              {aiSuggestions.map((s, idx) => (
                <div key={idx} className="ai-suggestion-item">
                  <i className="fas fa-lightbulb" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ai-chat-container" style={{ 
              height: '500px', 
              display: 'flex', 
              flexDirection: 'column',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {/* Chat Messages */}
              <div className="ai-chat-messages" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc'
              }}>
                {aiChatMessages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: darkMode ? '#94a3b8' : '#64748b', 
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <i className="fas fa-robot" style={{ fontSize: '48px', color: '#8b5cf6', marginBottom: '8px' }}></i>
                    <p>Xin chào! Tôi là AI Assistant. Bạn có thể hỏi tôi về:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                      {['Doanh thu', 'Khung giờ cao điểm', 'Trạm sạc', 'Nâng cấp hạ tầng'].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAISuggestionClick(suggestion)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: darkMode ? '#334155' : '#fff',
                            border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: darkMode ? '#f1f5f9' : '#475569'
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  aiChatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        gap: '8px'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: msg.role === 'user' ? '#8b5cf6' : (darkMode ? '#334155' : '#fff'),
                        color: msg.role === 'user' ? '#fff' : (darkMode ? '#f1f5f9' : '#1e293b'),
                        border: msg.role === 'user' ? 'none' : (darkMode ? '1px solid #475569' : '1px solid #e2e8f0'),
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {aiChatLoading && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: darkMode ? '#334155' : '#fff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                      color: darkMode ? '#f1f5f9' : '#1e293b'
                    }}>
                      <i className="fas fa-spinner fa-spin"></i> Đang suy nghĩ...
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="ai-chat-input" style={{
                padding: '16px',
                borderTop: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                backgroundColor: darkMode ? '#1e293b' : '#fff',
                display: 'flex',
                gap: '8px'
              }}>
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !aiChatLoading) {
                      e.preventDefault();
                      handleAIChatSend();
                    }
                  }}
                  placeholder="Nhập câu hỏi của bạn... (Enter để gửi)"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: darkMode ? '#334155' : '#fff',
                    color: darkMode ? '#f1f5f9' : '#1e293b'
                  }}
                  disabled={aiChatLoading}
                />
                <button
                  onClick={handleAIChatSend}
                  disabled={aiChatLoading || !aiChatInput.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: aiChatLoading || !aiChatInput.trim() ? '#cbd5e1' : '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: aiChatLoading || !aiChatInput.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <i className="fas fa-paper-plane"></i> Gửi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Peak Hours Chart */}
      {peakHoursData && peakHoursData.length > 0 && (
        <div className="chart-card" style={{ marginTop: '20px' }}>
          <div className="chart-header">
            <h3>Khung Giờ Cao Điểm (Peak Hours)</h3>
            <p style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '5px' }}>
              Phân bố số phiên sạc theo 24 giờ trong ngày
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="hour" 
                stroke={darkMode ? '#94a3b8' : '#64748b'} 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }}
              />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tick={{ fill: darkMode ? '#94a3b8' : '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff', 
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}
                formatter={(value) => `${value} phiên`}
              />
              <Bar dataKey="sessions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Suggestions Section */}
      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="ai-suggestions-section" style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: darkMode ? '#1e293b' : '#f8fafc', 
          borderRadius: '12px',
          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <div className="section-header" style={{ marginBottom: '15px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
              <i className="fas fa-robot" style={{ color: '#8b5cf6' }}></i>
              Gợi Ý Nâng Cấp Hạ Tầng (AI Assistant)
            </h3>
          </div>
          <div className="suggestions-list">
            {aiSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  background: darkMode ? '#334155' : '#fff',
                  borderRadius: '8px',
                  borderLeft: '4px solid #8b5cf6',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <i className="fas fa-lightbulb" style={{ color: '#f59e0b', marginTop: '3px' }}></i>
                <p style={{ margin: 0, color: darkMode ? '#f1f5f9' : '#475569', lineHeight: '1.6' }}>{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Stations Table */}
      <div 
        className="top-stations-section" 
        style={{ 
          marginTop: '20px',
          backgroundColor: darkMode ? '#1e293b' : 'white',
          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          color: darkMode ? '#f1f5f9' : '#1e293b'
        }}
      >
        <div className="section-header">
          <h3 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>Top Trạm Sạc theo Doanh thu</h3>
          <button className="btn-secondary btn-sm" onClick={fetchReportData}>
            <i className="fas fa-refresh"></i>
          </button>
        </div>
        <div className="stations-table-container">
          <table className="stations-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Tên trạm</th>
                <th>Doanh thu</th>
                <th>Số phiên</th>
                <th>Năng lượng (kWh)</th>
                <th>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {topStations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không có dữ liệu</p>
                  </td>
                </tr>
              ) : (
                topStations.map((station, index) => {
                  const percentage = station.percentage || (transactionStats.totalAmount > 0 
                    ? (station.revenue / transactionStats.totalAmount) * 100 
                    : 0);
                  return (
                    <tr key={station.id}>
                      <td>
                        <div className="rank-badge" style={{
                          background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#f97316' : (darkMode ? '#475569' : '#e2e8f0'),
                          color: index < 3 ? '#fff' : (darkMode ? '#f1f5f9' : '#64748b')
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{station.name || `Trạm ${station.id}`}</strong>
                      </td>
                      <td>
                        <span className="amount-text" style={{ color: '#10b981' }}>{formatCurrency(station.revenue || 0)}</span>
                      </td>
                      <td style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{station.sessions || 0}</td>
                      <td style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>{(station.energy || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</td>
                      <td>
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill"
                            style={{ width: `${Math.min(percentage, 100)}%`, background: '#10b981' }}
                          ></div>
                          <span className="percentage-text" style={{ color: darkMode ? '#f1f5f9' : '#64748b' }}>{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;