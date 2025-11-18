package com.quitsmoking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotNull(message = "Rating cannot be null")
    @Min(value = 0, message = "Rating must be at least 0")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating; // 0: Rất tệ, 4: Rất hài lòng

    @Size(max = 1000, message = "Feedback content cannot exceed 1000 characters")
    private String feedbackContent; // Nội dung ý kiến (có thể null hoặc rỗng)
}
