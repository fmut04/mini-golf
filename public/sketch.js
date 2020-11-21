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
let ballsec;
let ballsArr = [];
let drawnOtherBalls=true;
let offset = 600;
const STARTINGBALLX = 250;
const STARTINGBALLY = 700;
function setup() {
	createCanvas(windowWidth, windowHeight);
	 ballsArr.push(new golfBall(STARTINGBALLX,STARTINGBALLY));
	 //ballsArr.push(new golfBall(1000,400));
	 pickLevel();
	 addWalls();

	 socket = io.connect('https://mini-golf.herokuapp.com/');
	 socket.on('ballPos', drawOtherBalls);
	 //socket.on('addBall' , addNewBall)
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
		strokeWeight(3);
		line(lerp( this.mouseVector.x, this.pos.x, .5 ),lerp( this.mouseVector.y, this.pos.y, .5 ),this.pos.x,this.pos.y);


		///////////////DRAW GOAL//////////
		fill(120,70,200);
		ellipse(goalX,goalY,25);
	}

	move()
	{
		if(velMag>.02)
		{
			velMag-=.12;
		}

		this.vel.setMag(velMag);
		this.pos.sub(this.vel);

	}



launch()
{
	if(isMouseClicked && this.vel.mag()<.2)
	{
		this.acc = p5.Vector.sub(this.mouseVector, this.pos);
		this.vel.add(this.acc);
		velMag = dist( this.mouseVector.x, this.mouseVector.y,this.pos.x,this.pos.y)/30;

		isMouseClicked = false;
		strokes++;
	}
}

collisions()
{
	if(this.pos.x<20 || this.pos.x>windowWidth-20)
	{
		this.vel.x *= -1;
		velMag -=3;
		this.pos.sub(this.vel);
	}

	if(this.pos.y<20 || this.pos.y>windowWidth)
	{
		this.vel.y *= -1;
		velMag -=3;
	}

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
						if(walls[i].x1 == walls[i].x2){
						if( this.pos.y >  walls[i].y2 ||  this.pos.y >  walls[i].y1)
						{
							this.vel.x *= -1;
							velMag -=.5;
							this.pos.sub(this.vel);

							stroke(255,0,0);
							line(walls[i].x1,walls[i].y1, walls[i].x2,walls[i].y2);
						}
					}
						else if(walls[i].y1 == walls[i].y2 &&  this.pos.x > walls[i].x1 && this.pos.x < walls[i].x2)
						{

								this.vel.y *= -1;
								velMag -=.5;
								this.pos.sub(this.vel);

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

	 for (var i = 0; i < walls.length; i++) {
	 	walls[i].show();
	 }

	 ballsArr[0].show();
	 ballsArr[0].move();
	 ballsArr[0].launch();
	 ballsArr[0].collisions();
	 var sentBallPos = {
		 x:  ballsArr[0].pos.x,
		 y:  ballsArr[0].pos.y
	 }

	 socket.emit('ballPos', sentBallPos , walls);
	 for(var i=1; i<ballsArr.length; i++)
	 {
		ballsArr[i].show();
	 }
	 drawText();

}

function mouseClicked()
{
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

function getIntersectionPoint(m1 , c1, m2, c2)
{
	intersectionX = (c2 - c1) / (m1 - m2);
	intersectionY = (m1*c1 - c2*m2) / m1-m2;
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

		function drawText()
{
	noFill()
	strokeWeight(1);
	stroke(255);
	textFont("normal" , 50);
	text("Strokes " + strokes , 300 ,900);

}

function addWalls(randNum)
{
	if(randNum==0)
	{
		walls.push(new wall(200,50,650,50));
		walls.push(new wall(650,50,650,800));
		walls.push(new wall(200,800,650,800));
		walls.push(new wall(200,800,200,50));

		goalX = 400;
		goalY = 100;

		ballsArr[0].pos.x = STARTINGBALLX;
		ballsArr[0].pos.y = STARTINGBALLY;
	}

	if(randNum==1)
	{
		walls.push(new wall(200,50,650,50));
		walls.push(new wall(650,50,650,800));
		walls.push(new wall(200,800,650,800));
		walls.push(new wall(200,800,200,50));
		walls.push(new wall(200,400,400,400));
		walls.push(new wall(400,200,650,200));
		walls.push(new wall(400,600,650,600));
		goalX = 400;
		goalY = 100;

		ballsArr[0].pos.x = STARTINGBALLX;
		ballsArr[0].pos.y = STARTINGBALLY;
	}



}

 function pickLevel()
{
	let randNum = Math.floor(random(2));
	walls = [];
	addWalls(randNum);

		ballsArr[0].vel.x = 0;
		ballsArr[0].vel.y = 0;


}

function drawOtherBalls(sentBallPos, otherArr)
{
	background(0);
	stroke(0);
	strokeWeight(4);
	fill(180,0,0);
	ellipse(sentBallPos.x+offset,sentBallPos.y,30);

	for(var i=0; i<otherArr.length; i++)
	{
		stroke(255);
		line(otherArr[i].x1+offset,otherArr[i].y1,otherArr[i].x2+offset,otherArr[i].y2);
	}

}
