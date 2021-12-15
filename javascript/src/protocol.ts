export type Anchor = {
  anchor: string;
  verified: boolean;
  g1token: G1Token[];
}

export class G1Token {
  readonly hash: string;
  readonly score: number
  verified: number;
  readonly g1consent: G1Consent[];

  constructor(hash: string, score: number, consent: G1Consent[]) {
    this.hash = hash;
    this.score = score;
    this.g1consent = consent;
  }
}

export type G1Consent = {
  subject: string;
  request_time: Date;
  approve_time?: Date;
  reject_time?: Date;
  info?: string;
}

