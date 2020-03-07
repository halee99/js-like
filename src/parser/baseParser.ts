import Tokens from '../tokener/tokens'
import { Token, tokenType } from '../tokener/type'
import * as tree from '../ASTNode/baseNode'

import {
    binaryExpressionStar,

} from './EbnfUtils'

import {log} from "../utils"

const error = function(message: any, token?: Token, node?: tree.Node) {
    throw message
}

class Parser {
    tokens: Tokens
    token: Token
    constructor(tokens: Tokens) {
        this.tokens = tokens
        this.token = this.tokens.next()
    }
    eat() {
        log("*****eat**", this.token.value)
        this.tokens.eat()
        this.token = this.tokens.next()
    }

    unEat() {
        this.tokens.unEat()
        this.token = this.tokens.next()
        log("*****unEat**", this.token.value)
    }

    backtrack(pos: number) {
        this.tokens.setPosition(pos)
        this.token = this.tokens.next()
    }

    run(): any {
        // let t = this.additiveExpression()
        let p = this.program()
        return p
    }

    eatPunctuator(p: string): boolean {
        let {type, value} = this.token
        if (type === tokenType.PUNCTUATOR && value === p) {
            this.eat()
            return true
        }
        return false
    }

    eatKeyword(k: string): boolean {
        let {type, value} = this.token
        if (type === tokenType.KEYWORD && value === k) {
            this.eat()
            return true
        }
        return false
    }

    // 操作符 生成器
    generateOperator<T>(node: {new (t: Token): T }, operatorList: Array<string>): T {
        let token = this.token
        // log("generateOperator", token, operatorList)
        if(token.type === tokenType.PUNCTUATOR) {
            if (operatorList.includes(token.value)) {
                this.eat()
                return new node(token)
            }
        }
        return null
    }

    // Literal	::=	( <DECIMAL_LITERAL> | <STRING_LITERAL> | <BOOLEAN_LITERAL> | <NULL_LITERAL> )
    literal(): tree.Literal {
        let token = this.token
        // 假装先吃
        log("in literal", token)
        this.eat()
        switch (token.type) {
            case tokenType.BOOLEAN:
                return new tree.Literal(token, token.value === 'true')
            case tokenType.NULL:
                return new tree.Literal(token, null)
            case tokenType.NUMBER:
                return new tree.Literal(token, Number(token.value))
            case tokenType.STRING:
                return new tree.Literal(token, token.value)
            default:
                this.unEat()
                return null
        }
    }

    // Identifier	::=	<IDENTIFIER_NAME>
    identifier(): tree.Identifier {
        let token = this.token
        if (this.token.type === tokenType.ID) {
            this.eat()
            return new tree.Identifier(token)
        }
        return null
    }

    // Program	::=	( SourceElements )? <EOF>
    program(): tree.Program {
        let body = this.sourceElements()
        if (body.length === 0){
            if (this.token.type !== tokenType.EOF) {
                error('Invalid character', this.token)
            }
        }
        return new tree.Program(body)
    }

    // SourceElements ::= ( SourceElement )+
    sourceElements(): Array<tree.Statement | tree.Directive> {
        let element: tree.Statement | tree.Directive = this.sourceElement()
        let list: Array<tree.Statement | tree.Directive> = []
        while (element !== null) {
            list.push(element)
            element = this.sourceElement()
        }
        return list
    }

    // SourceElement ::= FunctionDeclaration | Statement
    sourceElement(): tree.Function | tree.Statement {
        let fun = this.functionDeclaration()
        if (fun !== null) {
            return fun
        }
        return this.statement()
    }

    publicFunction<T>(node: {
        new (
            id: tree.Identifier,
            params: Array< tree.Identifier >,
            body: tree.FunctionBody
        ): T
    }
    ): T {
        if (!this.eatKeyword('function')) {
            return null
        }
        let id = this.identifier()

        if (!this.eatPunctuator('(')) {
            error("函数定义 缺少()")
        }

        let params = this.formalParameterList()
        if (!this.eatPunctuator(')')) {
            error("函数定义 缺少()")
        }

        let body = this.functionBody()
        log('publicFunction', id, params, body)
        return new node(id, params, body)
    }

