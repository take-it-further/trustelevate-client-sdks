import {Anchor, G1Claim, SourceType} from "./protocol";
import {G1TokeBuilder} from "./tokenizer";

const defaultIntlCode = "0044"
type Db = {
  anchors: Anchor[],
  match: (claim: G1Claim) => Map<SourceType, number>
}

test("test tokens similarity", () => {
  const db: Db = {
    anchors: [],
    match: claim => {
      const result = new Map<SourceType, number>();
      for (const anchor of db.anchors) {
        const score = match(anchor, claim);
        if (score > 0) {
          anchor.g1Token.forEach(token => {
            token.g1Source?.forEach(source => {
              result.set(source.type, score);
            })
          })
        }
      }
      return result;
    }
  };

  insert(db, "SELF", "Michal Hariš", "18.8.1979", "Lego", "00447983572475", "michal@trustelevate.com");
  insert(db, "DUMMY", "Michal Hariš", "1979-08-18", "Lego", "07983572475", "mharis@bt.com");

  db.anchors.forEach(anchor => console.log(`Anchor: ${anchor.anchor}, Tokens: ${anchor.g1Token}`));

  const totalMatch = db.match(prepareBuilder("Michal Hariš", "18.8.1979", "Lego", "michal@trustelevate.com", "00447983572475").getClaim());
  expect(totalMatch).toEqual({"SELF": 5, "DUMMY": 5});

  const selfOnlyMatch = db.match(prepareBuilder("Michal Hariš", "18.8.1979", "Lego", "michal@trustelevate.com").getClaim());
  expect(selfOnlyMatch).toEqual({"SELF": 5});

  const oneTypoMatch = db.match(prepareBuilder("Michal Harris", "18.8.1979", "Lego", "7983572475").getClaim());
  expect(oneTypoMatch).toEqual({"SELF": 4, "DUMMY": 4});

  const twoTyposMatch = db.match(prepareBuilder("Michael Harris", "18.8.1979", "Lego", "07983572475").getClaim());
  expect(twoTyposMatch).toEqual({"SELF": 4, "DUMMY": 4});

  const noNameMatch = db.match(prepareBuilder("", "18.8.1979", "Lego", "7983572475").getClaim());
  expect(noNameMatch).toEqual({SELF: 3, DUMMY: 3});

  const nameMismatch = db.match(prepareBuilder("Johny Nielsen", "18.8.1979", "Lego", "7983572475").getClaim());
  expect(nameMismatch).toEqual({SELF: 3, DUMMY: 3});

  const noDobMatch = db.match(prepareBuilder("Michal Hariš", "", "Lego", "07983572475").getClaim());
  expect(noDobMatch).toEqual({SELF: 2, DUMMY: 2});

  const dobMismatch = db.match(prepareBuilder("Michal Hariš", "18.8.1989", "michal@trustelevate.com", "07983572475").getClaim());
  expect(dobMismatch).toEqual({SELF: 2, DUMMY: 2});

  const noDobAndTypoMatch = db.match(prepareBuilder("Michael Hariš", "", "Lego", "07983572475").getClaim());
  expect(noDobAndTypoMatch).toEqual({SELF: 1, DUMMY: 1});

  const totalMismatch = db.match(prepareBuilder("Johny Nielsen", "", "07983572475").getClaim());
  expect(totalMismatch).toEqual({});
});

function insert(db: Db, sourceType: SourceType, name: string, dob: string, subject: string, ...contacts: string[]) {
  let data = prepareBuilder(name, dob, subject, ...contacts).getData(sourceType);

  db.anchors.push(...data);
}

function prepareBuilder(name: string, dob: string, subject: string, ...contacts: string[]) {
  return new G1TokeBuilder(defaultIntlCode)
  .addConsent(subject, new Date())
  .setName(name)
  .setDateOfBirth(dob)
  .addContacts(...contacts);
}

function match(anchor: Anchor, claim: G1Claim): number {
  let score = 0;
  for (const entry in claim.data.entries()) {
    if (entry != anchor.anchor) {
      continue;
    }
    for (const token of anchor.g1Token) {
      if (token.score < score) {
        continue;
      }

      for (const hash of claim.data.get(entry)) {
        const tokenScore = token.match(hash);
        if (tokenScore > score) {
          score = tokenScore;
        }
      }
    }

    return score;
  }
}
