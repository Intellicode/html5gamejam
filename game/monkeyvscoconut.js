/**
* Game objects
*/

var STONE_NAME = "Stone";
var MONKEY_NAME = "Monkey";
var COCONUT_NAME = "Coconut";
var BRICK_NAME = "Brick";
var BRICK_SPEED = 140;
function Gameobject() {
   this.image = "";
   this.mass = 100;
   this.health = 100;
   this.objectName = "Gameobject";
}

Gameobject.prototype.name = function () {
    return this.objectName;
}

function Stone() {
    this.mass = 200;
    this.objectName = BRICK_NAME;
    this.image = document.getElementById("brickAsset");   
}

Stone.create = function(world, x, y, width, height, fixed) {
    if (typeof(fixed) == 'undefined') fixed = true;
	var boxSd = new b2BoxDef();
	if (!fixed) boxSd.density = 1.0;
	boxSd.extents.Set(width, height);
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	body = world.CreateBody(boxBd);
	body.gameObject = new Stone();
	objectCounter++;
	return body;
}

// Monkeys
function Monkey() {
    this.objectName = MONKEY_NAME;
    this.image = document.getElementById("monkeyAsset");   
}


Monkey.create = function(world, x, y, fixed) {
    	var ballSd = new b2CircleDef();
    	if (!fixed) ballSd.density = 1.0;
    	ballSd.radius = 12 || 10;
    	ballSd.restitution = 0.2;
    	var ballBd = new b2BodyDef();
    	ballBd.AddShape(ballSd);
    	ballBd.position.Set(x,y);
    	var body = world.CreateBody(ballBd);
    	body.gameObject = new Monkey();
    	objectCounter++;
    	return body;
    };
    
// Coconuts    
function Coconut() {
    this.objectName = COCONUT_NAME;
    this.image =  document.getElementById("coconutAsset");
}

Coconut.create = function(world, x, y, fixed) {
    	var ballSd = new b2CircleDef();
    	if (!fixed) ballSd.density = 1.0;
    	ballSd.radius = 16 || 10;
    	ballSd.restitution = 0.2;
    	var ballBd = new b2BodyDef();
    	ballBd.AddShape(ballSd);
    	ballBd.position.Set(x,y);
    	var body = world.CreateBody(ballBd);
    	body.gameObject = new Coconut();
    	objectCounter++;
    	return body;
    };
Coconut.add = function(coconut) {
    coconutCounter++;
    coconuts.push(coconut);
}

Coconut.remove = function() {
    coconuts[coconutCounter-1] = null;
    coconutCounter--;
}
    
Coconut.fallDownAll = function() {
    for(var i = coconuts.length-1; i >= 0 ; i--) {
        
        Coconut.fallDown(coconuts[i]);
        Coconut.remove();
    }
    started = true;
    
}

Coconut.fallDown = function(obj) {
    Coconut.create(world, obj.m_position.x, obj.m_position.y, false);
    liveCoconuts++;
    obj.m_position.x = 1000;
    obj.Freeze();
} 

Stone.prototype = new Gameobject();
Monkey.prototype = new Gameobject();
Coconut.prototype = new Gameobject();


/**
*   DEP: create box2d models
*/
    
Stone.prototype.createPoly = function(world, x, y, points, fixed) {
    	var polySd = new b2PolyDef();
    	if (!fixed) polySd.density = 1.0;
    	polySd.vertexCount = points.length;
    	for (var i = 0; i < points.length; i++) {
    		polySd.vertices[i].Set(points[i][0], points[i][1]);
    	}
    	var polyBd = new b2BodyDef();
    	polyBd.AddShape(polySd);
    	polyBd.position.Set(x,y);
    	return world.CreateBody(polyBd);
    };

/** 
* Event handling
*/
var monkey;
Event.observe(window, 'load', function() {
    init();
	level(currentLevel);
	ctx = $('canvas').getContext('2d');
	var canvasElm = $('canvas');
	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	canvasTop = parseInt(canvasElm.style.top);
	canvasLeft = parseInt(canvasElm.style.left);
	Event.observe('overlay', 'click', function(e) {
		//setupNextWorld();
		if(!started) {
    		var body = $('container');
    		var offset = body.positionedOffset(canvasElm);
    		var x = offset[0];
    		var y = offset[1];
    		if( Event.pointerY(e) - (y+100) > 100) {
    		    Stone.create(world,  Event.pointerX(e)  - (x+110),  Event.pointerY(e) - (y+130),16,16, false);
    		    score--;
    		    bricksUsed++;
    		}
		}
	    
	});
	Event.observe('canvas', 'contextmenu', function(e) {
		if (e.preventDefault) e.preventDefault();
		
		return false;
	});
	Event.observe('lose', 'click', function(e) {
		closeLose();
	});
	Event.observe('losePopover', 'click', function(e) {
		closeLose();
	});
	
	Event.observe('win', 'click', function(e) {
		closeWin();
	});
	Event.observe('winPopover', 'click', function(e) {
		closeWin();
	});
	Event.observe('tipPopover', 'click', function(e) {
		$('tipPopover').style.display = "none";
	});
	
	Event.observe('readyButton', 'click', function(e) {
		Coconut.fallDownAll();
	//	if(window.webkitNotifications)
	//	    window.webkitNotifications.requestPermission();
	});
	step();
});