    // FunctionDeclaration	::=	"function" Identifier ( "(" ( FormalParameterList )? ")" ) FunctionBody
    functionDeclaration(): tree.FunctionDeclaration{
        return this.publicFunction<tree.FunctionDeclaration>(tree.FunctionDeclaration)
    }

    // FunctionExpression ::= "function" ( Identifier )? ( "(" ( FormalParameterList )? ")" ) FunctionBody
    functionExpression(): tree.FunctionExpression {
        return this.publicFunction<tree.FunctionExpression>(tree.FunctionExpression)
    }

    // FormalParameterList	::=	Identifier ( "," Identifier )*
    formalParameterList(): Array<tree.Identifier> {
        let params: Array<tree.Identifier> = []
        let id = this.identifier()
        if (id === null) {
            return []
        }
        params.push(id)

        while (this.eatPunctuator(',')) {
            id = this.identifier()
            params.push(id)
        }
        return params
    }

    // FunctionBody ::= "{" ( SourceElements )? "}"
    functionBody(): tree.FunctionBody {
        if (!this.eatPunctuator('{')) {
            error("函数缺少 { }")
        }

        let elements = this.sourceElements()

        if (!this.eatPunctuator('}')) {
            error("函数缺少 { }")
        }
        return new tree.FunctionBody(elements)
    }


    // Statement ::= Block
    // |	VariableStatement
    // |	EmptyStatement
    // |	ExpressionStatement
    // |	IfStatement
    // |	IterationStatement
    // |	ContinueStatement
    // |	BreakStatement
    // |	ReturnStatement
    // |	SwitchStatement
    statement(): tree.Statement {
        return this.block()
            || this.variableStatement()
            || this.emptyStatement()
            || this.expressionStatement()
            || this.ifStatement()
            || this.iterationStatement()
            || this.continueStatement()
            || this.breakStatement()
            || this.returnStatement()
            || this.switchStatement()
    }

    // Block ::= "{" ( StatementList )? "}"
    block(): tree.BlockStatement {
        if (!this.eatPunctuator('{')) {
            return null
        }
        let states = this.statementList()
        if (!this.eatPunctuator('}')) {
            error("{} 未匹配到 }")
        }
        return new tree.BlockStatement(states)
    }

    // StatementList ::= ( Statement )+
    statementList(): Array<tree.Statement> {
        let states: Array<tree.Statement> = []
        let state = this.statement()
        while (state !== null) {
            states.push(state)
            state = this.statement()
        }
        return states
    }

    // SwitchStatement	::=	"switch" "(" Expression ")" CaseBlock
    switchStatement(): tree.SwitchStatement {
        if (!this.eatKeyword('switch')) {
            return null
        }
        if (!this.eatPunctuator('(')) {
            error("switch(){} 未匹配到 ()")
        }
        let disc = this.expression()
        if (!this.eatPunctuator(')')) {
            error("switch(){} 未匹配到 ()")
        }
        let block = this.caseBlock()
        return new tree.SwitchStatement(disc, block)
    }
    // CaseBlock ::= "{" ( CaseClauses )? ( "}" | DefaultClause ( CaseClauses )? "}" )
    caseBlock(): Array<tree.SwitchCase> {
        if (!this.eatPunctuator('{')) {
            error("switch(){} 未匹配到 {}")
        }
        let cases = this.caseClauses()
        if (!this.eatPunctuator('}')) {
            return cases
        }
        let def = this.defaultClause()
        let cases2 = this.caseClauses()
        cases = [...cases, ...cases2, def]
        return cases
    }
    // CaseClauses ::= ( CaseClause )+
    caseClauses(): Array<tree.SwitchCase> {
        let cases: Array<tree.SwitchCase> = []
        let c = this.caseClause()
        while (c !== null) {
            cases.push(c)
            c = this.caseClause()
        }
        return cases
    }

