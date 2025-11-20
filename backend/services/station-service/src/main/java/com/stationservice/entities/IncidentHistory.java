// FILE: IncidentHistory.java
package com.stationservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "incident_history")
public class IncidentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ActionType actionType;

    @Column(name = "action_by")
    private Long actionBy; // ID của user thực hiện action

    @Column(name = "action_by_name")
    private String actionByName; // Tên người thực hiện

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(name = "old_priority")
    private String oldPriority;

    @Column(name = "new_priority")
    private String newPriority;

    @Column(name = "old_assigned_to")
    private Long oldAssignedTo;

    @Column(name = "new_assigned_to")
    private Long newAssignedTo;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ActionType {
        created, status_changed, priority_changed, assigned, reassigned, 
        note_added, resolved, closed, cancelled
    }
}

