import {G1TokenBuilder} from "./tokenizer";

import * as mocha from 'mocha';
import * as chai from 'chai';
import * as fnv from "./fnv1a"

const expect = chai.expect;

const defaultIntlCode = "0044"

describe('G1 Token Builder', () => {

    it('should normalize contact precisely', () => {
        expect(G1TokenBuilder.normalizeContact(defaultIntlCode, " 01632 3380011")).to.equal('004416323380011')
        expect(G1TokenBuilder.normalizeContact(defaultIntlCode,  " 01632 811902")).to.equal('00441632811902')
    })

    it('should generate precise g1 anchor hash', () => {
        expect(G1TokenBuilder.anchorHash("00447333452934")).to.equal('g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d')
    })

    it('should generate precise fnv1a hash ', () => {
        expect(fnv.fnv1a(new Buffer("🦄🌈"))).to.equal(2868248295)
    })

    it('should generate precise sha256 hash ', () => {
        expect(G1TokenBuilder.sha256("🦄🌈").toString("hex")).to.equal("4d38e6491a04268a09eb9c0e0523d826d6b5387f7db16845d8dce4855f3bd0c0")
    })

    it('should generate precise g1 root ', () => {
        expect(G1TokenBuilder.g1Root("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d")).to.equal(518734356)
    })

    // it('should generate precise g1 root hash', () => {
    //     expect(G1TokenBuilder.g1RootHash("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d")).to.equal(2227947094331621376)
    // })

    it('should generate precise g1 fuzzy hash', () => {
        expect(G1TokenBuilder.g1fuzzyHash("Elsie Allen")).to.equal(17692386)
    })

    it('should generate precise g1 token', () => {
        expect(G1TokenBuilder.g1(518734356, 17692386)).to.equal("1eeb4214010df6e2")
    })

    it('should generate precise hash for dummy record', () => {
        const b = new G1TokenBuilder(defaultIntlCode)
            .setName("Elsie Allen")
            .setDateOfBirth("05.05.2009")
            .addContacts("07333452934");
        const data = b.getData()
        expect(data[0].anchor).to.equal("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d");
        expect(data[0].g1Token[0].score).to.equal(2);
        expect(data[0].g1Token[0].hash).to.equal("1eeb4214010df6e2");
        expect(data[0].g1Token[1].score).to.equal(3);
        expect(data[0].g1Token[1].hash).to.equal("193cbd7700000000");
        expect(data[0].g1Token[2].score).to.equal(5);
        expect(data[0].g1Token[2].hash).to.equal("193cbd77010df6e2");
        console.log(data)
    })
    //.addConsent("Zonk", time.Unix(0, 0))
    //.addConsent(subject, new Date())
})