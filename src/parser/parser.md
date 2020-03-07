Literal	::=	( <DECIMAL_LITERAL> | <HEX_INTEGER_LITERAL> | <STRING_LITERAL> | <BOOLEAN_LITERAL> | <NULL_LITERAL> | <REGULAR_EXPRESSION_LITERAL> )
Identifier	::=	<IDENTIFIER_NAME>

Program	::=	( SourceElements )? <EOF>

SourceElements	::=	( SourceElement )+

SourceElement	::=	FunctionDeclaration | Statement

函数
FunctionDeclaration	::=	"function" Identifier ( "(" ( FormalParameterList )? ")" ) FunctionBody

FunctionExpression	::=	"function" ( Identifier )? ( "(" ( FormalParameterList )? ")" ) FunctionBody

FormalParameterList	::=	Identifier ( "," Identifier )*

FunctionBody ::= "{" ( SourceElements )? "}"

语句
Statement	::=	Block
|	JScriptVarStatement // delete
|	VariableStatement
|	EmptyStatement
|	LabelledStatement // delete
|	ExpressionStatement
|	IfStatement
|	IterationStatement
|	ContinueStatement
|	BreakStatement
|	ImportStatement // delete
|	ReturnStatement
|	WithStatement // delete
|	SwitchStatement
|	ThrowStatement // delete
|	TryStatement // delete

Block	::=	"{" ( StatementList )? "}"

StatementList	::=	( Statement )+

变量 var
VariableStatement ::= ("var" | "let" | "const") VariableDeclarationList ( ";" )?

VariableDeclarationList	::=	VariableDeclaration ( "," VariableDeclaration )*

VariableDeclaration	::=	Identifier ( Initialiser )?

赋值
Initialiser	::=	"=" AssignmentExpression

表达式
AssignmentExpression ::= ( LeftHandSideExpression AssignmentOperator AssignmentExpression | ConditionalExpression )

[ 单式子
LeftHandSideExpression	::=	CallExpression | MemberExpression

AssignmentOperator	::=	( "=" | "*=" | <SLASHASSIGN> | "%=" | "+=" | "-=" | "<<=" | ">>=" | ">>>=" | "&=" | "^=" | "|=" )



调用
CallExpression	::=	MemberExpression Arguments ( CallExpressionPart )*

MemberExpression ::= ( ( FunctionExpression | PrimaryExpression ) ( MemberExpressionPart )* )
|	AllocationExpression

Arguments ::= "(" ( ArgumentList )? ")"

ArgumentList ::= AssignmentExpression ( "," AssignmentExpression )*

MemberExpressionPart ::= ( "[" Expression "]" ) | ( "." Identifier )

new
AllocationExpression ::= ( "new" MemberExpression ( ( Arguments ( MemberExpressionPart )* )* ) )

多调用
CallExpressionPart	::=	Arguments
|	( "[" Expression "]" )
|	( "." Identifier )

最优先
PrimaryExpression	::=	"this"
|	ObjectLiteral
|	( "(" Expression ")" )
|	Identifier
|	ArrayLiteral
|	Literal

对象
ObjectLiteral	::=	"{" ( PropertyNameAndValueList )? "}"

PropertyNameAndValueList ::= PropertyNameAndValue ( "," PropertyNameAndValue | "," )*

PropertyNameAndValue ::= PropertyName ":" AssignmentExpression

PropertyName	::=	Identifier
|	<STRING_LITERAL>
|	<DECIMAL_LITERAL>

数组
ArrayLiteral	::=	"[" ( ( Elision )? "]" | ElementList Elision "]" | ( ElementList )? "]" )
ElementList	::=	( Elision )? AssignmentExpression ( Elision AssignmentExpression )*
Elision	::=	( "," )+

多表达式
Expression	::=	AssignmentExpression ( "," AssignmentExpression )*


条件判断 与 三元表达式
ConditionalExpression	::=	LogicalORExpression ( "?" AssignmentExpression ":" AssignmentExpression )?

运算优先级链
并或判断
LogicalORExpression	::=	LogicalANDExpression ( LogicalOROperator LogicalANDExpression )*
LogicalOROperator	::=	"||"

LogicalANDExpression ::= EqualityExpression ( LogicalANDOperator EqualityExpression )*
LogicalANDOperator	::=	"&&"

// todo 位运算 位移运算

// 等式判断
EqualityExpression	::=	RelationalExpression ( EqualityOperator RelationalExpression )*
EqualityOperator	::=	( "==" | "!=" | "===" | "!==" )

// 比较判断
RelationalExpression	::=	AdditiveExpression ( RelationalOperator AdditiveExpression )*
RelationalOperator	::=	( "<" | ">" | "<=" | ">=" | "instanceof" )

// 运算
AdditiveExpression	::=	MultiplicativeExpression ( AdditiveOperator MultiplicativeExpression )*
AdditiveOperator	::=	( "+" | "-" )

MultiplicativeExpression	::=	UnaryExpression ( MultiplicativeOperator UnaryExpression )*
MultiplicativeOperator	::=	( "*" | <SLASH>"/" | "%" )

// 单运算
UnaryExpression	::=	( PostfixExpression | ( UnaryOperator UnaryExpression )+ )
UnaryOperator	::=	( "delete" | "void" | "typeof" | "++" | "--" | "+" | "-" | "~" | "!" )

PostfixExpression	::=	LeftHandSideExpression ( PostfixOperator )?
PostfixOperator	::=	( "++" | "--" )


空语句
EmptyStatement	::=	";"

表达式语句
ExpressionStatement	::=	Expression ( ";" )?

if语句
IfStatement	::=	"if" "(" Expression ")" Statement ( "else" Statement )?


迭代
IterationStatement	::=	( "do" Statement "while" "(" Expression ")" ( ";" )? )
|	( "while" "(" Expression ")" Statement )
|	( "for" "(" ( Expression )? ";" ( Expression )? ";" ( Expression )? ")" Statement )
|	( "for" "(" "var" VariableDeclarationList ";" ( Expression )? ";" ( Expression )? ")" Statement )

迭代改造
IterationStatement ::= DoWhileStatement | WhileStatement | ForStatement
DoWhileStatement ::= "do" Statement "while" "(" Expression ")" ( ";" )?
WhileStatement ::= "while" "(" Expression ")" Statement
ForStatement ::= "for" "(" ( VariableStatement | Expression) ? ";" ( Expression )? ";" ( Expression )? ")" Statement

ContinueStatement ::= "continue" ( ";" )?

BreakStatement ::= "break" ( Identifier )? ( ";" )?

ReturnStatement	::=	"return" ( Expression )? ( ";" )?

switch 语句
SwitchStatement	::=	"switch" "(" Expression ")" CaseBlock
CaseBlock	::=	"{" ( CaseClauses )? ( "}" | DefaultClause ( CaseClauses )? "}" )
CaseClauses	::=	( CaseClause )+
CaseClause	::=	( ( "case" Expression ":" ) ) ( StatementList )?
DefaultClause	::=	( ( "default" ":" ) ) ( StatementList )?
