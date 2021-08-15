export type Anchor = {
  anchor: string;
  verified: boolean;
  g1token: G1Token[];
}

export class G1Token {
  readonly hash: string;
  verified: number;
  readonly g1consent: G1Consent[];

  constructor(hash: string, consent: G1Consent[]) {
    this.hash = hash;
    this.g1consent = consent;
  }
}

export type G1Consent = {
  subject: string;
  request_time: Date;
  approve_time?: Date;
  reject_time?: Date;
}

