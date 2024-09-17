Program
    = _ inst:Instructions* _ {
        return { type: "PROGRAM", value: inst };
    }

Instructions
    = _ std: StructDeclaration _ {
        return { type: "INS_STD", value: std };
    }
    / _ decm:MatrixDeclaration _ {
        return { type: "INS_MDEC", value: decm };
    }
    / _ deca:ArrayDeclaration _ {
        return { type: "INS_ADEC", value: deca };
    }
    / _ dec:Declaration _ {
        return { type: "INS_DEC", value: dec };
    }
    / _ b:INSBREAK _ {
        return { type: "INS_BREAK", value: b };
    }
    / _ c:INSCONTINUE _ {
        return { type: "INS_CONTINUE", value: c };
    }
    / _ r:INSRETURN _ {
        return { type: "INS_RETURN", value: r };
    }
    / _ i:AdditionAssign _ {
        return { type: "INS_INCREMENT", value: i };
    }
    / _ d:SubsAssign _ {
        return { type: "INS_DECREMENT", value: d };
    }
    / _ fr:INSFOR _ {
        return { type: "INS_FOR", value: fr };
    }
    / _ i: INSIF _ {
        return { type: "INS_IF", value: i };
    }
    / _ sout:SOUT _ {
        return { type: "INST_SOUT", value: sout };
    }
    / _ exp:Expression _ {
        return { type: "INS_EXPRESION", value: exp};
    }
    / _ cs:INSSWITCH _ {
        return { type: "INS_SWITCH", value: cs };
    }
    / _ wh:INSWHILE _ {
        return { type: "INS_WHILE", value: wh };
    }

// PALABRAS RESERVADAS
TRUE = "true" { return true; }
FALSE = "false" { return false; }
INT = "int" { return text(); }
FLOAT = "float" { return text(); }
STRING = "string" { return text(); }
BOOLEAN = "boolean" { return text(); }
CHAR = "char" { return text(); }
VAR = "var" { return text(); }
NULL = "null" { return null; }
FOR = "for" { return text(); }
PARSEINT = "parseInt" { return text(); }
PARSEFLOAT = "parsefloat" { return text(); }
TOSTRING = "toString" { return text(); }
TOLOWERCASE = "toLowerCase" { return text(); }
TOUPPERCASE = "toUperCase" { return text(); }
TYPEOF = "typeof" { return  text(); }
IF = "if" { return text(); }
ELSE = "else" { return text(); }
SWITCH = "switch" { return text(); }
CASE = "case" { return text(); }
BREAK = "break" { return text(); }
DEFAULT = "default" { return text(); }
CONTINUE = "continue" { return text(); }
RETURN = "return" { return text(); }
WHILE = "while" { return text(); }
NEW = "new" { return text(); }
INDEXOF = "indexOf" { return text(); }
JOIN = "join" { return text(); }
LENGTH = "length" { return text(); }
VOID = "void" { return text(); }
STRUCT = "struct" { return text(); }
FUNCTION = "function" { return text(); }
KEYS = "keys" { return text(); }
OBJECT = "Object" { return text(); }

//INSTRUCCIONES
    //EMBEBIDAS
SOUT
    = "System.out.println(" _ e:Expression _ ")" _ ";"{
        return { type:"SOUT", value: e };
    }
INS_PARSE_INT
    = PARSEINT _ "(" _ e: Expression _ ")" _ ";"{
        return { type: "INS_PARSE_INT", value: e };
    }
    //Intrucciones normales
INSIF
    = IF _"(" _ c:Expression _")"_ "{" _ i:Instructions* _ "}"_ ei:INSELSEIF* _ e:INSELSE?{
        return { type: "IF", value: { condition: c, instructions: i, elseif: ei, else: e } };
    }
INSELSEIF
    = ELSE _ IF _ "("_ e:Expression _ ")" _ "{"_ v:Instructions* _ "}"{
        return { type: "ELSE IF", value: { condition: e, Instructions: v}}
    }
INSELSE
    = ELSE _ "{" _ v:Instructions* _ "}" {
        return { type: "ELSE", value: { Instructions: v } };
    }
INSFOR
    = FOR _ "("_ dec: Declaration _ asign: Expression _ ";" _ step: (Increment / Decrement) _ ")" _ "{" 
        _ Instructions* _   
    "}"{
        return { type:"FOR", value: { start: dec, end: asign, step: step } };
    }
INSSWITCH
    = SWITCH _ "(" e: Expression _ ")" _ "{" _ c: INSCASE+ _ d:INSDEFAULT? _ "}"{
        return { type: "SWITCH", value: { condition: e, cases: c, default: d } };
    }
INSCASE
    = CASE _ e:Expression _":"_ i:Instructions* {
        return { type: "CASE", value: { instructions: i } };
    }
