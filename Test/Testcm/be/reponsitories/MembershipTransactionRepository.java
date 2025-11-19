// com.quitsmoking.reponsitories.MembershipTransactionRepository.java
package com.quitsmoking.reponsitories;

import com.quitsmoking.model.MembershipTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipTransactionRepository extends JpaRepository<MembershipTransaction, String> {
    // Phương thức tùy chỉnh để tìm giao dịch theo ID người dùng
    @Query("SELECT mt FROM MembershipTransaction mt LEFT JOIN FETCH mt.user u LEFT JOIN FETCH mt.membershipPlan mp WHERE u.id = :userId")
    List<MembershipTransaction> findByUser_Id(@Param("userId") String userId);

    // Tải một giao dịch cụ thể, JOIN FETCH cả user và membershipPlan
    @Query("SELECT mt FROM MembershipTransaction mt LEFT JOIN FETCH mt.user u LEFT JOIN FETCH mt.membershipPlan mp WHERE mt.id = :transactionId AND u.id = :userId")
    Optional<MembershipTransaction> findByIdAndUser_Id(@Param("transactionId") String transactionId, @Param("userId") String userId);
}