Program = _ inst:Instructions* _{
    return { type: "Program", body: inst };
}
//INSTRUCCTIONS
Instructions
    = _ s:(Assignment 
    / Declaration
    / StructDeclaration
    / FunctionDeclaration
    / Break
    / Continue
    / Return
    / Sout
    / For
    / If
    / While
    / Switch) _ {
        return s;
    }
Sout = SOUT _ "(" _ e:Expression _ ")" _ ";"{
        return { type: "Sout", expression:e };
    }
//SENTENCES
    Case = CASE _ op:Expression _ ":" _ i:Instructions+{
        return {
            type: "Case",
            option: op,
            instructions: i
        };
    }
    Default = DEFAULT _ ":" _ Instructions+
    ElseIf = ELSE _ IF _ "(" c:Expression ")" _ "{" _ i:Instructions* _ "}"{
        return{
            type: "ElseIf",
            condition:c,
            instructions: i
        };
    }
    Else = ELSE _ "{" _ i:Instructions* _ "}"{
        return{
            type: "Else",
            instructions: i
        }
    }
For = FOR _ "(" _ i:(Declaration / Assignment) _  Expression _ ";" _ (Increment/Decrement)")" _ "{" _ Instructions* _ "}"
While = WHILE _ "(" _ c:Expression _ ")" _ "{" _ i:Instructions* _ "}"{
    return {
        type: "While",
        condition: c,
        instructions: i
    };
}
Switch = SWITCH _ "(" _ c:Expression _ ")" _ "{" _ cs:Case+ _ d:Default? _ "}"{
    return { 
        type: "Switch",
        condition: c,
        cases: cs,
        default: d !== null ? d : null
    };
}
If = IF _ "(" _ c:Expression _ ")" _ "{" _ i:Instructions* _ "}" _ ei:ElseIf* _ e:Else ?{
    return {
        type: "If",
        condition: c,
        instructions: i,
        elseIf: ei.length > 0 ? ei : null,
        elsState: e !== null ? e : null 
    };
}

//TRANSFERENCE
Break = BREAK _ ";"{ return { type:"Break" }; }
Continue = CONTINUE _ ";" { return { type: "Continue" }; }
Return = RETURN _ Expression? _ ";" 
//DECLARATIONS
    Rows
        = _ "{"_ Rows ( _ "," _ Rows)* _ "}"
        /  Expression ( _ "," _ Expression)*
    Params = DataType _ ("["_ Expression _"]")* _ Id (_ "," _ DataType _ ("["_ Expression _ "]")* _ Id)*
VarDeclaration = VAR _ i:Id _ "=" _ e:Expression _ ";" {
        return {
            type: "VarDeclaration",
            id: i,
            expression: e
        };
    }
TypedDeclaration
    = d:DataType _ i:Id _ "=" _ e:Expression _ ";"{
        return {
            type: "TypedDeclaration",
            dataType: d,
            id: i,
            expression: e
        };
    }
    / DataType _ Id _ ";"
ArrayDeclaration
    = DataType _ ("["_"]")+ _ Id _ "=" _ NEW _ DataType _ ("["_ Expression _"]")+ _ ";"
    / DataType _ ("["_"]")+ _ Id _ "=" _ "{" _ Rows (_ "," _ Rows)* _ "}" _ ";"
    / DataType _ ("["_"]")+ _ Id _ "=" _ IdNoMod _ ";"
FunctionDeclaration = ((DataType ("["_"]")*) / VOID) _ Id _ "(" Params* _ ")" _ "{"_ Instructions* _ "}"

StructDeclaration
    = STRUCT _ Id _ "{" _ Declaration+ _"}"
StructInstance = Id _ Id _ "=" _ StructInit _ ";"
StructVal = StructInit / Expression
StructParam = Id _ ":" _ StructVal
StructInit = Id _ "{" _ StructParam ( _ "," _ StructParam)* _ "}"
Declaration
    = _ d:(VarDeclaration
    / StructInstance
    / TypedDeclaration
    / ArrayDeclaration) _{
        return d;
    }
//ASSIGNMENTS
Decrement
    = i:Ids _ "-=" _ e:Expression{
        return {
            type:"Decremental",
            id: i,
            expr: e
        };
    }
    / i:Ids _ "--"{
        return {
            type:"Decremental",
            id: i,
            value: -1
        };
    }
