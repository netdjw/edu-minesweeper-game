let allMines = 0;
let visibleFlags = 0;
let openedFileds = 0;
const gameBoardSize = 10;
const MAX_MINES_PROBABILITY = 18;

const flagIcon = '<span style="font-size: 18px;">&#x1F6A9;</span>';
const mineIcon = '<span style="font-size: 18px;">&#x1f4a5;</span>';

/**
 * Draw the game board.
 */
function drawBoard() {
    const table = document.createElement('table');

    // rows
    for (row = 0; row < gameBoardSize; row++) {
        const tr = document.createElement('tr');

        for (col = 0; col < gameBoardSize; col++) {
            const td = document.createElement('td');

            // set coordinates to the td - later we use it to find out where happend the click
            td.dataset.row = row;
            td.dataset.col = col;

            // hide mines
            td.dataset.mine = putMine();

            // DEBUG
            // if (td.dataset.mine === '1') {
            //     td.classList.add('mine');
            // }

            // check mines aftre click
            td.onclick = function() {
                // prevent click on marked td
                if (!!td.dataset.mark && td.dataset.mark === '1') {
                    return;
                }

                check(td);
            }
            
            // set right click event - put a flag, question mark or remove sign
            td.oncontextmenu = function(event) {
                event.preventDefault();
                onRightClick(td);
            }

            // add td to tr
            tr.appendChild(td);
        }

        // add tr to table
        table.appendChild(tr);
    }

    // add table to gameboard
    document.getElementById('gameboard').appendChild(table);

    // set visible flags number
    visibleFlags = allMines;
    setVisibleFlags(visibleFlags);
}

drawBoard();

/**
 * This function returns a number: the field has mine (1) or not (0).
 */
function putMine() {
    const random = Math.random() * 100;

    // nincs akna
    if (random > MAX_MINES_PROBABILITY) {
        return 0;
    }

    ++allMines;

    return 1;
}

/**
 * Check a table cell it has mine or not.
 * 
 * @param {HTMLTableCellElement} td what you want to check it contains mine or not
 */
function check(td) {
    // if td has mine, user lose
    if (td.dataset.mine === '1') {
        lose(td);

        return;
    }

    // set current position to values as number
    const x = Number(td.dataset.row);
    const y = Number(td.dataset.col);
    
    // check mines around the current field
    let mines = countMinesAround(x, y);
    
    // set field as touched - later we prevent click it again
    td.dataset.touched = 1;
    // show number of mines in neighborhood
    td.innerHTML = mines ? mines : '';
    // set background color based on mines
    td.classList.add('mine-' + mines);
    // set off click event to prevent click again on a touched field
    td.onclick = null;
    // set off rightclick event to prevent click again on a touched field
    td.oncontextmenu = function(event) {
        event.preventDefault();
    }
    // count touched fields to detect the game progress
    ++openedFileds;
    
    // if the field not has mines in the neighborhood we need to check all neighbors
    if (mines === 0) {
        for (let row = -1; row <= 1; row++) {
            // before first row and after last row, skip check
            if (x + row < 0 || x + row > gameBoardSize - 1) {
                continue;
            }

            for (let col = -1; col <= 1; col++) {
                // before first col and after last col, skip check
                if (y + col < 0 || y + col > gameBoardSize - 1) {
                    continue;
                }

                const previousRow = x + row;
                const previousCol = y + col;

                // find the td what we check
                const cols_in_row = Array.from(document.querySelectorAll('[data-row="' + previousRow + '"]'));
                const foundCol = cols_in_row.find(td => td.dataset.col === previousCol.toString());
                
                // skip check if the found cell is the starter cell
                if ( col === 0 && row === 0) {
                    continue;
                }
                
                // check the found table cell
                if (!foundCol.dataset.touched) {
                    check(foundCol);
                }
            }
        }
    }

    // if there isn't more hidden cells, user win
    if (allMines + openedFileds === gameBoardSize * gameBoardSize) {
        win();
    }
}

/**
 * Show message to winner & set game over.
 */
function win() {
    const div = document.getElementById('win');
    div.style.display = 'block';

    gameOver();
}

/**
 * Show message to looser, set a boom icon & set game over.
 * 
 * @param {HTMLTableCellElement} td the looser table cell to show the boom icon
 */
function lose(td) {
    const div = document.getElementById('lose');
    div.style.display = 'block';

    td.innerHTML = mineIcon;
    td.dataset.touched = 1;

    gameOver();
}

/**
 * Count mines around a coordinate.
 * 
 * @param {number} x coordinate to check
 * @param {number} y coordinate to check
 */
function countMinesAround(x, y) {
    let mines = 0;
    const trs = document.getElementsByTagName('tr');

    for (let row = -1; row <= 1; row++) {
        // before first row and after last row, skip check
        if (x + row < 0 || x + row > gameBoardSize - 1) {
            continue;
        }

        const tds = trs[x + row].getElementsByTagName('td');

        for (let col = -1; col <= 1; col++) {
            // before first col and after last col, skip check
            if (y + col < 0 || y + col > gameBoardSize - 1) {
                continue;
            }

            // count mines if the cell has
            if (tds[y + col].dataset.mine === '1') {
                mines++;
            }
        }
    }

    return mines;
}

/**
 * Show all mines on board.
 */
function showAllMines() {
    const tds = Array.from(document.querySelectorAll('[data-mine="1"]'));

    tds.forEach(td => {
        if (!td.dataset.touched) {
            td.innerHTML = flagIcon;
        }
    });
}

/**
 * Set all td unclickable & show all mines.
 */
function gameOver() {
    const tds = Array.from(document.querySelectorAll('td'));

    tds.forEach(td => {
        td.onclick = null;
    });

    showAllMines();
}

/**
 * Start a new game.
 */
function newGame() {
    const board = document.getElementById('gameboard');
    board.innerHTML = '';

    const divLose = document.getElementById('lose');
    divLose.style.display = 'none';

    const divWin = document.getElementById('win');
    divWin.style.display = 'none';

    allMines = 0;
    openedFileds = 0;
    
    drawBoard(gameBoardSize);
}

/**
 * Handle rightclick event on a field.
 * 
 * @param {HTMLTableCellElement} td to show/hide guess marks
 */
function onRightClick(td) {
    if (!td.dataset.mark) {
        setRightClickContent(td, 1, flagIcon, -1);
    } else if (td.dataset.mark === '1') {
        setRightClickContent(td, 2, '?', 1);
    } else if (td.dataset.mark === '2') {
        setRightClickContent(td, null, '', 0);
    }
}

/**
 * Set user guesses on board & count available guesses.
 * 
 * @param {HTMLTableCellElement} td 
 * @param {null|1|2} mark if `null` the guess will disapper, if `1` the flag will shown, if `2` the question mark will shown
 * @param {HTMLElement|string} content of td innerHTML
 * @param {number} counterAdd add number to user's guesses to count available guesses
 */
function setRightClickContent(td, mark, content, counterAdd) {
    if (mark === null) {
        delete td.dataset.mark;
    } else {
        td.dataset.mark = mark;
    }

    td.innerHTML = content;
    visibleFlags += counterAdd;

    setVisibleFlags(visibleFlags);
}

/**
 * Show available guesses.
 * 
 * @param {number} visibleFlags available guesses
 */
function setVisibleFlags(visibleFlags) {
    document.getElementById('minecounter').innerHTML = visibleFlags;
}