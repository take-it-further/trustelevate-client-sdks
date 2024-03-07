
export type Anchor = {
  anchor: string;
  verified: boolean;
  g1token: G1Token[];
}

export class G1Token {
  readonly hash: string;
  readonly self: boolean
  // Deprecated. use best_score.
  readonly score: number
  readonly matching: number
  readonly best_score: number
  readonly g1consent: G1Consent[];
  readonly g1source: G1Source[];

  constructor(hash: string, score: number, self: boolean, consent: G1Consent[]) {
    this.hash = hash;
    this.score = score;
    this.self = self
    this.g1consent = consent;
  }
}

export class G1Source {
  readonly type: string;
  readonly update_time: Date;
  constructor(type: string, update_time: Date) {
    this.type = type;
    this.update_time = update_time;
  }
}

export class G1Consent {
  name?: string; // only added at the edge
  readonly age: number;
  readonly age_band: string;
  readonly subject: string;
  readonly request_time: Date;
  readonly customer_id: string;
  readonly approve_time?: Date;
  readonly reject_time?: Date;
  readonly info?: string;
  readonly custom_id?: string;
  readonly callback?: string;

  constructor(name: string, subject: string, request_time: Date, customer_id: string) {
    this.name = name;
    this.subject = subject;
    this.request_time = request_time;
    this.customer_id = customer_id;
  }

  status(): string {
    let result = "PENDING";
    if (this.approve_time !== undefined && validTs(this.approve_time)) {
      result = "APPROVED";
    }
    if (this.reject_time !== undefined && validTs(this.reject_time) && (!this.approve_time || !validTs(this.approve_time) || this.approve_time < this.reject_time)) {
      result = "REJECTED";
    }
    return result;
  }
  updateTime(): Date {
    let result = new Date(0);
    if (validTs(this.request_time)) {
      result = new Date(this.request_time);
    }
    if (validTs(this.approve_time)) {
      result = new Date(this.approve_time);
    }
    if (validTs(this.reject_time) && (!this.approve_time || !validTs(this.approve_time) || this.approve_time < this.reject_time)) {
      result = new Date(this.reject_time);
    }
    return result;
  }
}

function validTs(d: undefined | Date): boolean {
  return d !== undefined && new Date(d).getTime() > 0;
}

interface DynamicStringString {
  [key: string]: string;
}

interface DynamicStringBoolean {
  [key: string]: boolean;
}

export class ConsentReceipt {
  matching: number;
  best_score: number;
  subjects: DynamicStringString
  updated: Date;
  age_bands: DynamicStringBoolean
  id?: string;

  pending(): string[] {
    let result: string[] = []
    for (let key in this.subjects) {
      if (this.subjects[key] === "PENDING" || this.subjects[key] === "UNKNOWN") {
        result.push(key)
      }
    }
    return result
  }

  approved(): string[] {
    let result: string[] = []
    for (let key in this.subjects) {
      if (this.subjects[key] === "APPROVED") {
        result.push(key)
      }
    }
    return result
  }

  rejected(): string[] {
    let result: string[] = []
    for (let key in this.subjects) {
      if (this.subjects[key] === "REJECTED") {
        result.push(key)
      }
    }
    return result
  }
}