    // CaseClause ::= ( ( "case" Expression ":" ) ) ( StatementList )?
    caseClause(): tree.SwitchCase {
        if (this.eatKeyword('case')) {
            return null
        }
        let test = this.expression()
        if (this.eatPunctuator(':')) {
            error("case : 缺少 :")
        }
        let states = this.statementList()
        return new tree.SwitchCase(test, states)
    }
    // DefaultClause ::= ( ( "default" ":" ) ) ( StatementList )?
    defaultClause(): tree.SwitchCase {
        if (this.eatKeyword('default')) {
            return null
        }
        if (this.eatPunctuator(':')) {
            error("default: 缺少 :")
        }
        let states = this.statementList()
        return new tree.SwitchCase(null, states)
    }

    // ContinueStatement ::= "continue" ( ";" )?
    continueStatement(): tree.ContinueStatement {
        if (!this.eatKeyword("continue")) {
            return null
        }
        this.eatPunctuator(';')
        return new tree.ContinueStatement(null)
    }

    // BreakStatement ::= "break" ( Identifier )? ( ";" )?
    breakStatement(): tree.BreakStatement {
        if (!this.eatKeyword("continue")) {
            return null
        }
        let id = this.identifier()
        this.eatPunctuator(';')
        return new tree.BreakStatement(id)
    }

    // ReturnStatement	::=	"return" ( Expression )? ( ";" )?
    returnStatement(): tree.ReturnStatement {
        if (!this.eatKeyword("return")) {
            return null
        }
        let exp = this.expression()
        this.eatPunctuator(';')
        return new tree.ReturnStatement(exp)
    }


    // IterationStatement ::= DoWhileStatement | WhileStatement | ForStatement
    iterationStatement()
        : tree.DoWhileStatement
        | tree.WhileStatement
        | tree.ForStatement {
        return this.doWhileStatement()
            || this.whileStatement()
            || this.forStatement()
    }

    // DoWhileStatement ::= "do" Statement "while" "(" Expression ")" ( ";" )?
    doWhileStatement(): tree.DoWhileStatement {
        if (!this.eatKeyword('do')) {
            return null
        }
        let body = this.statement()
        if (body === null) {
            error("do 后面缺少语句")
        }
        if (!this.eatKeyword('while')) {
            error("do while 缺少 while")
        }
        if (!this.eatPunctuator('(')) {
            error("do while() 缺少 ()")
        }
        let test = this.expression()
        if (!this.eatPunctuator(')')) {
            error("do while() 缺少 ()")
        }
        this.eatPunctuator(';')
        return new tree.DoWhileStatement(test, body)
    }

    // WhileStatement ::= "while" "(" Expression ")" Statement
    whileStatement(): tree.WhileStatement {
        if (!this.eatKeyword('while')) {
            return null
        }

        if (!this.eatPunctuator('(')) {
            error("while() 缺少 ()")
        }
        let test = this.expression()
        if (!this.eatPunctuator(')')) {
            error("while() 缺少 ()")
        }

        let body = this.statement()
        this.eatPunctuator(';')
        return new tree.WhileStatement(test, body)
    }

    // ForStatement
    // ::= "for" "(" ( VariableStatementNoSemicolon | Expression) ? ";" ( Expression )? ";" ( Expression )? ")" Statement
    forStatement(): tree.ForStatement {
        if (!this.eatKeyword('for')) {
            return null
        }

        if (!this.eatPunctuator('(')) {
            error("for(;;) 缺少 ()")
        }
        let init: tree.VariableDeclaration | tree.Expression = this.variableStatementNoSemicolon()

        if (init === null) {
            init = this.expression()
        }

        if (init !== null) {
            let {type, value} = this.tokens.peek(-1)
            if (type === tokenType.PUNCTUATOR && value === ';') {

            }
        }

        if (!this.eatPunctuator(';')) {
            error("for(;;) 缺少 ;")
        }

        let test = this.expression()

        if (!this.eatPunctuator(';')) {
            error("for(;;) 缺少 ;")
        }

        let update = this.expression()

        if (!this.eatPunctuator(')')) {
            error("for(;;) 缺少 ()")
        }

        let body = this.statement()

        return new tree.ForStatement(init, test, update, body)
    }

