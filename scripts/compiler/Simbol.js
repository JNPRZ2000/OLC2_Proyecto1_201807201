class SymbolTable {
    constructor() {
      this.table = {};
    }
  
    set(id, value) {
      this.table[id] = value;
    }
  
    get(id) {
      if (id in this.table) {
        return this.table[id];
      }
      throw new Error(`Variable '${id}' no está definida.`);
    }
  }
  
  export default SymbolTable;
  