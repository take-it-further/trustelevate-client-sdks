
export type G1Consent = {
  uid?: string;
  subject: string;
  approveTime?: Date;
  requestTime?: Date;
  rejectTime?: Date;
}

export class G1Token {
  readonly hash: string;
  readonly g1Consent: G1Consent[];

  constructor(hash: string, consent: G1Consent[]) {
    this.hash = hash;
    this.g1Consent = consent;
  }

  anchorHashComponent(hash: string): number {
    // TODO: get uint64 value somehow
    return parseInt(hash, 16) >> 32 << 32;
  }

  g1localHashComponent(hash: string): number {
    return parseInt(hash, 16) << 32 >> 32;
  }
}

export type Anchor = {
  anchor: string;
  g1Token: G1Token[];
}