    // IfStatement	::=	"if" "(" Expression ")" Statement ( "else" Statement )?
    ifStatement(): tree.IfStatement {
        if (!this.eatKeyword('if')) {
            return null
        }
        if (!this.eatPunctuator('(')) {
            error('if() 缺少()')
        }
        let test = this.expression()
        if (test === null) {
            error('if() 缺少表达式')
        }
        if (!this.eatPunctuator(')')) {
            error('if 缺少()')
        }
        let state1 = this.statement()
        if (this.eatKeyword('else')) {
            let state2 = this.statement()
            return new tree.IfStatement(test, state1, state2)
        } else {
            return new tree.IfStatement(test, state1, null)
        }
    }

    // ExpressionStatement ::= Expression ( ";" )?
    expressionStatement(): tree.SequenceExpression {
        let exp = this.expression()
        if (exp.expressions.length === 0) {
            return null
        }
        this.eatPunctuator(';')
        return exp
    }

    // EmptyStatement	::=	";"
    emptyStatement(): tree.EmptyStatement{
        if (this.eatPunctuator(';')) {
            return new tree.EmptyStatement()
        } else {
            return null
        }
    }

    // VariableStatement ::= variableStatementNoSemicolon ( ";" )?
    variableStatement(): tree.VariableDeclaration {
        let dec = this.variableStatementNoSemicolon()
        if (dec === null) {
            return null
        }
        this.eatPunctuator(';')
        return dec
    }

    // variableStatementNoSemicolon ::= ("var" | "let" | "const") VariableDeclarationList
    variableStatementNoSemicolon(): tree.VariableDeclaration {
        let token = this.token
        if (token.type !== tokenType.KEYWORD) {
            return null
        }
        if (!['let', 'var', 'const'].includes(token.value)) {
            return null
        }
        this.eat()
        let list = this.variableDeclarationList()
        if (list === null) {
            error(token.value + '后面缺少语句')
        }

        return new tree.VariableDeclaration(list, token)
    }



    // VariableDeclarationList	::=	VariableDeclaration ( "," VariableDeclaration )*
    variableDeclarationList(): Array<tree.VariableDeclarator> {
        let vd = this.variableDeclaration()
        let list: Array<tree.VariableDeclarator> = []
        if (vd === null) {
            return null
        }
        list.push(vd)
        while (this.eatPunctuator(',')) {
            vd = this.variableDeclaration()
            if (vd === null) {
                break
            }
            list.push(vd)
        }
        return list
    }

    // VariableDeclaration	::=	Identifier ( Initialiser )?
    variableDeclaration(): tree.VariableDeclarator {
        let id = this.identifier()
        if(id === null) {
            return null
        }
        let init = this.initialiser()
        return new tree.VariableDeclarator(id, init)

    }

    // Initialiser	::=	"=" AssignmentExpression
    initialiser(): tree.Expression {
        if (!this.eatPunctuator('=')) {
            return null
        }
        return this.assignmentExpression()
    }

    // AssignmentExpression ::= ( LeftHandSideExpression AssignmentOperator AssignmentExpression | ConditionalExpression )
    assignmentExpression(): tree.AssignmentExpression | tree.Expression {
        let pos = this.tokens.getPosition()
        // LeftHandSideExpression AssignmentOperator AssignmentExpression
        let left = this.leftHandSideExpression()
        if (left === null) {
            return this.conditionalExpression()
        }
        let op = this.assignmentOperator()
        if (op === null) {
            // 回溯
            this.backtrack(pos)
            return this.conditionalExpression()
        }
        let exp = this.assignmentExpression()
        return new tree.AssignmentExpression(left, op, exp)
    }

