/**
 * canvas
 * Author: Neil Balaskandarajah
 * Created on: 04/05/2020
 * Canvas for drawing elements
 */

 //Attributes
 var canvas; //canvas object from document
 var c; //canvas context for drawing
 var t; //Tracker
 var goal; //goal point
 var goals; //all the current goal points
 var goalIndex; //index of the goal in goals

window.onload = function() {
    //set up the file chooser
    fileChooser = document.createElement('input'); //create element in DOM
    fileChooser.type = "file"; //set to select files
    fileChooser.accept = ".prstpath"; //only accept pursuit path files
    fileChooser.style.display = "none"; //make invisible
}

/**
 * Set up the program
 */
function initialize() {
    console.log("initialize");
    canvas = document.querySelector('canvas');
    winScale = 0.97;
    canvas.width = window.innerWidth * winScale;
    canvas.height = window.innerHeight * winScale;
    c = canvas.getContext('2d');

    //path pattern
    createRandomGoals();

    //create tracker starting at the first goal point
    t = new Tracker(goals[0][0], goals[0][1], heading(subtract(goals[0], goals[1])));
    theta = heading(subtract(goals[0], goals[1])) //point towards first point
    t.setPose(goals[0][0], goals[0][1], theta);

    img = new Image();
    img.src = "https://tinyurl.com/y99qsysr";
    t.img = img;
    t.imgsize = 30;
    t.arrived = false; //whether the Tracker has arrived at the final point
    t.reverse = false; //whether the Tracker is following in reverse
    t.lookahead = Math.max(bump / 20, 20); //lookahead distance for next point; based on path bumpiness now
    t.tolerance = 5; //distance from the path
    t.lastIndex = 0; //speed purposes
    goal = goals[0]; //the current goal is the first goal in the list
}

/**
 * Update the tracker, following a finite state machine style
 */
function loop() {
    if (t.arrived) {
        reset(t)
    } else {
        // pathFollow();
        purePursuit();
    }
    clear();
    drawGoals()
    drawTracker(t);
}

/**
 * Reset the Tracker after following a target
 * @param {*} t Tracker
 */
function reset(t) {
    t.arrived = false;
    goalIndex = 0;

    //create random goals for the Tracker to follow
    createRandomGoals();

    //give random position away from first point
    r = Math.random() * 10 + 10;
    theta = Math.random() * Math.PI;
    t.setPose(goals[0][0] + r * Math.cos(theta), goals[0][1] + r * Math.sin(theta), 0);
    t.lastIndex = 0;
}

/**
 * Create a random list of goals moving across the width of the canvas
 */
function createRandomGoals() {
    steps = 8
    step = canvas.width / steps;
    goals = []
    bump = Math.random() * 800 //larger bump = larger avg. y difference between points
    
    for (i = 0; i < steps; i++) {
        goals[i] = [(i+0.5) * step, Math.random() * bump + canvas.height/2 - bump/2]
    }

    goalIndex = 0;
    goal = goals[0];
}

/**
 * Create a random two point path
 */
function createRandomPath() {
    startX = canvas.width*0.1 + Math.random()*canvas.width*0.1
    startY = canvas.height*0.1 + Math.random()*canvas.height*0.8

    endX = canvas.width*0.8 + Math.random()*canvas.width*0.1
    endY = canvas.height*0.1 + Math.random()*canvas.height*0.8

    goals[0] = [startX, startY]
    goals[1] = [endX, endY]

    goalIndex = 1;
    goal = goals[goalIndex];
}

/**
 * Update a Tracker to move towards the target
 */
