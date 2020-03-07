import * as tree from '../ASTNode/baseNode'
import {Scope, Variable} from "../scope/scope"
import {log} from "../utils"
import {VariableDeclarator} from "../ASTNode/baseNode"

const CONTINUE: object = {}
const BREAK: object = {}
const RETURN: object = {}

const error = (message: string) => {
    throw message
}

type EvalMap = {
    [key in tree.Node['type']]: (node: tree.Node, scope: Scope) => any
}

interface StoreType  {
    set(value: any): boolean
    get(): any
}

const leftHandStore = (node: tree.Expression, scope: Scope): StoreType=> {
    let store: StoreType

    if (node.type === 'Identifier') {
        const {name} = <tree.Identifier>node
        store = scope.find(name)
        if (!store) {
            error(`${name} 未定义`)
        }
    } else if (node.type === 'MemberExpression') {
        const left = <tree.MemberExpression>node
        const object = evaluate(left.object, scope)

        let property
        if (left.computed) {
            property = evaluate(left.property, scope)
        } else {
            property = (<tree.Identifier>left.property).name
        }

        store = {
            set(value: any) {
                object[property] = value
                return true
            },
            get() {
                return object[property]
            }
        }
    } else {
        error('Invalid left-hand side')
    }
    return store
}

const evaluate = (node: tree.Node, scope: Scope): any => {
    const apply = evalMap[node.type]
    if (!apply) {
        throw `${node.type} 未实现`
    }
    return apply(node, scope)
}