    // AssignmentOperator	::=	( "=" | "*=" | <SLASHASSIGN> | "%=" | "+=" | "-=" | "<<=" | ">>=" | ">>>=" | "&=" | "^=" | "|=" )
    assignmentOperator = (): tree.AssignmentOperator => {
        return this.generateOperator<tree.AssignmentOperator>(
            tree.AssignmentOperator,
            ["=", "*=", "/=",  "%=", "+=", "-=",
                "<<=", ">>=", ">>>=", "&=", "^=", "|="]
        )
    }

    // Expression	::=	AssignmentExpression ( "," AssignmentExpression )*
    expression(): tree.SequenceExpression {
        let expressions: Array<tree.Expression> = []
        let exp = this.assignmentExpression()
        if (exp === null) {
            return new tree.SequenceExpression(expressions)
        }
        expressions.push(exp)
        while (this.eatPunctuator(',')) {
            exp = this.assignmentExpression()
            expressions.push(exp)
        }
        return new tree.SequenceExpression(expressions)
    }


    // ConditionalExpression ::= LogicalORExpression ( "?" AssignmentExpression ":" AssignmentExpression )?
    conditionalExpression(): tree.Expression | tree.ConditionalExpression {
        let logical = this.logicalORExpression()
        if (logical === null) {
            return null
        }
        if (!this.eatPunctuator('?')) {
            return logical
        }
        let exp1 = this.assignmentExpression()
        if (exp1 === null) {
            error("三元表达式, '?' 后缺少表达式")
        }

        if (!this.eatPunctuator(':')) {
            error("三元表达式, 缺少 ':' ")
        }

        let exp2 = this.assignmentExpression()
        if (exp2 === null) {
            error("三元表达式, ':' 后缺少表达式")
        }
        return new tree.ConditionalExpression(logical, exp1, exp2)
    }

    // LogicalORExpression ::= LogicalANDExpression ( LogicalOROperator LogicalANDExpression )*
    logicalORExpression = (): tree.LogicalExpression => {
        return binaryExpressionStar<tree.LogicalExpression>(
            tree.LogicalExpression,
            this.logicalANDExpression,
            this.LogicalOROperator,
            this.logicalANDExpression
        )
    }

    // LogicalOROperator	::=	"||"
    LogicalOROperator = (): tree.LogicalOperator => {
        return this.generateOperator<tree.LogicalOperator>(
            tree.LogicalOperator,
            ['||']
        )
    }

    // LogicalANDExpression ::= EqualityExpression ( LogicalANDOperator EqualityExpression )*
    logicalANDExpression = (): tree.LogicalExpression => {
        return binaryExpressionStar<tree.LogicalExpression>(
            tree.LogicalExpression,
            this.equalityExpression,
            this.logicalANDOperator,
            this.equalityExpression
        )
    }

    // LogicalANDOperator	::=	"&&"
    logicalANDOperator = (): tree.LogicalOperator => {
        return this.generateOperator<tree.LogicalOperator>(
            tree.LogicalOperator,
            ['&&']
        )
    }

    // EqualityExpression ::= RelationalExpression ( EqualityOperator RelationalExpression )*
    equalityExpression = (): tree.BinaryExpression => {
        return binaryExpressionStar<tree.BinaryExpression>(
            tree.BinaryExpression,
            this.relationalExpression,
            this.equalityOperator,
            this.relationalExpression
        )
    }

    // EqualityOperator	::=	( "==" | "!=" | "===" | "!==" )
    equalityOperator = (): tree.BinaryOperator => {
        return this.generateOperator<tree.BinaryOperator>(
            tree.BinaryOperator,
            ["==", "!=", "===", "!=="]
        )
    }

    // RelationalExpression	::=	AdditiveExpression ( RelationalOperator AdditiveExpression )*
    relationalExpression = (): tree.BinaryExpression => {
        return binaryExpressionStar<tree.BinaryExpression>(
            tree.BinaryExpression,
            this.additiveExpression,
            this.relationalOperator,
            this.additiveExpression
        )
    }
    // RelationalOperator ::= ( "<" | ">" | "<=" | ">=" | "instanceof" )
    relationalOperator = (): tree.BinaryOperator => {
        return this.generateOperator<tree.BinaryOperator>(
            tree.BinaryOperator,
            ["<", ">", "<=", ">=", "instanceof"]
        )
    }

