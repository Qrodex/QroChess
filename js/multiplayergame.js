var board = null;
var game = new Chess();
var log = document.getElementById('logDiv');
var placesound = new Audio('../assets/move-self.mp3');
var captureSound = new Audio('../assets/capture.mp3');
var illegalMoveSound = new Audio('../assets/illegal-move.mp3');
var conn;
var peer = new Peer();
var isHost = true;

function copy(that) {
    var inp = document.createElement('input');
    document.body.appendChild(inp);
    inp.value = that;
    inp.select();
    document.execCommand('copy', false);
    inp.remove();
}

function createLog(message) {
    let text = document.createElement('p');
    let brrskibididopdopdopyesyesyes = document.createElement('br');
    text.innerText = message;
    log.prepend(text);
    log.prepend(brrskibididopdopdopyesyesyes);
}

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if (isHost && piece.search(/^b/) !== -1) return false;
    if (!isHost && piece.search(/^w/) !== -1) return false;
}

function makeRandomMove() {
    var possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIdx]);
    board.position(game.fen());
    if (game.in_check()) {
        captureSound.play();
    } else {
        placesound.play();
    }
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    createLog(source + " -> " + target);

    if (move === null) {
        createLog('Illegal Move!');
        illegalMoveSound.play();
        return 'snapback';
    }

    sendCurrMove(move);

    if (game.in_check()) {
        captureSound.play();
    } else {
        placesound.play();
    }
    if (game.in_checkmate()) {
        alert("Checkmate!");
        startConfetti();
        document.getElementById('stopConfetti').style.display = "block";
        timer = false;
    } else if (game.in_stalemate()) {
        alert("Game drawn by stalemate");
        startConfetti();
        document.getElementById('stopConfetti').style.display = "block";
        timer = false;
    }
}

function onSnapEnd() {
    board.position(game.fen());
}

var config = {
    draggable: true,
    position: 'start',
    orientation: isHost ? 'white' : 'black',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
board = Chessboard('Board', config);
$(window).resize(board.resize);

peer.on('open', function (id) {
    var idButton = document.getElementById("myid");
    idButton.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> ${id}`;
    idButton.onclick = function () {
        copy(id);
        idButton.innerHTML = `<i class="fa-solid fa-clipboard-check"></i> ${id}`;
        setTimeout(() => {
            idButton.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> ${id}`;
        }, 1000);
    };
});

peer.on('connection', function (c) {
    conn = c;
    conn.on('open', function () {
        isHost = false;
        board.orientation('black');
        conn.on('data', function (data) {
            if (data.type === 'move') {
                updateEditor(data);
            }
        });
    });
});

function updateEditor(data) {
    if (data.type === 'move') {
        game.move(data.move);
        syncBoard();
        if (game.in_check()) {
            captureSound.play();
        } else {
            placesound.play();
        }
    }
}

function sendCurrMove(move) {
    if (conn && conn.open) {
        conn.send({ type: 'move', move: move });
    }
}

function syncBoard() {
    board.position(game.fen());
}

async function startCollab() {
    if (conn && conn.open) return;

    conn = peer.connect(document.getElementById("friend").value);
    conn.on('open', function () {
        conn.send({ type: 'handshake', peerId: peer.id });
        isHost = true;
        conn.on('data', function (data) {
            if (data.type === 'move') {
                updateEditor(data);
            }
        });
    });
}

var gameStarted = false
setInterval(() => {
    if (conn && conn.open) {
        document.getElementById("aiBootDialog").style.display = 'none';
        if (!gameStarted) {
            gameStarted = true
            timer = true;
            stopWatch();
        }
    } else {
        document.getElementById("aiBootDialog").style.display = 'flex';
        timer = false;
        if (gameStarted) {
            gameStarted = false
            window.location.reload()
        }
    }
});