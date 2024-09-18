export default class SymbolTable {
    constructor(parent = null) {
        this.symbols = {};
        this.parent = parent;
    }
    addSymbol(id, value) {
        if (this.symbols[id]) {
            throw new Error(`Symbol ${id} alreade exists in this scope.`);
        }
        this.symbols[id] = value;
    }
    getSymbol(id) {
        if (this.symbols[id]) {
            return this.symbols[id];
        } else if (this.parent) {
            return this.parent.getSymbol(id);
        } else {
            throw new Error(`Symbol ${id} not found`);
        }
    }
    setSymbolValue(id, value) {

        if (this.symbols[id]) {
            this.symbols[id] = value
        } else if (this.parent) {
            this.parent(this.setSymbolValue(id, value));
        } else {
            throw new Error(`Identifier ${id} not found`);
        }
    }
    checkDeclaration(id) {
        if (this.symbols[id]) {
            throw new Error(`Identifier ${id} already declared in this scope.`);
        }
    }
    createChildScope(){
        return new SymbolTable(this);
    }
}