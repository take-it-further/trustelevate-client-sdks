import * as crypto from "crypto";
import * as fnv from "@sindresorhus/fnv1a";
import {G1Consent, G1Source, G1Token, SourceType} from "./protocol";


export class G1TokeBuilder {
  private contacts: string[];
  private day: number;
  private month: number;
  private year: number;
  private name: string;
  // @ts-ignore
  private subjects: Map<string, Date>;
  private readonly updated: Date

  constructor(private defaultIntlCode: string) {
    this.contacts = [];
    // @ts-ignore
    this.subjects = new Map<string, Date>();
    this.updated = new Date();
  }

  addConsent(subject: string, requestTime: Date) {
    if (subject) {
      this.subjects.set(subject, requestTime)
    }

    return this;
  }

  addContacts(...contacts: string[]) {
    for (let contact in contacts) {
      let normContact = G1TokeBuilder.normalizeContact(this.defaultIntlCode, contact);
      if (normContact) {
        this.contacts.push(normContact);
      }
    }

    return this;
  }

  setName(name: string) {
    if (name) {
      this.name = name.trim();
    }
  }

  setDateOfBirth(date: string) {
    let normDate = date ? date.trim() : undefined;
    if (normDate) {
      let parts = normDate.split(/\.-/);
      if (parts.length != 3) {
        throw Error("Invalid date. Should match pattern: dd-MM-yyyy");
      }

      this.day = parseInt(parts[0]);
      this.month = parseInt(parts[1]);
      this.year = parseInt(parts[2]);
    }

    return this;
  }

  // @ts-ignore
  getTokens(sourceType: SourceType): Map<string, G1Token[]> {
    let result = new Map<string, G1Token[]>();

    for (let contact in this.contacts) {
      let anchorHash = G1TokeBuilder.anchorHash(contact);
      result.set(anchorHash, []);

      // fill in consents
      const consents: G1Consent[] = [];
      this.subjects.forEach((value, key) => {
        consents.push({subject: key, requestTime: value});
      });

      if (this.name) {
        let rootHash = this.g1RootHash(anchorHash);
        let token: G1Token = {hash: G1TokeBuilder.g1(rootHash + this.g1fuzzyHash(this.name)), score: 2, g1Consent: consents};
        if (sourceType != "NONE") {
          token.g1Source = [];
          token.g1Source.push({type: sourceType, updateTime: this.updated});
        }

        result.get(anchorHash).push(token);
      }

      if (this.day > 0 && this.month > 0 && this.year > 0) {
        let rootHash = this.g1RootHash(`${anchorHash}${this.day}${this.month}${this.year}`);
        let token: G1Token = {score: 3, hash: G1TokeBuilder.g1(rootHash), g1Consent: consents};
        if (sourceType != "NONE") {
          token.g1Source = [];
          token.g1Source.push({type: sourceType, updateTime: this.updated});
        }

        result.get(anchorHash).push(token);

        if (this.name) {
          let token: G1Token = {
            score: 5,
            hash: G1TokeBuilder.g1(rootHash + this.g1fuzzyHash(this.name)),
            g1Consent: consents
          }

          if (sourceType != "NONE") {
            token.g1Source = [];
            token.g1Source.push({type: sourceType, updateTime: this.updated});
          }

          result.get(anchorHash).push(token);
        }
      }

      return result;
    }
  }

  private static normalizeContact(defaultIntlCode: string, contact: string): string {
    let normContact = contact ? contact.trim() : "";

    if (normContact.indexOf("@") < 0) {
      let tmp = normContact
        .replace(" ", "")
        .replace("(", "")
        .replace(")", "")
        .replace("+", "00");

      if (!tmp.startsWith("00")) {
        normContact = defaultIntlCode + (tmp.indexOf("0") == 0 ? tmp.slice(1) : tmp);
      }
    }

    return normContact;
  }

  private static anchorHash(contact: string): string {
    const hash = crypto.createHash("sha256")
      .update(contact)
      .digest('hex');

    return `g1:${hash}`;
  }

  private g1RootHash(anchor: string): number {
    let hash = crypto.createHash("sha256")
      .update(anchor.trim())
      .digest('hex');

    // TODO(aleksey): find the solution for getting 'uint64'
    return BigInt(fnv(hash)) << 32;
  }

  // TODO(aleksey): implement
  private g1fuzzyHash(input: string): number {
    for (let part in input.split(" ")) {
      let normal = part.trim().toLowerCase();

    }

    return 0;
  }

  private static g1(hash: number): string {
    return hash.toString(16);
  }

}
