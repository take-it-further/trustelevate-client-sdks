import * as crypto from "webcrypto";
import * as fnv from "./fnv1a"
import {Anchor, G1Consent, G2Token} from "./protocol";

export class G2TokenBuilder {
  private contacts: string[];
  private day: number;
  private month: number;
  private year: number;
  private name: string;
  private self: boolean;
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
      let normContact = G2TokenBuilder.normalizeContact(this.defaultIntlCode, contacts[i]);
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

  setDateOfBirth(date: Date) {
    const d = new Date(date)
    this.day = d.getDate();
    this.month = d.getMonth() + 1;
    this.year = d.getFullYear();
    return this;
  }

  setSelf(self: boolean) {
    this.self = self
    return this;
  }

  build(): Anchor[] {
    const result: Anchor[] = [];

    this.contacts.forEach((contact) => {
      let anchorHash = G2TokenBuilder.anchorHash(contact);
      // fill in consents
      const consents: G1Consent[] = [];
      this.subjects.forEach((value, key) => {
        consents.push(new G1Consent("", key, value, ""));
      });

      const tokens: G2Token[] = [];
      if (this.name) {
        const t = G2TokenBuilder.g1(0, G2TokenBuilder.g1fuzzyHash(this.name))
        tokens.push(new G2Token(t, 2, this.self, consents));
      }

      const padZero = (val, size) => String(val).padStart(size, '0');

      if (this.day > 0 && this.month > 0 && this.year > 0) {
        let root =G2TokenBuilder.g1Root(`${contact}${padZero(this.day,2)}${padZero(this.month, 2)}${this.year}`);
        tokens.push(new G2Token(G2TokenBuilder.g1(root, 0), 3, this.self, consents));

        if (this.name) {
          tokens.push(new G2Token(G2TokenBuilder.g1(root, G2TokenBuilder.g1fuzzyHash(this.name)), 5, this.self, consents));
        }
      }
      result.push({anchor: anchorHash, verified: false, g2token: tokens})
    })
    return result;

  }

  static normalizeContact(defaultIntlCode: string, contact: string): string {
    let normContact = contact ? contact.trim() : "";

    if (normContact.indexOf("@") < 0) {
      normContact = normContact.replace(/\s/gi, "")
      normContact = normContact.replace("(0)", "")
      normContact = normContact.replace(/\(|\)/gi, "")
      normContact = normContact.replace("+", "00");
      if (!normContact.startsWith("00")) {
        normContact = defaultIntlCode + (normContact.indexOf("0") == 0 ? normContact.slice(1) : normContact);
      }
    }

    return normContact;
  }

  static anchorHash(contact: string): string {
    const hash = crypto.createHash("sha256")
      .update(contact)
      .digest('hex');

    return `g2:${hash}`;
  }

  static sha256(input: string): Buffer {
    return crypto.createHash("sha256")
        .update(input.trim())
        .digest()
  }

  static g1Root(input: string): number {
    let hash = G2TokenBuilder.sha256(input)
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
