Program
    = _ inst:Instructions* _ {
        return { type: "PROGRAM", value: inst };
    }

Instructions
    = _ dec:Declaration _ {
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
IF = "if" { return text(); }
ELSE = "else" { return text(); }
SWITCH = "switch" { return text(); }
CASE = "case" { return text(); }
BREAK = "break" { return text(); }
DEFAULT = "default" { return text(); }
CONTINUE = "continue" { return text(); }
RETURN = "return" { return text(); }
WHILE = "while" { return text(); }
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
    / id:Id p:"++"{
        return { type: "INCREMENT_B", value: {  ID: id, expr: p } };
    }
Decrement
    = id:Id _ "-=" _ expr:Expression{
        return { type: "DECREMENT_A", value: { ID: id, expr: expr } };
    }
    / id:Id p:"--"{
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
    / DATATYPE
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

// PRODUCCIONES AUXILIARES
DATATYPE
    = v: INT { return v; }
    / v: FLOAT { return v; }
    / v: STRING { return v; }
    / v: BOOLEAN { return v; }
    / v: CHAR { return v; }

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
