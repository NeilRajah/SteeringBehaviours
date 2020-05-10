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

    //path pattern
    createRandomGoals();
    // createRandomPath();

    //create tracker
    //start at the first goal point, move along
    t = new Tracker(goals[0][0], goals[0][1], heading(subtract(goals[0], goals[1])));
    // r = Math.random() * 10 + 10;
    r = 0
    theta = heading(subtract(goals[0], goals[1]))
    t.setPose(goals[0][0] + r * Math.cos(theta), goals[0][1] + r * Math.sin(theta), theta);

    img = new Image();
    img.src = "https://tinyurl.com/y99qsysr";
    t.img = img;
    t.imgsize = 30;
    t.arrived = false;
    t.reverse = false;
    t.lookahead = 100; //lookahead distance for predicted
    t.tolerance = 5; //distance from the path
    goal = goals[1];
}

/**
 * Update the tracker
 */
function loop() {
    clear();
    if (t.arrived) {
        t.arrived = false;

        goalIndex++;
        if (goalIndex >= goals.length) {
            goalIndex = 0;
            // createRandomPath();
            r = Math.random() * 10 + 10;
            theta = Math.random() * Math.PI;
            t.setPose(goals[0][0] + r * Math.cos(theta), goals[0][1] + r * Math.sin(theta), 0);

            createRandomGoals();
            // t.setPose(goals[0][0], goals[0][1], heading(subtract(goals[0], goals[1])))
        }
        goal = goals[goalIndex];
    } else {
        pathFollow(t);
    }
    drawGoals()
    drawTracker(t);
}

/**
 * Create a random list of goals moving across the width of the canvas
 */
