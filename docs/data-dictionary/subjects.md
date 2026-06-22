# Data Dictionary — `subjects`

Catalog of academic subjects an exam can belong to.

| Field Name                | PostgreSQL Type | Constraints & Keys        | UX & Business Logic Purpose                                                        |
|---------------------------|-----------------|---------------------------|-----------------------------------------------------------------------------------|
| `subject_identifier`      | UUID            | Primary Key, Not Null     | Secure, non-sequential global identifier.                                          |
| `subject_name`            | VARCHAR(100)    | Unique, Not Null          | Main subject name (e.g. "Mathematics").                                            |
| `academic_level`          | VARCHAR(50)     | Not Null                  | Maps to a dropdown in React (e.g. High School, University) to prevent typing errors.|
| `is_active_record`        | BOOLEAN         | Not Null, Default: TRUE   | Maps to a "Deactivate" toggle instead of a destructive delete button.             |
| `creation_timestamp`      | TIMESTAMP       | Not Null, Default: NOW()  | System-managed audit trail.                                                        |
| `update_timestamp`        | TIMESTAMP       | Not Null, Default: NOW()  | System-managed audit trail.                                                        |

## Notes

- Source of the **system-wide conventions**: UUID PKs, verbose `snake_case`,
  soft-delete (`is_active_record`) and audit timestamps.
- `academic_level` is a constrained value → modeled as an enum/catalog in the UI.
- Future: `exams.subject_id` references `subjects.subject_identifier`.
