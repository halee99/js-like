import {
    log,
} from '../utils'

import Lexer from "../tokener/lexer"

const simpleTest = (code: string): void => {
    let lexer = new Lexer()
    lexer.tokenize(code)
    log('lexerTest ', code, lexer.tokens)
}

const test = () => {
    simpleTest(`let abc = 2`)
    simpleTest(`1024 + 2 * 256`)
    simpleTest(`let s = "ni hao"`)

}

test()
