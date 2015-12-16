function Piece(params) {
    this.type = params.type;
    this.color = params.color;
}

Piece.MovesParams = {
    default: function(color, isFirstMove, isFight) {
        var isWhite = (color == 'white');

        return {
            steps:
                (isFight ?
                [
                    [-1, isWhite ? 1 : -1],
                    [1, isWhite ? 1 : -1]
                ] :
                [
                    [0, isWhite ? 1 : -1]
                ]),
            maxMovesCount: !isFight && isFirstMove ? 2 : 1
        };
    },
    king: function() {
        return {
            steps: [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, 1],
                [0, -1],
                [1, -1],
                [1, 0],
                [1, 1]
            ],
            maxMovesCount: 1
        };
    },
    queen: function() {
        return {
            steps: [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, 1],
                [0, -1],
                [1, -1],
                [1, 0],
                [1, 1]
            ]
        };
    }
};

Piece.prototype.getHtml = function() {
    return '<div class="piece piece_' + this.color + '">' + this.type + '</div>';
}

Piece.prototype.getNextCoords = function(coords, step) {
    return {
        x: coords.x + step[0],
        y: coords.y + step[1]
    };
};

Piece.prototype.generateMoves = function(initCoords, isFight) {
    var movesParams = (Piece.MovesParams[this.type] || Piece.MovesParams.default)(this.color, !this.moved, isFight),
        steps = movesParams.steps,
        step,
        movesCount,
        coords,
        cell,
        piece,
        moves = [];

    for (var i = 0; i < steps.length; i++) {
        step = steps[i];
        coords = initCoords;
        movesCount = 0;

        while ((!movesParams.maxMovesCount || (movesCount < movesParams.maxMovesCount)) &&
            (coords = this.getNextCoords(coords, step)) &&
            GAME.field.isValidCoords(coords)) {

            piece = GAME.field.getPieceByCoords(coords);

            if (!piece) {
                moves.push(coords);
                movesCount++;
            } else {
                if (piece.color != this.color) {
                    moves.push(coords);
                    break;
                } else {
                    break;
                }
            }
        }
    }

    return moves;
}

Piece.prototype.checkMove = function(coords, nextCoords, isFight) {
    var moves = this.generateMoves(coords, isFight),
        move;

    for (var i = 0; i < moves.length; i++) {
        move = moves[i];

        if (move.x == nextCoords.x && move.y == nextCoords.y) {
            return true;
        }
    }

    return false;
}
