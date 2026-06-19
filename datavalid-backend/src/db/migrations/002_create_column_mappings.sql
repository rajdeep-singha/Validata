CREATE TABLE IF NOT EXISTS column_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  uploaded_header     TEXT NOT NULL,
  mapped_field        TEXT NOT NULL,
  confidence          NUMERIC(4,3),
  confirmed_by_user   BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_column_mappings_job_id ON column_mappings(job_id);
