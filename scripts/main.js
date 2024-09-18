const linesText = document.getElementById('lines');
const codeText = document.getElementById('code');
const cursorPos = document.getElementById('cursorPos');

function updateLines() {
    const lines = codeText.value.split('\n').length;
    let lineNumberContent = '';
    for (let i = 1; i <= lines; i++) {
        lineNumberContent += i + '\n';
    }
    linesText.value = lineNumberContent;
}

function updateCursorPosition() {
    const cursorPostIndex = codeText.selectionStart;
    const textUntilCursor = codeText.value.slice(0, cursorPostIndex);
    const linesUntilCursor = textUntilCursor.split('\n');
    const currentLine = linesUntilCursor.length;
    const currentColumn = linesUntilCursor[linesUntilCursor.length - 1].length;
    cursorPos.textContent = `Línea: ${currentLine}, Columna: ${currentColumn}`;
}

codeText.addEventListener('input', () => {
    updateLines();
    updateCursorPosition();
});

codeText.addEventListener('scroll', () => {
    linesText.scrollTop = codeText.scrollTop;
});

codeText.addEventListener('keyup', () => { updateCursorPosition(); });
codeText.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeText.selectionStart;
        const end = codeText.selectionEnd;
        codeText.value = codeText.value.substring(0, start) + "   " + codeText.value.substring(end);
        codeText.selectionStart = codeText.selectionEnd = start + 3;
        updateCursorPosition();
        updateLines();
    } else {
        updateCursorPosition();
    }
});
codeText.addEventListener('click', () => { updateCursorPosition(); });

updateLines();
updateCursorPosition();