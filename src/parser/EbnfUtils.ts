import Tokens from '../tokener/tokens'
import { Token, tokenType } from '../tokener/type'
import * as tree from '../ASTNode/baseNode'

import { log } from "../utils"

interface ExpressionFun {
    (): tree.Expression
}

// 二叉树，* 重复
const binaryExpressionStar = function<T extends tree.Expression>(
    node: {new (l, o, r): T },
    fun1: ExpressionFun,
    op: ExpressionFun,
    fun2: ExpressionFun
): T {
    let leaf= fun1()
    log("leaf", leaf)
    if(leaf === null) {
        return null
    }
    let operator = op()
    let root: T = <T>leaf
    while(operator !== null) {
        log("operator", operator)
        let right = fun2()
        root = new node(leaf, operator, right)
        operator = op()
        leaf = root
    }
    log("binary", root)
    return root
}




export {
    binaryExpressionStar,
}
