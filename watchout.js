var d3 = d3;

var opts = {
  height: 450,
  width: 700,
  enemies: 50,
  padding: 20
};

var stats = {
  score: 0,
  bestScore: 0
};

var Vector = function (x, y) {
  this.x = x;
  this.y = y;
};

var Circle = function (x, y, r) {
  Vector.call(this, x, y);
  this.r = r;
};

Circle.prototype = Object.create(Vector.prototype);
Circle.prototype.constructor = Circle;

var playerLocation = new Circle(
  opts.width / 2, opts.height / 2, 10);

var updateHighScore = function (data) {
  stats.bestScore = Math.max(stats.bestScore, stats.score);

  var score = d3.select("#best-score")
    .data(data);

  score.enter().append("text")
    .text(function () { return stats.bestScore; });
  score.text(function () { return stats.bestScore; });
};

var game = d3.select(".game").append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
    .attr("padding", opts.padding);

var checkCollision = function (enemy, callback) {
  var xDiff = parseFloat(enemy.attr("cx")) - playerLocation.x;
  var yDiff = parseFloat(enemy.attr("cy")) - playerLocation.y;
  var radSum = parseFloat(enemy.attr("r")) + playerLocation.r;

  if (radSum * radSum > xDiff * xDiff + yDiff * yDiff) {
    callback(enemy);
  }
};

var updateScore = function (data) {
  var score = d3.select("#current-score")
    .data(data);

  score.enter().append("text")
    .text(function (d) { return d; });
  score.text(function (d) { return d; });
};

var onCollision = function () {
  updateHighScore([0]);
  stats.score = 0;
  updateScore([stats.score]);
};

var updateEnemies = function (data) {
  var enemies = game.selectAll(".enemy")
    .data(data);

  enemies.enter().append("circle")
    .attr("class", "enemy")
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("r", 0);

  enemies
    .transition()
      .duration(500)
      .attr("r", function (d) { return d.r; })
    .transition()
      .duration(1000)
      .tween("custom", function(d) {
        var enemy = d3.select(this);

        var startPos = new Vector(
          parseFloat(enemy.attr("cx")),
          parseFloat(enemy.attr("cy"))
        );

        var endPos = d;

        return function (t) {
          checkCollision(enemy, onCollision);

          enemy.attr("cx", startPos.x + (endPos.x - startPos.x)*t)
            .attr("cy", startPos.y + (endPos.y - startPos.y)*t);
        };
      });

  enemies.exit().remove();
};

var createPlayer = function (data) {
  var player = game.selectAll(".player")
    .data(data);

  player.enter().append("circle")
    .attr("class", "player")
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("r", function (d) { return d.r; })
    .style("fill", "orange")
    .call(d3.behavior.drag()
      .on("drag", function () {
      d3.select(this)
        .attr("cy", d3.event.y)
        .attr("cx", d3.event.x);
      playerLocation = new Circle(d3.event.x, d3.event.y,
        playerLocation.r);
    }));
};

var pack = function (length, fill) {
  var arr = [];
  for (var i = 0; i < length; i++) {
    arr.push(fill);
  }
  return arr;
};

var doSetInterval = function (func, time) {
  func();
  return setInterval(func, time);
};

var between = function (min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
};

createPlayer([playerLocation]);

var enemyLocations;

doSetInterval(function () {
  enemyLocations = pack(opts.enemies).map(function () {
    return new Circle(
      between(10, opts.width - 10),
      between(10, opts.height - 10),
      between(8, 12)
    );
  });
  updateEnemies(enemyLocations);
}, 1500);

doSetInterval(function () {
  stats.score += 1;
  updateScore([stats.score]);
}, 50);

// [x] Create master element
// [x] Create enemies
// [x] Implement enemy movement
// [x] Create a player
// [x] Make player draggable
// [x] Detect collisions
// [x] Implement score
