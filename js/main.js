var requestAnimFrame =  window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback) {
                            window.setTimeout(callback, 1000 / 60);
                        };

var startingLives = 10;


// Asset Manager Code Download all images
function assetManager() {
	this.succ = 0;
	this.err = 0;
	this.downloadQueue=[];
	this.cache={};
}

assetManager.prototype.queueDow = function(path) {
	this.downloadQueue.push(path);
}

assetManager.prototype.isDone = function() {
	return (this.downloadQueue.length == this.err + this.succ);
}

assetManager.prototype.dowAll = function(callBack, animation) {

	if(animation)
		animation();

	for(var i = 0; i < this.downloadQueue.length ; i++) {
		
		var img = new Image();
		var that = this;
		var path = this.downloadQueue[i];
		

		img.addEventListener("load", function (){
			that.succ++;
			if(that.isDone()) {if(callBack) callBack();}
			
		});
		img.addEventListener("error", function (){
			that.err++;
			if(that.isDone()) {if(callBack) callBack();}
			
		});
		img.src = path;
		this.cache[path] = img;
	}

	return this.err == 0;
}
assetManager.prototype.getMedia = function(path) {
	return this.cache[path];
}
//Asset Manager Ends

//GameEngine Portion

function gameEngine() {
	this.entities = [];
	this.canvctx = null;
	this.lastTimestamp = null;
	this.timeDelta = null;
}
gameEngine.prototype.init = function(ctx) {
	this.canvctx = ctx;
}
gameEngine.prototype.insEntity = function(obj) {
	this.entities.push(obj);
}

gameEngine.prototype.update = function (callBack) {
	//Updating diffrent entity space

	for(var i =0;i < this.entities.length; i++){
		if(!this.entities[i].destroyed)
			this.entities[i].update();
	}
	for(var i = 0;i < this.entities.length; i++) {
		if(this.entities[i].destroyed){
			this.entities.splice(i);

		}
	}
	if(callBack){
		callBack();
	}
}

gameEngine.prototype.draw = function (callBack) {
	//Drawing diffrent entity space
	this.canvctx.clearRect(0, 0, this.canvctx.canvas.width, this.canvctx.canvas.height);
	this.canvctx.save();
	this.canvctx.translate(this.canvctx.canvas.width/2, this.canvctx.canvas.height);
	
	// alert(this.canvctx.width);

	for(var i =0;i < this.entities.length; i++){
		this.entities[i].draw(this.canvctx);
	}
	this.canvctx.restore();
	
	if(callBack){
		callBack();
	}
}

gameEngine.prototype.loop = function () {
	var now = Date.now();
	this.delta = now - this.lastTimestamp;
	this.update();
	this.draw();
	this.lastTimestamp = now;

}

gameEngine.prototype.start = function () {
	//Initializing Code for the game
	console.log("Starting Game");
	this.lastTimestamp = Date.now();
	var that = this;
	(function gameLoop() {
		that.loop();
		requestAnimFrame(gameLoop, that.canvctx.canvas);
	})();
}


function entity(game,x,y) {
	this.game = game;
	this.X = x;
	this.Y = y;
	this.destroyed = false;
	this.sprite = null;
}

entity.prototype.draw = function (ctx) {
	//Draws Images centered
	// Y is replaced by -Y for proper orientations
	ctx.drawImage(this.sprite, this.X - this.sprite.width/2, -this.Y - this.sprite.height/2 );

}

entity.prototype.update = function() {
	
}

entity.prototype.getInBoundX = function() {
	if(this.X >this.game.canvctx.canvas.width/2-this.sprite.width/2)
		this.X = this.game.canvctx.canvas.width/2-this.sprite.width/2;
	if(this.X <-this.game.canvctx.canvas.width/2+this.sprite.width/2)
		this.X = -this.game.canvctx.canvas.width/2+this.sprite.width/2;
	
}

entity.prototype.getInBoundY = function () {
	// console.log("this.y" + this.Y);
	if(this.Y >this.game.canvctx.canvas.height-this.sprite.height/2)
		this.Y = this.game.canvctx.canvas.height-this.sprite.height/2;
	if(this.Y < this.sprite.height/2)
		this.Y = this.sprite.height/2;
}

entity.prototype.destroy = function () {
	this.destroyed = true;
}

