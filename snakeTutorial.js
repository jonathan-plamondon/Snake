var SNAKE = {};


SNAKE.equalCoordinates = function (coord1, coord2) {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

SNAKE.checkCoordinateInArray = function (coord, arr) {
  var isInArray = false;
  $.each(arr, function (index, item) {
    if (SNAKE.equalCoordinates(coord, item)) {
      isInArray = true;
    }
  });
  return isInArray;
};

SNAKE.game = (function () {
  var canvas, ctx;
  var frameLength;
  var snake;
  var apple;
  var score;
  var timeout;
  SNAKE.width = 350;
  SNAKE.height = 350;
  SNAKE.blockSize = 10;
  SNAKE.widthInBlocks = SNAKE.width / SNAKE.blockSize;
  SNAKE.heightInBlocks = SNAKE.height / SNAKE.blockSize;

  function init() {
    var $canvas = $('#snakecanvas');
    $canvas = $('#snakecanvas');
    $canvas.attr('width', SNAKE.width);
    $canvas.attr('height', SNAKE.height);
    canvas = $canvas[0];
    ctx = canvas.getContext('2d');
    score = 0;
    frameLength = 100;
    snake = SNAKE.snake();
    apple = SNAKE.apple();
    bindEvents();
    gameLoop();
  }

  function gameLoop() {
    ctx.clearRect(0, 0, SNAKE.width, SNAKE.height);
    snake.advance(apple);
    draw();

    if (snake.checkCollision()) {
      snake.retreat(); //move snake back to previous position
      snake.draw(ctx); //draw snake in its previous position
      gameOver();
    }
    else {
      timeout = setTimeout(gameLoop, frameLength);
    }
  }

  function draw() {
    snake.draw(ctx);
    drawBorder();
    apple.draw(ctx);
    drawScore();
  }

  function drawScore() {
    ctx.save();
    ctx.font = 'bold 102px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var centreX = SNAKE.width / 2;
    var centreY = SNAKE.width / 2;
    ctx.fillText(score.toString(), centreX, centreY);
    ctx.restore();
  }

  function gameOver() {
    ctx.save();
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    var centreX = SNAKE.width / 2;
    var centreY = SNAKE.width / 2;
    ctx.strokeText('Game Over', centreX, centreY - 10);
    ctx.fillText('Game Over', centreX, centreY - 10);
    ctx.font = 'bold 15px sans-serif';
    ctx.strokeText('Press space to restart', centreX, centreY + 15);
    ctx.fillText('Press space to restart', centreX, centreY + 15);
    ctx.restore();
  }

  function drawBorder() {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = SNAKE.blockSize;
    ctx.lineCap = 'square';
    var offset = ctx.lineWidth / 2;
    var corners = [
      [offset, offset],
      [SNAKE.width - offset, offset],
      [SNAKE.width - offset, SNAKE.height - offset],
      [offset, SNAKE.height - offset]
    ];
    ctx.beginPath();
    ctx.moveTo(corners[3][0], corners[3][1]);
    $.each(corners, function (index, corner) {
      ctx.lineTo(corner[0], corner[1]);
    });
    ctx.stroke();
    ctx.restore();
  }

  function restart() {
    clearTimeout(timeout);
    $('body').unbind('keydown');
    $(SNAKE).unbind('appleEaten');
    $(canvas).unbind('click');
    SNAKE.game.init();
  }
  
  function bindEvents() {
    var keysToDirections = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };

    $(document).keydown(function (event) {
      var key = event.which;
      var direction = keysToDirections[key];

      if (direction) {
        snake.setDirection(direction);
        event.preventDefault();
      }
      else if (key === 32) {
        restart();
      }
    });

    $(SNAKE).bind('appleEaten', function (event, snakePositions) {
      apple.setNewPosition(snakePositions);
      score++;
      frameLength *= 0.99; //subtle speed-up
    });

    $(canvas).click(restart);
  }

  return {
    init: init
  };
})();

