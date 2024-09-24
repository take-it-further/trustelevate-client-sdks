# TrustElev8 client library for C#

## Installing the NuGet Package

- Use NuGet Package Manager or .NET CLI to install the TrustElevateSDK package:
  ```sh
  dotnet add package TrustElevateSDK
-
- Implement the G2TokenBuilder to start using hashing

- Below are the details for teh G2TokenBuilder what are the method it comprises of.

## Methods in G2TokenBuilder:


## AddConsent

    ```csharp
    public G2TokenBuilder AddConsent(string subject, DateTime requestTime)
    {
        if (!string.IsNullOrEmpty(subject))
        {
            subjects[subject] = requestTime;
        }
        return this;
    }
- Purpose: Adds a consent entry with a specified subject and request time to the G2TokenBuilder.
- Explanation: If the subject is not empty, this method adds the subject and its corresponding requestTime to the subjects dictionary. This allows tracking of consent requests.
## AddContacts
    ```csharp
    public G2TokenBuilder AddContacts(params string[] contacts)
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
- Purpose: Adds one or more contacts to the G2TokenBuilder after normalizing them.
- Explanation: This method iterates through the provided contacts, normalizes each contact using NormalizeContact, and adds the normalized contact to the
  contacts list.
## SetName
    ```csharp
    public G2TokenBuilder SetName(string name)
    {
        if (!string.IsNullOrEmpty(name))
        {
            this.name = name.Trim();
        }
        return this;
    }
- Purpose: Sets the name for the G1 token.
- Explanation: If the name is not empty, this method trims any whitespace and assigns it to the name field of the builder.
## SetDateOfBirth
    ```csharp
    public G2TokenBuilder SetDateOfBirth(DateTime date)
    {
        day = date.Day;
        month = date.Month;
        year = date.Year;
        return this;
    }
- Purpose: Sets the date of birth for the G1 token.
- Explanation: This method extracts the day, month, and year from the provided date and assigns them to the respective fields.
## SetSelf
    ```csharp
    public G2TokenBuilder SetSelf(bool self)
    {
        this.self = self;
        return this;
    }
- Purpose: Indicates whether the token is for the user themselves.
- Explanation: This method sets the self field to indicate if the token is for the user.
## Build
    ```csharp
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
            var tokens = new List<G2Token>();
            if (!string.IsNullOrEmpty(name))
            {
                var root = G1Root(anchorHash);
                var t = G1(root, G1FuzzyHash(name));
                tokens.Add(new G2Token(t, 2, self, consents));
            }
            if (day > 0 && month > 0 && year > 0)
            {
                var dateString = $"{day:D2}{month:D2}{year}";
                var root = G1Root(anchorHash + dateString);
                tokens.Add(new G2Token(G1(root, 0), 3, self, consents));
                if (!string.IsNullOrEmpty(name))
                {
                    tokens.Add(new G2Token(G1(root, G1FuzzyHash(name)), 5, self, consents));
                }
            }
            result.Add(new Anchor { Hash = anchorHash, Verified = false, G2Token = tokens });
        }
        return result;
    }

- Purpose: Builds and returns a list of Anchor objects containing G1 tokens.
- Explanation:
  Iterates through the contacts list.
  For each contact, it generates an anchorHash using the AnchorHash method.
  Creates a list of consents from the subjects dictionary.
  Initializes a list of G2Token.
  If a name is set, it adds a token with the name's fuzzy hash.
  If day, month, and year are set, it adds a token with the date of birth.
  Adds the tokens to an Anchor object and appends it to the result list.
  Finally, returns the list of Anchor objects.
## Helper Methods
## NormalizeContact
    ```csharp
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
- Purpose: Normalizes a contact string by removing spaces, special characters, and adding the international code if necessary.
## AnchorHash
    ```csharp
    public static string AnchorHash(string contact)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(contact));
        return $"g1:{Convert.ToHexString(hash).ToLower()}";
    }
- Purpose: Generates a SHA-256 hash for the given contact.
## Sha256
    ```csharp
    public static byte[] Sha256(string input)
    {
        return SHA256.HashData(Encoding.UTF8.GetBytes(input.Trim()));
    }
- Purpose: Generates a SHA-256 hash for the given input string.
## G1Root
    ```csharp
    public static uint G1Root(string input)
    {
        var hash = Sha256(input);
        return Fnv1a.Hash(hash);
    }
- Purpose: Generates an FNV-1a hash for the given input.
## G1FuzzyHash
    ```csharp
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
- Purpose: Generates a fuzzy hash for the given input string.
## G1
    ```csharp
    public static string G1(uint root, int leaf)
    {
        return root.ToString("X8") + leaf.ToString("X8");
    }
- Purpose: Generates a G1 token from the root and leaf values.
- Returns: string: The generated G1 token as a string.
## G1Consent
    ```csharp
    public class G1Consent(string id, string subject, DateTime requestTime, string status)
    {
      public string Id { get; } = id;
      public string Subject { get; } = subject;
      public DateTime RequestTime { get; } = requestTime;
      public string Status { get; } = status;
    }
- Purpose: Represents a consent record with an ID, subject, request time, and status.
## G1Source
    ```csharp
    public class G1Source(string type, DateTime updateTime)
    {
      public readonly string Type = type;
      public readonly DateTime UpdateTime = updateTime;
    }
- Purpose: Represents the source of a G1 token with a type and update time.
## G2Token
    ```csharp
    public class G2Token(string hash, double score, bool self, List<G1Consent> consent)
    {
      public readonly string Hash = hash;
      public readonly bool Self = self;
      public readonly double Score = score; // Deprecated. use BestScore.
      public readonly int Matching;
      public readonly double BestScore;
      public readonly List<G1Consent> G1Consent = consent;
      public readonly List<G1Source> G1Source = [];
    }
- Purpose: Represents a G1 token with a hash, score, self indicator, consents, and sources.
  G1Consent (List<G1Consent>): The list of consents associated with the token.
  G1Source (List<G1Source>): The list of sources associated with the token.
## Anchor
    ```csharp
    public class Anchor
    {
      public string? Hash { get; set; }
      public bool Verified { get; set; } = true;
      public List<G2Token> G2Token { get; set; } = [];
    }
- Purpose: Represents an anchor point for G1 tokens, indicating their hash and verification status.
- G2Token (List<G2Token>): The list of G1 tokens associated with the anchor.
## Fnv1a
    ```csharp
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
- Purpose: Provides a static method to compute FNV-1a hash values.
- These are the methods you can use to get started with the TrustElevateSDK.
