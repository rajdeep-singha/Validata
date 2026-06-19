CREATE TABLE IF NOT EXISTS jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_filename TEXT NOT NULL,
  file_path         TEXT NOT NULL,
  file_size_bytes   BIGINT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','MAPPING','PROCESSING','COMPLETED','FAILED')),
  total_rows        INTEGER,
  processed_rows    INTEGER DEFAULT 0,
  valid_rows        INTEGER DEFAULT 0,
  invalid_rows      INTEGER DEFAULT 0,
  output_paths      TEXT[] DEFAULT '{}',
  error_message     TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
