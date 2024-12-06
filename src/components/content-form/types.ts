export interface FormData {
  title: string;
  description: string;
  distributionChannel: string;
  accessLevel: string;
  contentType: string;
  writtenFormat: string;
  fileType: string;
  visualFormat: string;
  interactiveFormat: string;
  tags: string[];
}

export interface CategoryDefinition {
  options: string[];
  description: string;
}

export interface Recommendation {
  value: string;
  confidence: number;
  similar: number;
}

export interface HistoricalContent {
  title: string;
  description: string;
  distributionChannel: string;
  accessLevel: string;
  contentType: string;
  writtenFormat: string;
  fileType: string;
  visualFormat: string;
  interactiveFormat: string;
  tags: string[];
}

export interface PatternInsights {
  similarContent: Array<{
    content: HistoricalContent;
    similarity: number;
  }>;
  topMatches: number;
}