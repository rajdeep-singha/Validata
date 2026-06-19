import { type ColumnMappingEntry, ALL_SCHEMA_FIELDS, type SchemaField } from '../../types/domain';
import { confidenceColor, confidenceLabel } from '../../utils/format';

interface MappingRowProps {
  mapping: ColumnMappingEntry;
  overrideValue?: SchemaField;
  onOverride: (field: SchemaField) => void;
}

export function MappingRow({ mapping, overrideValue, onOverride }: MappingRowProps) {
  const effectiveField = overrideValue ?? mapping.mappedField;
  const isLowConfidence = mapping.confidence < 0.85;

  return (
    <tr style={{ background: isLowConfidence ? '#fef9c3' : 'white' }}>
      <td style={tdStyle}>
        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
          {mapping.uploadedHeader}
        </code>
      </td>
      <td style={tdStyle}>→</td>
      <td style={tdStyle}>
        <select
          value={effectiveField}
          onChange={(e) => onOverride(e.target.value as SchemaField)}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: `1px solid ${isLowConfidence ? '#f59e0b' : '#d1d5db'}`,
            background: 'white',
          }}
        >
          {ALL_SCHEMA_FIELDS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
          <option value="_ignore">— ignore this column —</option>
        </select>
      </td>
      <td style={tdStyle}>
        <span style={{ color: confidenceColor(mapping.confidence), fontWeight: 600 }}>
          {Math.round(mapping.confidence * 100)}% ({confidenceLabel(mapping.confidence)})
        </span>
        {isLowConfidence && (
          <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#92400e' }}>
            ⚠ Please review
          </span>
        )}
      </td>
    </tr>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #e5e7eb',
};
