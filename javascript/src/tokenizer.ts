import * as crypto from "crypto";
import * as fnv from "./fnv1a"
import {Anchor, G1Consent, G1Token} from "./protocol";

export class G1TokenBuilder {
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

    for (let i =0; i < contacts.length; i++) {
      let normContact = G1TokenBuilder.normalizeContact(this.defaultIntlCode, contacts[i]);
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
      let parts = normDate.split(/[.-]/);
      if (parts.length != 3) {
        throw Error("Invalid date. Should match pattern: dd-MM-yyyy");
      }

      this.day = parseInt(parts[0]);
      this.month = parseInt(parts[1]);
      this.year = parseInt(parts[2]);
    }

    return this;
  }

  build(): Anchor[] {
    const result: Anchor[] = [];

    this.contacts.forEach((contact) => {
      let anchorHash = G1TokenBuilder.anchorHash(contact);
      // fill in consents
      const consents: G1Consent[] = [];
      this.subjects.forEach((value, key) => {
        consents.push({subject: key, requestTime: value});
      });

      const tokens: G1Token[] = [];
      if (this.name) {
        let root = G1TokenBuilder.g1Root(anchorHash);
        const t = G1TokenBuilder.g1(root, G1TokenBuilder.g1fuzzyHash(this.name))
        tokens.push(new G1Token(t, consents));
      }

      const padZero = (val, size) => String(val).padStart(size, '0');

      if (this.day > 0 && this.month > 0 && this.year > 0) {
        let root =G1TokenBuilder.g1Root(`${anchorHash}${padZero(this.day,2)}${padZero(this.month, 2)}${this.year}`);
        tokens.push(new G1Token(G1TokenBuilder.g1(root, 0), consents));

        if (this.name) {
          tokens.push(new G1Token(G1TokenBuilder.g1(root, G1TokenBuilder.g1fuzzyHash(this.name)), consents));
        }
      }
      result.push({anchor: anchorHash, g1Token: tokens})
    })
    return result;

  }

  static normalizeContact(defaultIntlCode: string, contact: string): string {
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

  static anchorHash(contact: string): string {
    const hash = crypto.createHash("sha256")
      .update(contact)
      .digest('hex');

    return `g1:${hash}`;
  }

  static sha256(input: string): Buffer {
    return crypto.createHash("sha256")
        .update(input.trim())
        .digest()
  }

  static g1Root(input: string): number {
    let hash = G1TokenBuilder.sha256(input)
    return fnv.fnv1a(hash)
  }

  static g1fuzzyHash(input: string): number {
    let result = 0;

    for (let part of input.split(" ")) {
      let normal = part.trim().toLowerCase();
      let weight = 65535;
      for (let c of normal) {
        const rune = c.codePointAt(0);
        const piece = rune * weight;
        result += piece
        weight = Math.floor(weight / 4 )
      }
    }

    return result;
  }

  static g1(root: number, leaf: number): string {
    return root.toString(16).padStart(8, '0') + leaf.toString(16).padStart(8, '0');
  }
}
