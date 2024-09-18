import SymbolTable from "./symbol/SymbolTable.js";
class Visitor {
    constructor(/** @type {SymbolTable} */symbolTable) {
        this.symbolTable = symbolTable;
        this.semanticErrors = [];
        this.controlContext = {};
    }
    visit(node) {
        switch (node.type) {
            case "Program": return this.visitProgram(node);
            case "For": return this.visitFor(node);
            case "Switch": return this.visitSwitch(node);
            case "Break": return this.visitBreak(node);
            case "Return": return this.visitReturn(node);
            case "Continue": return this.visitContinue(node);
            case "If": return this.visitIf(node);
            case "ElseIf": return this.visitElseIf(node);
            case "Else": return this.visitElse(node);
            case "Assignment": return this.visitAssignment(node);
            case "Incremental": return this.visitIncremental(node);
            case "Decremental": return this.visitDecremental(node);
            case "While": return this.visitWhile(node);
            case "VarDeclaration": return this.visitVarDeclaration(node);
            case "TypedDeclaration": return this.visitTypedDeclaration(node);
            case "TypedDeclaration": return this.visitTypedDeclaration2(node);
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
    visitFor(node) {
        console.log(`For`);
        this.visit(node.init);
        while (this.visit(node.condition)) {
            for (let instruction of node.instructions) {
                const result = this.visit(instruction);
                if (result === "continue") {
                    break;
                } else if (result === "break") {
                    return;
                }
            }
            this.visit(node.update);
        }
    }
    visitSwitch(node) {
        console.log(`Switch {JSON.stringify(node, null, 2)}`);
        const switchValue = this.visit(node.condition);
        let caseMatched = false;
        for (let caseNode of node.cases) {
            const caseValue = this.visit(caseNode.option);
            if (switchValue === caseValue || caseMatched) {
                caseMatched = true;
                for (let instruction of caseNode.instructions) {
                    const result = this.visit(instruction);
                    if (result === "continue" || result === "break") {
                        return result;  // Propaga "continue" o "break" hacia el ciclo exterior
                    }
                }
            }
        }
        if (!caseMatched && node.default) {
            for (let instruction of node.default.instructions) {
                const result = this.visit(instruction);
                if (result === "continue" || result === "break") {
                    return result;  // Propaga "continue" o "break" hacia el ciclo exterior
                }
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
        const condition = this.visit(node.condition);
        if (condition) {
            let result;
            for (let instruction of node.instructions) {
                result = this.visit(instruction);
                if (result === "continue" || result === "break") { return result; }
            }
            return;
        } else if (node.elseIf) {
            let result;
            for (let elseif of node.elseIf) {
                result = this.visitElseIf(elseif);
                if (result === "continue" || result === "break") { return result; }
                else if (result === true) {
                    return;
                }
            }
        }
        if (node.elseState) {
            const result = this.visit(node.elseState);
            if (result === "continue" || result === "break") { return result; }
        }
    }
    visitElseIf(node) {
        console.log(`ELSE IF`);
        const condition = this.visit(node.condition);
        if (condition) {
            let result;
            for (let instruction of node.instructions) {
                result = this.visit(instruction);
                if (result === "continue" || result === "break") { return result; }
            }
            return true;
        }
        return false;
    }
    visitElse(node) {
        let result;
        for (let instruction of node.instructions) {
            result = this.visit(instruction);
            if (result === "continue" || result === "break") { return result; }
        }

    }
    visitWhile(node) {
        console.log(`WHILE`);
        // Crear un nuevo scope solo una vez para el bucle
        const previousSymbolTable = this.symbolTable; // Guardar la tabla de símbolos actual
        this.symbolTable = this.symbolTable.createChildScope(); // Crear una nueva tabla de símbolos (scope) para el while

        // Mientras la condición sea verdadera
        while (this.visit(node.condition).value) {
            let result;

            // Iterar sobre las instrucciones dentro del while
            for (const instruction of node.instructions) {
                result = this.visit(instruction);

                if (result === "continue") {
                    // En caso de continue, rompe este ciclo interno y sigue con la siguiente iteración del while
                    break;
                } else if (result === "break") {
                    // En caso de break, salir del while
                    this.symbolTable = previousSymbolTable; // Restaurar la tabla de símbolos anterior
                    return;
                }
            }
        }

        // Al final del while, restaurar la tabla de símbolos anterior
        this.symbolTable = previousSymbolTable;
        /*
        while (this.visit(node.condition).value) {
            let result;
            for (const instruction of node.instructions) {
                result = this.visit(instruction);
                if (result === "continue") {
                    break;
                } else if (result === "break") {
                    return;
                }
            }
        }*/
    }
    visitDecremental(node) {
        console.log(`DECREMENTAL`)
        const id = node.id.value.id;
        let val = this.symbolTable.getSymbol(id);
        if (val.dataType === "int" || val.dataType === "float") {
            if (node.value) {
                val.value = val.value - 1;
            }
            if (node.expr) {
                const result = this.visit(node.expr);
                val.value = val.value - result.value;
            }
        } else {
            val.value = null;
        }
        this.symbolTable.setSymbolValue(id, val);
    }
    visitIncremental(node) {
        console.log(`INCREMENTAL`)
        const id = node.id.value.id;
        let val = this.symbolTable.getSymbol(id);
        if (val.dataType === "int" || val.dataType === "float") {
            if (node.value) {
                val.value = val.value + 1;
            }
            if (node.expr) {
                const result = this.visit(node.expr);
                val.value = val.value + result.value;
            }
        } else {
            val.value = null;
        }
        this.symbolTable.setSymbolValue(id, val);
    }
    visitAssignment(node) {
        console.log(`ASSIGNMENT`);
        const id = node.id.value.id;
        const result = this.visit(node.expression);
        const val = this.symbolTable.getSymbol(id);
        if (result.dataType === val.dataType) {
            val.value = result.value;
        } else {
            val.value = null;
        }
        this.symbolTable.setSymbolValue(id, val);
    }
    visitVarDeclaration(node) {
        const id = node.id.value.id;
        const result = this.visit(node.expression);
        const val = {
            type: "variable",
            dataType: result.dataType,
            value: result.value
        }
        this.symbolTable.addSymbol(id, val);

    }
    visitTypedDeclaration(node) {
        console.log(`TYPED DEC`);
        const dataType = node.dataType;
        const id = node.id.value.id;
        const value = this.visit(node.expression);
        const val = {
            type: "variable",
            dataType: dataType,
            value: value.value,
        }
        if (value.dataType === dataType) {
            this.symbolTable.addSymbol(id, val);
        } else {
            this.semanticErrors.push({
                cause: "DECLARATION",
                message: `TIPOS NO COINCIDEN DEC:${dataType} && VAL:${value.dataType}[${value.value}]`
            });
            this.symbolTable.addSymbol(id, { type: "variable", dataType: "null", value: null });
        }
    }
    visitTypedDeclaration2(node){
        console.log(`TYPED DEC 2`);
        let val;
        if(node.dataType === "string"){
            val = "";
        }else if(node.dataType === "int"){
            val = 0;
        }else if(node.dataType === "float"){
            val = 0.0;
        }else if(node.dataType === "boolean"){
            val = true;
        }else if(node.dataType === "char"){
            val = '';
        }else{
            val = null;
        }
        const res = {
            type: "variable",
            dataType: node.dataType,
            value: val
        };
        this.symbolTable.addSymbol(node.id.value.id, res);
    }
    visitTernary(node) {
        console.log("Ternary");
        const condition = this.visit(node.condition);
        const trueVal = this.visit(node.trueExp);
        const falseVal = this.visit(node.falseExp);
        return condition.value ? trueVal : falseVal;
    }
    visitLogical(node) {
        console.log("Logical");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "&&":
                        if (left.dataType === "boolean" && right.dataType === "boolean") {
                            left.value = left.value && right.value;
                        } else {
                            this.semanticErrors.push({
                                cause: "AND",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            return {
                                dataType: "null",
                                value: null
                            };
                        }
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
                if (left.dataType === "boolean" && right.dataType === "boolean") {
                    left.value = left.value || right.value;
                } else {
                    this.semanticErrors.push({
                        cause: "OR",
                        message: `Tipos no compatibles: ${left.dataType}[${left.value}] || ${right.dataType}[${right.value}]`
                    });
                    return {
                        dataType: "null",
                        value: null
                    };
                }
            }
        }
        return left;
    }
    visitNot(node) {
        console.log("Not");
        let result = this.visit(node.exp);
        if (result.dataType === "boolean") {
            result.value = !result.value;
            return result;
        } else {
            this.semanticErrors.push({
                cause: "NOT",
                message: `Tipos no compatibles: ${result.dataType}[${result.value}]`
            });
            return { dataType: "null", value: null };
        }
    }
    visitComparison(node) {
        console.log("Comparison");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "==":
                        if ((left.dataType === "boolean" && right.dataType === "boolean")
                            || (left.dataType === "string" && right.dataType === "string")
                            || (left.dataType === "char" && right.dataType === "char")
                            || ((left.dataType === "int" || left.dataType === "float")
                                && (right.dataType === "int" || right.dataType === "float"))) {
                            return {
                                dataType: "boolean",
                                value: left.value == right.value
                            };
                        } else {
                            this.semanticErrors.push({
                                cause: "COMPARACION",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] == ${right.dataType}[${right.value}]`
                            });
                            return { dataType: "null", value: null };
                        }
                    case "!=":
                        if ((left.dataType === "boolean" && right.dataType === "boolean")
                            || (left.dataType === "string" && right.dataType === "string")
                            || (left.dataType === "char" && right.dataType === "char")
                            || ((left.dataType === "int" || left.dataType === "float")
                                && (right.dataType === "int" || right.dataType === "float"))) {
                            return {
                                dataType: "boolean",
                                value: left.value != right.value
                            };
                        } else {
                            this.semanticErrors.push({
                                cause: "COMPARACION",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] != ${right.dataType}[${right.value}]`
                            });
                            return { dataType: "null", value: null };
                        }
                }
            }
        }
        //return left;
    }
    visitRelational(node) {
        console.log("Relational");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case ">=":
                        if (((left.dataType === "int" || left.dataType === "float") && (right.dataType === "int" || right.dataType === "float")) || (left.dataType === "char" && right.dataType === "char")) {
                            return {
                                dataType: "boolean",
                                value: left.value >= right.value
                            };
                        } else {
                            this.semanticErrors.push({
                                cause: "RELACIONAL",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] >= ${right.dataType}[${right.value}]`
                            });
                            return { dataType: "null", value: null };
                        }
                    case "<=":
                        if (((left.dataType === "int" || left.dataType === "float") && (right.dataType === "int" || right.dataType === "float")) || (left.dataType === "char" && right.dataType === "char")) {
                            return {
                                dataType: "boolean",
                                value: left.value <= right.value
                            };
                        } else {
                            this.semanticErrors.push({
                                cause: "RELACIONAL",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] <= ${right.dataType}[${right.value}]`
                            });
                            return { dataType: "null", value: null };
                        }
                    case ">":
                        if (((left.dataType === "int" || left.dataType === "float") && (right.dataType === "int" || right.dataType === "float")) || (left.dataType === "char" && right.dataType === "char")) {
                            return {
                                dataType: "boolean",
                                value: left.value > right.value
                            };
                        } else {
                            this.semanticErrors.push({
                                cause: "RELACIONAL",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] > ${right.dataType}[${right.value}]`
                            });
                            return { dataType: "null", value: null };
                        }
                    case "<":
                        if (((left.dataType === "int" || left.dataType === "float") && (right.dataType === "int" || right.dataType === "float")) || (left.dataType === "char" && right.dataType === "char")) {
                            return {
                                dataType: "boolean",
                                value: left.value < right.value
                            };
                        } else {
                            this.semanticErrors.push({
                                cause: "RELACIONAL",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] < ${right.dataType}[${right.value}]`
                            });
                            return { dataType: "null", value: null };
                        }
                }
            }
        }
        //return left;
    }
    visitAddition(node) {
        console.log("Addition");
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "+":
                        if (left.dataType === "string" && right.dataType === "string") {
                            left.dataType = "string";
                            left.value += right.value;
                        } else if ((left.dataType === "int" && right.dataType === "float") || (left.dataType === "float" && right.dataType === "int")) {
                            left.dataType = "float";
                            left.value += right.value;
                        } else if (left.dataType === "int" && right.dataType === "int") {
                            left.dataType = "int";
                            left.value += right.value;
                        } else if (left.dataType === "float" && right.dataType === "float") {
                            left.dataType = "float";
                            left.value += right.value;
                        } else {
                            this.semanticErrors.push({
                                cause: "SUMA",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            left.dataType = "null";
                            left.value = null;
                        }
                        break;
                    case "-":
                        if (left.dataType === "int" && right.dataType === "int") {
                            left.dataType = "int";
                            left.value -= right.value;
                        } else if ((left.dataType === "int" && right.dataType === "float") || (left.dataType === "float" && right.dataType === "int")) {
                            left.dataType = "float";
                            left.value -= right.value;
                        } else if (left.dataType === "float" && right.dataType === "float") {
                            left.dataType = "float";
                            left.value -= right.value;
                        } else {
                            this.semanticErrors.push({
                                cause: "RESTA",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            left.dataType = "null";
                            left.value = null;
                        }
                        break;
                }
            }
        }
        return left;
    }
    visitMultiplication(node) {
        console.log(`Multiplication`);
        let left = this.visit(node.left);
        if (node.right) {
            for (const { op, expr } of node.right) {
                const right = this.visit(expr);
                switch (op) {
                    case "*":
                        if (left.dataType === "int" && right.dataType === "int") {
                            left.dataType = "int";
                            left.value *= right.value;
                        } else if (left.dataType === "int" || left.dataType === "float" && right.dataType === "int" || right.dataType === "float") {
                            left.dataType = "float";
                            left.value *= right.value;
                        } else {
                            this.semanticErrors.push({
                                cause: "MULTIPLICACION",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            left.dataType = "null";
                            left.value = null;
                        }
                        break;
                    case "/":
                        if (right.value == 0) {
                            this.semanticErrors.push({
                                cause: "DIVISION",
                                message: `División nula: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            left.dataType = "null";
                            left.value = null;
                        }
                        else if (left.dataType === "int" && right.dataType === "int") {
                            left.dataType = "int";
                            left.value = Math.round(left.value / right.value);
                        } else if (left.dataType === "int" || left.dataType === "float" && right.dataType === "int" || right.dataType === "float") {
                            left.dataType = "float";
                            left.value /= right.value;
                        } else {
                            this.semanticErrors.push({
                                cause: "DIVISION",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            left.dataType = "null";
                            left.value = null;
                        }
                        break;
                    case "%":
                        if (left.dataType === "int" && right.dataType === "int") {
                            left.dataType = "int";
                            left.value %= right.value;
                        } else {
                            this.semanticErrors.push({
                                cause: "MODULO",
                                message: `Tipos no compatibles: ${left.dataType}[${left.value}] && ${right.dataType}[${right.value}]`
                            });
                            left.dataType = "null";
                            left.value = null;
                        }
                        break;
                }
            }
        }
        return left;
    }
    visitUnary(node) {
        console.log("Unary");
        const result = this.visit(node.exp);
        switch (node.op) {
            case "-":
                if (result.dataType === "int" || result.dataType === "float") {
                    result.value *= -1;
                    return result;
                } else {
                    this.semanticErrors.push({
                        cause: "NEGACION UNARIA",
                        message: `Tipos no compatibles: ${result.dataType}[${result.value}]`
                    });
                    return { dataType: "null", value: null };
                }
            case "+":
                if (result.dataType === "int" || result.dataType === "float") {
                    return result;
                } else {
                    this.semanticErrors.push({
                        cause: "SUMA UNARIA",
                        message: `Tipos no compatibles: ${result.dataType}[${result.value}]`
                    });
                    return { dataType: "null", value: null };
                }
        }
    }
    visitSout(node) {
        console.log(`SOUT ${JSON.stringify(node, null, 2)}`);
        let msg = `\n`
        let result;
        for (let i = 0; i < node.expressions.length; i++) {
            result = this.visit(node.expressions[i]);
            if (i == 0) {
                msg += `${result.value}`;
            }else{
                msg += ` ${result.value}`;
            }
        }
        document.getElementById("console").value += `\n${msg}`;


    }
    visitStrVal(node) {
        console.log(`STRVAL`);
        return {
            dataType: "string",
            value: node.value
        };
    }
    visitCharVal(node) {
        console.log("CharVal");
        return {
            dataType: "char",
            value: node.value
        };
    }
    visitBoolVal(node) {
        console.log("BoolVal");
        return {
            dataType: "boolean",
            value: node.value
        };
    }
    visitNumVal(node) {
        console.log(`NUMVAL`);
        const dtt = node.value.type;
        let result
        if (dtt === "float") {
            result = parseFloat(node.value.val);
        } else {
            result = parseInt(node.value.val);
        }
        const val = {
            dataType: dtt,
            value: result
        };
        return val;
    }
    visitNone(node) {
        console.log("NONE");
        return {
            value: null,
            dataType: null
        };
    }
    visitId(node) {
        console.log(`ID`);
        switch (node.cat) {
            case "normal":
                try {
                    const ret = this.symbolTable.getSymbol(node.value.id);
                    return {
                        value: ret.value,
                        dataType: ret.dataType
                    };
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
    visitWithScope(node, scope) {
        // Guardamos el scope anterior
        const previousScope = this.symbolTable;

        // Cambiamos el scope actual al nuevo scope
        this.symbolTable = scope;

        // Visitamos el nodo en el nuevo scope
        const result = this.visit(node);

        // Restauramos el scope anterior después de visitar
        this.symbolTable = previousScope;

        return result;
    }
}

export default Visitor;