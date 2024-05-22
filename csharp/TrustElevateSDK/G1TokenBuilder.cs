namespace TrustElevateSDK;

using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

public class G1TokenBuilder(string defaultIntlCode)
{
  private readonly string defaultIntlCode = defaultIntlCode;
  private readonly List<string> contacts = [];
  private int day;
  private int month;
  private int year;
  private string? name;
  private bool self;
  private readonly Dictionary<string, DateTime> subjects = [];

  public G1TokenBuilder AddConsent(string subject, DateTime requestTime)
  {
    if (!string.IsNullOrEmpty(subject))
    {
      subjects[subject] = requestTime;
    }

    return this;
  }

  public G1TokenBuilder AddContacts(params string[] contacts)
  {
    foreach (var contact in contacts)
    {
      var normContact = NormalizeContact(defaultIntlCode, contact);
      if (normContact != null)
      {
        this.contacts.Add(normContact);
      }
    }

    return this;
  }

  public G1TokenBuilder SetName(string name)
  {
    if (!string.IsNullOrEmpty(name))
    {
      this.name = name.Trim();
    }
    return this;
  }

  public G1TokenBuilder SetDateOfBirth(DateTime date)
  {
    day = date.Day;
    month = date.Month;
    year = date.Year;
    return this;
  }

  public G1TokenBuilder SetSelf(bool self)
  {
    this.self = self;
    return this;
  }

  public List<Anchor> Build()
  {
    var result = new List<Anchor>();

    foreach (var contact in contacts)
    {
      var anchorHash = AnchorHash(contact);
      var consents = new List<G1Consent>();
      foreach (var (key, value) in subjects)
      {
        consents.Add(new G1Consent("", key, value, ""));
      }

      var tokens = new List<G1Token>();
      if (!string.IsNullOrEmpty(name))
      {
        var root = G1Root(anchorHash);
        var t = G1(root, G1FuzzyHash(name));
        tokens.Add(new G1Token(t, 2, self, consents));
      }

      if (day > 0 && month > 0 && year > 0)
      {
        var dateString = $"{day:D2}{month:D2}{year}";
        var root = G1Root(anchorHash + dateString);
        tokens.Add(new G1Token(G1(root, 0), 3, self, consents));

        if (!string.IsNullOrEmpty(name))
        {
          tokens.Add(new G1Token(G1(root, G1FuzzyHash(name)), 5, self, consents));
        }
      }

      result.Add(new Anchor { Hash = anchorHash, Verified = false, G1Token = tokens });
    }

    return result;
  }

  public static string NormalizeContact(string defaultIntlCode, string contact)
  {
    var normContact = contact?.Trim() ?? "";

    if (normContact.IndexOf('@') < 0)
    {
      normContact = normContact.Replace(" ", "");
      normContact = normContact.Replace("(0)", "");
      normContact = normContact.Replace("(", "");
      normContact = normContact.Replace(")", "");
      normContact = normContact.Replace("+", "00");
      if (!normContact.StartsWith("00"))
      {
        normContact = defaultIntlCode + (normContact.StartsWith('0') ? normContact[1..] : normContact);
      }
    }

    return normContact;
  }

  public static string AnchorHash(string contact)
  {
    var hash = SHA256.HashData(Encoding.UTF8.GetBytes(contact));
    return $"g1:{Convert.ToHexString(hash).ToLower()}";
  }

  public static byte[] Sha256(string input)
  {
    return SHA256.HashData(Encoding.UTF8.GetBytes(input.Trim()));
  }

  public static uint G1Root(string input)
  {
    var hash = Sha256(input);
    return Fnv1a.Hash(hash);
  }

  public static int G1FuzzyHash(string input)
  {
    int result = 0;
    foreach (var part in input.Split(" "))
    {
      var normal = part.Trim().ToLower();
      var weight = 65535;
      foreach (var c in normal)
      {
        var rune = (int)c;
        var piece = rune * weight;
        result += piece;
        weight = (int)Math.Floor(weight / 4.0);
      }
    }
    return result;
  }

  public static string G1(uint root, int leaf)
  {
    return root.ToString("X8") + leaf.ToString("X8");
  }
}

public class G1Consent(string id, string subject, DateTime requestTime, string status)
{
  public string Id { get; } = id;
  public string Subject { get; } = subject;
  public DateTime RequestTime { get; } = requestTime;
  public string Status { get; } = status;
}

public class G1Source(string type, DateTime updateTime)
{
  public readonly string Type = type;
  public readonly DateTime UpdateTime = updateTime;
}

public class G1Token(string hash, double score, bool self, List<G1Consent> consent)
{
  public readonly string Hash = hash;
  public readonly bool Self = self;
  public readonly double Score = score; // Deprecated. use BestScore.
  public readonly int Matching;
  public readonly double BestScore;
  public readonly List<G1Consent> G1Consent = consent;
  public readonly List<G1Source> G1Source = [];
}

public class Anchor
{
  public string? Hash { get; set; }
  public bool Verified { get; set; } = true;
  public List<G1Token> G1Token { get; set; } = [];
}

public class Fnv1a
{
  private const uint FNV_OFFSET_BASIS = 2166136261;

  public static uint Hash(byte[] data)
  {
    uint hash = FNV_OFFSET_BASIS;
    foreach (byte characterCode in data)
    {
      hash ^= characterCode;
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash;
  }
}