function seek() {
    //delta is difference between target and goal
    delta = subtract(t.xy(), goal);
    dist = mag(delta); //distance from goal

    absAng = heading(delta); //absolute angle to target
    relAng = angleWrap(absAng - (t.theta - Math.PI/2)); //relative angle based on current heading

    //two angles, CW and CCW
    relTurn = relAng - Math.PI/2;
    relTurn2 = 2*Math.PI + relTurn;
    
    //relative X and Y from the goal
    relX = Math.cos(relAng) * dist;
    relY = Math.sin(relAng) * dist;

    //relative angle
    twist = minMag(relTurn, relTurn2);
    if (t.reverse) {
        twist = angleWrap(twist + Math.PI); //pi radians away if reversing
    }

    //scale linear speed based on twist (ie. turn more & drive less if far away from target)
    t.speed *= -Math.min(Math.PI/2, Math.abs(twist)) / (Math.PI/2) + 1; //zero at 90+ degrees
    if (t.reverse) {
        t.speed = -Math.abs(t.speed); //negative speed if reversing
    }

    //change the angle based on how much the change in angle is needed
    t.ang = Math.sign(twist) * Math.min(t.maxAng, t.turnConst * Math.abs(twist))
    t.theta += t.ang; //limit to maximum turn rate
    t.step();
}

/**
 * Slow a Tracker down based on how far it is from the goal. Scales and sets outputs, does not actually move
 * the Tracker.
 */
function arrive() {
    //distance away from goal and finish distance
    goalDist = Math.min(t.lookahead + t.speed * 10, 50);
    endDist = t.lookahead/2;

    if (isWithinBounds(t.xy(), goal, goalDist)) { //if in ramping zone of END point
        dist = distance(goal, t.xy());
        scaleFactor = dist < endDist ? 0 : dist / goalDist;
        t.speed = t.maxLin * scaleFactor; //ramp down linearly
        t.arrived = dist < endDist;

    } else { //anywhere else
        t.speed = t.maxLin;
        t.ang = t.maxAng;
    }
}

/**
 * Follow a path using the path following behaviour
 */
function pathFollow() {
    //Predicted position a fixed distance away in the same direction as the Tracker
    t.predicted = add(t.xy(), setMag(t.velVector(), t.lookahead)); 

    //Predicted position in same direction as Tracker varying by speed 
    //By using speed, the predicted point could represent where the Tracker is after 
    // a certain time has passed (ie. where will the Tracker be if it maintains the same
    // speed and heading for 0.25s)
    // t.predicted = add(t.xy(), setMag(t.velVector(), t.speed * 15))

    //Loop through all the points and find the closest normal point
    normals = [] //collection of normals to the path

    //get all the normals
    for (i = 0; i < goals.length-1; i++) {
        //normal point from predicted to that line segment
        //Using an array for graphics, could go back to single point (ie. just normal)
        normals[i] = getNormalPoint(t.predicted, goals[i], goals[i+1]);

        //If the normal point is not on the line, set the normal point to the end point
        //This ensures the path is followed even if the normals are off the path
        if (!pointOnLine(normals[i], goals[i],  goals[i+1], 1)) {
            normals[i] = goals[i+1];
            // col = i == 0 ? "blue" : "green"
            // console.log("normal ", col, " is off of line")
        } 
    }

    //choose the closest normal    
    minDist = 100000000000; //distance of closest normal 
    record = 0; //index of closest normal

    for (i = 0; i < normals.length; i++) {
        dist = distsq(t.predicted, normals[i]);
        if (dist < minDist) {
            minDist = dist
            record = i
        }
    }
    t.normal = normals[record]

    distFromPath = distance(t.predicted, t.normal);
    //Track the end goal if the distance to the end goal is less than 
    //  the lookahead plus a factor based on the speed ('look' further if going faster)
    if (distance(t.xy(), goals[goals.length-1]) < t.lookahead + t.speed * 10) {
        goal = goals[goals.length-1]; //set to end point if close enough
        arrive(); //scale output
        seek(); //seek the final target

    //Too far off the path, need to steer to it
    //Could possibly change this to account for size of the relative angle to the target
    //  ie. should steer towards path if on path but 90deg away from target
    } else if (distFromPath > t.tolerance) {
        //set target further from normal based on distance from the path
        // goal = add(t.normal, setMag(B, distFromPath * 1.2));

        goal = t.normal //just the normal point
        seek(); //seek target

    //On path, moving fine
    } else {
        goal = t.normal; //goal is point further ahead (don't necessarily need to set this, can just move ahead)
        t.speed = t.maxLin //set max speed
        t.step(); //just keep moving forward 
    }
}

