var board = null
var game = new Chess()
var log = document.getElementById('logDiv')
var placesound = new Audio('351518__mh2o__chess_move_on_alabaster.wav')

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
    placesound.play()
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
    placesound.play()
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