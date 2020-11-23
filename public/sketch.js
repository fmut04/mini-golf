let ball;
let isMouseClicked=false;
let tempVector;
let velMag = 0;
let goalX;
let goalY;
let slope;
let b;
let walls =  [];
let intersectionX;
let linesArrIndex=0;
let intersectionY;
let intersectionPoints = [];
let strokes=0;
let socket;
let drawnOtherBalls=true;
let otherConnections=false;
let offset = 600;
let subVel;
let levels = [1,2,3,4,5];
var wallX = 350;
var input;
let username= "Empty";
let otherUsername= "Empty";
let inputElem;
let winningUsername = "";
let didSendUsername = false;
let gameStarted=false;
let gameEnded=false;
const STARTINGBALLX = 430;
const STARTINGBALLY = 750;
function setup() {
	createCanvas(windowWidth, windowHeight);
	 ball = new golfBall(STARTINGBALLX,STARTINGBALLY);
	 levelShuffle(levels);
	 pickLevel();

	 inputElem = createInput('');
	 inputElem.changed(changeUsername);
   inputElem.position(windowWidth/2-50, windowHeight/2+50)

	 socket = io.connect('https://mini-golf.herokuapp.com/');
	 //socket = io.connect('localhost:3000');
	 socket.on('ballPos', drawOtherPlayers);
	 socket.on('newConnection', newConnection);
	 socket.on('disconnected', endGame);
	 socket.on('sentUsername', getUsername);
	 socket.on('gameEnd', endGame);
}

class wall {
	constructor(x1,y1,x2,y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
	show()
	{
		stroke(255);
		line(this.x1,this.y1,this.x2,this.y2);
	}

}
class golfBall {
	constructor(x,y) {
		this.r = 30;
		this.pos = createVector(x,y);
		this.mouseVector = createVector(mouseX,mouseY);
		this.dirVector = createVector(0,0);
		this.acc = createVector(0,0);
		this.vel = createVector(0,0);
		this.ballSlope;
		this.ballB;
		this.linesArr = [];
	}

	show()
	{

		////////CREATES BALL////////////
		stroke(0);
		strokeWeight(4);
		fill(0,180,0);
		ellipse(this.pos.x,this.pos.y,this.r);

		////////////CREATES LINE FROM BALL TO MOUSE POS////////////////
		this.mouseVector = createVector(mouseX,mouseY);
		stroke(30);
		strokeWeight(3);
		line(lerp( this.mouseVector.x, this.pos.x, .5 ),lerp( this.mouseVector.y, this.pos.y, .5 ),this.pos.x,this.pos.y);


		///////////////DRAW GOAL//////////
		fill(120,70,200);
		ellipse(goalX,goalY,25);
	}

	move()
	{
		////////SLOWS THE BALL DOWN////////////
		 if(velMag>.02)
		{
			velMag*=.94;
		}
		else{
			velMag=0;
		}

		//////SETS THE MAGNITUDE TO THE SLOWED MAG/////
		this.vel.setMag(velMag);
		///////////LIMITS THE VEL SO ITS NOT TOO STRONG/////
		this.vel.limit(10);
		/////MOVES THE BALL IN THE DIRECTION OF VEL//////
		this.pos.sub(this.vel);

	}



launch()
{
	if(isMouseClicked && this.vel.mag()<.2)
	{
		this.acc = p5.Vector.sub(this.mouseVector, this.pos);

		this.vel.add(this.acc);
		if(abs(this.vel.y) >30 || abs(this.vel.x) >30)
		{
			this.vel.mult(.2);
			console.log("call");
		}
		velMag = dist( this.mouseVector.x, this.mouseVector.y,this.pos.x,this.pos.y)/10;

		isMouseClicked = false;
		strokes++;
	}
}

collisions()
{
	if(dist(this.pos.x,this.pos.y,goalX,goalY)<this.r)
	{
			pickLevel();
			strokes = 0;
	}

	this.checkWallCollisions();

}

