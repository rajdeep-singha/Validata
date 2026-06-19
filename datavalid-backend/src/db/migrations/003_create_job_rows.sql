CREATE TABLE IF NOT EXISTS job_rows (
  id              BIGSERIAL PRIMARY KEY,
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  row_number      INTEGER NOT NULL,
  row_data        JSONB NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('VALID','INVALID')),
  errors          JSONB,
  fix_suggestions JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_rows_job_id ON job_rows(job_id);
CREATE INDEX IF NOT EXISTS idx_job_rows_job_status ON job_rows(job_id, status);
