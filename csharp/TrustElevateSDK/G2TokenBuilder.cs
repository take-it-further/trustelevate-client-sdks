namespace TrustElevateSDK
{
    using System;
    using System.Collections.Generic;
    using System.Security.Cryptography;
    using System.Text;

    public class G2TokenBuilder
    {
        private string defaultIntlCode;
        private List<string> contacts = new List<string>();
        private int day;
        private int month;
        private int year;
        private string name;
        private bool self;
        private Dictionary<string, DateTime> subjects = new Dictionary<string, DateTime>();

        public G2TokenBuilder(string defaultIntlCode)
        {
            this.defaultIntlCode = defaultIntlCode;
        }



        public G2TokenBuilder AddConsent(string subject, DateTime requestTime)
        {
            if (!string.IsNullOrEmpty(subject))
            {
                this.subjects[subject] = requestTime;
            }

            return this;
        }

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

        public G2TokenBuilder SetName(string name)
        {
            if (!string.IsNullOrEmpty(name))
            {
                this.name = name.Trim();
            }
            return this;
        }

        public G2TokenBuilder SetDateOfBirth(DateTime date)
        {
            this.day = date.Day;
            this.month = date.Month;
            this.year = date.Year;
            return this;
        }

        public G2TokenBuilder SetSelf(bool self)
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
#if NET8_0_OR_GREATER
                foreach (var (key, value) in subjects)
                {
                    consents.Add(new G1Consent("", key, value, ""));
                }


#else
                foreach (var s in subjects)
                {
                    consents.Add(new G1Consent("", s.Key, s.Value, ""));
                }
#endif

                var tokens = new List<G2Token>();

                if (!string.IsNullOrEmpty(name))
                {
                    var t = G1(0, G1FuzzyHash(name));
                    tokens.Add(new G2Token(t, 2, self, consents));
                }

                if (day > 0 && month > 0 && year > 0)
                {
                    var dateString = $"{day:D2}{month:D2}{year}";
                    var root = G1Root(contact + dateString);
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
#if NET8_0_OR_GREATER
                    normContact = defaultIntlCode + (normContact.StartsWith("0") ? normContact[1..] : normContact);
#else
                    normContact = defaultIntlCode + (normContact.StartsWith("0") ? normContact.Substring(1) : normContact);
#endif
                }
            }

            return normContact;
        }

        public static string AnchorHash(string contact)
        {
#if NET8_0_OR_GREATER
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(contact));
            return $"g2:{Convert.ToHexString(hash).ToLower()}";
#else
            using (var sha256 = SHA256.Create())
            {
                byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(contact));
                return $"g2:{BitConverter.ToString(hash).Replace("-", "").ToLower()}";
            }
#endif
        }

        public static byte[] Sha256(string input)
        {
#if NET8_0_OR_GREATER
            return SHA256.HashData(Encoding.UTF8.GetBytes(input.Trim()));
#else
            using (var sha256 = SHA256.Create())
            {
                return sha256.ComputeHash(Encoding.UTF8.GetBytes(input.Trim()));
            }
#endif
        }

        public static uint G1Root(string input)
        {
            var hash = Sha256(input);
            return Fnv1a.Hash(hash);
        }

        public static int G1FuzzyHash(string input)
        {
            int result = 0;
            foreach (var part in input.Split(' '))
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
            return root.ToString("X8").ToLower() + leaf.ToString("X8").ToLower();
        }
    }

    public class G1Consent
    {
        public string Id;
        public string Subject;
        public DateTime RequestTime;
        public string Status;
        public G1Consent(string id, string subject, DateTime requestTime, string status)
        {
            this.Id = id;
            this.Subject = subject;
            this.RequestTime = requestTime;
            this.Status = status;

        }
    }

    public class G1Source
    {
        public readonly string Type;
        public readonly DateTime UpdateTime;

        public G1Source(string type, DateTime updateTime)
        {
            this.Type = type;
            this.UpdateTime = updateTime;
        }
    }

    public class G2Token
    {
        public string Hash;
        public bool Self;
        public double Score; // Deprecated. use BestScore.
        public int Matching;
        public double BestScore;
        public List<G1Consent> G1Consent = new List<G1Consent>();
        public List<G1Source> G1Source = new List<G1Source>();

        public G2Token(string hash, double Score, bool self, List<G1Consent> consent)
        {
            this.Hash = hash;
            this.Score = Score;
            this.Self = self;
            this.G1Consent = consent;

        }
    }

    public class Anchor
    {
        public string Hash { get; set; }
        public bool Verified { get; set; } = true;
#if NET8_0_OR_GREATER
        public List<G2Token> G2Token { get; set; } = [];
#else
        public List<G2Token> G2Token { get; set; } = new List<G2Token>();
#endif
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

}
