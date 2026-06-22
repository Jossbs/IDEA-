package com.idea.shared.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Base for every persistent entity.
 *
 * <p>Carries the system-wide conventions defined by the data dictionaries:
 * a soft-delete flag ({@code is_active_record}) instead of destructive deletes,
 * and a managed audit trail ({@code creation_timestamp}, {@code update_timestamp}).
 * The UUID primary key lives on each concrete entity because its column name is
 * entity-specific (e.g. {@code subject_identifier}).</p>
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    /** Soft-delete flag — records are deactivated, never physically removed. */
    @Column(name = "is_active_record", nullable = false)
    private boolean activeRecord = true;

    @CreationTimestamp
    @Column(name = "creation_timestamp", nullable = false, updatable = false)
    private LocalDateTime creationTimestamp;

    @UpdateTimestamp
    @Column(name = "update_timestamp", nullable = false)
    private LocalDateTime updateTimestamp;
}
