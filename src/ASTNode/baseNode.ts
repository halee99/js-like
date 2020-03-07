import {Token, tokenType} from '../tokener/type'
import Tokens from "../tokener/tokens"

interface BaseNode {
    type: string;

    loc?: SourceLocation | null;
}

interface SourceLocation {
    source: string | null;
    start: Position;
    end: Position;
}

interface Position {
    line: number; // >= 1
    column: number; // >= 0
}

// 语句
interface Statement extends BaseNode {

}

// 表达式
interface Expression extends BaseNode {

}

interface Pattern extends BaseNode{

}

class Identifier implements Pattern, Expression {
    type = "Identifier";
    name: string;
    constructor(t: Token) {
        this.name = t.value
    }
}

class Literal implements Expression {
    type = "Literal";
    value: string | boolean | null | number;
    constructor(t: Token, value: string | boolean | null | number) {
        this.value = value
    }
}

class Program implements BaseNode {
    type = "Program";
    body: Array<Directive | Statement>;
    constructor(body: Array<Directive | Statement>) {
        this.body = body
    }
}

class Function implements BaseNode {
    type: string
    id: Identifier | null;
    params: Array< Identifier >;
    body: FunctionBody;
}

interface ExpressionStatement extends Statement {
    type: "ExpressionStatement";
    expression: Expression;
}

interface Directive extends BaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

class BlockStatement implements Statement {
    type = "BlockStatement";
    body: Array< Statement >;
    constructor(body: Array< Statement >) {
        this.body = body
    }
}

class FunctionBody extends BlockStatement {
    body: Array< Directive | Statement >;
    constructor(body: Array< Directive | Statement >) {
        super(body)
        this.body = body
    }
}

class EmptyStatement implements Statement {
    type = "EmptyStatement";
}

// debugger
interface DebuggerStatement extends Statement {
    type: "DebuggerStatement";
}

// return
class ReturnStatement implements Statement {
    type: "ReturnStatement";
    argument: Expression | null;
    constructor(argument: Expression | null) {
        this.argument = argument
    }
}

class BreakStatement implements Statement {
    type: "BreakStatement";
    label: Identifier | null;
    constructor(label: Identifier | null) {
        this.label = label
    }
}

class ContinueStatement implements Statement {
    type = "ContinueStatement";
    label: Identifier | null;
    constructor(label: Identifier | null) {
        this.label = label
    }
}

class IfStatement implements Statement {
    type = "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate: Statement | null;
    constructor(
        test: Expression,
        consequent: Statement,
        alternate: Statement | null
    ) {
        this.test = test
        this.consequent = consequent
        this.alternate = alternate
    }
}

class SwitchStatement implements Statement {
    type = "SwitchStatement";
    discriminant: Expression;
    cases: Array< SwitchCase >;
    constructor(discriminant: Expression, cases: Array< SwitchCase >) {
        this.discriminant = discriminant
        this.cases = cases
    }
}

class SwitchCase implements BaseNode {
    type = "SwitchCase";
    // default, if test === null
    test: Expression | null;
    consequent: Array< Statement >;
    constructor(test: Expression | null, consequent: Array< Statement >) {
        this.test = test
        this.consequent = consequent
    }
}

class WhileStatement implements Statement {
    type = "WhileStatement";
    test: Expression;
    body: Statement;
    constructor(test: Expression, body: Statement) {
        this.test = test
        this.body = body
    }
}

class DoWhileStatement implements Statement {
    type = "DoWhileStatement";
    body: Statement;
    test: Expression;
    constructor(test: Expression, body: Statement) {
        this.test = test
        this.body = body
    }
}

class ForStatement implements Statement {
    type = "ForStatement";
    init: VariableDeclaration | Expression | null;
    test: Expression | null;
    update: Expression | null;
    body: Statement;
    constructor(
        init: VariableDeclaration | Expression | null,
        test: Expression | null,
        update: Expression | null,
        body: Statement,
    ) {
        this.init = init
        this.test = test
        this.update = update
        this.body = body
    }
}


interface Declaration extends Statement {

}

class FunctionDeclaration extends Function implements Declaration {
    type = "FunctionDeclaration";
    id: Identifier;
    constructor(id: Identifier, params: Array< Identifier >, body: FunctionBody) {
        super()
        this.id = id
        this.params = params
        this.body = body
    }
}


