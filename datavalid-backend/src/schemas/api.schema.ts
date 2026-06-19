import { z } from 'zod';

export const columnMappingRequestSchema = z.object({
  jobId:   z.string().uuid(),
  headers: z.array(z.string()).min(1),
  sample:  z.array(z.record(z.string())).max(10),
});

export const confirmMappingRequestSchema = z.object({
  jobId: z.string().uuid(),
  mappings: z.array(z.object({
    uploadedHeader: z.string(),
    mappedField:    z.string(),
  })).min(1),
});

export const fixSuggestionRequestSchema = z.object({
  jobId: z.string().uuid(),
  rows: z.array(z.object({
    rowNumber: z.number().int().positive(),
    rowData:   z.record(z.string()),
    errors:    z.array(z.object({
      field:   z.string(),
      code:    z.string(),
      message: z.string(),
    })),
  })).min(1).max(50),
});

export const paginationSchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(500).default(100),
  filter: z.enum(['VALID', 'INVALID']).optional(),
});
