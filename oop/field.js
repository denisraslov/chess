function Field() {
    this.el = document.getElementById('field');
    this.moveMode = Field.MoveModes.PIECE_CHOOSE;
}

Field.initPiecesCoords = [
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
];

Field.MoveModes = {
    PIECE_CHOOSE: 0,
    CELL_CHOOSE: 1
};

Field.prototype.map = {};

Field.prototype.addPieceToMap = function(coords, piece) {
    this.map[coords.x + '_' + coords.y] = piece;
}

Field.prototype.render = function() {
    var html = '',
        rowHtml,
        piecesCoords = Field.initPiecesCoords,
        piece;

    for (var y = 1; y <= 8; y++) {
        rowHtml = '<tr>';

        for (var x = 1; x <= 8; x++) {
            var piecesRow,
                pieceType;

            rowHtml += '<td id="cell_' + x + '_' + y + '" data-x="' + x + '" data-y="' + y + '" class="cell">';

            if ((piecesRow = piecesCoords[y - 1]) && (pieceType = piecesRow[x - 1])) {
                piece = new Piece({ type: pieceType, color: 'white' });
                this.addPieceToMap({ x: x, y: y }, piece);
                rowHtml += piece.getHtml();
            }

            if ((piecesRow = piecesCoords[8 - y]) && (pieceType = piecesRow[x - 1])) {
                piece = new Piece({ type: pieceType, color: 'black' });
                this.addPieceToMap({ x: x, y: y }, piece);
                rowHtml += piece.getHtml();
            }

            rowHtml += '</td>';
        }
        rowHtml += '</tr>';

        html = rowHtml + html;
    }

    this.el.getElementsByTagName('tbody')[0].innerHTML = html;
}

Field.prototype.removePiece = function(piece) {
    for (var key in this.map) {
        if (this.map[key] == piece) {
            delete this.map[key];
        }
    }
}

Field.prototype.getPieceByCoords = function(coords) {
    return this.map[coords.x + '_' + coords.y];
}

Field.prototype.isValidCoords = function(coords) {
    return (coords.x >= 1) && (coords.x <= 8) &&
        (coords.y >= 1) && (coords.y <= 8);
}

Field.prototype.choosePiece = function(cell) {
    var piece,
        playerColor = (GAME.isWhiteTurn ? 'white' : 'black');

    piece = this.getPieceByCoords({ x: cell.dataset.x, y: cell.dataset.y });

    if (piece && piece.color == playerColor) {
        cell.classList.add('cell_choosen');

        this.moveMode = Field.MoveModes.CELL_CHOOSE;
        this.choosenCell = cell;
    }
}

Field.prototype.chooseCell = function(cell) {
    var piece,
        playerColor = (GAME.isWhiteTurn ? 'white' : 'black');

    if (cell == this.choosenCell) {
        cell.classList.remove('cell_choosen');
        this.moveMode = Field.MoveModes.PIECE_CHOOSE;
        this.choosenCell = null;

    } else {
        opponentPiece = this.getPieceByCoords({ x: cell.dataset.x, y: cell.dataset.y });
        choosenPiece = this.getPieceByCoords({ x: this.choosenCell.dataset.x, y: this.choosenCell.dataset.y })

        if ((opponentPiece && opponentPiece.color == playerColor) ||
            !choosenPiece.checkMove(
                {
                    x: Number(this.choosenCell.dataset.x),
                    y: Number(this.choosenCell.dataset.y)
                },
                {
                    x: Number(cell.dataset.x),
                    y: Number(cell.dataset.y)
                },
                !!opponentPiece
            )
        ) {
            alert('You can\'t move the piece to this cell!');
        } else {

            choosenPiece.moved = true;
            cell.innerHTML = choosenPiece.getHtml();

            this.addPieceToMap({
                x: Number(this.choosenCell.dataset.x),
                y: Number(this.choosenCell.dataset.y)
            }, null);

            this.addPieceToMap({
                x: Number(cell.dataset.x),
                y: Number(cell.dataset.y)
            }, choosenPiece);

            this.choosenCell.classList.remove('cell_choosen');

            if (opponentPiece) {
                GAME.addCatch(opponentPiece);
            }

            this.choosenCell.innerHTML = '';
            this.choosenCell = null;
            this.moveMode = Field.MoveModes.PIECE_CHOOSE;
            GAME.changePlayer();
            GAME.renderTurnInfo();
        }
    }
}

Field.prototype.onCellClick = function(cell) {
    var piece,
        playerColor = (GAME.isWhiteTurn ? 'white' : 'black');

    if (this.moveMode == Field.MoveModes.PIECE_CHOOSE) {
        this.choosePiece(cell);
        return;
    }

    if (this.moveMode == Field.MoveModes.CELL_CHOOSE) {
        this.chooseCell(cell);
    }
}

Field.prototype.setHandlers = function() {
    var field = this,
        cells = this.el.getElementsByClassName('cell');

    for (var i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', function(e) {
            field.onCellClick(e.currentTarget);
        });
    }
}