/**
 * Follow the goal points using the Pure Pursuit algorithm
 */
function purePursuit() {
    //find the closest point
    minDist = 100000000
    record = t.lastIndex
    //optimize this to search through less points (later start, earlier end)
    for (i = 0; i < goals.length; i++) {
        dist = distsq(t.xy(), goals[i]);
        if (dist < minDist) {
            minDist = dist;
            record = i
        }
    }
    t.closest = goals[record];
    t.lastIndex = record

    //find all intersects
    intersects = []
    //started at Math.max(0, t.lastIndex-1)
    for (i = 0; i < goals.length-1; i++) {
        intersects = intersects.concat(lcIntersect(goals[i], goals[i+1], t.xy(), t.lookahead));
    }
    
    //if there are no intersects, choose the closest point to the Tracker
    //Could potentially be closest + some distance along the path
    if (intersects.length == 0) {
        // t.target = goals[Math.min(record+1, goals.length)] 
        t.target = t.closest

    //if there are intersects, choose the last one added
    //Could change to point with both minDist, minDistAlongPath
    } else {
        t.target = intersects[Math.max(0, intersects.length-1)]
    }
    goal = t.target

    //set the speed
    t.speed = t.maxLin

    //set the goal to the last point if closer to the goal
    if (goal) {
        if (distance(t.xy(), goals[goals.length-1]) < distance(t.xy(), goal)) {
            goal = goals[goals.length-1]; //set to end point if close enough
            arrive(); //scale output
        }
    }
    
    //seek the target
    seek()
}

//Graphics

/**
 * Draw a point
 * @param {*} x X value for center of circle
 * @param {*} y Y value for center of circle
 */
function drawPoint(x, y, color, rad=10) {
    c.fillStyle = color
    c.beginPath();
    c.arc(x, y, rad, 0, 2 * Math.PI);
    c.fill();
}

/**
 * Clear the background for the next frame
 */
function clear() {
    c.fillStyle = "white"
    c.fillRect(0,0, canvas.width, canvas.height)
}

/**
 * Draw a Tracker object
 * @param {*} t Tracker to draw
 */
function drawTracker(t) {
    //draw the lookahead circle
    c.strokeStyle = "black"
    c.beginPath();
    c.arc(t.x, t.y, t.lookahead, 0, 2*Math.PI);
    c.stroke();

    //draw intersects
    if (intersects) {
        for (i = 0; i < intersects.length; i++) {
            drawPoint(intersects[i][0], intersects[i][1], "green", Math.max(5, t.lookahead/10))
        }
    }

    //draw the target
    if (t.target) {
        drawPoint(t.target[0], t.target[1], "blue", 5);
    }
    
    //draw goal
    drawPoint(goal[0], goal[1], "red", 5);
    c.strokeStyle = "red";
    drawLine(t.x, t.y, goal[0], goal[1]) //line from robot to goal

    //draw Tracker
    half = t.imgsize / 2;
    c.save();
    c.translate(t.x, t.y);
    c.rotate(t.theta + Math.PI/2);
    c.drawImage(t.img, -half, -half, t.imgsize, t.imgsize);
    c.restore();
}

/**
 * Draw a line between two points
 * @param {*} x1 X of first point
 * @param {*} y1 Y of first point
 * @param {*} x2 X of second point
 * @param {*} y2 Y of second point
 */
function drawLine(x1, y1, x2, y2) {
    c.beginPath()
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
}

/**
 * Draw the goals and lines connecting them
 */
function drawGoals() {
    //draw path
    c.fillStyle = "gray";
    c.lineWidth = 2;

    //draw lines
    c.strokeStyle = "black";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(goals[0][0], goals[0][1]);
    for (i = 1; i < goals.length; i++) {
        c.lineTo(goals[i][0], goals[i][1]);
    }
    c.stroke();

    //draw points
    for (i = 0; i < goals.length; i++) {
        drawPoint(goals[i][0], goals[i][1], "black", 7);
    }
}

//Main Script
initialize();
this.interval = setInterval(loop, 1000/50)