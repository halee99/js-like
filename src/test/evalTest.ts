import Lexer from '../tokener/lexer'
import Parser from '../parser/baseParser'
import evaluate from "../eval/eval"
import {Scope} from "../scope/scope"

const testFun = (code: string, result: any) => {
    let lexer = new Lexer()
    let tokens = lexer.tokenize(code)
    console.log(code, tokens)
    let parser = new Parser(tokens)
    let node = parser.program()
    console.log(code, node)
    let scope = new Scope("block")
    let r = evaluate(node, scope)
    console.log("scope", scope)
    console.log(code, r)
    if (r !== result) {
        console.error( `${code}
            期望：${result}
            结果：${r}
        `)
    }
}

const test1 = () => {
    let code = `2 + 3 * (5 + 1)`
    testFun(code, 20)
}

const test2 = () => {
    let code = `
    let a = 4
    let b = 1, c = 2
    a = c
    15 + 3 * (a + b)
    `
    testFun(code, 24)
}

const test3 = () => {
    let code = `
    let a = 2
    let b = 1 
    let c = b
    if (a > 0) {
        c = a 
    }
    c++
    15 + 3 * (c)
    `
    testFun(code, 24)
}

const test4 = () => {
    let code = `
    let sum = 0
    for (let i = 0; i < 51; i++) {
        sum += i
    }
    sum
    `
    testFun(code, 1275)
}


const test = () => {
    // test1()
    // test2()
    // test3()
    test4()
}

test()