function paddle(game) {
	entity.call(this, game, 0, 15);	
	this.sprite = AS.getMedia("images/paddle.png");
	
	this.speedX = paddleSpeed;
}

paddle.prototype = new entity();
paddle.prototype.constructor = paddle;


paddle.prototype.update = function() {
	this.X += this.speedX*this.game.move;
	entity.prototype.getInBoundX.call(this);
}

paddle.prototype.func = function (x, y) {
	var a = this.sprite.width/2,
		b = this.sprite.height/2;

	return ((x -this.X) * (x- this.X))/(a*a) + ((y - this.Y) * (y - this.Y)) /(b*b) -1;
}

paddle.prototype.shoot = function() {

}


function box() {
	this.corX = 0;
	this.corY = 0;
	this.sizeX = 0;
	this.sizeY = 0;
}

box.prototype.draw = function(ctx) {

}

box.prototype.update = function() {

}

function ball(game) {

	entity.call(this,game, this.X, 33);
	this.sprite = AS.getMedia("images/ball.png");
	this.onPaddle = true;
	this.speedX = 0;
	this.speedY = 0;

}

ball.prototype = new entity();
ball.prototype.constructor = ball;



ball.prototype.update = function() {
	// console.log("Speeds: "+this.speedY+" "+this.speedX);
	if(this.onPaddle)
		this.X = this.game.pad.X;

	this.X += this.speedX;
	this.Y += this.speedY;

	entity.prototype.getInBoundY.call(this);
	entity.prototype.getInBoundX.call(this);

	if(this.Y <= this.sprite.height/2){
		this.reset();
		this.game.lives -= 1;
	}

	this.normalize();

	if(this.onEdge()) {
		var epsilon = 0.01;
		if(this.onEdge() == 'x') {
			this.speedX*=-1;
			this.speedX += epsilon;
		}
		if(this.onEdge() == 'y') {
			this.speedY*=-1;
			this.speedY += epsilon;
		}

	}

	if(this.hitOnPad() && !this.onPaddle) {

		var that = this;

		function tangentEllipse(x,y,a,b) {
			var centerX = that.game.pad.X,
				centerY = that.game.pad.Y;

			console.log( (y +" "+ centerY));

			return -((x - centerX) * (b*b))/((y - centerY) * (a*a));
		}

		var theta = Math.atan(tangentEllipse(this.X,this.Y,this.sprite.width/2, this.sprite.height/2));
		// console.log(tangentEllipse(this.X,this.Y,this.sprite.width, this.sprite.height));
		console.log("cor: "+this.X+ " "+ this.Y );
		console.log("func: ", this.game.pad.func(this.X, this.Y));
		console.log("Gradient: "+theta*180/3.14 );
		console.log("Cos: "+Math.cos(theta)+ " sin: "+Math.sin(theta));

		// var speed = [0,0];
		// speed[0] = this.speedX * Math.cos(theta) + this.speedY * Math.sin(theta); 
		// speed[1] = this.speedX * Math.sin(theta) - this.speedY * Math.cos(theta);

		// speed[1] *= -1;

		// console.log("Speed(0,1): ("+speed[0]+ ", "+speed[1]+")" );
		console.log("orignal: "+this.speedX+" "+ this.speedY);

		// this.speedX = speed[0] / Math.cos(theta) - speed[1] / Math.sin(theta);
		// this.speedY = speed[1] / Math.cos(theta) + speed[0] / Math.sin(theta);
		// var mod = Math.sqrt( this.speedX * this.speedX + this.speedY* this.speedY);

		// this.speedY = this.speedY*paddleSpeed/mod;
		// this.speedX = this.speedX*paddleSpeed/mod;

		var sx = this.speedX,
			sy = this.speedY;

		this.speedX = sx * (Math.cos(theta) * Math.cos(theta) - Math.sin(theta) * Math.sin(theta)) + 2 * sy * Math.sin(theta) * Math.cos(theta);
		this.speedY = sy * (Math.sin(theta) * Math.sin(theta) - Math.cos(theta) * Math.cos(theta)) + 2 * sx * Math.sin(theta) * Math.cos(theta);
		if(Math.cos(theta)<.9999)
			this.speedY *= -1;


		//Adding randomnesss for breaking deadlocks
		this.speedX += .005 - Math.random()/100;
		this.speedY += .005 - Math.random()/100;
		console.log("computed: "+this.speedX+ " "+this.speedY);

		// this.speedX += 0.1 - Math.random()/10;
		// this.speedY += 0.1 - Math.random()/10;
		
		
		
	}
	// console.log("corY: "+ this.Y);
	// entity.prototype.update.call(this);
}

