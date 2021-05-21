export function fnv1a(input: Buffer) {
    let hash = Number(2166136261)
    for (let i = 0; i < input.length; i++) {
        let characterCode = input[i]
        hash ^= characterCode;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0
}
