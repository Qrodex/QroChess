var board = null
var game = new Chess()
var log = document.getElementById('logDiv')
var placesound = new Audio('../assets/move-self.mp3')
var captureSound = new Audio('../assets/capture.mp3')
var illegalMoveSound = new Audio('../assets/illegal-move.mp3')
var engine = new Worker('../js/stockfish.js')
var time = { wtime: 4000, btime: 4000, winc: 400, binc: 400 };

function uciCmd(cmd) {
    engine.postMessage(cmd);
} uciCmd('uci');

engine.onmessage = function(event) {
    console.log(event.data);

    var line = event.data;
    var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
    if (match) {
        console.log(match)
        game.move({from: match[1], to: match[2], promotion: match[3]});
        board.position(game.fen())

        if (game.in_check()) {
            captureSound.play()
        } else {
            placesound.play()
        }

        document.getElementById('status').innerText = 'Ready';

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
        
    } else if(line == 'uciok') {
        document.querySelector('.aiBootDialog').style.display = 'none';
        document.getElementById('status').innerText = 'Ready';

        uciCmd('setoption name Contempt Factor value 0');
        uciCmd('setoption name Skill Level value 20');
        uciCmd('setoption name Aggressiveness value 200');
    }
};

var bookRequest = new XMLHttpRequest();
bookRequest.open('GET', '../assets/book.bin', true);
bookRequest.responseType = "arraybuffer";
bookRequest.onload = function(event) {
    if(bookRequest.status == 200) {
        engine.postMessage({book: bookRequest.response});
    }
};

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

function get_moves() {
    var moves = '';
    var history = game.history({verbose: true});
    
    for(var i = 0; i < history.length; ++i) {
        var move = history[i];
        moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
    }
    
    return moves;
}

function makeRandomMove() {
    document.getElementById('status').innerText = 'Thinking...'

    uciCmd('position startpos moves' + get_moves());
    if(time.depth) {
        uciCmd('go depth ' + time.depth);
    } else if(time.nodes) {
        uciCmd('go nodes ' + time.nodes);
    } else {
        uciCmd('go wtime ' + time.wtime + ' winc ' + time.winc + ' btime ' + time.btime + ' binc ' + time.binc);
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