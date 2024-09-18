document.getElementById('btnNewFile').addEventListener('click', createNewFile);
document.getElementById('btnLoadFile').addEventListener('click', loadFile);
document.getElementById('code').addEventListener('input', markUnsaved);
document.addEventListener('keydown', handleKeydown);

let files = {}; // Almacenar el contenido de cada archivo
let currentTab = null;

window.onload = () => {
    // Crear una pestaña y archivo por defecto
    createTab('default.txt');
    selectTab('default.txt');
};

function createNewFile() {
    const fileName = prompt('Enter new file name:');
    if (fileName) {
        createTab(fileName);
        selectTab(fileName);
    }
}

function loadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.oak'; // Ajusta esto según el tipo de archivo que permitas

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileName = file.name;
                createTab(fileName);
                selectTab(fileName);
                document.getElementById('code').value = reader.result; // Carga el contenido del archivo en el textarea
                files[fileName] = reader.result; // Almacena el contenido del archivo
            };
            reader.readAsText(file);
        }
    });

    input.click();
}

function createTab(fileName) {
    if (files[fileName]) return; // No crear pestaña si ya existe

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('data-file-name', fileName);
    tab.textContent = fileName;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.textContent = 'X';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el click en el botón de cierre active la pestaña
        closeTab(fileName);
    });

    tab.appendChild(closeBtn);
    tab.addEventListener('click', () => selectTab(fileName));

    document.getElementById('tabsContainer').appendChild(tab);

    files[fileName] = ''; // Inicializar contenido del archivo
}

function selectTab(fileName) {
    if (currentTab) {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            activeTab.classList.remove('active');
        }
        files[currentTab] = document.getElementById('code').value;
    }

    currentTab = fileName;

    // Encuentra la pestaña correspondiente y actívala
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-file-name') === fileName) {
            tab.classList.add('active');
            document.getElementById('code').value = files[fileName];
            tab.classList.remove('unsaved'); // Eliminar el indicador de cambios no guardados
        }
    });

    // Si no se encuentra la pestaña, limpiar el textarea de código
    if (!document.querySelector('.tab.active')) {
        document.getElementById('code').value = '';
    }
    updateEditorState();
}

function closeTab(fileName) {
    if (currentTab === fileName) {
        const tabs = document.querySelectorAll('.tab');
        const nextTab = Array.from(tabs).find(tab => tab.getAttribute('data-file-name') !== fileName);
        if (nextTab) {
            selectTab(nextTab.getAttribute('data-file-name'));
        } else {
            currentTab = null;
            document.getElementById('code').value = '';
        }
    }

    delete files[fileName];

    // Encuentra la pestaña correspondiente y la elimina
    const tabToRemove = document.querySelector(`.tab[data-file-name='${fileName}']`);
    if (tabToRemove) {
        tabToRemove.remove();
    }

    // Seleccionar la primera pestaña si no hay ninguna seleccionada
    if (!currentTab && Object.keys(files).length > 0) {
        const firstFileName = Object.keys(files)[0];
        selectTab(firstFileName);
    }
}

function markUnsaved() {
    if (currentTab) {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-file-name') === currentTab && !tab.classList.contains('unsaved')) {
                tab.classList.add('unsaved');
            }
        });
    }
}

function handleKeydown(event) {
    if (event.ctrlKey && event.key === 'g') {
        event.preventDefault(); // Prevenir la acción por defecto del navegador
        saveCurrentFile();
    }
}

function saveCurrentFile() {
    if (currentTab) {
        const content = document.getElementById('code').value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentTab;
        a.click();
        URL.revokeObjectURL(url);

        // Eliminar el indicador de cambios no guardados
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            activeTab.classList.remove('unsaved');
        }
    }
}

function updateEditorState() {
    const codeText = document.getElementById('code');

    codeText.selectionStart = 0;
    codeText.selectionEnd = 0;

    updateLines();
    updateCursorPosition();
}

function updateLines() {
    const codeText = document.getElementById('code');
    const lines = codeText.value.split('\n').length;
    let lineNumberContent = '';
    for (let i = 1; i <= lines; i++) {
        lineNumberContent += i + '\n';
    }
    document.getElementById('lines').value = lineNumberContent;
}

function updateCursorPosition() {
    const codeText = document.getElementById('code');
    const cursorPostIndex = codeText.selectionStart;
    const textUntilCursor = codeText.value.slice(0, cursorPostIndex);
    const linesUntilCursor = textUntilCursor.split('\n');
    const currentLine = linesUntilCursor.length;
    const currentColumn = linesUntilCursor[linesUntilCursor.length - 1].length;
    document.getElementById('cursorPos').textContent = `Línea: ${currentLine}, Columna: ${currentColumn}`;
}