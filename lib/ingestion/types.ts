/**
 * lib/ingestion/types.ts
 * Ingestion Lifecycle States, Batch Contracts & Publication Workflow
 */

export type IngestionLifecycleState = 
  | 'DISCOVERED'
  | 'EXTRACTED'
  | 'VALIDATION_REQUIRED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'SUPERSEDED'
  | 'CORRECTED';

export interface ImportBatchMetadata {
  batchId: string;
  sourceId: string;
  paperCode: string;
  year: number;
  totalDiscovered: number;
  totalExtracted: number;
  totalValidated: number;
  totalPublished: number;
  errorCount: number;
  state: IngestionLifecycleState;
  initiatedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  checksum: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAuditEntry {
  id: string;
  entityType: 'QUESTION' | 'CURRENT_AFFAIRS_STORY' | 'EXAM_PROFILE' | 'ANSWER_KEY';
  entityId: string;
  reviewerId: string;
  reviewerName: string;
  previousState: IngestionLifecycleState;
  newState: IngestionLifecycleState;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'PUBLISH' | 'WITHDRAW' | 'CORRECT';
  sourceReference: string;
  notes?: string;
  timestamp: string;
}

export interface ImportErrorRecord {
  id: string;
  batchId: string;
  itemIndex: number;
  errorCode: string;
  errorMessage: string;
  rawSnippet?: string;
  severity: 'FATAL' | 'WARNING' | 'NEEDS_MANUAL_REVIEW';
  createdAt: string;
}