/**
* Rendering
*/
function drawWorld(world, context) {
	for (var j = world.m_jointList; j; j = j.m_next) {
		drawJoint(j, context);
	}
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
		    if(s.m_body.m_position.x < 480)
			    drawShape(s, context);
		}
	}
}

function drawJoint(joint, context) {
	var b1 = joint.m_body1;
	var b2 = joint.m_body2;
	var x1 = b1.m_position;
	var x2 = b2.m_position;
	var p1 = joint.GetAnchor1();
	var p2 = joint.GetAnchor2();
	context.strokeStyle = '#00eeee';
	context.beginPath();
	switch (joint.m_type) {
	case b2Joint.e_distanceJoint:
		context.moveTo(p1.x, p1.y);
		context.lineTo(p2.x, p2.y);
		break;

	case b2Joint.e_pulleyJoint:
		// TODO
		break;

	default:
		if (b1 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
		}
		else if (b2 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x1.x, x1.y);
		}
		else {
			context.moveTo(x1.x, x1.y);
			context.lineTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
			context.lineTo(p2.x, p2.y);
		}
		break;
	}
	context.stroke();
}

function drawShape(shape, context) {
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
		{
		    var poly = shape;
			var image = poly.m_body.gameObject.image;
            ctx.save();                                                                                                         
            ctx.translate(poly.m_body.m_position.x,poly.m_body.m_position.y);     
            ctx.rotate(poly.m_body.m_rotation);                                                                               
            ctx.drawImage(image, -16, -16, 32, 32);
            ctx.restore();     
            
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
		}
		break;
	case b2Shape.e_polyShape:
		{	var poly = shape;
		    if(poly.m_body.gameObject != undefined) {
    			var image = poly.m_body.gameObject.image;
                ctx.save();                                                                                                         
                ctx.translate(poly.m_body.m_position.x,poly.m_body.m_position.y);     
                ctx.rotate(poly.m_body.m_rotation);                                                                               
                ctx.drawImage(image, -16, -16, 32, 32);
                ctx.restore();     
            }
		}
		break;
	}
}
/**
* Game base
*/
var initId = 0;
var world = createWorld();
var ctx;
var canvasWidth;
var canvasHeight;
var canvasTop;
var canvasLeft;
var currentLevel = 1;
var coconuts = [];
var liveCoconuts = 0;
var coconutCounter = 0;
var gameLoop;
var score = 50;
var started = false;
var bricksUsed = 0;
var notifications = false;
var clear = false;
var coconutsGoneAt = 0;
var winTimeout = 0;
var objectCounter = 0;
var oldTime = (new Date()).getTime();
function step(cnt) {
    
	var stepping = false;
	var timeStep = 1.0/24;
	var iteration = 1;
	//var oldt = (new Date()).getTime();
	world.Step(timeStep, iteration);
//var newt = (new Date()).getTime();
	// dt = newt - oldt
//	$('physics').innerHTML = dt;
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawWorld(world, ctx);
	//$('score').innerHTML =1/ (dt/1000);
	$('level').innerHTML = currentLevel;
	$('goldMedals').innerHTML = goldMedals;
	$('silverMedals').innerHTML = silverMedals;
	$('bronzeMedals').innerHTML = bronzeMedals;
	if(world.GetContactList() != null) {
	    var contact = world.GetContactList();
	    var gameObject1 = contact.GetShape1().m_body.gameObject;
	    var gameObject2 = contact.GetShape2().m_body.gameObject;
	    var body1 = contact.GetShape1().m_body;
	    var body2 = contact.GetShape2().m_body;
	    var name1 = "";
	    var name2 = "";
	    if(gameObject1 != undefined) {
	       name1 = gameObject1.name();
        } 
	    
	    if(gameObject2 != undefined) {
	       name2 = gameObject2.name();
	    }
	    
	    if(checkPair(name1, name2, COCONUT_NAME, "")) {
	        var vec2 = new b2Vec2();
	        var obj =  getObjectWithName(COCONUT_NAME,body1, body2);
	        if(obj.m_position.x < 240) vec2.Set(BRICK_SPEED,0);
	        else vec2.Set(-1*BRICK_SPEED,0);
	        obj.SetLinearVelocity(vec2);
	    }
	    
	    if(checkPair(name1, name2, COCONUT_NAME, BRICK_NAME)) {
	        var vec2 = new b2Vec2();
	        var coconut = getObjectWithName(COCONUT_NAME,body1, body2);
	        var brick = getObjectWithName(BRICK_NAME,body1, body2);
	        console.log("Brick:"+brick.m_position.y);
	        console.log("Coconut:"+coconut.m_position.y);
	        if((coconut.m_position.y+5) > brick.m_position.y ) {
    	        body1.m_position.x = 4000;
    	        body2.m_position.x = 4000;
    	        if(!body1.IsFrozen())
    	            liveCoconuts--;
    	        body1.Freeze();
    	        body2.Freeze();
            } else {
                var vec2 = new b2Vec2();
    	        if(coconut.m_position.x > 240) vec2.Set(BRICK_SPEED,0);
    	        else vec2.Set(-1*BRICK_SPEED,0);
    	        coconut.SetLinearVelocity(vec2);
            }
	        
	    }
	    
	    if(checkPair(name1, name2, COCONUT_NAME, MONKEY_NAME)) {
	        lose();
        }
        
         if(checkPair(name1, name2, BRICK_NAME,MONKEY_NAME)) {
	        lose();
        }
        var date = new Date();
        var time = date.getTime();
	    if(liveCoconuts  == 0 && started && !clear) {
	        clear = true;
	        
	        coconutsGoneAt = time
	        winTimeout = time+1000;
	    } 
	    
	    if(clear && time  > winTimeout) {
	        win();
        }
	}
//newT = (new Date()).getTime();
//	$('fps').innerHTML = Math.round(1/ ((newT-oldTime)/1000));
//oldTime = newT;
//	$('objects').innerHTML = objectCounter;
	
	gameLoop = setTimeout('step(' + (cnt || 0) + ')', 16);
}

