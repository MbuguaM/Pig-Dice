var Player = {
  setNumber: function(number) {
    this.number = number;
  },
  addPoints: function(points) {
    this.score += points;
  },
  score: 0
};

var Turn = {
  points: 0,
  setPlayer: function(player) {
    this.player = player;
  },
  roll: function() {
    var die = Object.create(Die);
    var roll = die.roll();
    if (roll === 1) {
      this.over = true;
      this.points = 0;
    } else {
      this.points += roll;
    }
    return roll;
  },
  hold: function() {
    this.player.addPoints(this.points);
    this.over = true;
  }
};

var Die = {
  roll: function() {
    return Math.floor(Math.random() * 5 + 1);
  }
};

var Game = {
  createPlayers: function(numberOfPlayers) {
    this.players = [];
    for (var i = numberOfPlayers; i > 0; i--) {
      var player = Object.create(Player);
      player.setNumber(i);
      this.players.push(player);
      this.nextPlayer();
    }
  },
  nextPlayer: function() {
    this.currentPlayer = this.players.pop();
    this.players.unshift(this.currentPlayer);
    return this.currentPlayer;
  },
  over: function() {
    return this.players.some(function(player) {
      return player.score >= 100;
    });
  },
  winner: function() {
    return this.players.reduce(function(highestScorerYet, currentPlayer) {
      if (highestScorerYet.score > currentPlayer.score) {
        return highestScorerYet;
      } else {
        return currentPlayer;
      }
    });
  }
};

$(function() {
  function endTurn() {
    $("#player" + currentPlayer.number + "-score").empty().append(currentPlayer.score);
    currentPlayer = game.nextPlayer();
  }

  function newTurn() {
    $("#turn").hide();
    $("#current-player").empty().append(currentPlayer.number);
    var currentTurn = Object.create(Turn);
    currentTurn.setPlayer(currentPlayer);
    return currentTurn;
  }

  var game = Object.create(Game);
  game.createPlayers(2);
  var currentPlayer = game.currentPlayer;
  var currentTurn = newTurn();
  
  $("button#roll").click(function() {
    var currentRoll = currentTurn.roll();
    $("#current-roll").empty().append(currentRoll);
    $("#current-turn-score").empty().append(currentTurn.points);
    $("#turn").show();
    if (currentTurn.over) {
      alert("You rolled a 1. Your turn is over!")
      endTurn();
      currentTurn = newTurn();
    }
  });

  $("button#hold").click(function() {
    currentTurn.hold();
    endTurn();
    alert("You scored " + currentTurn.points + " points this turn.");
    if (game.over()) {
      alert("Player " + game.winner().number + " wins!")
    } else {
      currentTurn = newTurn();
    }
  });
});
specs.js
describe("Player", function() {
  it("lets you set its number", function() {
    var player = Object.create(Player);
    player.setNumber(1);
    player.number.should.equal(1);
  });

  it("starts out with 0 points", function() {
    var player = Object.create(Player);
    player.score.should.equal(0);
  });

  it("lets you add points to its score", function() {
    var player = Object.create(Player);
    player.addPoints(5);
    player.score.should.equal(5);
  });
});

describe("Game", function() {
  describe("createPlayers", function() {
    it("creates players", function() {
      var game = Object.create(Game);
      game.createPlayers(2);
      game.players.length.should.equal(2);
    });

    it("sets the current player after creating players", function() {
      var game = Object.create(Game);
      game.createPlayers(1);
      player = game.players[0];
      game.currentPlayer.should.equal(player);
    });
  });


  specs
  
  describe("nextPlayer", function() {
    it("changes the player to the next player", function() {
      var game = Object.create(Game);
      game.createPlayers(2);
      var oldCurrentPlayer = game.currentPlayer;
      var newCurrentPlayer = game.players.filter(function(player) {
        return player !== oldCurrentPlayer;
      }).pop();
      game.nextPlayer();
      game.currentPlayer.should.equal(newCurrentPlayer);
    });
  });

  describe("over", function() {
    it("is not over if no player has at least 100 points", function() {
      var game = Object.create(Game);
      game.createPlayers(1);
      game.over().should.be.false;
    });

    it("is over if a player has at least 100 points", function() {
      var game = Object.create(Game);
      game.createPlayers(1);
      player = game.players[0];
      player.addPoints(100);
      game.over().should.be.true;
    });
  });

  describe("winner", function() {
    it("tells you which player has more than 100 points", function() {
      var game = Object.create(Game);
      game.createPlayers(2);
      var winner = game.players[0];
      winner.addPoints(100);
      game.winner().should.equal(winner);
    });
  });
});

describe("Turn", function() {
  it("lets you set the player for the turn", function() {
    var turn = Object.create(Turn);
    var player = Object.create(Player);
    turn.setPlayer(player);
    turn.player.should.equal(player);
  });

  it("starts with 0 points", function() {
    var turn = Object.create(Turn);
    turn.points.should.equal(0);
  });

  describe("roll", function() {
    it("adds the roll to the points if you roll anything but a 1", function() {
      var turn = Object.create(Turn);
      sinon.stub(Die, 'roll').returns(6);
      turn.roll();
      turn.points.should.equal(6);
      Die.roll.restore();
    });

    it("sets its points to 0 if you roll a 1", function() {
      var turn = Object.create(Turn);
      sinon.stub(Die, 'roll').returns(1);
      turn.roll();
      turn.points.should.equal(0);
      Die.roll.restore();
    });

    it("is over if you roll a 1", function() {
      var turn = Object.create(Turn);
      sinon.stub(Die, 'roll').returns(1);
      turn.roll();
      turn.over.should.be.true;
      Die.roll.restore();
    });

    it("returns the value of the roll", function() {
      var turn = Object.create(Turn);
      sinon.stub(Die, 'roll').returns(1);
      turn.roll().should.equal(1);
      Die.roll.restore();
    });
  });

  describe("hold", function() {
    it("adds its points to the player's score if they hold", function() {
      var turn = Object.create(Turn);
      var player = Object.create(Player);
      turn.setPlayer(player);
      sinon.stub(Die, "roll").returns(6);
      turn.roll();
      turn.hold();
      player.score.should.equal(6);
      Die.roll.restore();
    });

    it("ends the turn", function() {
      var turn = Object.create(Turn);
      var player = Object.create(Player);
      turn.setPlayer(player);
      turn.hold();
      turn.over.should.be.true;
    });
  });
});

describe("Die", function() {
  it("returns a value when you roll it", function() {
    var die = Object.create(Die);
    sinon.stub(Math, "random").returns(1);
    die.roll().should.equal(6);
    Math.random.restore();
  });
});