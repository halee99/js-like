// const log = (...args) => {
//   console.group('log:')
//   args.forEach(e => console.log(e))
//   console.groupEnd()
// }

const log = console.log.bind(console)

// 判断单字符是否为数字
const isDigit = (k: string): boolean => {
    if (k.length !== 1) {
        return false
    }
    let c = k.charCodeAt(0)
    // '0' 48
    // '9' 57
    return 47 < c && c < 58
}

// 判断单字符是否为字母
const isLetter = (k: string): boolean => {
    if (k.length !== 1) {
        return false
    }
    let c = k.charCodeAt(0)
    // 'A' 65
    // 'z' 122
    return 64 < c && c < 123
}

const isBlank = (k: string): boolean => {
    return k === ' ' || k === '\t' || k === '\n'
}



export {
    log,
    isDigit,
    isLetter,
    isBlank,
}