const evalMap: EvalMap = {
    Program: (node: tree.Program, scope: Scope): any => {
        let r: any = null
        node.body.forEach(e => r = evaluate(e, scope))
        log("最终结果，", r)
        return r
    },
    SequenceExpression: (node: tree.SequenceExpression, scope: Scope): any => {
        let r: any = null
        node.expressions.forEach(e => r = evaluate(e, scope))
        return r
    },
    BinaryExpression: (node: tree.BinaryExpression, scope: Scope): any => {
        let op = node.operator.operator
        let left = node.left
        let right = node.right
        if (op === null) {
            return evaluate(left, scope)
        }
        let opMap = {
            '+': (a, b) => a + b,
            "-": (a, b) => a - b,
            "*": (a, b) => a * b,
            "/": (a, b) => a / b,
            "%": (a, b) => a % b,
            "==": (a, b) => a == b,
            "!=": (a, b) => a != b,
            "===": (a, b) => a === b,
            "!==": (a, b) => a !== b,
            "<": (a, b) => a < b,
            "<=": (a, b) => a <= b,
            ">": (a, b) => a > b,
            ">=": (a, b) => a >= b,
        }
        let a = evaluate(left, scope)
        let b = evaluate(right, scope)
        log("eval BinaryExpression", a, op, b)
        return opMap[op](a, b)
    },
    Literal: (node: tree.Literal, scope: Scope): any => {
        return node.value
    },
    Identifier: (node: tree.Identifier, scope: Scope): any => {
        let id = node.name
        let variable = scope.find(id)
        log('eval Identifier', id, variable)
        if (!variable) {
            error(`${id} 未定义`)
        }
        return variable.get()

    },
    VariableDeclaration: (node: tree.VariableDeclaration, scope: Scope): any => {
        let type = node.kind
        node.declarations.forEach(e => {
            let {id, init} = evaluate(e, scope)
            scope.declare(type, id, init)
        })
    },
    VariableDeclarator: (node: tree.VariableDeclarator, scope: Scope): any => {
        let id = node.id.name
        let init = node.init? evaluate(node.init, scope): null
        return {
            id,
            init,
        }
    },
    AssignmentExpression: (node: tree.AssignmentExpression, scope: Scope): any => {
        let store = leftHandStore(node.left, scope)

        let assignmentMap = {
            "=": r => (store.set(r), r),
            "+=": r => (store.set(store.get() + r), store.get()),
            "-=": r => (store.set(store.get() - r), store.get()),
            "*=": r => (store.set(store.get() * r), store.get()),
            "/=": r => (store.set(store.get() / r), store.get()),
            "%=": r => (store.set(store.get() % r), store.get()),
        }
        return assignmentMap[node.operator.operator](evaluate(node.right, scope))
    },
    UnaryExpression: (node: tree.UnaryExpression, scope: Scope): any => {
        // todo 优化 UnaryExpression AST
        let {operator, prefix, argument} = node
        let opMap = {
            '+': () => +evaluate(argument, scope),
            '-': () => -evaluate(argument, scope),
            '!': () => !evaluate(argument, scope),
            '~': () => ~evaluate(argument, scope),
            'typeof': () => typeof evaluate(argument, scope),
            'delete': () => error(`delete 未实现`)
        }
        let op = operator.operator
        if (['++', '--'].includes(op)) {
            let store = leftHandStore(argument, scope)
            if (op === '++') {
                store.set(store.get() + 1)
            } else {
                store.set(store.get() - 1)
            }
            return store.get()
        }
        if (!opMap[op]) {
            error(`${op} 未实现`)
        }
        return opMap[op]()
    },
    UpdateExpression: (node: tree.UpdateExpression, scope: Scope): any => {
        // todo 优化 UpdateExpression AST
        let {operator, prefix, argument} = node
        if (prefix) {
            error('UnaryExpression 与 UpdateExpression 冲突')
        }
        let store = leftHandStore(argument, scope)
        let opMap = {
            post: {
                '++': () => {
                    let r = store.get()
                    store.set(r + 1)
                    return r
                },
                '--': () => {
                    let r = store.get()
                    store.set(r - 1)
                    return r
                },
            }
        }
        return opMap['post'][operator.operator]()
    },
    IfStatement: (node: tree.IfStatement, scope: Scope): any => {
        log('eval IfStatement', node)
        let test = evaluate(node.test, scope)
        if (test) {
            return evaluate(node.consequent, scope)
        } else if (node.alternate) {
            return evaluate(node.alternate, scope)
        }
    },
    LogicalExpression: (node: tree.LogicalExpression, scope: Scope): any => {
        let left = evaluate(node.left, scope)
        let op = node.operator.operator
        if (op === '||' && !left) {
            return evaluate(node.right, scope)
        }
        if (op === '&&' && left) {
            return evaluate(node.right, scope)
        }

    },
    BlockStatement: (node: tree.BlockStatement, scope: Scope): any => {
        let tdzFlag = false
        node.body.forEach( state => {
            if (state.type === 'VariableDeclaration') {
                let kind = (<tree.VariableDeclaration>state).kind
                if (['let', 'const'].includes(kind)) {
                    tdzFlag = true
                }
            }
        })

        let ms = tdzFlag? new Scope('block', scope) : scope
        for (const b of node.body) {
            let r = evaluate(b, ms)
            if (r === CONTINUE || r === BREAK || r === RETURN) {
                return r
            }
        }
    },
    ForStatement: (node: tree.ForStatement, scope: Scope): any => {
        let {init, test, update, body} = node
        let ms = scope
        let tdzFlag = false
        if (init && init.type === 'VariableDeclaration') {
            let kind = (<tree.VariableDeclaration>init).kind
            if (['let', 'const'].includes(kind)) {
                ms = new Scope('loop', scope)
                tdzFlag = true
            }
        }
        // init
        evaluate(init, ms)
        let r:any
        for (;;) {
            // test
            if (test && !evaluate(test, ms)) {
                break
            }
            // body
            if (tdzFlag) {
                r = evaluate(body, new Scope('block', ms))
            } else {
                r = evaluate(body, ms)
            }
            evaluate(update, ms)
        }
        return r
    },
    EmptyStatement: (node: tree.EmptyStatement, scope: Scope): any => {

    },
}

export default evaluate


