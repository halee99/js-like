import {
    log,
    isDigit,
    isLetter,
    isBlank,
} from '../utils'

import {
    tokenType,
    keywordMap,
    punctuatorList,
    morePunctuatorList,
    quotationList,
    Token,
} from './type'

import Tokens from './tokens'

class Lexer {
    tokens: Array<Token>
    token: Token
    constructor() {
        this.tokens = []
        this.resetToken()
    }
    resetToken(): void {
        this.token = {
            type: tokenType.INITIAL,
            value: '',
        }
    }

    setToken(type: string, value: string): boolean {
        this.token.type = type
        this.token.value = value
        return true
    }

    appendTokenValue(c: string): void {
        this.token.value += c
    }

    handleKeyword(): void {
        let token = this.token
        let t = keywordMap[token.value]
        if (t !== undefined) {
            token.type = t
        }
    }

    handleToken() {
        if (this.token.type === tokenType.ID) {
            this.handleKeyword()
        }
        this.tokens.push(this.token)
        this.resetToken()
    }

    initToken(c: string): boolean {
        if(this.token.value.length > 0) {
            this.handleToken()
        }
        if (isBlank(c)) {
            return this.setToken(tokenType.BLANK, '')
        }
        if (isDigit(c)) {
            return this.setToken(tokenType.NUMBER, c)
        }
        if (isLetter(c)) {
            return this.setToken(tokenType.ID, c)
        }
        if (quotationList.includes(c)) {
            return this.setToken(tokenType.STRING, c)
        }
        if (punctuatorList.includes(c)) {
            return this.setToken(tokenType.PUNCTUATOR, c)
        }
        if(c === 'EOF') {
            return this.setToken(tokenType.EOF, c)
        }
        throw `错误/未知/未处理字符 ${c}`
    }

    tokenize(code: string) {
        let len = code.length
        for (let i = 0; i < len; i++) {
            let c = code[i]
            this.scanToken(this.token.type, c)
        }

        this.initToken('EOF')
        this.tokens.push(this.token)
        return new Tokens(this.tokens)
    }

    scanToken(type: string, c: string): void {
        switch(type) {
            case tokenType.INITIAL:
                this.initToken(c)
                break
            case tokenType.BLANK:
                this.initToken(c)
                break
            case tokenType.NUMBER:
                if (isDigit(c)) {
                    this.appendTokenValue(c)
                } else if (c === '.' && !this.token.value.includes('.')) {
                    this.appendTokenValue(c)
                } else if (c === '.') {
                    throw `数字错误 ${this.token.value + '.'}`
                } else {
                    this.initToken(c)
                }
                break
            case tokenType.ID:
                if (isLetter(c) || isDigit(c) || c === '_' || c === '@') {
                    this.appendTokenValue(c)
                } else {
                    this.initToken(c)
                }
                break
            case tokenType.STRING:
                if (quotationList.includes(c) && this.token.value[0] === c) {
                    this.appendTokenValue(c)
                    this.initToken('EOF')
                } else {
                    this.appendTokenValue(c)
                }
                break
            case tokenType.PUNCTUATOR:
                let p = this.token.value + c
                if(morePunctuatorList.includes(p)) {
                    this.appendTokenValue(c)
                } else {
                    this.initToken(c)
                }
                break
            default:
                break
        }
    }
}

export default Lexer
