export type DocumentCategory =
  | 'declaration'
  | 'retenue'
  | 'tva'
  | 'entreprise'
  | 'attestation'
  | 'comptabilite'
  | 'juridique'
  | 'autre';

export type DocumentAudience =
  | 'entreprise'
  | 'particulier'
  | 'comptable'
  | 'tous';

export interface FiscalDocument {
  id: string;

  title: string;

  shortTitle: string;

  description: string;

  category: DocumentCategory;

  categoryLabel: string;

  audience: DocumentAudience[];

  format: 'PDF' | 'DOCX' | 'XLSX';

  size: string;

  official: boolean;

  verified: boolean;

  version?: string;

  date: string;

  url: string;

  source: string;

  tags: string[];

  popular?: boolean;

  featured?: boolean;
}