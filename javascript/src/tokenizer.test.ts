import {G2TokenBuilder} from "./tokenizer";

import * as mocha from 'mocha';
import * as chai from 'chai';
import * as fnv from "./fnv1a"

const expect = chai.expect;

const defaultIntlCode = "0044"

describe('G2 Token Builder', () => {

    it('should normalize contact precisely', () => {
        expect(G2TokenBuilder.normalizeContact(defaultIntlCode, " 01632 3380011")).to.equal('004416323380011')
        expect(G2TokenBuilder.normalizeContact(defaultIntlCode, " +44 1632 3380011")).to.equal('004416323380011')
        expect(G2TokenBuilder.normalizeContact(defaultIntlCode, " +44 (0) 1632 3380011")).to.equal('004416323380011')
        expect(G2TokenBuilder.normalizeContact(defaultIntlCode,  " 01632 811902")).to.equal('00441632811902')
    })


    it('should generate precise g2 anchor hash', () => {
        const b1 = new G2TokenBuilder("0044")
        b1.addContacts("00447333452934")
        expect(b1.build()[0].anchor).to.equal('g2:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d')
        const b2 = new G2TokenBuilder("0044")
        b2.addContacts("+447333452934")
        expect(b2.build()[0].anchor).to.equal('g2:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d')
        expect(b2.build()[0].anchor).to.equal('g2:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d')
    })

    it('should generate precise fnv1a hash ', () => {
        expect(fnv.fnv1a(Buffer.from("🦄🌈"))).to.equal(2868248295)
    })

    it('should generate precise sha256 hash ', () => {
        expect(G2TokenBuilder.sha256("🦄🌈").toString("hex")).to.equal("4d38e6491a04268a09eb9c0e0523d826d6b5387f7db16845d8dce4855f3bd0c0")
    })

    it('should generate precise g1 root ', () => {
        expect(G2TokenBuilder.g1Root("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d")).to.equal(518734356)
    })

    it('should generate precise g1 fuzzy hash', () => {
        expect(G2TokenBuilder.g1fuzzyHash("Elsie Allen")).to.equal(17692386)
    })

    it('should generate precise g1 token', () => {
        expect(G2TokenBuilder.g1(518734356, 17692386)).to.equal("1eeb4214010df6e2")
    })

    it('should generate precise hash for dummy record', () => {
        let consentDate = new Date();
        const b = new G2TokenBuilder(defaultIntlCode)
            .setName("Elsie Allen")
            .setDateOfBirth(new Date("5.5.2009"))
            .addContacts("07333452934", "hello@example.com")
            .addConsent("Zonk", consentDate);
        const data = b.build()
        expect(data.length).to.equal(2);
        expect(data[0].anchor).to.equal("g2:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d");
        expect(data[0].g2token[0].hash).to.equal("00000000010df6e2");
        expect(data[0].g2token[0].score).to.equal(2);
        expect(data[0].g2token[0].g1consent[0].subject).to.equal("Zonk");
        expect(data[0].g2token[0].g1consent[0].request_time).to.equal(consentDate);

        expect(data[0].g2token[1].hash).to.equal("01e7149600000000");
        expect(data[0].g2token[1].score).to.equal(3);
        expect(data[0].g2token[1].g1consent[0].subject).to.equal("Zonk");
        expect(data[0].g2token[1].g1consent[0].request_time).to.equal(consentDate);

        expect(data[0].g2token[2].hash).to.equal("01e71496010df6e2");
        expect(data[0].g2token[2].score).to.equal(5);
        expect(data[0].g2token[2].g1consent[0].subject).to.equal("Zonk");
        expect(data[0].g2token[2].g1consent[0].request_time).to.equal(consentDate);
    })

})
