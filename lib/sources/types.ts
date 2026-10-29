/**
 * lib/sources/types.ts
 * Source-Adapter Type Definitions & Permitted Ingestion Governance
 */

export type SourceCategory = 
  | 'OFFICIAL_AUTHORITY' 
  | 'GOVERNMENT_FEED' 
  | 'REGULATORY_BODY' 
  | 'POLICY_RESEARCH' 
  | 'EDUCATIONAL_BENCHMARK';

export type CollectionMethod = 
  | 'DIRECT_DOCUMENT_DOWNLOAD' 
  | 'RSS_AND_STRUCTURED_PAGE' 
  | 'PRESS_RELEASE_METADATA' 
  | 'METADATA_AND_LINKING_ONLY' 
  | 'FUNCTIONAL_UX_REFERENCE_ONLY' 
  | 'SYLLABUS_TAXONOMY_INSPECTION_ONLY' 
  | 'EXTERNAL_COMPETITIVE_BENCHMARK_ONLY';

export interface SourceSpecification {
  id: string;
  name: string;
  category: SourceCategory;
  providedReference: string;
  canonicalUrl: string;
  canonicalDomain: string;
  publisher: string;
  authRequired: boolean;
  robotsStatus: string;
  allowedMethods: CollectionMethod[];
  licensing: string;
  originalContentStoragePermitted: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  relevantExams: string;
  relevantYears: string;
  updateFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AFTER_RESULT_DECLARATION' | 'MANUAL_INSPECTION_ONLY';
  retryPolicy: string;
  humanReviewRequired: boolean;
  blockers?: string;
}

export interface DiscoveredDocument {
  documentId: string;
  examCode: string;
  paperCode: string;
  stage: string;
  year: number;
  series?: string;
  title: string;
  sourceUrl: string;
  answerKeyUrl?: string;
  checksum?: string;
  pageCount?: number;
  retrievedAt: string;
  status: 'DISCOVERED' | 'DOWNLOADED' | 'EXTRACTED' | 'FAILED';
  metadata: Record<string, any>;
}

export interface ExtractionResult<T = any> {
  success: boolean;
  items: T[];
  errorCount: number;
  errors: Array<{ itemIndex: number; message: string; rawSnippet?: string }>;
  confidence: number;
  metadata: Record<string, any>;
}

export interface ISourceAdapter {
  spec: SourceSpecification;
  discoverDocuments(): Promise<DiscoveredDocument[]>;
  verifyPermissions(): Promise<{ permitted: boolean; reason?: string }>;
  extractContent(document: DiscoveredDocument): Promise<ExtractionResult>;
  validateItems(items: any[]): Promise<{ valid: any[]; invalid: any[] }>;
}