SNAKE.apple = function () {
  var position = [6, 6];

  function draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#0a0'; //apple green
    ctx.beginPath();
    var radius = SNAKE.blockSize / 2;
    var x = position[0] * SNAKE.blockSize + radius;
    var y = position[1] * SNAKE.blockSize + radius;
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  function random(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }

  //get a random position within the game bounds
  function getRandomPosition() {
    var x = random(1, SNAKE.widthInBlocks - 2);
    var y = random(1, SNAKE.heightInBlocks - 2);
    return [x, y];
  }

  function setNewPosition(snakeArray) {
    var newPosition = getRandomPosition();
    //if new position is already covered by the snake, try again
    if (SNAKE.checkCoordinateInArray(newPosition, snakeArray)) {
      return setNewPosition(snakeArray);
    }
    //otherwise set position to the new position
    else {
      position = newPosition;
    }
  }

  function getPosition() {
    return position;
  }

  return {
    draw: draw,
    setNewPosition: setNewPosition,
    getPosition: getPosition
  };
};

SNAKE.snake = function () {
  var previousPosArray;
  var posArray = [];
  posArray.push([6, 4]);
  posArray.push([5, 4]);
  var direction = 'right';
  var nextDirection = direction;

  function setDirection(newDirection) {
    var allowedDirections;

    switch (direction) {
    case 'left':
    case 'right':
      allowedDirections = ['up', 'down'];
      break;
    case 'up':
    case 'down':
      allowedDirections = ['left', 'right'];
      break;
    default:
      throw('Invalid direction');
    }
    if (allowedDirections.indexOf(newDirection) > -1) {
      nextDirection = newDirection;
    }
  }

  function drawSection(ctx, position) {
    var x = SNAKE.blockSize * position[0];
    var y = SNAKE.blockSize * position[1];
    ctx.fillRect(x, y, SNAKE.blockSize, SNAKE.blockSize);
  }

  function draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#33a';
    for(var i = 0; i < posArray.length; i++) {
      drawSection(ctx, posArray[i]);
    }
    ctx.restore();
  }

  function checkCollision() {
    var wallCollision = false;
    var snakeCollision = false;
    var head = posArray[0]; //just the head
    var rest = posArray.slice(1); //the rest of the snake
    var snakeX = head[0];
    var snakeY = head[1];
    var minX = 1;
    var minY = 1;
    var maxX = SNAKE.widthInBlocks - 1;
    var maxY = SNAKE.heightInBlocks - 1;
    var outsideHorizontalBounds = snakeX < minX || snakeX >= maxX;
    var outsideVerticalBounds = snakeY < minY || snakeY >= maxY;

    if (outsideHorizontalBounds || outsideVerticalBounds) {
      wallCollision = true;
    }
    //check if the snake head coords overlap the rest of the snake
    snakeCollision = SNAKE.checkCoordinateInArray(head, rest);
    return wallCollision || snakeCollision;
  }

  function advance(apple) {
    //make a copy of the head of the snake otherwise
    //the changes below would affect the head of the snake
    var nextPosition = posArray[0].slice();
    direction = nextDirection;
    switch (direction) {
    case 'left':
      nextPosition[0] -= 1;
      break;
    case 'up':
      nextPosition[1] -= 1;
      break;
    case 'right':
      nextPosition[0] += 1;
      break;
    case 'down':
      nextPosition[1] += 1;
      break;
    default:
      throw('Invalid direction');
    }

    previousPosArray = posArray.slice(); //save previous array
    posArray.unshift(nextPosition);
    if (isEatingApple(posArray[0], apple)) {
      $(SNAKE).trigger('appleEaten', [posArray]);
    }
    else {
      posArray.pop();
    }
  }

  function isEatingApple(head, apple) {
    return SNAKE.equalCoordinates(head, apple.getPosition());
  }

  function retreat() {
    posArray = previousPosArray;
  }

  return {
    draw: draw,
    advance: advance,
    retreat: retreat,
    setDirection: setDirection,
    checkCollision: checkCollision
  };
};


SNAKE.game.init();