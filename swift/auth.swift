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

extension Sequence where Iterator.Element == UInt8 {

    var hex: String {
        let format = "%02hhX"
        return map { String(format: format, $0) }.joined()
    }
    func base64() -> String {
        let bytes = self as! Array<UInt8>
        let data = NSData(bytes: bytes, length: bytes.count)
        return data.base64EncodedString()
    }
}

func timeBasedHash(path: String, salt: String, offset: Int64 = 0) -> String {
    let ts = (Int64(floor(Date().timeIntervalSince1970 / 60)) + offset) * 60
    let tsendian = withUnsafeBytes(of: ts.bigEndian) { Array($0) }
    let raw = salt.hexa + tsendian + path.bytes
    var digest = [UInt8](repeating: 0, count:Int(CC_SHA256_DIGEST_LENGTH))
    CC_SHA256(raw, UInt32(raw.count), &digest)
    var sha256signature = ""
    for byte in digest {
        sha256signature += String(format:"%02X", UInt8(byte))
    }
    return sha256signature
}
