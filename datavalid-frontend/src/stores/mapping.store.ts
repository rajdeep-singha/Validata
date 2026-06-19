import { create } from 'zustand';
import { type ColumnMappingEntry, type SchemaField } from '../types/domain';

interface MappingStore {
  mappings: ColumnMappingEntry[];
  userOverrides: Record<string, SchemaField>;
  unmappedHeaders: string[];
  confirmed: boolean;
  setMappings: (mappings: ColumnMappingEntry[], unmappedHeaders: string[]) => void;
  overrideMapping: (uploadedHeader: string, mappedField: SchemaField) => void;
  confirm: () => void;
  reset: () => void;
  getEffectiveMappings: () => ColumnMappingEntry[];
}

export const useMappingStore = create<MappingStore>((set, get) => ({
  mappings: [],
  userOverrides: {},
  unmappedHeaders: [],
  confirmed: false,

  setMappings: (mappings, unmappedHeaders) =>
    set({ mappings, unmappedHeaders, confirmed: false, userOverrides: {} }),

  overrideMapping: (uploadedHeader, mappedField) =>
    set((state) => ({
      userOverrides: { ...state.userOverrides, [uploadedHeader]: mappedField },
    })),

  confirm: () => set({ confirmed: true }),
  reset: () => set({ mappings: [], userOverrides: {}, unmappedHeaders: [], confirmed: false }),

  getEffectiveMappings: () => {
    const { mappings, userOverrides } = get();
    return mappings.map((m) => ({
      ...m,
      mappedField: userOverrides[m.uploadedHeader] ?? m.mappedField,
    }));
  },
}));