    // AdditiveExpression ::= MultiplicativeExpression ( AdditiveOperator MultiplicativeExpression )*
    additiveExpression = (): tree.BinaryExpression => {
        return binaryExpressionStar<tree.BinaryExpression>(
            tree.BinaryExpression,
            this.multiplicativeExpression,
            this.additiveOperator,
            this.multiplicativeExpression
            )
    }

    // AdditiveOperator	::=	( "+" | "-" )
    additiveOperator = (): tree.BinaryOperator => {
        return this.generateOperator<tree.BinaryOperator>(
            tree.BinaryOperator,
            ['+', '-']
        )
    }

    // MultiplicativeExpression	::=	UnaryExpression ( MultiplicativeOperator UnaryExpression )*
    multiplicativeExpression = (): tree.BinaryExpression => {
        return binaryExpressionStar<tree.BinaryExpression>(
            tree.BinaryExpression,
            this.unaryExpression,
            this.multiplicativeOperator,
            this.unaryExpression
        )
    }
    // MultiplicativeOperator	::=	( "*" | <SLASH>"/" | "%" )
    multiplicativeOperator = (): tree.BinaryOperator => {
        return this.generateOperator<tree.BinaryOperator>(
            tree.BinaryOperator,
            ['*', '/', '%']
        )
    }

    // UnaryExpression	::=	( PostfixExpression | ( UnaryOperator UnaryExpression )+ )
    unaryExpression = (): tree.UpdateExpression
        | tree.Expression
        | tree.UnaryExpression => {
        // todo 优化 unaryExpression 与 UpdateExpression
        let op = this.unaryOperator()
        // log("in unaryExpression op", op)
        if(op === null) {
            return this.postfixExpression()
        }
        let unary: tree.Expression


        unary = this.unaryExpression()
        if(unary === null) {
            error("unaryExpression 缺少表达式")
        }
        return new tree.UnaryExpression(unary, op, true)
    }

    // UnaryOperator	::=	( "delete" | "void" | "typeof" | "++" | "--" | "+" | "-" | "~" | "!" )
    unaryOperator = (): tree.UnaryOperator => {
        return this.generateOperator<tree.UnaryOperator>(
            tree.UnaryOperator,
            ["delete", "void", "typeof",
                "++", "--", "+", "-", "~", "!"]
        )
    }

    // PostfixExpression ::= LeftHandSideExpression ( PostfixOperator )?
    postfixExpression(): tree.Expression {
        let leftHand = this.leftHandSideExpression()
        // log('in postfixExpression leftHand 1', leftHand)
        if(leftHand === null) {
            return null
        }
        let op = this.postfixOperator()
        if(op === null) {
            return leftHand
        }

        return new tree.UpdateExpression(leftHand, op, false)

    }

    // PostfixOperator	::=	( "++" | "--" )
    postfixOperator = (): tree.UpdateOperator => {
        return this.generateOperator<tree.UpdateOperator>(
            tree.UpdateOperator,
            ["++", "--"]
        )
    }

    // LeftHandSideExpression ::= CallExpression | MemberExpression
    leftHandSideExpression(): tree.Expression {
        // return this.memberExpression() || this.callExpression()
        // 改进 把 memberExpression 融入 callExpression 中
        return this.callExpression()
    }

    // CallExpression	::=	MemberExpression Arguments ( CallExpressionPart )*
    // 改进
    // CallExpression	::=	MemberExpression ( Arguments ( CallExpressionPart )* )?
    callExpression(): tree.Expression {
        let mem = this.memberExpression()
        // log("in callExpression mem", mem)
        let args = this.arguments_()
        if (args === null) {
            return mem
        }
        log("in callExpression middle")
        let exp: tree.Expression = new tree.CallExpression(mem, args)
        let callPart = this.callExpressionPart(exp)
        while (callPart !== null) {
            exp = callPart
            callPart = this.callExpressionPart(exp)
        }
        return exp
    }