function createRandomGoals() {
    steps = Math.random() * 5 + 2
    step = canvas.width / steps;
    goals = []
    
    for (i = 0; i < steps; i++) {
        goals[i] = [(i+0.5) * step, Math.random() * 100 + canvas.height * 0.45]
        // goals[i] = [(i+0.5) * step, Math.random() * canvas.height]
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
 * @param {*} t Tracker to update
 */
function seek(t) {
    twopi = Math.PI * 2;

    //delta is difference between target and goal
    delta = subtract(t.xy(), goal);
    dist = mag(delta); //distance from goal

    absAng = heading(delta); //absolute angle to target
    relAng = angleWrap(absAng - (t.theta - Math.PI/2)); //relative angle based on current heading

    //two angles, CW and CCW
    relTurn = relAng - Math.PI/2;
    relTurn2 = twopi + relTurn;
    
    //relative X and Y from the goal
    relX = Math.cos(relAng) * dist;
    relY = Math.sin(relAng) * dist;

    //relative angle
    twist = minMag(relTurn, relTurn2);
    if (t.reverse) {
        twist = angleWrap(twist + Math.PI); //pi radians away if reversing
    }

    //scale linear speed based on twist (ie. turn more & drive less if far away from target)
    // t.speed *= -Math.min(Math.PI/2, Math.abs(twist)) / (Math.PI/2) + 1; //zero at 90+ degrees
    if (t.reverse) {
        t.speed = -Math.abs(t.speed); //negative speed if reversing
    }

    turnConst = 0.09; //change the angle based on how much the change in angle is needed
    t.ang = Math.sign(twist) * Math.min(t.maxAng, turnConst * Math.abs(twist))
    t.theta += t.ang; //limit to maximum turn rate
    t.step();
}

/**
 * Slow a Tracker down based on how far it is from the goal. Scales and sets outputs, does not actually move
 * the Tracker.
 * @param {*} t Tracker to adjust
 */
function arrive(t) {
    //distance away from goal and finish distance
    goalDist = Math.min(t.lookahead + t.speed * 10, 50);
    endDist = 5;

    if (isWithinBounds(t.xy(), goal, goalDist)) { //if in ramping zone of END point
        dist = mag(subtract(goal, t.xy()));
        scale = dist < endDist ? 0 : dist / goalDist;
        t.speed = t.maxLin * scale; //ramp down linearly
        t.arrived = dist < endDist;

    } else { //anywhere else
        t.speed = t.maxLin;
        t.ang = t.maxAng;
    }
}

/**
 * Follow a path using the path following behaviour
 * @param {*} t Tracker
 */
function pathFollow(t) {
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

    // console.log(normals[0], goals[0], goals[1]);

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
        arrive(t); //scale output
        seek(t); //seek the final target

    //Too far off the path, need to steer to it
    //Could possibly change this to account for size of the relative angle to the target
    //  ie. should steer towards path if on path but 90deg away from target
    } else if (distFromPath > t.tolerance) {
        //set target further from normal based on distance from the path
        // goal = add(t.normal, setMag(B, distFromPath * 1.2));
        goal = t.normal //just the normal point
        seek(t); //seek target

    //On path, moving fine
    } else {
        goal = t.normal; //goal is point further ahead (don't necessarily need to set this, can just move ahead)
        t.speed = t.maxLin //set max speed
        t.step(); //just keep moving forward 
    }
}

//Utility

/**
 * Return whether a point is on a line within a tolerance
 * @param {*} p Point to check
 * @param {*} a First point of line segment
 * @param {*} b Second point of line segment
 * @param {*} epsilon Distance to be within to be considered 'on the line'
 * @returns True if p is close enough to ab, false if not
 */
function pointOnLine(p, a, b, epsilon=0.001) {
    //Avoiding use square roots to be faster
    return fuzzEq(distance(a,b), distance(a,p) + distance(b,p), epsilon)
}

/**
 * Return if two numbers are close enough to each other
 * @param {*} m First number
 * @param {*} n Second number
 * @param {*} eps Acceptable error to be true
 * @returns True if absolute difference is less than eps, false if not
 */
function fuzzEq(m, n, eps=0.001) {
    return Math.abs(m-n) < eps
}

/**
 * Returns the distance squared between two vectors (for fast calculations)
 * @param {*} a First vector
 * @param {*} b Second vector
 * @returns Sum of squares of component differences
 */
function distsq(a, b) {
    return magsq(subtract(a,b))
}

/**
 * Return the square of the magnitude of the vector (for fast calculations)
 * @param {*} a  Vector
 * @returns Sum of squares of components
 */
function magsq(a) {
    return a[0]*a[0] + a[1]*a[1]
}

/**
 * Returns the normal point of one vector relative to a line segment of two vectors
 * @param {*} p Vector off of line
 * @param {*} a Start of line segment
 * @param {*} b End of line segment
 * @returns (x,y) of normal point
 */
function getNormalPoint(p, a, b) {
    //a is start, b is end, p is predicted
    A = subtract(a, p);
    B = subtract(a, b);
    return add(a, setMag(B, dot(A, normalize(B))));
}

/**
 * Return the dot product of two vectors
 * @param {*} a First vector
 * @param {*} b Second vector
 * @returns Scalar product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

/**
 * Returns the normalized vector
 * @param {*} a Vector to normalize
 * @returns Unit vector in a's direction
 */
function normalize(a) {
    magnitude = mag(a);
    return [a[0]/magnitude, a[1]/magnitude];
}

/**
 * Return the absolute distance between two vectors
 * @param {*} a First vector
 * @param {*} b Second vector
 * @returns Magnitude of difference between a and b
 */
function distance(a, b) {
    return mag(subtract(a,b));
}

/**
 * Return the number with the minimum magnitude
 * @param {*} a First number
 * @param {*} b Second number
 * @returns Number closest to zero
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
    // //draw goal
    drawPoint(goal[0], goal[1], "green", 5);
    c.strokeStyle = "green";
    drawLine(t.x, t.y, goal[0], goal[1]) //line from robot to goal

    //draw all the normal points, line from predicted
    for (i = 0; i < normals.length; i++) {
        c.strokeStyle = "blue"
        c.lineWidth = 1
        drawLine(t.predicted[0], t.predicted[1], normals[i][0], normals[i][1])
        drawPoint(normals[i][0], normals[i][1], "blue", 3)
    }

    //draw lookahead
    c.strokeStyle = "grey"
    drawLine(t.x, t.y, t.predicted[0], t.predicted[1]);
    drawPoint(t.predicted[0], t.predicted[1], "grey", 5);
    drawLine(t.normal[0], t.normal[1], t.predicted[0], t.predicted[1]);

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

console.log(pointOnLine([5,5], [0,0], [10,10], 1.0))
initialize();
main();