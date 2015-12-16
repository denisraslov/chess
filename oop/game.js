function Game() {
    this.field = new Field();
    this.isWhiteTurn = true;
    this.whiteCatches = [];
    this.blackCatches = [];
}

Game.prototype.start = function() {
    this.field.render();
    this.field.setHandlers();
}

Game.prototype.renderTurnInfo = function() {
    document.getElementById('turn_info').innerHTML = (this.isWhiteTurn ? 'Whites turn' : 'Blacks turn');
}

Game.prototype.changePlayer = function() {
    this.isWhiteTurn = !this.isWhiteTurn;
}

Game.prototype.addCatch = function(piece) {
    var catched = (this.isWhiteTurn ? this.whiteCatches : this.blackCatches);

    catched.push(piece);
    this.renderCatches();
}

Game.prototype.renderCatches = function() {
    document.getElementById('catches_info').innerHTML =
        this.getCatchesHtml(this.whiteCatches, 'White') +
        this.getCatchesHtml(this.blackCatches, 'Black');
};

Game.prototype.getCatchesHtml = function(catches, player) {
    var html = '';

    if (catches.length) {
        html += '<div class="catchesTitle">' + player + ' catches</div>'
    }

    for (var i = 0; i < catches.length; i++) {
        html += '<div>' + catches[i].type + '</div>'
    }

    return html;
};
