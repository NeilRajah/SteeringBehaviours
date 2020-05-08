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
 var goals;
 var goalIndex;
 var dir;


 /**
  * Create the canvas and run the main loop
  */
function main() {
    //update goal on mouse move
    // window.addEventListener('mousemove', function (e) {
    //     offset = 10
    //     goal = [e.x - offset, e.y - offset];
    // });
    this.interval = setInterval(loop, 1000/50) //run loop periodically
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

    //create goals
    goals = []
    steps = 9;
    dir = true;

    //radial pattern
    // r = 200
    // step = 2*Math.PI / steps;
    // for (i = 0; i < steps; i++) {
    //     goals[i] = [start[0] + r * Math.cos(step * i), start[1] + r * Math.sin(step * i)]
    // }

    //path pattern
    createRandomGoals();

    //create tracker
    //start at the first goal point, move along
    t = new Tracker(goals[0][0], goals[0][1], heading(subtract(goals[0], goals[1])));
    img = new Image();
    img.src = "https://tinyurl.com/y99qsysr";
    t.img = img;
    t.imgsize = 30;
    t.arrived = false;
    t.reverse = false;
}

/**
 * Update the tracker
 */
function loop() {
    // console.log(t)
    clear();
    arrive(t);
    if (t.arrived) {
        goal = [Math.random() * canvas.width, Math.random() * canvas.height];
        // t.reverse = Math.random() > 0.5;
        t.arrived = false;

        goalIndex++;
        if (goalIndex >= goals.length) {
            goalIndex = 0;
            dir = !dir;
            createRandomGoals();
            t.setPose(goals[0][0], goals[0][1], heading(subtract(goals[0], goals[1])))
        }
        goal = goals[goalIndex];
        // t.x = start[0];
        // t.y = start[1];
        // t.theta = 0;
        // t.reverse = true;
    } else {
        seek(t)
    }
    drawGoals(c)
    drawTracker(t);
}

/**
 * Create a random list of goals moving across the width of the canvas
 * @param {*} dir True if left to right, false if right to left 
 */
function createRandomGoals() {
    step = canvas.width / (steps);
    
    for (i = 0; i < steps-1; i++) {
        goals[i] = [(i+1) * step, Math.random() * canvas.height]
    }

    goalIndex = 0;
    goal = goals[0];
}

/**
 * Update a Tracker to move towards the target
 * @param {*} t Tracker to update
 */
function seek(t) {
    twopi = Math.PI * 2;

    //delta is difference between target and goal
    delta = subtract(t.xy(), goal);
    distance = mag(delta); //distance from goal

    absAng = heading(delta); //absolute angle to target
    relAng = angleWrap(absAng - (t.theta - Math.PI/2)); //relative angle based on current heading

    //two angles, CW and CCW
    relTurn = relAng - Math.PI/2;
    relTurn2 = twopi + relTurn;
    
    //relative X and Y from the goal
    relX = Math.cos(relAng) * distance;
    relY = Math.sin(relAng) * distance;

    //relative angle
    twist = minMag(relTurn, relTurn2);
    if (t.reverse) {
        twist = angleWrap(twist + Math.PI); //pi radians away if reversing
    }

    //scale linear speed based on twist (ie. turn more & drive less if far away from target)
    t.speed *= -Math.min(Math.PI/2, Math.abs(twist)) / (Math.PI/2) + 1;
    if (t.reverse) {
        t.speed = -Math.abs(t.speed); //negative speed if reversing
    }

    turnConst = 0.09; //change the angle based on how much the change in angle is needed
    t.theta += Math.sign(twist) * Math.min(t.maxAng, turnConst * Math.abs(twist)); //limit to maximum turn rate
    t.step();
}

/**
 * Slow a Tracker down based on how far it is from the goal
 * @param {*} t Tracker to adjust
 */
function arrive(t) {
    //distance away from goal and finish distance
    goalDist = 50;
    endDist = 3;

    if (isWithinBounds(t.xy(), goal, goalDist)) { //if in ramping zone
        dist = mag(subtract(goal, t.xy()));
        scale = dist < endDist ? 0 : dist / goalDist;
        t.speed = t.maxLin * scale; //ramp down linearly
        t.ang = dist < endDist ? 0 : t.ang;
        t.arrived = dist < endDist;

    } else { //anywhere else
        t.speed = t.maxLin;
        t.ang = t.maxAng;
    }
}

//Utility

/**
 * Return the number with the minimum magnitude
 * @param {*} a 
 * @param {*} b 
 */
