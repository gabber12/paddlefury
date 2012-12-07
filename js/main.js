var requestAnimFrame =  window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback) {
                            window.setTimeout(callback, 1000 / 60);
                        };




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
//Asset Manager Ends

//GameEngine Portion

function gameEngine() {
	this.entitie = [];
	this.canvctx = null;
	this.lastTimestamp = null;
	this.timeDelta = null;
}
game.prototype.insEntity = function(obj) {
	this.entitie.push(obj);
}

gameEngine.prototype.update = function (callBack) {
	//Updating diffrent entity space
	for(var i =0;i < entity.length; i++){
		entitie[i].update();
	}
	if(callBack){
		callBack();
	}
}

gameEngine.prototype.draw = function (callBack) {
	//Drawing diffrent entity space
	for(var i =0;i < entity.length; i++){
		entitie[i].draw(this.canvctx);
	}
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



function paddle() {
	this.sizeX = 100;
	this.sizeY = 20;
	this.corX = 0;
	this.corY = 0;
	this.speed = 2;

}

paddle.prototype.draw = function(ctx) {

}

paddle.prototype.update = function() {

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

box.prototype.destroy = function() {

}

function ball() {
	this.corX = 0;
	this.corY = 0;

}

ball.prototype.draw = function (ctx) {

}

ball.prototype.update = function() {

}


function game() {
	
	this.AS = new assetManager();
	this.GE = new gameEngine();
	this.blt = new ball();
	this.pad = new paddle();
	this.boxes = [];
	
}















//Main Javascript Portion


var tid = setInterval(function (){
	if(document.readyState != 'complete') return ;
	clearInterval(tid);

	document.querySelector("#space").style["background-color"] = "rgba(0,0,0,0.9)";

	var AS = new assetManager;
	
	AS.queueDow("hel1.jpg");
	AS.queueDow("hel.png");

	AS.dowAll(function() {
		if (AS.isDone())	{
			
			log.console("Number of Error: " + AS.err + " Number of Sucess: " + AS.succ);
			document.querySelector("body").style["background-color"]="white";
		}
	}, function() {
		document.querySelector("body").style["background-color"]="rgba(0,0,0,0.8)";
	});
//Asset Management Over
	

}, 100);