ball.prototype.reset = function() {

	this.X = this.game.pad.X;
	this.onPaddle = true;
	this.speedX = 0;
	this.speedY = 0;
	this.Y = this.game.pad.sprite.height + this.sprite.height/2;
	console.log(this.X+""+ this.Y);

}

ball.prototype.onEdge = function() {
	if(this.X == this.game.canvctx.canvas.width/2-this.sprite.width/2 || this.X == -this.game.canvctx.canvas.width/2+this.sprite.width/2)
		return 'x';
	else if(this.Y == this.game.canvctx.canvas.height-this.sprite.height/2)
		return 'y';
	return null;
}

ball.prototype.hitOnPad = function() {
	// console.log(this.game.pad.func(this.X, this.Y));
	return this.game.pad.func(this.X, this.Y) <= 0.01;
}

ball.prototype.normalize = function() {
	var a = this.game.pad.sprite.width/2,
		b = this.game.pad.sprite.height/2;

	if(this.game.pad.func(this.X, this.Y) <= 0.01){
		var t = this.X - this.game.pad.X;
		this.Y = b*Math.sqrt(1 - (t*t)/(a*a)) + this.game.pad.Y;

		// console.log("Normalized "+this.game.pad.func(this.X, this.Y));
	}
}

function game() {
	gameEngine.call(this);
	this.score = 0;
	this.lives = startingLives;
	this.move = 0;
}

game.prototype = new gameEngine();
game.prototype.constructor = game;	

game.prototype.start = function() {
	this.pad = new paddle(this);
	this.ball = new ball(this);
	this.insEntity(this.pad);
	this.insEntity(this.ball);
	this.startInput();
	gameEngine.prototype.start.call(this);
}

game.prototype.draw = function () {
	gameEngine.prototype.draw.call(this);
	this.canvctx.save();
	this.canvctx.translate(this.canvctx.canvas.width - 100, 0);
	this.canvctx.fillStyle = "white";
	this.canvctx.font = "22px bold Ariel";
	this.canvctx.fillText("Lives: "+this.lives, 0 ,  25);
	this.canvctx.restore();
}
game.prototype.startInput = function() {
	var that = this;

	document.addEventListener('keydown', keyPressed, false);
	document.addEventListener('keyup', keyLeft, false);

	function keyPressed(e) {
		var key = e.which ||e.keyCode ;
		if(key == 37) // Left Key pressed Move paddle Left
			that.move = -1;			
		
		if(key == 39)  // Right Key pressed Move paddle right
			that.move = 1;			

		if(key == 32)
			e.preventDefault();
	}

	function keyLeft(e) {
		var key = e.which ||e.keyCode ;

		if(key == 37 || key == 39) // Left Key or Right key
			that.move = 0;			

		if(key == 32 && that.ball.onPaddle) {
			// alert("ds");
			var ball = that.ball;
			that.ball.onPaddle = false;
			that.ball.speedY = 10;
			that.ball.speedX = 0;
			e.preventDefault();
		}
		if(key == 65){
			that.ball.speedX = 0;
			that.ball.speedY = 0;
			that.ball.X = 100;
			that.ball.Y = 100;
		}


	}

}











//Main Javascript Portion

var newgame = new game();
var AS = new assetManager();
var paddleSpeed = 6;
var canvas = document.querySelector("#space");
var context = canvas.getContext('2d');
var tid = setInterval(function (){
	if(document.readyState != 'complete') return ;
	clearInterval(tid);

	document.querySelector("#space").style["background-color"] = "rgba(0,0,0,0.9)";

	

	
	AS.queueDow("images/paddle.png");
	AS.queueDow("images/ball.png");

	AS.dowAll(function() {
		console.log("Number of Error: " + AS.err + " Number of Sucess: " + AS.succ);
		document.querySelector("body").style["background-color"]="white";
		newgame.init(context);
		newgame.start();
		
	});

	

}, 100);

