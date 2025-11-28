// src/services/description.model.ts

export interface AiDescriptionOptions {
  location?: string;
  price?: number | string;      // will be stringified
  dimensions?: string;
  category?: string;
  conditionHint?: string;
}

export interface AiDescriptionResponse {
  titlePt: string;
  descriptionPt: string;

  titleEn?: string | null;
  descriptionEn?: string | null;

  tags: string[] | null;

  category?: string | null;
  condition?: string | null;
  roomType?: string | null;

  confidenceNotes?: string | null;
}
