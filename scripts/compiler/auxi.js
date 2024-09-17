class SymbolTable {
    constructor(parent = null) {
        this.symbols = {};  // Almacena los símbolos en el entorno actual
        this.parent = parent;  // Referencia al entorno padre (si lo hay)
    }

    addSymbol(id, type, value) {
        if (this.existsInCurrentScope(id)) {
            throw new Error(`Variable '${id}' ya está declarada en este entorno.`);
        }
        this.symbols[id] = { type, value };
    }

    modifySymbol(id, value) {
        if (this.symbols[id]) {
            this.symbols[id].value = value;
        } else if (this.parent) {
            // Si no está en el entorno actual, intentar en el entorno padre
            this.parent.modifySymbol(id, value);
        } else {
            throw new Error(`Variable '${id}' no está declarada.`);
        }
    }

    getSymbol(id) {
        if (this.symbols[id]) {
            return this.symbols[id];
        } else if (this.parent) {
            // Buscar en el entorno padre
            return this.parent.getSymbol(id);
        } else {
            throw new Error(`Variable '${id}' no está declarada.`);
        }
    }

    existsInCurrentScope(id) {
        return this.symbols.hasOwnProperty(id);
    }

    existsInAnyScope(id) {
        if (this.existsInCurrentScope(id)) {
            return true;
        } else if (this.parent) {
            return this.parent.existsInAnyScope(id);
        }
        return false;
    }
}

class InterpreterVisitor {
    constructor() {
        this.globalSymbolTable = new SymbolTable(); // Entorno global
        this.currentSymbolTable = this.globalSymbolTable; // Apunta al entorno actual
    }

    enterFunctionScope() {
        // Crear un nuevo entorno local con referencia al actual
        const localSymbolTable = new SymbolTable(this.currentSymbolTable);
        this.currentSymbolTable = localSymbolTable;
    }

    exitFunctionScope() {
        // Volver al entorno padre (salir de la función)
        this.currentSymbolTable = this.currentSymbolTable.parent;
    }

    visitVariableDeclaration(declaration) {
        // Comprobar si ya existe una variable con el mismo nombre en cualquier entorno superior
        if (this.currentSymbolTable.existsInAnyScope(declaration.id)) {
            throw new Error(`Variable '${declaration.id}' ya está declarada en un entorno superior.`);
        }
        const value = declaration.value.accept(this);
        this.currentSymbolTable.addSymbol(declaration.id, declaration.type, value);
    }

    visitVariableAssignment(assignment) {
        const value = assignment.value.accept(this);
        this.currentSymbolTable.modifySymbol(assignment.id, value);
    }

    visitLiteral(literal) {
        return literal.value;
    }

    visitFunctionDeclaration(functionDeclaration) {
        // Comprobar si la función ya está declarada
        if (this.globalSymbolTable.existsInCurrentScope(functionDeclaration.id)) {
            throw new Error(`Función '${functionDeclaration.id}' ya está declarada en el entorno global.`);
        }
        this.globalSymbolTable.addSymbol(functionDeclaration.id, "function", functionDeclaration);
    }

    visitFunctionCall(functionCall) {
        const func = this.globalSymbolTable.getSymbol(functionCall.id);

        // Entrar en el ámbito de la función
        this.enterFunctionScope();

        // Asignar valores de los parámetros a los argumentos en la tabla de símbolos local
        for (let i = 0; i < func.params.length; i++) {
            const param = func.params[i];
            const argValue = functionCall.args[i].accept(this);
            this.currentSymbolTable.addSymbol(param.id, param.type, argValue);
        }

        // Ejecutar el cuerpo de la función
        func.body.accept(this);

        // Salir del ámbito de la función
        this.exitFunctionScope();
    }
}