	checkWallCollisions()
	{
		this.linesArr.push(createVector(this.pos.x,this.pos.y-20));
		this.linesArr.push(createVector(this.pos.x+20,this.pos.y));
		this.linesArr.push(createVector(this.pos.x,this.pos.y+20));
		this.linesArr.push(createVector(this.pos.x-20,this.pos.y));


		for (var i = 0; i < walls.length; i++) {
			for(var j=0; j<4; j++)
			{
				intersectionPoints[j] = intersect(this.linesArr[j].x,this.linesArr[j].y,this.pos.x,this.pos.y,walls[i].x1,walls[i].y1,walls[i].x2,walls[i].y2);

				if(dist(intersectionPoints[j].x,intersectionPoints[j].y,this.pos.x,this.pos.y)<this.r/2)
				{
						if(walls[i].x1 == walls[i].x2)
						{
						if( this.pos.y >  walls[i].y2 &&  this.pos.y <  walls[i].y1)
						{
							this.vel.x *= -1;
							velMag -=1;
							subVel = this.vel.mult(.9);
							this.pos.sub(subVel);

							stroke(255,0,0);
							line(walls[i].x1,walls[i].y1, walls[i].x2,walls[i].y2);
						}
					}
						else if(walls[i].y1 == walls[i].y2 &&  this.pos.x > walls[i].x1 && this.pos.x < walls[i].x2)
						{
								this.vel.y *= -1;
								velMag -=1;
								subVel = this.vel.mult(.9);
 								this.pos.sub(subVel);

								stroke(255,0,0);
								line(walls[i].x1,walls[i].y1, walls[i].x2,walls[i].y2);
						}
				}
			}
			}

		this.linesArr = [];
	}
}
function draw() {

	if(gameStarted && !gameEnded)
	{
	if(otherConnections && otherUsername!="Empty")
	{
		var sentBallPos = {
		 x:  ball.pos.x,
		 y:  ball.pos.y
	 }
	 socket.emit('ballPos', sentBallPos , walls);
	}
	else {
		background(0);
	}

	 for (var i = 0; i < walls.length; i++) {
	 	walls[i].show();
	 }

	 ball.show();
	 ball.move();
	 ball.launch();
	 ball.collisions();
	 drawStrokes();
}
else if(gameEnded)
{
	drawGameEnd();
}
else {
		background(0);
		drawStart();
}
}




function mouseClicked()
{
	if(gameStarted)
	isMouseClicked=true;
}

function calcSlope( x1 , y1 , x2,  y2 , returnSlope)
{
	if(x2-x1 !=0 && y2-y1!=-0)
	{
		 slope = (y2 - y1) / (x2-x1);
	}
else {
	 slope = 0;
}
	 b = y1 - (slope * x1);
	 if(returnSlope){
	 return slope;
 }
	 	return b;
}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
    if (denominator === 0) {
				let x = 10000
				let y = 10000
        return {x,y}
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator


  // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)

    return {x, y}
}

