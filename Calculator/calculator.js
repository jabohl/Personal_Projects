// Calculator state
let currInput = '';
let currOperation = '';
let prevInput = '';
let history = [];

/**
 * Append a number to the current input
 * @param {string} num - The number or decimal point to append
 */
function appendNum(num) {
    // Prevent multiple decimal points
    if (num === '.' && currInput.includes('.')) {
        return;
    }
    
    currInput += num;
    updateDisplay();
}

/**
 * Update the display with current calculation state
 */
function updateDisplay() {
    const display = document.getElementById('display');
    
    if (currOperation) {
        display.value = `${prevInput} ${currOperation} ${currInput}`;
    } else if (prevInput && currOperation === '') {
        display.value = prevInput;
    } else {
        display.value = currInput;
    }
}

/**
 * Append an operation (+, -, *, /)
 * @param {string} operation - The operation to append
 */
function appendOperation(operation) {
    if (currInput === '' && prevInput === '') return;
    
    if (currInput !== '') {
        if (prevInput !== '') {
            calculate();
        }
        prevInput = currInput;
        currInput = '';
    }
    
    currOperation = operation;
    updateDisplay();
}

/**
 * Main calculator function
 * Handles all arithmetic operations: +, -, *, /
 */
function calculate() {
    if (prevInput === '' || currInput === '') return;
    
    let result;
    const prev = parseFloat(prevInput);
    const curr = parseFloat(currInput);

    switch (currOperation) {
        case '+':
            result = prev + curr;
            break;
        case '-':
            result = prev - curr;
            break;
        case '*':
            result = prev * curr;
            break;
        case '/':
            if (curr === 0) {
                alert('❌ Cannot divide by zero');
                clearDisplay();
                return;
            }
            result = prev / curr;
            break;
        default:
            return;
    }

    // Store in history
    history.push(`${prev} ${currOperation} ${curr} = ${result}`);
    
    // Round to avoid floating point errors
    currInput = parseFloat(result.toFixed(10)).toString();
    currOperation = '';
    prevInput = '';
    updateDisplay();
}

/**
 * Clear the entire display and reset calculator state
 */
function clearDisplay() {
    currInput = '';
    prevInput = '';
    currOperation = '';
    document.getElementById('display').value = '';
}

/**
 * Delete the last character from current input
 */
function deleteLast() {
    currInput = currInput.slice(0, -1);
    updateDisplay();
}

/**
 * Toggle the sign of the current input (positive/negative)
 */
function toggleSign() {
    if (currInput === '') return;
    
    if (currInput.charAt(0) === '-') {
        currInput = currInput.slice(1);
    } else {
        currInput = '-' + currInput;
    }
    
    updateDisplay();
}

/**
 * Keyboard support for calculator
 */
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        appendNum(key);
    } else if (key === '.') {
        appendNum('.');
    } else if (key === '+' || key === '-') {
        appendOperation(key);
    } else if (key === '*') {
        event.preventDefault();
        appendOperation('*');
    } else if (key === '/') {
        event.preventDefault();
        appendOperation('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    } else if (key === 'Escape') {
        event.preventDefault();
        clearDisplay();
    }
});

// Initialize display
window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
});