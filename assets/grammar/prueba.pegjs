{
  let visitor;
  let symbolTable;
}

Program
  = _ statements:statement* _ {
      return { type: "Program", body: statements };
  }

statement
  = _ s:(variableDeclaration
  / printStatement)_ { return s; }

variableDeclaration
  = type:DataType _ id:Identifier _ "=" _ expr:expression _ ";" {
      return { type: "VariableDeclaration", dataType: type, id, expr };
  }

printStatement
  = "print" _ "(" _ expr:expression _ ")" _ ";" {
      return { type: "PrintStatement", expr };
  }

expression
  = left:term _ op:("+" / "-" / "*" / "/") _ right:term {
      return { type: "BinaryExpression", operator: op, left, right };
  }
  / term

term
  = number
  / string
  / id:Identifier { return { type: "Identifier", name: id }; }

number
  = [0-9]+("." [0-9]+)? {
      return { type: "Literal", value: parseFloat(text()) };
  }

string
  = "\"" chars:[a-zA-Z ]* "\"" {
      return { type: "Literal", value: chars };
  }

DataType
  = "int" / "float" / "string"

Identifier
  = [a-zA-Z_][a-zA-Z0-9_]* {
      return text();
  }

_ = [ \t\n\r]*   // Espacios en blanco opcionales
