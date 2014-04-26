var d3 = d3;

// Set up our game options.
// We will reference these numbers all over our
// implementation, so it's important that we keep
// them in one place so they are easy to change in
// the future.
var opts = {
  height: 450,
  width: 700,
  enemies: 50,
  padding: 20
};

// We need a place to keep the score
// without polluting the global namespace.
var stats = {
  score: 0,
  bestScore: 0
};

// A Vector type that we will use for convenience.
// Since this doesn't implement any methods
// it's just a shorthand for creating an object
// with x and y keys.
var Vector = function (x, y) {
  this.x = x;
  this.y = y;
};

// An extension of our Vector object to hold a radius.
// The location of the circle is kept in the x and y
// attributes, and it's radius is kept in r.
var Circle = function (x, y, r) {
  Vector.call(this, x, y);
  this.r = r;
};

// Pseudoclassical inheritance boilerplate.
Circle.prototype = Object.create(Vector.prototype);
Circle.prototype.constructor = Circle;

// This variable will hold the Circle object that
// represents the model of the player throughout
// this implementation.
var playerLocation = new Circle(
  opts.width / 2, opts.height / 2, 10);

// A D3 handler for updating the score quickly.
// Nothing too interesting in here.
var updateHighScore = function (data) {
  // Update our best score to the highest score yet - either the current
  // high score or a new one.
  stats.bestScore = Math.max(stats.bestScore, stats.score);

  var score = d3.select("#best-score")
    .data(data);

  score.enter().append("text")
    .text(function () { return stats.bestScore; }); // Quick hack to ignore data.
  score.text(function () { return stats.bestScore; });
};

// Create the svg element we will be doing all of our graphics work in.
var game = d3.select(".game").append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
    .attr("padding", opts.padding);

// Takes an enemy and a callback and will call the callback with
// the enemy if there is a collision between the enemy
// and the player.
var checkCollision = function (enemy, callback) {
  var xDiff = parseFloat(enemy.attr("cx")) - playerLocation.x;
  var yDiff = parseFloat(enemy.attr("cy")) - playerLocation.y;
  var radSum = parseFloat(enemy.attr("r")) + playerLocation.r;

  if (radSum * radSum > xDiff * xDiff + yDiff * yDiff) {
    callback(enemy);
  }
};

// D3 updater for increasing the current-score.
// Gets called in our setInterval event-loop.
var updateScore = function (data) {
  var score = d3.select("#current-score")
    .data(data);

  score.enter().append("text")
    .text(function (d) { return d; });
  score.text(function (d) { return d; });
};

// Our callback that we want to execute
// whenever a collision is detected.
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
      // This tween re-implements the moving animation
      // and detects collisions each frame.
      .tween("custom", function(d) {
        var enemy = d3.select(this);

        var startPos = new Vector(
          parseFloat(enemy.attr("cx")),
          parseFloat(enemy.attr("cy"))
        );

        var endPos = d;

        return function (t) {
          // Call our callback every frame.
          checkCollision(enemy, onCollision);

          // Update our position by scaling by t.
          enemy.attr("cx", startPos.x + (endPos.x - startPos.x)*t)
            .attr("cy", startPos.y + (endPos.y - startPos.y)*t);
        };
      });

  enemies.exit().remove();
};

// Create the player - called once.
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

// Pack an array to the length of the first parameter with an
// optional fill parameter.
var pack = function (length, fill) {
  var arr = [];
  for (var i = 0; i < length; i++) {
    arr.push(fill);
  }
  return arr;
};

// Set Interval, except calls the function immediately
// before starting the interval.
var doSetInterval = function (func, time) {
  func();
  return setInterval(func, time);
};

// Generates a random int between two values.
var between = function (min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
};

// Create the player.
createPlayer([playerLocation]);

var enemyLocations;

// Start the enemy animation loop.
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

// Start the score animation loop.
doSetInterval(function () {
  stats.score += 1;
  updateScore([stats.score]);
}, 50);
