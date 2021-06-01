export type Anchor = {
  anchor: string;
  g1token: G1Token[];
}

export class G1Token {
  readonly hash: string;
  readonly g1consent: G1Consent[];

  constructor(hash: string, consent: G1Consent[]) {
    this.hash = hash;
    this.g1consent = consent;
  }
}

export type G1Consent = {
  subject: string;
  approve_time?: Date;
  request_time?: Date;
  reject_time?: Date;
}

