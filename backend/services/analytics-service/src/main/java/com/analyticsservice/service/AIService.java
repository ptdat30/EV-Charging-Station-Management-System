package com.analyticsservice.service;

import com.analyticsservice.dto.AIChatRequest;
import com.analyticsservice.dto.AIChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class AIService {

    /**
     * Process AI chat request and generate intelligent response
     * This is a mock implementation. In production, integrate with OpenAI, Azure OpenAI, or other AI services.
     */
    public AIChatResponse chat(AIChatRequest request) {
        try {
            String userMessage = request.getMessage() != null ? request.getMessage().toLowerCase() : "";
            String context = request.getContext() != null ? request.getContext() : "general";
            Map<String, Object> analyticsData = request.getAnalyticsData() != null ? request.getAnalyticsData() : new HashMap<>();

            String response = generateResponse(userMessage, context, analyticsData);
            List<String> suggestions = generateSuggestions(userMessage, context, analyticsData);

            return new AIChatResponse(response, suggestions, context, true, null);
        } catch (Exception e) {
            log.error("Error processing AI chat request", e);
            return new AIChatResponse(
                "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
                Arrays.asList("Hỏi về doanh thu", "Hỏi về khung giờ cao điểm", "Hỏi về trạm sạc"),
                request.getContext(),
                false,
                e.getMessage()
            );
        }
    }

    private String generateResponse(String userMessage, String context, Map<String, Object> analyticsData) {
        // Revenue-related questions
        if (userMessage.contains("doanh thu") || userMessage.contains("revenue") || userMessage.contains("tiền")) {
            return generateRevenueResponse(analyticsData);
        }

        // Usage-related questions
        if (userMessage.contains("sử dụng") || userMessage.contains("usage") || userMessage.contains("phiên") || userMessage.contains("session")) {
            return generateUsageResponse(analyticsData);
        }

        // Peak hours questions
        if (userMessage.contains("cao điểm") || userMessage.contains("peak") || userMessage.contains("giờ") || userMessage.contains("hour")) {
            return generatePeakHoursResponse(analyticsData);
        }

        // Station-related questions
        if (userMessage.contains("trạm") || userMessage.contains("station")) {
            return generateStationResponse(analyticsData);
        }

        // Upgrade/infrastructure questions
        if (userMessage.contains("nâng cấp") || userMessage.contains("upgrade") || userMessage.contains("mở rộng") || userMessage.contains("expand")) {
            return generateUpgradeResponse(analyticsData);
        }

        // Forecast questions
        if (userMessage.contains("dự báo") || userMessage.contains("forecast") || userMessage.contains("tương lai") || userMessage.contains("future")) {
            return generateForecastResponse(analyticsData);
        }

        // Greeting
        if (userMessage.contains("xin chào") || userMessage.contains("hello") || userMessage.contains("hi") || userMessage.contains("chào")) {
            return "Xin chào! Tôi là AI Assistant hỗ trợ phân tích và đưa ra gợi ý nâng cấp hạ tầng trạm sạc. " +
                   "Bạn có thể hỏi tôi về doanh thu, khung giờ cao điểm, trạm sạc, hoặc đề xuất nâng cấp.";
        }

        // Default response
        return "Tôi hiểu bạn đang hỏi về: \"" + userMessage + "\". " +
               "Để tôi có thể hỗ trợ tốt hơn, bạn có thể hỏi cụ thể về:\n" +
               "• Doanh thu và xu hướng\n" +
               "• Khung giờ cao điểm\n" +
               "• Trạm sạc và hiệu suất\n" +
               "• Đề xuất nâng cấp hạ tầng\n" +
               "• Dự báo nhu cầu tương lai";
    }

    private String generateRevenueResponse(Map<String, Object> analyticsData) {
        Object totalRevenue = analyticsData.get("totalRevenue");
        Object revenueGrowth = analyticsData.get("revenueGrowth");
        
        StringBuilder response = new StringBuilder("📊 **Phân tích Doanh thu:**\n\n");
        
        if (totalRevenue != null) {
            response.append("• Tổng doanh thu hiện tại: ").append(formatNumber(totalRevenue)).append(" VNĐ\n");
        }
        
        if (revenueGrowth != null) {
            double growth = parseDouble(revenueGrowth);
            if (growth > 0) {
                response.append("• Tăng trưởng: +").append(String.format("%.1f", growth)).append("% - Xu hướng tích cực!\n");
            } else {
                response.append("• Tăng trưởng: ").append(String.format("%.1f", growth)).append("% - Cần theo dõi\n");
            }
        }
        
        response.append("\n💡 **Gợi ý:**\n");
        response.append("• Xem xét mở rộng các trạm có doanh thu cao\n");
        response.append("• Áp dụng chiến lược giá động theo khung giờ\n");
        response.append("• Tối ưu hóa vị trí trạm sạc mới dựa trên dữ liệu doanh thu");
        
        return response.toString();
    }

    private String generateUsageResponse(Map<String, Object> analyticsData) {
        Object totalSessions = analyticsData.get("totalSessions");
        Object avgSessionDuration = analyticsData.get("avgSessionDuration");
        
        StringBuilder response = new StringBuilder("⚡ **Phân tích Sử dụng:**\n\n");
        
        if (totalSessions != null) {
            response.append("• Tổng số phiên sạc: ").append(formatNumber(totalSessions)).append("\n");
        }
        
        if (avgSessionDuration != null) {
            response.append("• Thời gian sạc trung bình: ").append(formatNumber(avgSessionDuration)).append(" phút\n");
        }
        
        response.append("\n💡 **Gợi ý:**\n");
        response.append("• Phân tích khung giờ cao điểm để điều phối tải\n");
        response.append("• Tối ưu hóa thời gian sạc để tăng throughput\n");
        response.append("• Xem xét thêm điểm sạc tại các trạm có tần suất sử dụng cao");
        
        return response.toString();
    }

    private String generatePeakHoursResponse(Map<String, Object> analyticsData) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> peakHours = (List<Map<String, Object>>) analyticsData.get("peakHours");
        
        StringBuilder response = new StringBuilder("⏰ **Khung Giờ Cao Điểm:**\n\n");
        
        if (peakHours != null && !peakHours.isEmpty()) {
            response.append("Top 3 khung giờ cao điểm:\n");
            for (int i = 0; i < Math.min(3, peakHours.size()); i++) {
                Map<String, Object> hour = peakHours.get(i);
                String hourLabel = (String) hour.getOrDefault("hourLabel", hour.getOrDefault("hour", "N/A"));
                Object sessions = hour.get("sessions");
                response.append(String.format("%d. %s: %s phiên\n", i + 1, hourLabel, formatNumber(sessions)));
            }
        } else {
            response.append("• Đang phân tích dữ liệu khung giờ cao điểm...\n");
        }
        
        response.append("\n💡 **Gợi ý:**\n");
        response.append("• Áp dụng giá cao điểm vào các khung giờ này\n");
        response.append("• Điều phối tải bằng cách khuyến khích sạc ngoài giờ cao điểm\n");
        response.append("• Đảm bảo đủ công suất tại các khung giờ cao điểm");
        
        return response.toString();
    }

    private String generateStationResponse(Map<String, Object> analyticsData) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topStations = (List<Map<String, Object>>) analyticsData.get("topStations");
        
        StringBuilder response = new StringBuilder("🔌 **Phân tích Trạm Sạc:**\n\n");
        
        if (topStations != null && !topStations.isEmpty()) {
            response.append("Top 3 trạm sạc hàng đầu:\n");
            for (int i = 0; i < Math.min(3, topStations.size()); i++) {
                Map<String, Object> station = topStations.get(i);
                String name = (String) station.getOrDefault("name", station.getOrDefault("stationName", "Trạm " + station.get("id")));
                Object revenue = station.get("revenue");
                Object sessions = station.get("sessions");
                response.append(String.format("%d. %s: %s VNĐ (%s phiên)\n", 
                    i + 1, name, formatNumber(revenue), formatNumber(sessions)));
            }
        } else {
            response.append("• Đang phân tích dữ liệu trạm sạc...\n");
        }
        
        response.append("\n💡 **Gợi ý:**\n");
        response.append("• Nâng cấp công suất cho các trạm có doanh thu cao\n");
        response.append("• Bổ sung điểm sạc tại các trạm quá tải\n");
        response.append("• Xem xét mở rộng mạng lưới tại khu vực có nhu cầu cao");
        
        return response.toString();
    }

    private String generateUpgradeResponse(Map<String, Object> analyticsData) {
        StringBuilder response = new StringBuilder("🚀 **Đề Xuất Nâng Cấp Hạ Tầng:**\n\n");
        
        response.append("Dựa trên phân tích dữ liệu hiện tại:\n\n");
        response.append("1. **Nâng cấp công suất:**\n");
        response.append("   • Xác định các trạm có tỷ lệ sử dụng > 80%\n");
        response.append("   • Ưu tiên các trạm có doanh thu cao và tần suất sử dụng lớn\n\n");
        
        response.append("2. **Mở rộng mạng lưới:**\n");
        response.append("   • Phân tích khu vực có nhu cầu cao nhưng thiếu trạm\n");
        response.append("   • Xem xét vị trí mới dựa trên dữ liệu di chuyển và sử dụng\n\n");
        
        response.append("3. **Tối ưu hóa hiện có:**\n");
        response.append("   • Cải thiện hiệu suất các trạm hiện tại\n");
        response.append("   • Áp dụng công nghệ sạc nhanh hơn\n");
        response.append("   • Tối ưu hóa quản lý tải");
        
        return response.toString();
    }

    private String generateForecastResponse(Map<String, Object> analyticsData) {
        StringBuilder response = new StringBuilder("🔮 **Dự Báo Nhu Cầu:**\n\n");
        
        response.append("Dựa trên xu hướng lịch sử:\n\n");
        response.append("• **3 tháng tới:** Dự kiến tăng trưởng 15-20% số phiên sạc\n");
        response.append("• **6 tháng tới:** Có thể cần thêm 2-3 trạm sạc mới\n");
        response.append("• **12 tháng tới:** Nên lập kế hoạch mở rộng quy mô lớn\n\n");
        
        response.append("💡 **Khuyến nghị:**\n");
        response.append("• Bắt đầu lập kế hoạch nâng cấp từ bây giờ\n");
        response.append("• Ưu tiên các khu vực có tốc độ tăng trưởng cao\n");
        response.append("• Đầu tư vào công nghệ sạc nhanh để đáp ứng nhu cầu");
        
        return response.toString();
    }

    private List<String> generateSuggestions(String userMessage, String context, Map<String, Object> analyticsData) {
        List<String> suggestions = new ArrayList<>();
        
        if (userMessage.contains("doanh thu") || context.equals("revenue")) {
            suggestions.add("Doanh thu tăng trưởng như thế nào?");
            suggestions.add("Trạm nào có doanh thu cao nhất?");
            suggestions.add("Làm sao để tăng doanh thu?");
        } else if (userMessage.contains("sử dụng") || context.equals("usage")) {
            suggestions.add("Khung giờ nào có nhiều phiên sạc nhất?");
            suggestions.add("Trạm nào được sử dụng nhiều nhất?");
            suggestions.add("Thời gian sạc trung bình là bao nhiêu?");
        } else if (userMessage.contains("nâng cấp") || userMessage.contains("upgrade")) {
            suggestions.add("Trạm nào cần nâng cấp?");
            suggestions.add("Khu vực nào cần thêm trạm mới?");
            suggestions.add("Chi phí nâng cấp ước tính?");
        } else {
            suggestions.add("Hỏi về doanh thu");
            suggestions.add("Hỏi về khung giờ cao điểm");
            suggestions.add("Hỏi về đề xuất nâng cấp");
        }
        
        return suggestions;
    }

    private String formatNumber(Object number) {
        if (number == null) return "0";
        if (number instanceof Number) {
            double value = ((Number) number).doubleValue();
            if (value >= 1_000_000_000) {
                return String.format("%.2f tỷ", value / 1_000_000_000);
            } else if (value >= 1_000_000) {
                return String.format("%.2f triệu", value / 1_000_000);
            } else if (value >= 1_000) {
                return String.format("%.2f nghìn", value / 1_000);
            } else {
                return String.format("%.0f", value);
            }
        }
        return number.toString();
    }

    private double parseDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}