INSWHILE
    = WHILE _ "(" _ c: Expression _ ")" _ "{" _ i:Instructions* _ "}"{
        return { type: "WHILE", value: { condition: c, instructions: i } };
    }
  // TRANSFERENCIA
INSDEFAULT
    = DEFAULT _ ":" _ i:Instructions*{
        return { type: "DEFAULT", value: { instructions: i} };
    }
  // TRANSFERENCIA
INSBREAK
    = BREAK _ ";"{
        return { type: "BREAK" };
    }
INSCONTINUE
    =  CONTINUE _ ";"{
        return { type: "CONTINUE" };
    }
INSRETURN
    = RETURN _ e:Expression? _ ";"{
        return { type: "RETURN", value: { expression: e } };
    }

// VALORES
Expression
    = TernaryExpression

TernaryExpression
    = cond:LogicalExpression _ "?" _ exprA:LogicalExpression _ ":" _ exprB:LogicalExpression {
        return cond ? exprA : exprB;
    }
    / LogicalExpression

LogicalExpression
    = head:OrExpression tail:(_ ("&&" / "||") _ OrExpression)* {
        let result = head;
        for (let i = 0; i < tail.length; i++) {
            if (tail[i][1] === "&&") {
                result = result && tail[i][3];
            } else {
                result = result || tail[i][3];
            }
        }
        return result;
    }

OrExpression
    = head:NotExpression tail:(_ "||" _ NotExpression)* {
        let result = head;
        for (let i = 0; i < tail.length; i++) {
            result = result || tail[i][3];
        }
        return result;
    }

NotExpression
    = "!" _ expr:ComparisonExpression {
        return !expr;
    }
    / ComparisonExpression

ComparisonExpression
    = head:RelationalExpression tail:(_ ("==" / "!=") _ RelationalExpression)* {
        let result = head;
        for (let i = 0; i < tail.length; i++) {
            if (tail[i][1] === "==") {
                result = result === tail[i][3];
            } else {
                result = result !== tail[i][3];
            }
        }
        return result;
    }

RelationalExpression
    = head:AdditionExpression tail:(_ (">=" / "<=" / ">" / "<") _ AdditionExpression)* {
        let result = head;
        for (let i = 0; i < tail.length; i++) {
            if (tail[i][1] === ">") {
                result = result > tail[i][3];
            } else if (tail[i][1] === "<") {
                result = result < tail[i][3];
            } else if (tail[i][1] === ">=") {
                result = result >= tail[i][3];
            } else {
                result = result <= tail[i][3];
            }
        }
        return result;
    }

AdditionExpression
    = head:MultiplicationExpression tail:(_ ("+" / "-") _ MultiplicationExpression)* {
        let result = head;
        for (let i = 0; i < tail.length; i++) {
            if (tail[i][1] === "+") {
                result += tail[i][3];
            } else {
                result -= tail[i][3];
            }
        }
        return result;
    }

MultiplicationExpression
    = head:UnaryExpression tail:(_ ("*" / "/" / "%") _ UnaryExpression)* {
        let result = head;
        for (let i = 0; i < tail.length; i++) {
            if (tail[i][1] === "*") {
                result *= tail[i][3];
            } else if (tail[i][1] === "/") {
                result /= tail[i][3];
            } else if (tail[i][1] === "%") {
                result %= tail[i][3];
            }
        }
        return result;
    }

// EXPRESIONES UNARIAS
UnaryExpression
    = "-" _ expr:UnaryExpression {
        return -expr;
    }
    / "!" _ expr:UnaryExpression {
        return !expr;
    }
    / Value

//
Declaration
    = d: VarDeclaration{
        return { type: "DECLARATION", value: d };
    }
    / d: TypedDeclaration{
        return { type: "DECLARATION", value: d };
    }
    / d: Assignament{
        return { type: "DECLARATION", value: d };
    }

StructDeclaration
    = STRUCT _ i: Id _"{"_ d:Declaration+ _ "}"{
        return { type: "STRUCT", value: { ATTRS: d } };
    }
 
MatrixDeclaration
    = d:DATATYPE _ "["_"]"_"["_"]"_ i:Id _ "=" _ NEW _ d2:DATATYPE _"["_ w:Expression _"]" _ "["_ h:Expression _"]"_";"{
        return { type: "Matrix Declaration", value: {DT1:d, DT2: d2, ID:i, WIDH: w, HEIGHT: h } };
    }
    / d:DATATYPE _ "[" _ "]" _ "[" _ "]" _ i:Id _ "=" _ "{" _ firstRow:MatrixRow otherRows:(_"," _ MatrixRow)* _ "}" _ ";" {
        return { type: "MATRIX_DECLARATION", value: { DT: d, ID: i, Rows: [firstRow].concat(otherRows.map(element => element[3]))/*[firstRow].concat(otherRows)*/ } };
    }
