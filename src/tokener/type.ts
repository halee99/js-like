enum tokenType  {
    KEYWORD= 'KEYWORD',
    ID= 'ID',
    PUNCTUATOR= 'PUNCTUATOR',
    NUMBER= 'NUMBER',
    STRING= 'STRING',
    BLANK= 'BLANK',
    BOOLEAN= 'BOOLEAN',
    INITIAL= 'INITIAL',
    NULL='NULL',
    EOF='EOF',
}

const _keywordMap1 = {
    'false': tokenType.BOOLEAN,
    'true': tokenType.BOOLEAN,
    'null': tokenType.NULL,
}

const keywordList = [
    'let', "await", "break", "case", "catch",
    "class", "const", "continue", "debugger",
    "default", "delete", "do", "else", "export",
    "extends", "finally", "for", "function", "if",
    "import", "in", "instanceof", "new", "return",
    "super", "switch", "this", "throw", "try", "typeof",
    "var", "void", "while", "with", "yield",
    ]

const _keywordMap2 = {}

keywordList.forEach(e => {
    _keywordMap2[e] = tokenType.KEYWORD
})

const keywordMap = {
    ..._keywordMap1,
    ..._keywordMap2,
}

console.log("keywordMap", keywordMap)

const punctuatorList = [
    '+',
    '-',
    '*',
    '/',
    '%',
    '=',
    '>',
    '<',
    ',',
    ';',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '.',
]

const morePunctuatorList = [
    '==',
    '===',
    '>=',
    '<=',
    '=>',
    '++',
    '--',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
]

const quotationList = [
    '\'',
    '\"',
    '\`',
]

interface Token {
    type: string
    value: string
}

export {
    tokenType,
    keywordMap,
    punctuatorList,
    morePunctuatorList,
    quotationList,
    Token,
}
