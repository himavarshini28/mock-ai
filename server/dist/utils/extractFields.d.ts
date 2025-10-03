interface ExtractedField {
    value: string | null;
    confidence: number;
    source: 'ai' | 'regex' | 'manual';
}
interface ExtractedFields {
    name: ExtractedField;
    email: ExtractedField;
    phone: ExtractedField;
}
export declare const extractFieldsAI: (text: string) => Promise<ExtractedFields>;
export {};
//# sourceMappingURL=extractFields.d.ts.map