MatrixRow
    = "{" _ e:Expression e2:(_"," _ Expression)* _ "}" {
        return { type: "MATRIX_ROW", values: [e].concat(e2.map(element => element[3])) };
    }
ArrayDeclaration
    = d:DATATYPE _ "["_"]"_ i:Id _ "=" _ NEW _ d2:DATATYPE _ "[" _ l:Expression _ "]" _ ";" {
        return { type: "Array DECLARATION", value: { DTA: d, DTB: d2, ID: i, Length: l } };
    }
    / d:DATATYPE _ "[" _ "]" _ i:Id _ "=" _ "{" _ e:Expression e2:(_ "," _ Expression)* _ "}" _ ";" {
        return { type: "ARRAY_DECLARATION2", value: { DT: d, ID: i, Values: [e].concat(e2.map(element => element[3])) } };
    }
    / d: DATATYPE _ "[" _ "]" _ i:Id _ "=" _ i2:Id _ ";"{
        return { type: "ARRAY_DECLARATION3", value: { DT: d, ID: i, Value: i2 } };
    }
VarDeclaration
    = VAR _ id: Id _ "=" _ expr: Expression _ ";"{
        return { type:"VAR_DEC", value: { TYPE: "var", ID: id, EXPR: expr } };
    }


TypedDeclaration
    = type: DATATYPE _ id: Id _ "=" _ expr: Expression _ ";" {
        return { type:"TYPE_DEC", value: { TYPE: type, ID: id, EXPR: expr } };
    }
    / type: DATATYPE _ id: Id _ ";"{
        return { type: "TYPE_DEC", value: { TYPE: type, ID: id, EXPR: null } };
    }


Assignament
    = id:Id _ "=" _ expr: Expression _ ";"{
        return { type: "ASSIGN", value: { ID: id, EXPR: expr } };
    }


AdditionAssign
    = inc: Increment _ ";"{
        return { type: "ADDITION_ASSIGN", value: inc };
    }


SubsAssign
    = dec: Decrement _ ";"{
        return { type: "SUSB_ASSIGN", value: dec };
    }

Increment
    = id:Id _ "+=" _ expr:Expression{
        return { type: "INCREMENT_A", value: { ID: id, expr: expr } };
    }
    / id:Id _ p:"++"{
        return { type: "INCREMENT_B", value: {  ID: id, expr: p } };
    }

Decrement
    = id:Id _ "-=" _ expr:Expression{
        return { type: "DECREMENT_A", value: { ID: id, expr: expr } };
    }
    / id:Id _ p:"--"{
        return { type: "DECREMENT_B", value: {  ID: id, expr: p } };
    }


Value
    = "(" _ v: Expression _ ")" { return v; }
    / _ v: StrVal _ { return v; }
    / _ v: NumVal _ { return v; }
    / _ v: BoolVal _ { return v; }
    / _ v: CharVal _ { return v; }
    / _ v: NULL _ { return v; }
    / _ v: Id _ { return v; }


StrVal
    = "\"" val: [^\"]* "\"" {
        return val.join("");
    }


CharVal
    = "'" val: [^'] "'" {
        return val;
    }


NumVal
    = ([0-9]+('.'[0-9]+)?) {
        return parseFloat(text(), 10);
    }
    / [0-9]+ {
        return parseInt(text());
    }


BoolVal
    = v: (TRUE / FALSE){
        return v;
    }


Id
    = !Reserved [a-zA-Z_][a-zA-Z0-9_]* {
        return { type: "ID", value: text() };
    }


Reserved
    = BoolVal
    / INT
    / CHAR
    / FLOAT
    / STRING
    / BOOLEAN
    / FOR
    / NULL
    / IF
    / ELSE
    / SWITCH
    / CASE
    / BREAK
    / DEFAULT
    / CONTINUE
    / RETURN
    / WHILE
    / NEW
    / INDEXOF
    / JOIN
    / LENGTH
    / STRUCT
    / OBJECT
    / KEYS
    / TYPEOF
    / VOID
    / PARSEINT
    / PARSEFLOAT
    / TOSTRING
    / TOLOWERCASE
    / TOUPPERCASE
    / TYPEOF



// PRODUCCIONES AUXILIARES

DATATYPE
    = v: INT { return v; }
    / v: FLOAT { return v; }
    / v: STRING { return v; }
    / v: BOOLEAN { return v; }
    / v: CHAR { return v; }
    / v: Id { return v; }


// Manejo de espacios en blanco y comentarios
_
    = (WS / Comment)*

WS
    = [ \t\n\r\f]+

Comment
    = BlockComment / LineComment

BlockComment
    = "/*" (!"*/" .)* "*/"

LineComment
    = "//" [^\n]*