		function drawStrokes()
{

	noFill()
	strokeWeight(1);
	stroke(255);
	textFont("normal" , 30);
	if(otherUsername!="Empty" && otherConnections)
	{
		text(otherUsername, 1050, 850);
	}


	text("Strokes " + strokes , 250 ,850);
	text( username , 450 ,850);
}
 function changeUsername()
{
	username = this.value();
	inputElem.position(-200,-200);
	if(otherConnections)
	{
		socket.emit("sentUsername", username);
		didSendUsername = true;
	}
	gameStarted=true;
}
function drawStart()
{
	noFill()
	strokeWeight(1);
	stroke(0,50,200);
	textFont("normal" , 80);
	text("Welcome To Mini Golf", windowWidth/2-350,windowHeight/2-300);
	text("Enter Username To Start", windowWidth/2-350,windowHeight/2-100);
}

function drawGameEnd()
{
	noFill()
	strokeWeight(1);
	stroke(255);
	textFont("normal" , 80);
	background(0);
	text("Game Over", windowWidth/2-200,windowHeight/2-300);
	text(winningUsername + "  Has Won!", windowWidth/2-300,windowHeight/2-100);
	text("Play Again", windowWidth/2-200,windowHeight/2+50)
	if(mouseX>windowWidth/2-225 && mouseX<windowWidth/2-550 && mouseY>windowHeight/2-20 && mouseY<windowHeight/2-385)
	{
		fill(230);
		console.log("mouse over");
	}
	rect(windowWidth/2-225,windowHeight/2-20, windowWidth/2-550,windowHeight/2-385);

}
function addWalls(levelNum)
{
	walls.push(new wall(200,50,650,50));
	walls.push(new wall(650,800,650,50));
	walls.push(new wall(200,800,650,800));
	walls.push(new wall(200,800,200,50));


	if(levelNum==1)
	{
		walls.push(new wall(200,400,400,400));
		walls.push(new wall(400,200,650,200));
		walls.push(new wall(400,600,650,600));
	}

	if(levelNum==2)
	{
		walls.push(new wall(500,250,500,100));
		walls.push(new wall(400,250,600,250));

		walls.push(new wall(300,450,300,300));
		walls.push(new wall(200,450,400,450));

		walls.push(new wall(450,650,450,500));
		walls.push(new wall(350,650,550,650));
	}

	if(levelNum==3)
	{

		walls.push(new wall(wallX,600,wallX+150,600));
		walls.push(new wall(wallX-50,400,wallX+200,400));
		walls.push(new wall(wallX-100,200,wallX+250,200));
	}

	if(levelNum==4)
	{
		walls.push(new wall(350,600,650,600));
		walls.push(new wall(200,600,300,600));

		walls.push(new wall(200,400,400,400));
		walls.push(new wall(500,400,650,400));

		walls.push(new wall(300,200,500,200));
		walls.push(new wall(200,200,250,200));
		walls.push(new wall(550,200,650,200));
	}

	if(levelNum==5)
	{
		walls.push(new wall(470,650,650,650));
		walls.push(new wall(200,650,400,650));

		walls.push(new wall(wallX-100,350,wallX+250,350));
		walls.push(new wall(430,550,430,350));
		walls.push(new wall(400,550,460,550));

		walls.push(new wall(300,200,500,200));
		walls.push(new wall(200,200,250,200));
		walls.push(new wall(550,200,650,200));
	}


}

 function pickLevel()
{
	if(levels.length>4)
	{
		let levelNum = levels[levels.length-1];
		//let randNum = 5;
		walls = [];
		addWalls(levelNum);
		levels.pop();
	}
	else
	{
			console.log("You Finished The Game");
			socket.emit("gameEnd", username);
	}
	resetBall();

}

function levelShuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function resetBall()
{
	goalX = 400;
	goalY = 100;

	ball.pos.x = STARTINGBALLX;
	ball.pos.y = STARTINGBALLY;

	ball.vel.x = 0;
	ball.vel.y = 0;
}

function drawOtherPlayers(sentBallPos, otherArr)
{
	background(0);
	stroke(0);
	strokeWeight(4);
	fill(180,0,0);
	ellipse(sentBallPos.x+offset,sentBallPos.y,30);
	fill(180,0,180);
	ellipse(400+offset,100,25);
	strokeWeight(1);
	stroke(255);
	for(var i=0; i<otherArr.length; i++)
	{
		line(otherArr[i].x1+offset,otherArr[i].y1,otherArr[i].x2+offset,otherArr[i].y2);
	}
}

function getUsername(enemyUsername)
{
	otherUsername = enemyUsername;
	if(!didSendUsername)
	{
		socket.emit("sentUsername", username);
		didSendUsername=true;
	}
}
function endGame(winUsername)
{
		gameEnded=true;
		winningUsername=winUsername;
}

function resetGame()
{
	resetBall();
}
function newConnection()
{
	otherConnections=true;
}

function disconnected()
{
	otherConnections=false;
	didSendUsername=false;
	otherUsername = "Empty";
}
