var M_SNAKEGAME = {};

M_SNAKEGAME.game = (function () {
   var canvas = $('#snakecanvas')[0];
   var context = canvas.getContext('2d');
   var frameLenght = 100; // New frame each 0.1 seconds
   var snake;
    
   M_SNAKEGAME.blockSize = 10;
   M_SNAKEGAME.width = canvas.width;
   M_SNAKEGAME.height = canvas.height;
   
    
    //Initialise the context with a pink rectangle in it
    function initialise(){
    //Set the color of the canvas to pink
    context.fillStyle = '#fe78a1';
    //x,y,width,height
    context.fillRect(0,0,50,50);  
    snake = M_SNAKEGAME.snake();
         bindEvents();
    loop();
    }
    
    //The game loop
    function loop(){
    context.clearRect(0,0, M_SNAKEGAME.width, M_SNAKEGAME.height); //x,y,width,height
    
    snake.advance();
    snake.draw(context);
        
    setTimeout(loop, frameLenght);
    
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
  }
    
    return {
        initialise : initialise
           };

})();



M_SNAKEGAME.snake = (function() {
    
    var snakeArray = [];
    snakeArray.push([6,4]);
    snakeArray.push([5,4]);
    snakeArray.push([4,4]);
    var direction = 'right';
    var nextDirection = direction;

  function setDirection(newDirection) {
    var allowedDirections;

    //If snake is going left or right, only valid new directions
    //are up and down. Vice versa for up or down.
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

    
    function drawSnakePart(context, position){
        
    var x = M_SNAKEGAME.blockSize * position[0];
    var y = M_SNAKEGAME.blockSize * position[1];
        
    context.fillRect(x,y,M_SNAKEGAME.blockSize,M_SNAKEGAME.blockSize);
    }
    
    function draw(context){
        /*
        Since a canvas can only have one 2d context, we need to use
        save and restore in order to transform it
        for more explanation : see http://html5.litten.com/understanding-save-and-restore-for-the-canvas-context/
        */
        
        context.save(); //Pushes the current state onto the stack.
        context.fillStyle = '#33a';
        
        for(var i = 0; i < snakeArray.length; i++){
          drawSnakePart(context, snakeArray[i]);
        }
        context.restore(); //Pops the top state on the stack
    }
    
   function advance() {
       
    var nextPos = snakeArray[0].slice(); //Copie the head of the snake   
       
   direction = nextDirection;
    switch (direction) {
    case 'left':
      nextPos[0] -= 1;
      break;
    case 'up':
      nextPos[1] -= 1;
      break;
    case 'right':
      nextPos[0] += 1;
      break;
    case 'down':
      nextPos[1] += 1;
      break;
    default:
      throw('Invalid direction');
    }
    
    snakeArray.unshift(nextPos); //unshit definition : Add new items to the beginning of an array
    //remove the last position
    snakeArray.pop();
       
   }
    return {
    draw: draw,
    advance: advance
  };
});

$(document).ready(function() {

    M_SNAKEGAME.game.initialise();
});