function checkPair(name1, name2, expected1, expected2) {
    return (name1 == expected1 && name2 == expected2) || (name1 == expected2 && name2 == expected1);
}

function getObjectWithName(name, obj1, obj2) {
    if(obj1.gameObject != undefined && obj1.gameObject.name() == name) return obj1;
    else return obj2;
}
function createWorld() {
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(1000, 1000);
	var gravity = new b2Vec2(0, 300);
	var doSleep = true;
	var world = new b2World(worldAABB, gravity, doSleep);
	createGround(world);
	createBox(world, 0, 125, 10, 250);
	createBox(world, 500, 125, 10, 250);
	return world;
}

function createGround(world) {
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(1000, 50);
	groundSd.restitution = 0.2;
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(-500, 360);
	return world.CreateBody(groundBd)
}

function createBall(world, x, y) {
	var ballSd = new b2CircleDef();
	ballSd.density = 1.0;
	ballSd.radius = 20;
	ballSd.restitution = 1.0;
	ballSd.friction = 0;
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

function createBox(world, x, y, width, height, fixed) {
	if (typeof(fixed) == 'undefined') fixed = true;
	var boxSd = new b2BoxDef();
	if (!fixed) boxSd.density = 1.0;
	boxSd.extents.Set(width, height);
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd)
}

function clearWorld() {
   world = level(currentLevel);
}

function win() {
     if(started) {
        $('win').style.display = "block";
        $('winPopover').style.display = "block";
        if(bricksUsed <= (currentLevel)) {
           $('medal').innerHTML = 'Gold';
           window.localStorage["goldMedals"] = ++goldMedals;
        } else if(bricksUsed <= (currentLevel*2)) {
           $('medal').innerHTML = 'Silver'; 
           window.localStorage["silverMedals"] = ++silverMedals;
        } else {
           $('medal').innerHTML = 'Bronze'; 
           window.localStorage["bronzeMedals"] = ++bronzeMedals;
        }
    } 
    started = false;
    gameLoop = null;
}

function closeWin() {
      $('win').style.display = "none";
      $('winPopover').style.display = "none";
       score = 50 + score;
    level(++currentLevel);
   
}

function lose() {
   
        clear = false;
        $('lose').style.display = "block";
        $('losePopover').style.display = "block";
        started = false;
        gameLoop = null;
    
}

function closeLose() {
     $('lose').style.display = "none";
     $('losePopover').style.display = "none";
    level(currentLevel);
}

function level(level) {
    started = false;
    bricksUsed = 0;
    currentLevel = level;
    clear = false;
    window.localStorage["currentLevel"] = currentLevel; 
    coconuts = [];
    liveCoconuts = 0;
    world = createWorld();
    if(currentLevel > 6) {
        monkey = Monkey.create(world, 320, 130, false);
        monkey = Monkey.create(world, 140, 130, false);
    } else {
        monkey = Monkey.create(world, 240, 130, false);
    }
    width = 400/level;
    for(var i = 0;i<level;i++) {
        var rand = Math.floor(Math.random()*10)
        Coconut.add(Coconut.create(world, (1+i)*width, 10, true));
    }   
}

function init() {
    currentLevel = window.localStorage["currentLevel"];
    
    if(currentLevel == null) currentLevel = 1;
    
    goldMedals = window.localStorage["goldMedals"];
    if(goldMedals == null) goldMedals = 0;
    silverMedals = window.localStorage["silverMedals"];
    if(silverMedals == null) silverMedals = 0;
    bronzeMedals = window.localStorage["bronzeMedals"];
    if(bronzeMedals == null) bronzeMedals = 0;
}
