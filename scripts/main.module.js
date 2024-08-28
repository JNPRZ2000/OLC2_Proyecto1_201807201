import { parse, StartRules } from "../scripts/grammar/parser.js";
document.getElementById('btnRun').addEventListener('click', () => {
    const currentDate = new Date();
    // Obtener componentes de la fecha y hora
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    // Formatear la fecha y hora como una cadena
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    document.getElementById('console').value = formattedDate + "\n";
    const code = document.getElementById('code').value;
    try {
        const tree = parse(code.trim(), {
            StartRules: ["Program"]
        });
        document.getElementById('console').value += `${JSON.stringify(tree, null, 2)}`;

    } catch (e) {
        const location = e.location || {};
        const line = location.start?.line || 'unknown';
        const column = location.start?.column || 'unknown';
        let err = "Sintax Error {\n";
        err += `\tMessage: ${e.message}\n`;
        err += `\tLine: ${line}\n`;
        err += `\tColumn: ${column}\n`;
        err += `\tCause: ${code.split('\n')[line - 1]?.[column - 1] || 'unknown'}\n`;
        err += `\tContext: ${code.split('\n')[line - 1]}\n}`;
        document.getElementById("console").value += err;
    }
});

document.getElementById('btnCST').addEventListener('click', () => {
    document.getElementById('console').value += "CST\t";
});

document.getElementById('btnAST').addEventListener('click', () => {
    document.getElementById('console').value += "AST\t";
});
