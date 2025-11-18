package com.quitsmoking.model.interfaces;

public interface iMemberManageable {
    void viewMemberProgress(String memberId); // Xem tiến độ của Member
    void assignCourseToMember(String memberId, String courseId); // Gán khóa học cho Member
    void sendMessageToMember(String memberId, String message); // Gửi tin nhắn cho Member
    //...
    
}
