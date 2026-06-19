CREATE TABLE IF NOT EXISTS ai_summaries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  summary_text     TEXT NOT NULL,
  top_issues       JSONB,
  recommendations  JSONB,
  generated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_summaries_job_id ON ai_summaries(job_id);
