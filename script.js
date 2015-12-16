document.addEventListener('DOMContentLoaded', function() {

    var field = document.getElementById('field');

    //----------------------- consts ----------------------

    var piecesParams = [
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
    ];

    var piecesMovesParams = {
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

    var MoveModes = {
        PIECE_CHOOSE: 0,
        CELL_CHOOSE: 1
    };

    //--------------------- game state ------------------------

    var isWhiteTurn = true,
        moveMode = MoveModes.PIECE_CHOOSE,
        isGameContinues = true,
        choosen,
        check,
        whiteCatches = [],
        blackCatches = [];

    //---------------------- render --------------------------

    var renderField = function() {
        var html = '',
            rowHtml;

        for (var y = 1; y <= 8; y++) {
            rowHtml = '<tr>';

            for (var x = 1; x <= 8; x++) {
                var piecesRow,
                    pieceType;

                rowHtml += '<td id="cell_' + x + '_' + y + '" data-x="' + x + '" data-y="' + y + '" class="cell">';

                if ((piecesRow = piecesParams[y - 1]) && (pieceType = piecesRow[x - 1])) {
                    rowHtml += getPieceHtml(pieceType, 'white');
                }

                if ((piecesRow = piecesParams[8 - y]) && (pieceType = piecesRow[x - 1])) {
                    rowHtml += getPieceHtml(pieceType, 'black');
                }

                rowHtml += '</td>';
            }
            rowHtml += '</tr>';

            html = rowHtml + html;
        }

        field.getElementsByTagName('tbody')[0].innerHTML = html;
    };

    var getPieceHtml = function(type, color) {
        return '<div data-type="' + type + '" data-color="' + color + '" data-moved="0" class="piece piece_' + color + '">' + type + '</div>';
    };

    var renderTurnInfo = function() {
        document.getElementById('turn_info').innerHTML = (isWhiteTurn ? 'Whites turn' : 'Blacks turn');
    };

    var renderCatches = function() {
        document.getElementById('catches_info').innerHTML = getCatchesHtml(whiteCatches, 'White') + getCatchesHtml(blackCatches, 'Black');
    };

    var getCatchesHtml = function(catches, player) {
        var html = '';

        if (catches.length) {
            html += '<div class="catchesTitle">' + player + ' catches</div>'
        }

        for (var i = 0; i < catches.length; i++) {
            html += '<div>' + catches[i] + '</div>'
        }

        return html;
    };

    //-------------- click handler ----------------

    var setHandlers = function() {
        var cells = field.getElementsByClassName('cell');

        for (var i = 0; i < cells.length; i++) {

            cells[i].addEventListener('click', function(e) {
                var cell = e.currentTarget,
                    piece,
                    pieceClass,
                    kingDanger,
                    opponentKingDanger;

                if (isGameContinues) {

                    if (moveMode == MoveModes.PIECE_CHOOSE) {

                        piece = cell.getElementsByClassName('piece')[0],
                        pieceClass = (isWhiteTurn ? 'piece_white' : 'piece_black');

                        if (piece && piece.classList.contains(pieceClass)) {
                            cell.classList.add('cell_choosen');

                            moveMode = MoveModes.CELL_CHOOSE;
                            choosen = {
                                piece: piece,
                                cell: cell
                            };
                        }

                    } else if (moveMode == MoveModes.CELL_CHOOSE) {

                        if (cell.classList.contains('cell_choosen')) {

                            cell.classList.remove('cell_choosen');
                            moveMode = MoveModes.PIECE_CHOOSE;
                            choosen = null;

                        } else {

                            piece = cell.getElementsByClassName('piece')[0];

                            if ((piece && piece.dataset.color == choosen.piece.dataset.color) ||
                                !checkPieceMove(
                                    choosen.piece.dataset.type,
                                    choosen.piece.dataset.color,
                                    {
                                        x: Number(choosen.cell.dataset.x),
                                        y: Number(choosen.cell.dataset.y)
                                    },
                                    {
                                        x: Number(cell.dataset.x),
                                        y: Number(cell.dataset.y)
                                    },
                                    !Number(choosen.piece.dataset.moved),
                                    piece
                                )
                            ) {
                                alert('You can\'t move the piece to this cell!');
                            } else {

                                kingDanger = checkKingDanger(choosen.piece.dataset.color,
                                    {
                                        piece: choosen.piece,
                                        cell: cell
                                    },
                                    piece
                                );

                                if (kingDanger.check || kingDanger.stalemate) {
                                    alert('You can\'t move the piece to this cell because your will have check!');
                                } else {
                                    choosen.piece.dataset.moved = 1;
                                    cell.appendChild(choosen.piece);
                                    choosen.cell.classList.remove('cell_choosen');

                                    if (piece) {
                                        isWhiteTurn
                                            ? whiteCatches.push(piece.dataset.type)
                                            : blackCatches.push(piece.dataset.type);
                                        renderCatches();
                                        piece.parentNode.removeChild(piece);
                                    }

                                    choosen = null;

                                    opponentKingDanger = checkKingDanger(isWhiteTurn ? 'black' : 'white');
                                    if (opponentKingDanger.stalemate) {
                                        isGameContinues = false;
                                        alert(isWhiteTurn ? 'Whites won!' : 'Blacks won!');

                                    } else {
                                        check = opponentKingDanger.check;

                                        if (check) {
                                            alert(isWhiteTurn ? 'Blacks have check!' : 'Whites have check!');
                                        }

                                        moveMode = MoveModes.PIECE_CHOOSE;
                                        isWhiteTurn = !isWhiteTurn;

                                        renderTurnInfo();
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    //----------------- coords ------------------------

    var getCellByCoords = function(coords) {
        return field.querySelector('#cell_' + coords.x + '_' + coords.y);
    };

    var getNextCoords = function(coords, step) {
        return {
            x: coords.x + step[0],
            y: coords.y + step[1]
        };
    };

    //-------------------- moves --------------------

    var checkPieceMove = function(type, color, coords, nextCoords, isFirstMove, isFight) {
        var moves = generatePieceMoves(type, color, coords, isFirstMove, isFight),
            move;

        for (var i = 0; i < moves.length; i++) {
            move = moves[i];

            if (move.x == nextCoords.x && move.y == nextCoords.y) {
                return true;
            }
        }

        return false;
    };

    var generatePieceMoves = function(type, color, initCoords, isFirstMove, isFight, moved, removed) {
        var movesParams = (piecesMovesParams[type] || piecesMovesParams.default)(color, isFirstMove, isFight),
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
                (coords = getNextCoords(coords, step)) &&
                (cell = getCellByCoords(coords))) {

                if (moved && cell == moved.cell) {
                    piece = moved.piece;
                } else {
                    piece = cell.getElementsByClassName('piece')[0];
                }

                if (!piece || (moved && piece == moved.piece) || piece == removed) {
                    moves.push(coords);
                    movesCount++;
                } else {
                    if (piece.dataset.color != color) {
                        moves.push(coords);
                        break;
                    } else {
                        break;
                    }
                }
            }
        }

        return moves;
    };

    var findMove = function(moves, searchMove) {
        for (var i = 0; i < moves.length; i++) {
            move = moves[i];
            if (move.x == searchMove.x && move.y == searchMove.y) {
                return true;
            }
        }
        return false;
    };

    var addMoveToArray = function(moves, newMove) {
        if (!findMove(moves, newMove)) {
            moves.push(newMove);
        }
    };

    var getPiecesMoves = function(pieces, color, moved, removed) {
        var piece,
            cell,
            pieceMoves,
            moves = [];

        for (var i = 0; i < pieces.length; i++) {
            piece = pieces[i];

            if (removed != piece) {

                cell = (moved && (piece == moved.piece) ? moved.cell : piece.parentNode);

                pieceMoves = generatePieceMoves(
                    piece.dataset.type,
                    color,
                    {
                        x: Number(cell.dataset.x),
                        y: Number(cell.dataset.y)
                    },
                    Number(piece.dataset.moved),
                    true,
                    moved,
                    removed
                );

                for (var j = 0; j < pieceMoves.length; j++) {
                    addMoveToArray(moves, pieceMoves[j]);
                }
            }
        }

        return moves;
    };

    //---------------------- king danger -------------------------

    //consider one removed piece and one moved piece
    var checkKingDanger = function(color, moved, removed) {
        var king,
            kingCell,
            opponentColor = (color == 'white' ? 'black' : 'white'),
            opponentPieces = field.querySelectorAll('.piece[data-color="' + opponentColor + '"]'),
            opponentMoves,
            pieces,
            piece,
            pieceMoves,
            moveCell,
            danger = {};

        if (moved &&
            moved.piece.dataset.color == color &&
            moved.piece.dataset.type == 'king') {

            king = moved.piece;
            kingCell = moved.cell;

        } else {
            king = field.querySelector('.piece[data-type="king"][data-color="' + color + '"]');
            kingCell = king.parentNode;
        }

        //get all opponents moves
        opponentMoves = getPiecesMoves(opponentPieces, opponentColor, moved, removed);

        //check danger
        if (findMove(opponentMoves, { x: Number(kingCell.dataset.x), y: Number(kingCell.dataset.y) })) {
            danger.check = true;
        }

        danger.stalemate = checkStalemate(king, kingCell, opponentPieces, moved, removed);

        //check if we can block one of the opponent's pieces in next move
        if (danger.stalemate) {
            pieces = field.querySelectorAll('.piece[data-color="' + color + '"]');

            for (var i = 0; i < pieces.length; i++) {
                piece = pieces[i];

                if (piece.dataset.type != 'king') {

                    pieceMoves = generatePieceMoves(
                        piece.dataset.type,
                        color,
                        {
                            x: Number(piece.parentNode.dataset.x),
                            y: Number(piece.parentNode.dataset.y)
                        },
                        Number(piece.dataset.moved),
                        true
                    );

                    for (var j = 0; j < pieceMoves.length; j++) {
                        moveCell = getCellByCoords(pieceMoves[j]);

                        danger.stalemate = danger.stalemate && checkStalemate(king,
                            kingCell,
                            opponentPieces,
                            { piece: piece, cell: moveCell },
                            moveCell.getElementsByClassName('piece')[0]
                        );
                    }
                }
            }
        }

        return danger;
    };

    var checkStalemate = function(king, kingCell, opponentPieces, moved, removed) {

        var kingMoves = generatePieceMoves(
            'king',
            king.dataset.color,
            {
                x: Number(kingCell.dataset.x),
                y: Number(kingCell.dataset.y)
            },
            Number(king.dataset.moved),
            true,
            moved,
            removed
        );

        var opponentMoves = getPiecesMoves(opponentPieces, (king.dataset.color == 'white' ? 'black' : 'white'), moved, removed);

        var isStalemate = (kingMoves.length != 0);

        //check danger of all of the king moves
        for (var i = 0; i < kingMoves.length; i++) {
            isStalemate = isStalemate && findMove(opponentMoves, kingMoves[i]);
        }

        return isStalemate;
    };

    //----------------------- game -----------------------------

    renderField();
    renderTurnInfo();
    setHandlers();
});
