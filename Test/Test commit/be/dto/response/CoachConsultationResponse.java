package com.quitsmoking.dto.response;

import java.time.LocalDateTime;

public class CoachConsultationResponse {
    private String id;
    private String memberId;
    private String coachId;
    private String sessionType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin member bổ sung
    private String memberFirstName;
    private String memberLastName;
    private String memberUsername;
    private String memberEmail;
    private String memberPictureUrl;

    // Thông tin coach bổ sung
    private String coachFirstName;
    private String coachLastName;
    private String coachUsername;
    private String coachEmail;
    private String coachPictureUrl;

    // getter & setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getCoachId() { return coachId; }
    public void setCoachId(String coachId) { this.coachId = coachId; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getMemberFirstName() { return memberFirstName; }
    public void setMemberFirstName(String memberFirstName) { this.memberFirstName = memberFirstName; }
    public String getMemberLastName() { return memberLastName; }
    public void setMemberLastName(String memberLastName) { this.memberLastName = memberLastName; }
    public String getMemberUsername() { return memberUsername; }
    public void setMemberUsername(String memberUsername) { this.memberUsername = memberUsername; }
    public String getMemberEmail() { return memberEmail; }
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
    public String getMemberPictureUrl() { return memberPictureUrl; }
    public void setMemberPictureUrl(String memberPictureUrl) { this.memberPictureUrl = memberPictureUrl; }

    public String getCoachFirstName() { return coachFirstName; }
    public void setCoachFirstName(String coachFirstName) { this.coachFirstName = coachFirstName; }
    public String getCoachLastName() { return coachLastName; }
    public void setCoachLastName(String coachLastName) { this.coachLastName = coachLastName; }
    public String getCoachUsername() { return coachUsername; }
    public void setCoachUsername(String coachUsername) { this.coachUsername = coachUsername; }
    public String getCoachEmail() { return coachEmail; }
    public void setCoachEmail(String coachEmail) { this.coachEmail = coachEmail; }
    public String getCoachPictureUrl() { return coachPictureUrl; }
    public void setCoachPictureUrl(String coachPictureUrl) { this.coachPictureUrl = coachPictureUrl; }
} 