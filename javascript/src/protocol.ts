export type Anchor = {
  anchor: string;
  g1Token: G1Token[];
}

export class G1Token {
  readonly hash: string;
  readonly g1Consent: G1Consent[];

  constructor(hash: string, consent: G1Consent[]) {
    this.hash = hash;
    this.g1Consent = consent;
  }
}

export type G1Consent = {
  uid?: string;
  subject: string;
  approveTime?: Date;
  requestTime?: Date;
  rejectTime?: Date;
}