    // MemberExpression ::= ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* ) |	AllocationExpression
    memberExpression(): tree.Expression {
        // AllocationExpression
        let allocation = this.allocationExpression()
        // log('memberExpression in allocation is', allocation)
        if (allocation !== null) {
            return allocation
        }

        // ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* )
        let exp: tree.Expression = this.functionExpression()
        if (exp === null) {
            exp = this.primaryExpression()
        }
        if (exp === null) {
            return null
        }
        let member = this.memberExpressionPart(exp)
        while (member !== null) {
            exp = member
            member = this.memberExpressionPart(exp)
        }
        return exp
    }


    // CallExpressionPart ::= Arguments | ( "[" Expression "]" ) | ( "." Identifier )
    // MemberExpressionPart ::= ( "[" Expression "]" ) | ( "." Identifier )
    callOrMemberExpressionPart(mode: "Call" | "Member", expression: tree.Expression)
        : tree.CallExpression | tree.MemberExpression {
        // []
        if (this.eatPunctuator('[')) {
            let exp = this.expression()
            if (exp.expressions.length === 0) {
                error("[] 缺少表达式")
            }

            if (this.eatPunctuator(']')) {
                return new tree.MemberExpression(expression, exp, true)
            } else {
                error("[ ] 缺少 ]")
            }
        }
        // .
        if (this.eatPunctuator('.')) {
            let id = this.identifier()
            if (id === null) {
                error(". 缺少字段")
            }
            return new tree.MemberExpression(expression, id, false)
        }
        if (mode === "Member") {
            return null
        }
        // ()
        let args = this.arguments_()
        if( args === null) {
            return null
        }
        return new tree.CallExpression(expression, args)
    }

    callExpressionPart(expression: tree.Expression)
        : tree.CallExpression | tree.MemberExpression{
        return this.callOrMemberExpressionPart('Call', expression)
    }

    memberExpressionPart(expression: tree.Expression)
        : tree.CallExpression | tree.MemberExpression{
        return this.callOrMemberExpressionPart('Member', expression)
    }


    // PrimaryExpression
    // ::=	"this"
    // | ObjectLiteral
    // | ( "(" Expression ")" )
    // | Identifier
    // | ArrayLiteral
    // | Literal
    primaryExpression(): tree.Expression {
        // "this"
        if (this.eatKeyword('this')) {
            return new tree.ThisExpression()
        }

        let primary = this.objectLiteral()
            || this.identifier()
            || this.arrayLiteral()
            || this.literal()

        if (primary !== null) {
            return primary
        }

        // ( "(" Expression ")" )
        if (this.eatPunctuator('(')) {
            let exp = this.expression()
            if (this.eatPunctuator(')')) {
                return exp
            } else {
                error("() 缺少 ')'")
            }
        }

        log("in primaryExpression", this.token)
        // debugger
        return null
    }

    // ObjectLiteral::=	"{" ( PropertyNameAndValueList )? "}"
    objectLiteral(): tree.ObjectExpression {
        if (!this.eatPunctuator('{')) {
            return null
        }
        let ps = this.propertyNameAndValueList()
        if (!this.eatPunctuator('}')) {
            error("{} 缺少 }")
        }
        return new tree.ObjectExpression(ps)
    }

    // PropertyNameAndValueList ::= PropertyNameAndValue ( "," PropertyNameAndValue | "," )*
    propertyNameAndValueList(): Array<tree.Property> {
        let ps: Array<tree.Property> = []
        let p = this.propertyNameAndValue()
        if (!p === null) {
            ps.push(p)
        }
        while (this.eatPunctuator(',')) {
            if (this.eatPunctuator(',')) {
                error("连续两个 ','")
            }
            p = this.propertyNameAndValue()
            if (p !== null) {
                ps.push(p)
            }
        }
        return ps
    }

