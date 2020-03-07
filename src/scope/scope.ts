type ScopeType = 'loop' | 'function' | 'block'

type VariableType = 'let' | 'const' | 'var'

class Variable {
    readonly type: VariableType
    private value: any
    constructor(type: VariableType, value: any) {
        this.type = type
        this.value = value
    }

    public set(value: any): boolean {
        if (this.type === 'const') {
            return false
        }
        this.value = value
        return true
    }

    public get(): any {
        return this.value
    }
}

class Scope {
    readonly type: ScopeType
    private content: { [key: string]: Variable } = {}
    private parent: Scope | null
    readonly salt = '__'
    public isFound = false

    constructor(type: ScopeType, parent?: Scope) {
        this.type = type
        this.parent = parent || null
    }

    find(id: string): Variable | null {
        let key = this.salt + id
        if (this.content.hasOwnProperty(key)) {
            return this.content[key]
        } else if (this.parent !== null) {
            return this.parent.find(id)
        } else {
            return null
        }
    }

    letDeclare = (id: string, value: any): boolean => {
        let key = this.salt + id
        if (this.content.hasOwnProperty(key)) {
            return false
        }
        this.content[key] = new Variable('let', value)
        return true
    }

    constDeclare = (id: string, value: any): boolean => {
        let key = this.salt + id
        if (this.content.hasOwnProperty(key)) {
            return false
        }
        this.content[key] = new Variable('const', value)
        return true
    }

    varDeclare = (id: string, value: any): boolean => {
        let key = this.salt + id
        let scope: Scope = this
        while (scope.parent !== null && scope.type !== 'function') {
            scope = scope.parent
        }

        this.content[key] = new Variable('let', value)
        return true
    }

    declare(type: string, id: string, value:any) {
        let declareMap = {
            'let': this.letDeclare,
            'const': this.constDeclare,
            'var': this.varDeclare
        }
        declareMap[type](id, value)
    }

}

export {
    Variable,
    Scope,
}