Increment
    = i:Ids _ "+=" _ e:Expression{
        return {
            type: "Incremental",
            id: i,
            expr: e
        };
    }
    / i:Ids _ "++"{
        return {
            type: "Incremental",
            id: i,
            value: 1
        };
    }
AdditionAssign = i:Increment _ ";"{
    return i;
}
SubsAssign = d:Decrement _ ";"{
    return d;
}

Assignment
    = AdditionAssign
    / SubsAssign
    / i:Ids _ "=" _ e:Expression _ ";"{
        return {
            type: "Assignment",
            id: i,
            expression: e
        };
    } 

//EXPRESSION
Expression = TernaryExpression
TernaryExpression
    = c:LogicalExpression _ "?" _ t:LogicalExpression _ ":" _ f:LogicalExpression{
        return {
            type: "Ternary",
            condition: c,
            trueExp: t,
            falseExp: f
        };
    }
    / LogicalExpression
LogicalExpression = left:OrExpression tail:( _ operator:("&&" / "||") _  right:OrExpression)*{
        if(tail.length === 0){ return left; }
        return {
            type: "Logical",
            left,
            right: tail.map(([_, op, __, expr])=> ({op, expr}))
        };
    }
OrExpression = left:NotExpression tail:( _ operator:"||" _ right:NotExpression)*{
        if(tail.length === 0){ return left; }
        return {
            type: "Or",
            left,
            right: tail.map(([_, op, __, expr])=> ({op,expr}))
        };
    }
NotExpression
    = "!" _ c:ComparisonExpression{
        return { type:"Not", exp: c};
    }
    / ComparisonExpression
ComparisonExpression = left:RelationalExpression tail:(_ operator:("=="/"!=") _ right:RelationalExpression)*{
        if(tail.length === 0){ return left; }
        return {
            type: "Comparison",
            left,
            right: tail.map(([_, op, __, expr])=>({op, expr}))
        };
    }
RelationalExpression = left:AdditionExpression tail:( _ operator:(">="/"<="/">"/"<") _ right:AdditionExpression)*{
    if(tail.length === 0){ return left; }
    return {
        type: "Relational",
        left,
        right: tail.map(([_, op, __, expr])=>({op, expr}))
    };
}
AdditionExpression = left:MultiplicationExpression tail:( _ operator:("+"/"-") _ right:MultiplicationExpression)*{
    if(tail.length === 0){ return left; }
    return {
        type: "Addition",
        left,
        right: tail.map(([_, op, __, expr])=>({op, expr}))
    };
}
MultiplicationExpression = left:UnaryExpression tail:( _ operator:("*"/"/"/"%") _ right:UnaryExpression)*{
    if(tail.length === 0){ return left; }
    return {
        type: "Multiplication",
        left,
        right: tail.map(([_, op, __, expr])=>({op, expr}))
    };
}
UnaryExpression
    = "-" _ e:UnaryExpression { return { type:"Unary", op: "-", exp: e}; }
    / "+" _ e:UnaryExpression { return { type:"Unary", op: "+", exp: e}; }
    / "!" _ e:UnaryExpression { return { type:"Unary", op: "!", exp: e}; }
    / v:Value { return v;}
