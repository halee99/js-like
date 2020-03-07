import Lexer from '../tokener/lexer'
import Parser from '../parser/baseParser'

const test1 = () => {
    let code = '2 + 3 + 5 + 1'
    let lexer = new Lexer()
    let parser = new Parser(lexer.tokenize(code))
    console.log(code, parser.program())
}

const test = () => {
    test1()
}

test()
