import has = Reflect.has;

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

export class G1Token {
  readonly hash: string;
  readonly score: number;
  readonly g1Source?: G1Source[];
  readonly g1Consent: G1Consent[];

  constructor(hash: string, score: number, source: G1Source[], consent: G1Consent[]) {
    this.hash = hash;
    this.score = score;
    this.g1Source = source;
    this.g1Consent = consent;
  }

  match(hash: string): number {
    if (this.anchorHashComponent(hash) != this.anchorHashComponent(this.hash)) {
      return 0;
    }

    let distance: number;
    let max: number;
    let tHash = this.g1localHashComponent(this.hash);
    let t2Hash = this.g1localHashComponent(hash);

    if (tHash >= t2Hash) {
      max = this.g1localHashComponent(this.hash)
      distance = tHash - t2Hash
    } else {
      max = this.g1localHashComponent(hash)
      distance = t2Hash - tHash
    }
    if (max == 0) {
      return this.score;
    }
    if (distance == 0) {
      return this.score;
    }
    if (distance < max) {
      let e = 100 - distance / max * 100;
      if (e > 99) {
        return this.score - 1;
      }
    }
    return 0
  }

  anchorHashComponent(hash: string): number {
    // TODO: get uint64 value somehow
    return parseInt(hash, 16) >> 32 << 32;
  }

  g1localHashComponent(hash: string): number {
    return parseInt(hash, 16) << 32 >> 32;
  }
}

export type G1Claim = {
  data: Map<string, string[]>
}

export type Anchor = {
  anchor: string;
  g1Token: G1Token[];
}