//VALUES
StrVal = "\"" s:[^\"]* "\"" { return { type: "StrVal", value: s }; }
CharVal = "'" c:[^'] "'" { return { type: "CharVal", value: c }; }
BoolVal = TRUE { return { type:"BoolVal", value: true }; } / FALSE { return { type:"BoolVal", value: false }; } 
NumVal
    = [0-9]?'.'[0-9]+ { return { type: "NumVal", value:{ type: "f", val: parseInt(text()) } }; }
    / [0-9]+ { return {type:"NumVal", value: { type:"i", val: parseInt(text()) } }; }
ParamValues
    = Expression ( _ "," _ Expression)*
    // SYSTEM FUNCTIONS
    ObjectKeys = OBJKYS _ "(" _ Expression _ ")"
    ParseFloat = PARSEFLOAT _ "("_ Expression _ ")"
    ParseInt = PARSEINT _ "(" _ Expression _ ")"
    ToLowerCase = TOLOWERCASE _ "(" _ Expression _ ")"
    ToString = TOSTRING _ "(" _ Expression _ ")"
    ToUpperCase = TOUPPERCASE _ "(" _ Expression _ ")"
    TypeOf = TYPEOF  _ Expression
    // ARRAY VALS
    IndexOf = IdNoMod"."INDEXOF _ "(" _ Expression _ ")"
    Join = IdNoMod"."JOIN _ "(" _ ")"
    Length = IdNoMod"."LENGTH

Value
    = "(" _ e:Expression _ ")" { return e; }
    / s:StrVal { return s; }
    / c:CharVal { return c; }
    / b:BoolVal { return b; }
    / n:NumVal { return n; }
    / NULL { return { type: "None", value: null }; }
    / i:IdNoMod { return i;} 

// ID's & DATATYPES
Id
    = r:Reserved? [a-zA-Z_][a-zA-Z0-9_]* {
        if(r){
            return { type: "Id", cat: "normal", value: { id: text()+r } };
        }
        return {type : "Id", cat: "normal", value: { id: text() } };
    }
IdArray
    = i:Id _ d:("["_ Expression _ "]")+ { return { type: "Id", cat: "array", value: { id: i, dimensions: d } }; }
IdFunction
    = i:Id".(" _ p:ParamValues * _ ")" { return { type: "Id", cat: "function", value: { id: i, params: p } }; }
IdStruct
    = s:Id"."k:Id { return { type:"Id", cat:"struct", value: {struct: s, key: k } }; }
Ids
    = i:(IdArray
    / IdStruct
    / Id) { return i; }
IdNoMod
    = i:(Ids
    / IdFunction){ return i; }

DataType
    = dt:(INT
    / FLOAT
    / STRING
    / CHAR
    / BOOLEAN
    / Id){ return dt; }

// PALABRAS RESERVADAS
BOOLEAN = "boolean" { return text(); }
BREAK = "break" { return text(); }
CASE = "case" { return text(); }
CHAR = "char" { return text(); }
CONTINUE = "continue" { return text(); }
DEFAULT = "default" { return text(); }
ELSE = "else" { return text(); }
FALSE = "false" { return text(); }
FLOAT = "float" { return text(); }
FOR = "for" { return text(); }
IF = "if" { return text(); }
INDEXOF = "indexOf" { return text(); }
INT = "int" { return text(); }
JOIN = "join" { return text(); }
LENGTH = "length" { return text(); }
NEW = "new" { return text(); }
NULL = "null" { return text(); }
OBJKYS = "Object.keys" { return text(); }
PARSEFLOAT = "parsefloat" { return text(); }
PARSEINT = "parseInt" { return text(); }
RETURN = "return" { return text(); }
STRING = "string" { return text(); }
STRUCT = "struct" { return text(); }
SOUT = "System.out.println" { return text(); }
SWITCH = "switch" { return text(); }
TOLOWERCASE = "toLowerCase" { return text(); }
TOSTRING = "toString" { return text(); }
TOUPPERCASE = "toUpperCase" { return text(); }
TRUE = "true" { return text(); }
TYPEOF = "typeof" { return text(); }
VAR = "var" { return text(); }
VOID = "void" { return text(); }
WHILE = "while" { return text(); } 

Reserved
    = BOOLEAN
    / BREAK
    / CASE
    / CHAR
    / CONTINUE
    / DEFAULT
    / ELSE
    / FALSE
    / FLOAT
    / FOR
    / IF
    / INDEXOF
    / INT
    / JOIN
    / LENGTH
    / NEW
    / NULL
    / OBJKYS
    / PARSEFLOAT
    / PARSEINT
    / RETURN
    / STRING
    / STRUCT
    / SOUT
    / SWITCH
    / TOLOWERCASE
    / TOSTRING
    / TOUPPERCASE
    / TRUE
    / TYPEOF
    / VAR
    / VOID
    / WHILE

//ESPACIOS EN BLANCO
_ = (WS / Comment)*
WS = [ \t\n\r\f]+
Comment = Block / Line
Block = "/*"(!"*/" .)*"*/"
Line = "//" [^\n]*