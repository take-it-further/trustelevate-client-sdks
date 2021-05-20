import * as crypto from "crypto";
import * as fnv from "@sindresorhus/fnv1a";
import {Anchor, G1Claim, G1Consent, G1Source, G1Token, SourceType} from "./protocol";

type RuneVal = {
  rune: number,
  size: number
};

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
    return this;
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

  getData(sourceType: SourceType): Anchor[] {
    const result: Anchor[] = [];
    this.getTokens(sourceType).forEach((value, key) => {
      result.push({anchor: key, g1Token: value});
    })

    return result;
  }

  getClaim(): G1Claim {
    const data = new Map<string, string[]>();

    this.getTokens("DUMMY").forEach((value, key) => {
      const hashes = [];
      value.forEach(v => hashes.push(v.hash))

      data.set(key, hashes);
    })

    return {data: data};
  }


  // @ts-ignore
  getTokens(sourceType: SourceType): Map<string, G1Token[]> {
    let result = new Map<string, G1Token[]>();

    for (let contact of this.contacts) {
      let anchorHash = G1TokeBuilder.anchorHash(contact);
      result.set(anchorHash, []);

      // fill in consents
      const consents: G1Consent[] = [];
      this.subjects.forEach((value, key) => {
        consents.push({subject: key, requestTime: value});
      });

      if (this.name) {
        let rootHash = this.g1RootHash(anchorHash);

        let token: G1Token = new G1Token(
            G1TokeBuilder.g1(rootHash + this.g1fuzzyHash(this.name)),
            2,
            sourceType != "NONE" ? [{type: sourceType, updateTime: this.updated}] : [],
            consents
        ) ;

        result.get(anchorHash).push(token);
      }

      if (this.day > 0 && this.month > 0 && this.year > 0) {
        let rootHash = this.g1RootHash(`${anchorHash}${this.day}${this.month}${this.year}`);

        let token: G1Token = new G1Token(
            G1TokeBuilder.g1(rootHash),
            3,
            sourceType != "NONE" ? [{type: sourceType, updateTime: this.updated}] : [],
            consents
        );

        result.get(anchorHash).push(token);

        if (this.name) {
          let token: G1Token = new G1Token(
              G1TokeBuilder.g1(rootHash + this.g1fuzzyHash(this.name)),
              5,
              sourceType != "NONE" ? [{type: sourceType, updateTime: this.updated}] : [],
              consents
          );

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

    // TODO(Michal): how to get the 'uint64' type here ??
    return BigInt(fnv(hash)) << 32;
  }

  // TODO(Michal): Is this function may work in the JS? It is using uint64 types, that not supported in JS
  private g1fuzzyHash(input: string): number {
    let result = 0;

    for (let part of input.split(" ")) {
      let normal = part.trim().toLowerCase();
      let weight = 65535;
      while (normal.length > 0) {
        const rune = this.decodeRuneInStr(normal);
        normal = normal.slice(rune.size);
        const piece = rune.rune * weight;
        result += piece
        weight = weight / 4
      }
    }

    return 0;
  }

  // TODO (Michal): how to do it in JS????
  private decodeRuneInStr(val: string): RuneVal {
    return {rune: 0, size: 0};
  }

  private static g1(hash: number): string {
    return hash.toString(16);
  }
}
