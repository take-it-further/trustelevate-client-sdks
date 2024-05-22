using System.Text;
using TrustElevateSDK;

namespace TrustElevateSDKTests;

public class TokenizerTests
{
    [Fact]
    public void Normalize()
    {
        Assert.Equal("004416323380011", G1TokenBuilder.NormalizeContact("0044", " 01632 3380011"));
        Assert.Equal("004416323380011", G1TokenBuilder.NormalizeContact("0044", " +44 1632 3380011"));
        Assert.Equal("004416323380011", G1TokenBuilder.NormalizeContact("0044", " +44 (0) 1632 3380011"));
        Assert.Equal("00441632811902", G1TokenBuilder.NormalizeContact("0044", " 01632 811902"));
    }

    [Fact]
    public void GenerateAnchorHash()
    {
        var b1 = new G1TokenBuilder("0044").AddContacts("00447333452934");
        Assert.Equal("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d", b1.Build().First().Hash);

        var b2 = new G1TokenBuilder("0044").AddContacts("+447333452934");
        Assert.Equal("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d", b2.Build().First().Hash);
        Assert.Equal("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d", b2.Build().First().Hash);
    }

    [Fact]
    public void Generatefnv1aHash()
    {
        Assert.Equal("2868248295", Fnv1a.Hash(Encoding.UTF8.GetBytes("🦄🌈")).ToString());
    }

    [Fact]
    public void GenerateSha256Hash()
    {
        Assert.Equal("4d38e6491a04268a09eb9c0e0523d826d6b5387f7db16845d8dce4855f3bd0c0", Convert.ToHexString(G1TokenBuilder.Sha256("🦄🌈")).ToLower());
    }

    [Fact]
    public void GenerateG1Root()
    {
        Assert.Equal("518734356", G1TokenBuilder.G1Root("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d").ToString());
    }

    [Fact]
    public void GenerateG1FuzzyHash()
    {
        Assert.Equal("17692386", G1TokenBuilder.G1FuzzyHash("Elsie Allen").ToString());
    }

    [Fact]
    public void GenerateG1Token()
    {
        Assert.Equal("1EEB4214010DF6E2", G1TokenBuilder.G1(518734356, 17692386));
    }

    [Fact]
    public void GenerateHashForDummyRecord()
    {
        var consentDate = new DateTime();
        var b = new G1TokenBuilder("0044")
            .SetName("Elsie Allen")
            .SetDateOfBirth(DateTime.ParseExact("2009-05-05", "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture))
            .AddContacts("07333452934", "hello@example.com")
            .AddConsent("Zonk", consentDate);

        var data = b.Build();

        Assert.Equal(2, data.Count);

        Assert.Equal("g1:07eb5de568abbde396ec20264c88ac5fd9ae7183c5ecd5ce94ae48b5e66f212d", data.First().Hash);
        Assert.Equal("1EEB4214010DF6E2", data.First().G1Token.First().Hash);
        Assert.Equal("2", data.First().G1Token.First().Score.ToString());
        Assert.Equal("Zonk", data.First().G1Token.First().G1Consent.First().Subject);
        Assert.Equal(consentDate, data.First().G1Token.First().G1Consent.First().RequestTime);

        Assert.Equal("193CBD7700000000", data.First().G1Token.ElementAt(1).Hash);
        Assert.Equal("3", data.First().G1Token.ElementAt(1).Score.ToString());
        Assert.Equal("Zonk", data.First().G1Token.ElementAt(1).G1Consent.First().Subject);
        Assert.Equal(consentDate, data.First().G1Token.ElementAt(1).G1Consent.First().RequestTime);

        Assert.Equal("193CBD77010DF6E2", data.First().G1Token.ElementAt(2).Hash);
        Assert.Equal("5", data.First().G1Token.ElementAt(2).Score.ToString());
        Assert.Equal("Zonk", data.First().G1Token.ElementAt(2).G1Consent.First().Subject);
        Assert.Equal(consentDate, data.First().G1Token.ElementAt(2).G1Consent.First().RequestTime);
    }
}