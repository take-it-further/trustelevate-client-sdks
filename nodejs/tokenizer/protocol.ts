export type SourceType = 'NONE' | 'SELF' | 'DUMMY' | 'WONDE';

export type G1Source = {
  uid?: string;
  type: SourceType;
  updateTime: Date;
}

export type G1Consent = {
  uid?: string;
  subject: string;
  approveTime?: Date;
  requestTime?: Date;
  rejectTime?: Date;
}

export type G1Token = {
  uid?: string;
  hash: string;
  score: number;
  g1Source?: G1Source[];
  g1Consent: G1Consent[];
}

export type Anchor = {
  uid: string;
  anchor: string;
  g1Token: G1Token[];
}
