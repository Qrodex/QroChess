var board = null
var game = new Chess()
var log = document.getElementById('logDiv')

function createLog(message) {
    let text = document.createElement('p');
    text.innerText = message;

    log.prepend(text)
}

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false
    if (piece.search(/^b/) !== -1) return false
}

function makeRandomMove() {
    var possibleMoves = game.moves()
    if (possibleMoves.length === 0) return
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    game.move(possibleMoves[randomIdx])
    board.position(game.fen())
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    })

    createLog(source + " -> " + target);

    if (move === null) {
        createLog('Illegal Move!');
        return 'snapback'
    }
    window.setTimeout(makeRandomMove, 250)
}

function onSnapEnd() {
    board.position(game.fen())
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}
board = Chessboard('Board', config)
$(window).resize(board.resize)

let hour = 00;
let minute = 00;
let second = 00;
let count = 00;

function stopWatch() {
    if (timer) {
        count++;

        if (count == 100) {
            second++;
            count = 0;
        }

        if (second == 60) {
            minute++;
            second = 0;
        }

        if (minute == 60) {
            hour++;
            minute = 0;
            second = 0;
        }

        let hrString = hour;
        let minString = minute;
        let secString = second;
        let countString = count;

        if (hour < 10) {
            hrString = "0" + hrString;
        }

        if (minute < 10) {
            minString = "0" + minString;
        }

        if (second < 10) {
            secString = "0" + secString;
        }

        if (count < 10) {
            countString = "0" + countString;
        }
    }

    document.getElementById('hr').innerHTML = hrString;
    document.getElementById('min').innerHTML = minString;
    document.getElementById('sec').innerHTML = secString;
    document.getElementById('count').innerHTML = countString;
    setTimeout(stopWatch, 10);

    if (game.game_over() == true) {
        alert("Checkmate!");
        timer = false;
    }
}

timer = true;
stopWatch();