class VariableDeclaration implements Declaration {
    type = "VariableDeclaration";
    declarations: Array< VariableDeclarator >
    kind: "var" | "let" | "const"
    constructor(declarations: Array<VariableDeclarator>, t: Token) {
        this.declarations = declarations
        this.kind = <"var" | "let" | "const"> t.value
    }
}

class VariableDeclarator implements BaseNode {
    type = "VariableDeclarator";
    id: Identifier;
    init: Expression | null;
    constructor(id: Identifier, init: Expression) {
        this.id = id
        this.init = init
    }
}

class ThisExpression implements Expression {
    type =  "ThisExpression";
}

class ArrayExpression implements Expression {
    type = "ArrayExpression";
    elements: Array< Expression | null >;
    constructor(elements: Array< Expression | null >) {
        this.elements = elements
    }
}


class ObjectExpression implements Expression {
    type = "ObjectExpression";
    properties: Array< Property >;
    constructor(properties: Array< Property >) {
        this.properties = properties
    }
}

class Property implements BaseNode {
    type = "Property";
    key: Literal | Identifier;
    value: Expression;
    kind: "init" | "get" | "set";
    constructor(
        key: Literal | Identifier,
        value: Expression,
        kind: "init" | "get" | "set"
    ) {
        this.key = key
        this.value = value
        this.kind = kind
    }
}

class FunctionExpression extends Function {
    type = "FunctionExpression";
    constructor(id: Identifier, params: Array< Identifier >, body: FunctionBody) {
        super()
        this.id = id
        this.params = params
        this.body = body
    }
}

class UnaryExpression implements Expression {
    type = "UnaryExpression";
    operator: UnaryOperator;
    prefix: boolean;
    argument: Expression;
    constructor(argument: Expression, operator: UnaryOperator, prefix: boolean) {
        this.operator = operator
        this.prefix = prefix
        this.argument = argument
    }
}

class UnaryOperator implements BaseNode {
    type = "UnaryOperator"
    operator: "-" | "+" |"++" | "--" | "!" | "~" | "typeof" | "void" | "delete"
    constructor(t: Token) {
        this.operator = (<"-" | "+" |"++" | "--"
            | "!" | "~" | "typeof"
            | "void" | "delete"> t.value)
    }
}

class UpdateExpression implements Expression {
    type = "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
    constructor(argument: Expression, operator: UpdateOperator, prefix: boolean) {
        this.operator = operator
        this.prefix = prefix
        this.argument = argument
    }

}

class UpdateOperator implements BaseNode{
    type = "UpdateOperator"
    operator: "++" | "--"
    constructor(t: Token) {
        this.operator = (<"++" | "--"> t.value)
    }

}

class BinaryExpression implements Expression {
    type = "BinaryExpression";
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
    constructor(left: Expression, operator: BinaryOperator, right: Expression) {
        this.left = left
        this.operator = operator
        this.right = right
    }
}

class BinaryOperator implements BaseNode {
    type = "BinaryOperator"
    operator: "==" | "!=" | "===" | "!=="
            | "<" | "<=" | ">" | ">="
            | "<<" | ">>" | ">>>"
            | "+" | "-" | "*" | "/" | "%"
            | "|" | "^" | "&" | "in"
            | "instanceof"
    constructor(t: Token) {
        this.operator =
            (<"==" | "!=" | "===" | "!=="
            | "<" | "<=" | ">" | ">="
            | "<<" | ">>" | ">>>"
            | "+" | "-" | "*" | "/" | "%"
            | "|" | "^" | "&" | "in"
            | "instanceof"> t.value)
    }
}


class AssignmentExpression implements Expression {
    type = "AssignmentExpression";
    operator: AssignmentOperator;
    left: Identifier | Expression;
    right: Expression;
    constructor(
        left: Identifier | Expression,
        operator: AssignmentOperator,
        right: Expression
    ) {
        this.operator = operator
        this.left = left
        this.right = right
    }
}

class AssignmentOperator implements BaseNode{
    type = "AssignmentOperator"
    operator: "=" | "+=" | "-=" | "*=" | "/=" | "%="
            | "<<=" | ">>=" | ">>>="
            | "|=" | "^=" | "&="
    constructor(t: Token) {
        this.operator = <
            "=" | "+=" | "-=" | "*=" | "/=" | "%="
            | "<<=" | ">>=" | ">>>="
            | "|=" | "^=" | "&="
            > t.value
    }
}