function minMag(a, b) {
    return Math.abs(a) < Math.abs(b) ? a : b;
}

/**
 * Constrain an angle into the [-pi,pi] domain
 * @param {*} ang Angle in radians
 * @returns Equivalent angle in domain
 */
function angleWrap(ang) {
    return ang - 2*Math.PI * Math.floor((ang + Math.PI) / (2*Math.PI));
}

/**
 * Convert an angle to degrees
 * @param {*} angrad Angle in radians
 * @returns Equivalent angle in degrees
 */
function degrees(angrad) {
    return angrad * 180 / Math.PI
}

/**
 * Whether the distance between two points is within an epsilon
 * @param {*} current Point 1
 * @param {*} goal Point 2
 * @param {*} epsilon Distance apart to be considered 'close enough'
 * @returns True if distance between points is less than epsilon, false if not
 */
function isWithinBounds(current, goal, epsilon) {
    dx = goal[0] - current[0];
    dy = goal[1] - current[1];

    return (Math.abs(dy) < epsilon && Math.abs(dx) < epsilon);
}

/**
 * Calculate the magnitude of a vector
 * @param {*} xy Vector to calculate magnitude of
 * @returns Magnitude of xy
 */
function mag(xy) {
    return Math.sqrt(xy[0] * xy[0] + xy[1] * xy[1]);
}

/**
 * Limit a vector to a magnitude
 * @param {*} xy Vector to limit
 * @param {*} magnitude Magnitude cap
 * @returns Vector limited to the magnitude cap
 */
function limit(xy, magnitude) {
    return mag(xy) > magnitude ? setMag(xy, magnitude) : xy;
}

/**
 * Calculate the angle between two vectors
 * @param {*} v1 First vector
 * @param {*} v2 Second vector
 * @returns Angle between the two vectors in radians
 */
function angleBetween(v1, v2) {
    return Math.atan2(v2[1], v2[0]) - Math.atan2(v1[1], v1[0]);
}

/**
 * Scale linear output based on angle difference
 * @param {*} dTheta Angle difference
 * @returns Scale factor between 0.5 and 1
 * 
 * change this to account for more ranges
 */
function angleScale(dTheta) {
    return dTheta > Math.PI/2 ? 0.5 : 1 - (Math.pow(dTheta, 2) / Math.pow(Math.PI/2, 2)) + 0.5;
    // return 1;
}

/**
 * Return the angle the vector is pointing at
 * @param {*} xy Vector to get heading from 
 * @returns Angle vector is pointing at from -pi/2 to pi/2
 */
function heading(xy) {
    return Math.atan2(xy[1], xy[0]);
}

/**
 * Normalize the vector and scale to a new magnitude
 * @param {*} xy Vector to change
 * @param {*} magnitude New magnitude to scale to 
 * @returns Vector scaled to new magnitude
 */
function setMag(xy, magnitude) {
    xyMag = mag(xy);
    return [xy[0] * (magnitude / xyMag), xy[1] * (magnitude / xyMag)]; 
}

/**
 * Return the difference between two vectors
 * @param {*} v1 First vector
 * @param {*} v2 Second vector
 * @returns (dx,dy) vector
 */
function subtract(v1, v2) {
    return [v2[0] - v1[0], v2[1] - v1[1]];
}

/**
 * Return the sum of two vectors
 * @param {*} v1 First vector
 * @param {*} v2 Second vector
 * @returns (x1+x2,y1+y2) vector
 */
function add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

//Graphics

/**
 * Draw a point
 * @param {*} x X value for center of circle
 * @param {*} y Y value for center of circle
 */
function drawPoint(x, y, color) {
    c.fillStyle = color
    c.beginPath();
    c.arc(x, y, 10, 0, 2 * Math.PI);
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
    half = t.imgsize / 2;
    c.save();
    c.translate(t.x, t.y);
    c.rotate(t.theta + Math.PI/2);
    c.drawImage(t.img, -half, -half, t.imgsize, t.imgsize);
    c.restore();
}

function drawLine(c, x1, y1, x2, y2) {
    c.beginPath()
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
}

function drawGoals(c) {
    //draw lines
    c.strokeStyle = "red";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(goals[0][0], goals[0][1]);
    for (i = 1; i < goals.length; i++) {
        c.lineTo(goals[i][0], goals[i][1]);
    }
    c.stroke();

    //draw points
    for (i = 0; i < goals.length; i++) {
        drawPoint(goals[i][0], goals[i][1], "red");
    }
}

initialize();
main();