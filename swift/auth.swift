import Foundation
import CommonCrypto

extension StringProtocol {
    var hexa: [UInt8] {
        var startIndex = self.startIndex
        return stride(from: 0, to: count, by: 2).compactMap { _ in
            let endIndex = index(startIndex, offsetBy: 2, limitedBy: self.endIndex) ?? self.endIndex
            defer { startIndex = endIndex }
            return UInt8(self[startIndex..<endIndex], radix: 16)
        }
    }
}

func timeBasedHash(path: String, salt: String, offset: Int64 = 0) -> String {
    let ts = (Int64(floor(Date().timeIntervalSince1970 / 60)) + offset) * 60
    let tsendian = withUnsafeBytes(of: ts.bigEndian) { Array($0) }
    let raw = salt.hexa + tsendian + path.data(using: .utf8)
    var digest = [UInt8](repeating: 0, count:Int(CC_SHA256_DIGEST_LENGTH))
    CC_SHA256(raw, UInt32(raw.count), &digest)
    var sha256signature = ""
    for byte in digest {
        sha256signature += String(format:"%02X", UInt8(byte))
    }
    return sha256signature
}