class LogicalExpression implements Expression {
    type = "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
    constructor(
        left: Expression,
        operator: LogicalOperator,
        right: Expression
    ) {
        this.left = left
        this.operator = operator
        this.right = right
    }
}

class LogicalOperator implements BaseNode{
    type = "LogicalOperator"
    operator: "||" | "&&"
    constructor(t: Token) {
        this.operator = <"||" | "&&">t.value
    }
}

class MemberExpression implements Expression {
    type = "MemberExpression";
    object: Expression;
    property: Expression;
    computed: boolean;
    // computed true : a[b]
    // computed false : a.b
    constructor(object: Expression, property: Expression, computed: boolean) {
        this.object = object
        this.property = property
        this.computed = computed
    }
}

class ConditionalExpression implements Expression {
    type = "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
    constructor(
        test: Expression,
        consequent: Expression,
        alternate: Expression,
    ) {
        this.test = test
        this.alternate = alternate
        this.consequent = consequent
    }
}

type LeftHandSideExpression = CallExpression | MemberExpression

class CallExpression implements Expression {
    type = "CallExpression";
    callee: Expression;
    arguments_: Array<Expression>;
    constructor(callee: Expression, arguments_: Array<Expression>) {
        this.callee = callee
        this.arguments_ = arguments_
    }
}

class CallOrMemberExpressionPart {
    type: "[]" | "." | "()"
    value: SequenceExpression | Identifier | Array<Expression>
    constructor(
        type: "[]" | "." | "()",
        value: SequenceExpression | Identifier | Array<Expression>
    ) {
        this.type = type
        this.value = value
    }
}

class NewExpression implements Expression {
    type = "NewExpression";
    callee: Expression;
    arguments_: Array< Expression >;
    constructor(callee: Expression, arguments_: Array< Expression >) {
        this.callee = callee
        this.arguments_ = arguments_
    }

}

class SequenceExpression implements Expression {
    type = "SequenceExpression"
    expressions: Array< Expression >
    constructor(expressions: Array< Expression >) {
        this.expressions = expressions
    }
}

type Call_Member_NewExpression
    = CallExpression
    | MemberExpression
    | NewExpression


type Node
    = BaseNode
    | Identifier
    | Literal
    | Program
    | Function
    | ExpressionStatement
    | Directive
    | BlockStatement
    | FunctionBody
    | EmptyStatement
    | DebuggerStatement
    | ReturnStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | SwitchCase
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | Declaration
    | FunctionDeclaration
    | VariableDeclaration
    | VariableDeclarator
    | ThisExpression
    | ArrayExpression
    | ObjectExpression
    | Property
    | FunctionExpression
    | UnaryExpression
    | UnaryOperator
    | UpdateExpression
    | UpdateOperator
    | BinaryExpression
    | BinaryOperator
    | AssignmentExpression
    | AssignmentOperator
    | LogicalExpression
    | LogicalOperator
    | MemberExpression
    | LeftHandSideExpression
    | ConditionalExpression
    | CallExpression
    | NewExpression
    | SequenceExpression
    | Call_Member_NewExpression

export {
    Node,
    Expression,
    Statement,
    Identifier,
    Literal,
    Program,
    Function,
    ExpressionStatement,
    Directive,
    BlockStatement,
    FunctionBody,
    EmptyStatement,
    DebuggerStatement,
    ReturnStatement,
    BreakStatement,
    ContinueStatement,
    IfStatement,
    SwitchStatement,
    SwitchCase,
    WhileStatement,
    DoWhileStatement,
    ForStatement,
    Declaration,
    FunctionDeclaration,
    VariableDeclaration,
    VariableDeclarator,
    ThisExpression,
    ArrayExpression,
    ObjectExpression,
    Property,
    FunctionExpression,
    UnaryExpression,
    UnaryOperator,
    UpdateExpression,
    UpdateOperator,
    BinaryExpression,
    BinaryOperator,
    AssignmentExpression,
    AssignmentOperator,
    LogicalExpression,
    LogicalOperator,
    MemberExpression,
    ConditionalExpression,
    CallExpression,
    LeftHandSideExpression,
    NewExpression,
    SequenceExpression,
    CallOrMemberExpressionPart,
    Call_Member_NewExpression,
}