    // PropertyNameAndValue ::= PropertyName ":" AssignmentExpression
    propertyNameAndValue(): tree.Property {
        let key = this.propertyName()
        if (key === null) {
            return
        }
        if (this.eatPunctuator(':')) {
            let exp = this.assignmentExpression()
            if (exp === null) {
                error(": 后面缺少表达式")
            }
            return new tree.Property(key, exp, 'init')
        } else {
            if (key instanceof tree.Identifier) {
                return new tree.Property(key, key, 'init')
            }
        }
        return null
    }

    // PropertyName ::= Identifier | <STRING_LITERAL> | <DECIMAL_LITERAL>
    propertyName(): tree.Literal | tree.Identifier {
        let id = this.identifier()
        if (id !== null) {
            return id
        }
        let { type } = this.token
        if (type === tokenType.STRING || type === tokenType.NUMBER) {
            return this.literal()
        }
        return null
    }

    // ArrayLiteral	::=	"[" ( ( Elision )? "]" | ElementList Elision "]" | ( ElementList )? "]" )
    // 优化为
    // ArrayLiteral	::=	"[" ( ( elementList )? "]"
    arrayLiteral(): tree.ArrayExpression {
        if (!this.eatPunctuator('[')) {
            return null
        }
        let list = this.elementList()
        if (!this.eatPunctuator(']')) {
            error("[] 缺少 ]")
        }
        return new tree.ArrayExpression(list)
    }
    // ElementList	::=	( Elision )? AssignmentExpression ( Elision AssignmentExpression )*
    // 优化为
    // ElementList ::= ( Elision ( AssignmentExpression )? )*
    elementList(): Array< tree.Expression | null > {
        let list: Array< tree.Expression | null > = []

        let eli = this.elision()
        while (eli.length !== 0) {
            // 消耗一个 ,
            eli.pop()
            list = [...list, ...eli]
            let exp = this.assignmentExpression()
            if (exp !== null) {
                list.push(exp)
            }
            eli = this.elision()
        }
        return list
    }
    // Elision	::=	( "," )+
    elision(): Array<tree.Expression | null> {
        let nulls: Array<tree.Expression | null> = []
        let p = this.eatPunctuator(',')
        while (p) {
            nulls.push(null)
            p = this.eatPunctuator(',')
        }
        return nulls
    }

    // Arguments ::= "(" ( ArgumentList )? ")"
    arguments_(): Array< tree.Expression > {
        if(this.eatPunctuator('(')) {
            let args = this.argumentList()
            if (this.eatPunctuator(')')) {
               return args
            } else {
                error("() 缺少 )")
            }
        }
        return null
    }

    // ArgumentList ::= AssignmentExpression ( "," AssignmentExpression )*
    argumentList(): Array< tree.Expression > {
        let args: Array< tree.Expression > = []
        let arg = this.assignmentExpression()
        while (arg !== null) {
            args.push(arg)
            arg = this.assignmentExpression()
        }
        return args
    }

    // AllocationExpression ::= ( "new" MemberExpression ( ( Arguments ( MemberExpressionPart )* )* ) )
    allocationExpression() : tree.Call_Member_NewExpression {
        if (!this.eatKeyword('new')) {
            // log("allocationExpression null a")
            return null
        }

        log("allocationExpression in")

        let memberExp = this.memberExpression()
        if (memberExp === null) {
            error("new 缺少表达式")
        }
        let args = this.arguments_()
        if (args === null) {
            return new tree.NewExpression(memberExp, [])
        }
        let firstFlag: boolean = true
        let exp: tree.Call_Member_NewExpression = new tree.NewExpression(memberExp, args)

        // ( Arguments ( MemberExpressionPart )* )*
        while (args !== null) {
            if (firstFlag) {
                firstFlag = false
            } else {
                exp = new tree.CallExpression(exp, args)
                let member = this.memberExpressionPart(exp)

                // ( MemberExpressionPart )*
                while (member !== null) {
                    exp = member
                    member = this.memberExpressionPart(exp)
                }
                args = this.arguments_()
            }
        }
        return exp
    }


}



export default Parser
