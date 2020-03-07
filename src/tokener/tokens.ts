import { Token } from './type'

class Tokens {
    _tokens: Array<Token>
    _index: number
    _len: number
    constructor(tokens: Array<Token>) {
        this._tokens = tokens
        this._index = 0
        this._len = tokens.length
    }

    next(): Token {
        return this._tokens[this._index]
    }

    peek(step: number= 1): Token {
        return this._tokens[this._index + step]
    }

    eat(): void {
        this._index++
    }

    unEat(): void {
        if(this._index > 0) {
            this._index--
        }
    }

    getPosition(): number {
        return this._index
    }

    setPosition(position: number): void {
        if(0 > position || position >= this._len) {
            throw 'tokens overflow'
        }
        this._index = position
    }
}

export default Tokens
