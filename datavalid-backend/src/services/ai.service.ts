import { anthropic, AI_MODEL, MAPPING_MAX_TOKENS, FIX_MAX_TOKENS, SUMMARY_MAX_TOKENS } from '../config/ai.config';
import { validationConfig } from '../config/validation.config';
import { ALL_SCHEMA_FIELDS, SchemaField } from '../types/domain';
import { AIMappingResponse, FixSuggestionsResponse, AISummaryResponse } from '../types/api';
import { logger } from '../utils/logger';

//  Column Mapping 
export async function getColumnMappings(
  headers: string[],
  sample: Record<string, string>[]
): Promise<AIMappingResponse> {
  const schemaDescription = ALL_SCHEMA_FIELDS.map(f => {
    const descriptions: Record<string, string> = {
      order_id: 'Unique order identifier',
      order_date: 'Date of the order',
      customer_name: 'Full name of customer',
      customer_phone: 'Phone number of customer',
      customer_country_code: '2-letter ISO country code (e.g. IN, SG, US)',
      product_id: 'Unique product identifier',
      product_name: 'Name of the product',
      quantity: 'Number of units ordered (integer)',
      unit_price: 'Price per unit (decimal)',
      total_amount: 'Total order amount (decimal)',
      payment_mode: 'Payment method: UPI, CARD, NETBANKING, PAYPAL, or CASH',
      transaction_id: 'Payment transaction reference ID',
    };
    return `  - ${f}: ${descriptions[f] || f}`;
  }).join('\n');

  const prompt = `You are a data schema mapping assistant. Map the uploaded CSV headers to canonical schema fields.

Required schema fields:
${schemaDescription}

Uploaded headers: ${JSON.stringify(headers)}

Sample rows (first ${sample.length}):
${JSON.stringify(sample, null, 2)}

Rules:
- confidence 0.90+ = very confident
- confidence 0.70–0.89 = likely match, user should confirm
- confidence below 0.70 = uncertain
- ONLY use exact field names listed above
- If a header clearly matches despite different naming, map it
- Headers that match no schema field go in unmappedHeaders
- Schema fields with no matching header go in unmappedSchemaFields

Respond ONLY with valid JSON:
{
  "mappings": [
    { "uploadedHeader": "<exact header>", "mappedField": "<schema field>", "confidence": <0.0-1.0> }
  ],
  "unmappedHeaders": [],
  "unmappedSchemaFields": []
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: MAPPING_MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = parseJsonFromLLM<AIMappingResponse>(text);

  logger.info('AI column mapping generated', { headerCount: headers.length });
  return parsed;
}

//  Auto-Fix Suggestions 

export async function getFixSuggestions(
  rows: Array<{
    rowNumber: number;
    rowData: Record<string, string>;
    errors: Array<{ field: string; code: string; message: string }>;
  }>
): Promise<FixSuggestionsResponse> {
  const phoneRulesText = Object.entries(validationConfig.phone)
    .map(([cc, rule]) => `  - ${cc}: ${rule.length} digits, pattern: ${rule.regex}`)
    .join('\n');

  const prompt = `You are a data quality assistant. Suggest corrections for these invalid transaction rows.

Allowed payment modes: ${validationConfig.allowedPaymentModes.join(', ')}
Phone number rules by country:
${phoneRulesText}

Invalid rows with errors:
${JSON.stringify(rows, null, 2)}

Rules:
- ONLY suggest fixes when you are highly confident (e.g. obvious typos, letter/digit confusion)
- NEVER invent or fabricate data
- NEVER suggest a fix you aren't confident about (omit uncertain ones)
- If the letter O is used where digit 0 should be, that's a common typo to fix
- If a payment mode is a typo of an allowed value, suggest the correct one

Respond ONLY with valid JSON:
{
  "suggestions": [
    {
      "rowNumber": <number>,
      "fixes": [
        {
          "field": "<field name>",
          "originalValue": "<exact original value>",
          "suggestedValue": "<corrected value>",
          "reason": "<brief explanation>",
          "confidence": <0.0-1.0>
        }
      ]
    }
  ]
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: FIX_MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = parseJsonFromLLM<FixSuggestionsResponse>(text);

  logger.info('AI fix suggestions generated', { rowCount: rows.length });
  return parsed;
}

//  Validation Summary 

export async function generateValidationSummary(stats: {
  jobId: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errorBreakdown: Array<{ errorCode: string; count: number }>;
}): Promise<{ summaryText: string; topIssues: AISummaryResponse['topIssues']; recommendations: AISummaryResponse['recommendations'] }> {
  const errorDetails = stats.errorBreakdown
    .map(e => `  - ${e.errorCode}: ${e.count} rows (${((e.count / stats.totalRows) * 100).toFixed(1)}%)`)
    .join('\n');

  const prompt = `You are a data quality analyst. Generate a clear validation summary report.

Job statistics:
- Total rows processed: ${stats.totalRows}
- Valid rows: ${stats.validRows} (${((stats.validRows / stats.totalRows) * 100).toFixed(1)}%)
- Invalid rows: ${stats.invalidRows} (${((stats.invalidRows / stats.totalRows) * 100).toFixed(1)}%)

Error breakdown:
${errorDetails}

Generate:
1. summaryText: A 2-3 sentence plain-English executive summary
2. topIssues: Top issues ranked by count with percentage and plain-language description
3. recommendations: Actionable recommendations with priority (HIGH/MEDIUM/LOW)

Respond ONLY with valid JSON:
{
  "summaryText": "...",
  "topIssues": [
    { "errorCode": "...", "count": <number>, "percentage": <number>, "description": "..." }
  ],
  "recommendations": [
    { "priority": "HIGH|MEDIUM|LOW", "message": "..." }
  ]
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: SUMMARY_MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = parseJsonFromLLM<{ summaryText: string; topIssues: AISummaryResponse['topIssues']; recommendations: AISummaryResponse['recommendations'] }>(text);

  logger.info('AI validation summary generated', { jobId: stats.jobId });
  return parsed;
}

//  Helper 

function parseJsonFromLLM<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    logger.error('Failed to parse LLM JSON response', { text: cleaned.slice(0, 200) });
    throw new Error('AI returned invalid JSON. Please retry.');
  }
}
