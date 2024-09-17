import SymbolTable from "./symbol/SymbolTable.js";
class Visitor {
    constructor(/** @type {SymbolTable} */symbolTable) {
        this.symbolTable = symbolTable;
        this.semanticErrors = [];
    }
    visit(node) {
        switch (node.type) {
            case "Program": return this.visitProgram(node);
            case "Switch": return this.visitSwitch(node);
            case "Case": return this.visitCase(node);
            case "Default": return this.visitDefault(node);
            case "Break": return this.visitBreak(node);
            case "Return": return this.visitReturn(node);
            case "Continue": return this.visitReturn(node);
            case "If": return this.visitIf(node);
            case "ElseIf": return this.visitElseIf(node);
            case "Else": return this.visitElse(node);
            case "Assignment": return this.visitAssignment(node);
            case "Incremental": return this.visitIncremental(node);
            case "Decremental": return this.visitDecremental(node);
            case "While": return this.visitWhile(node);
            case "VarDeclaration": return this.visitVarDeclaration(node);
            case "TypedDeclaration": return this.visitTypedDeclaration(node);
            case "Ternary": return this.visitTernary(node);
            case "Logical": return this.visitLogical(node);
            case "Or": return this.visitOr(node);
            case "Not": return this.visitNot(node);
            case "Comparison": return this.visitComparison(node);
            case "Relational": return this.visitRelational(node);
            case "Addition": return this.visitAddition(node);
            case "Multiplication": return this.visitMultiplication(node);
            case "Unary": return this.visitUnary(node);
            case "Sout": return this.visitSout(node);
            case "StrVal": return this.visitStrVal(node);
            case "CharVal": return this.visitCharVal(node);
            case "BoolVal": return this.visitBoolVal(node);
            case "NumVal": return this.visitNumVal(node);
            case "None": return this.visitNone(node);
            case "Id": return this.visitId(node);
            default:
                console.error(`Nodo no reconocido: ${JSON.stringify(node, null, 2)}`);
        }
    }
    visitSwitch(node) { }
    visitCase(node) {
    }
    visitDefault(node) {
        console.log(`Default`);
        for (let instruction of node.instructions) {
            const result = this.visit(instruction);
            if(result === "break"){
                return;
            }
        }
    }
    visitContinue(node) {
        console.log(`Continue`);
        return "continue";
    }
    visitReturn(node) { }
    visitBreak(node) {
        console.log(`Break`);
        return "break";
    }
    visitIf(node) {
        console.log(`IF`);
        if (this.visit(node.condition)) {
            for (let instruction of node.instructions) {
                this.visit(instruction);
            }
            return
        } else if (node.elseIf) {
            for (let elseif of node.elseIf) {
                if (this.visit(elseif)) {
                    console.log("MATCH");
                    return;
                }
            }
        }
        console.log("NO MATCHES");
        if (node.elsState) {
            this.visit(node.elsState);
        }
    }
    visitElseIf(node) {
        console.log(`ELSE IF`);
        if (this.visit(node.condition)) {
            for (let instruction of node.instructions) {
                this.visit(instruction);
            }
            return true;
        }
        return false;
    }
    visitElse(node) {
        console.log(`ELSE`);
        for (let instruction of node.instructions) {
            this.visit(instruction);
        }
    }
    visitWhile(node) {
        console.log(`WHILE: ${JSON.stringify(node, null, 2)}`);
        //let condition = this.visit(node.condition);
        while (this.visit(node.condition)) {
            for (const instruction of node.instructions) {
                this.visit(instruction);
            }
            //expression = this.visit(node.condition)
        }
    }
    visitDecremental(node) {
        console.log(`DECREMENTAL`)
        const id = node.id.value.id;
        let val = this.symbolTable.getSymbol(id);
        if (node.value) {
            val.value = val.value - 1;
        }
        if (node.expr) {
            const expr = this.visit(node.expr);
            val.value = val.value - expr;
        }
        this.symbolTable.setSymbolValue(id, val);
    }
    visitIncremental(node) {
        console.log(`INCREMENTAL`)
        const id = node.id.value.id;
        let val = this.symbolTable.getSymbol(id);
        if (node.value) {
            val.value = val.value + 1;
        }
        if (node.expr) {
            const expr = this.visit(node.expr);
            val.value = val.value + expr;
        }
        this.symbolTable.setSymbolValue(id, val);
    }
    visitAssignment(node) {
        console.log(`ASSIGNMENT`);
        const id = node.id.value.id;
        const value = this.visit(node.expression);
        const val = this.symbolTable.getSymbol(id);
        val.value = value;
        this.symbolTable.setSymbolValue(id, val);

        //console.log(`Id: ${id}\nVal: ${value}`);
    }
    visitVarDeclaration(node) { }
    visitTypedDeclaration(node) {
        const dataType = node.dataType;
        const id = node.id.value.id;
        const value = this.visit(node.expression);
        //console.log(`DT: ${dataType}\nId: ${id}\nValue: ${value}`);
        const val = {
            type: "variable",
            dataType: dataType,
            value: value,
        }
        this.symbolTable.addSymbol(id, val);
    }
    visitTernary(node) {
        console.log("Ternary");
        const condition = this.visit(node.condition);
        const trueVal = this.visit(node.trueExp);
        const falseVal = this.visit(node.falseExp);
        return condition ? trueVal : falseVal;
    }
    visitLogical(node) {
        console.log("Logical");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "&&": left = left && right;
                        break;
                    case "||": left = left || right;
                        break;
                }
            }
        }
        return left;
    }
    visitOr(node) {
        console.log(`OR:\n{JSON.stringify(node)}`);
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                left = left || right;
            }
        }
        return left;
    }
    visitNot(node) {
        console.log("Not");
        return !this.visit(node.exp);
    }
    visitComparison(node) {
        console.log("Comparison");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "==": left = left == right;
                        break;
                    case "!=": left = left != right;
                        break;
                }
            }
        }
        return left;
    }
    visitRelational(node) {
        console.log("Relational");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case ">=": left = left >= right;
                        break;
                    case "<=": left = left <= right;
                        break;
                    case ">": left = left > right;
                        break;
                    case "<": left = left < right;
                        break;
                }
            }
        }
        return left;
    }
    visitAddition(node) {
        console.log("Addition");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "+":
                        left += right;
                        break;
                    case "-":
                        left -= right;
                        break;
                }
            }
        }
        return left;
    }
    visitMultiplication(node) {
        console.log(`Multiplication\n{JSON.stringify(node, null, 2)}`);
        let left = this.visit(node.left);
        //console.log(`Left:\n{JSON.stringify(left, null, 2)}`);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                //console.log(`Rigth:\n${left, null, 2}`);
                switch (op) {
                    case "*":
                        left *= right;
                        break;
                    case "/":
                        left /= right;
                        break;
                    case "%":
                        left %= right;
                        break;
                }
            }
        }
        return left;
    }
    visitUnary(node) {
        console.log("Unary");
        switch (node.op) {
            case "-":
                return -this.visit(node.exp)
            case "+":
                return +this.visit(node.exp);
            case "!":
                return !this.visit(node.exp);
        }
    }
    visitSout(node) {
        console.log("Sout");
        const value = this.visit(node.expression);
        document.getElementById("console").value += `\n${value}`;
    }
    visitStrVal(node) {
        console.log(`STRVAL:\n{JSON.stringify(node)}`);
        return node.value.join('');
    }
    visitCharVal(node) {
        console.log("CharVal");
        return node.value;
    }
    visitBoolVal(node) {
        console.log("BoolVal");
        return node.value;
    }
    visitNumVal(node) {
        console.log("NumVal");
        return node.value.val;
    }
    visitNone(node) {
        console.log("NONE");
        return node.value;
    }
    visitId(node) {
        console.log(`ID:\n{JSON.stringify(node, null, 2)}`);
        switch (node.cat) {
            case "normal":
                try {
                    const ret = this.symbolTable.getSymbol(node.value.id);
                    //console.log(`RET:\n${ret.value}`);
                    return ret.value;
                } catch (e) {
                    console.error(e);
                    return undefined;
                }
            case "array":
                break;
            case "function":
                break;
            case "struct":
                break;
            default:
                break;
        }

    }
    visitProgram(node) {
        console.log("Program");
        node.body.forEach(statement => {
            this.visit(statement);
        });
    }
}

export default Visitor;