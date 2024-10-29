var board = null
var game = new Chess()
var log = document.getElementById('logDiv')
var placesound = new Audio('../assets/move-self.mp3')
var captureSound = new Audio('../assets/capture.mp3')
var illegalMoveSound = new Audio('../assets/illegal-move.mp3')

function createLog(message) {
    let text = document.createElement('p');
    let brrskibididopdopdopyesyesyes = document.createElement('br');
    text.innerText = message;

    log.prepend(text)
    log.prepend(brrskibididopdopdopyesyesyes)
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
    if (game.in_check()) {
        captureSound.play()
    } else {
        placesound.play()
    }
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
        illegalMoveSound.play()
        return 'snapback'
    }
    window.setTimeout(makeRandomMove, 250)
    if (game.in_check()) {
        captureSound.play()
    } else {
        placesound.play()
    }
    
    var turn = "White"
    if (game.turn() == "b") {
        turn = "Black"
    }

    if (game.in_checkmate()) {
        alert(turn + " checkmate!");
        startConfetti();
        document.getElementById('stopConfetti').style.display = "block";
        timer = false;
    } else if (game.in_stalemate()) {
        alert("Game drawn by stalemate")
        startConfetti();
        document.getElementById('stopConfetti').style.display = "block";
        timer = false
    }
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