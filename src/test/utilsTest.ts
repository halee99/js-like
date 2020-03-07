import {
    log,
    isDigit,
    isLetter,
    isBlank,
} from '../utils'

const ensure = (condition: boolean, message: string): void => {
    if (!condition) {
        log('*****error***** ', message)
    }
}

const equalList = (a: Array<any>, b: Array<any>): boolean => {
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if(a[i] !== b[i]) {
            return false
        }
    }
    return true
}

const ensureEqual = (guess: any, ans: any, message: string): void => {
    if (ans instanceof Array) {
        ensure(equalList(guess, ans), message)
    } else {
        ensure(guess === ans, message)
    }
}

const simpleTest = (fun, list: Array<any>): void => {
    list.forEach((item, i) => {
        let [args, ans] = item
        ensureEqual(fun.apply(null, args), ans, `函数 ${fun.name}, ${item}, ${i}`)
    })
}

const isDigitTest = (): void => {
    let data = [
        [['0'], true],
        [['1'], true],
        [['s'], false],
    ]
    simpleTest(isDigit, data)
}

const isLetterTest = (): void => {
    let data = [
        [['s'], true],
        [['A'], true],
        [['2'], false],
    ]
    simpleTest(isLetter, data)
}

const isBlankTest = ():void => {
    let data = [
        [[' '], true],
        [['\t'], true],
        [['\n'], true],
        [['\s'], false],
    ]
    simpleTest(isBlank, data)
}


const test = (): void => {
    isDigitTest()
    isLetterTest()
    isBlankTest()
}

test()
