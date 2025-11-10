// FILE: DailyReportRepository.java
package com.analyticsservice.repositories;

import com.analyticsservice.entities.DailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {
    Optional<DailyReport> findByReportDate(LocalDate reportDate);
    List<DailyReport> findByReportDateBetweenOrderByReportDateDesc(LocalDate start, LocalDate end);
}

