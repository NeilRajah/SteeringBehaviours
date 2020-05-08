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


 /**
  * Create the canvas and run the main loop
  */
function main() {
    //update goal on mouse move
    window.addEventListener('mousemove', function (e) {
        offset = 10
        goal = [e.x - offset, e.y - offset];
    });
    this.interval = setInterval(loop, 1000/50) //loop at 30fps
}

/**
 * Set up the program
 */
function initialize() {
    console.log("initialize");
    canvas = document.querySelector('canvas');
    size = 600;
    canvas.width = size;
    canvas.height = size;
    c = canvas.getContext('2d');

    //create tracker
    start = [250, 250];
    t = new Tracker(start[0], start[1], 0, 0);
    img = new Image();
    img.src = "https://tinyurl.com/y99qsysr";
    t.img = img;
    t.imgsize = 30;
    t.arrived = false;

    //create goal
    goals = []
    r = 200
    steps = 10;
    step = 2*Math.PI / steps;
    for (i = 0; i < steps; i++) {
        goals[i] = [start[0] + r * Math.cos(step * i), start[1] + r * Math.sin(step * i)]
    }
    goalIndex = 0;
    goal = goals[0];

    //add key listeners
    console.log(t);
}

/**
 * Update the tracker
 */
function loop() {
    // console.log(t)
    clear();
    arrive(t);
    if (t.arrived) {
        // goal = [Math.random() * 500, Math.random() * 500];

        goalIndex = (goalIndex + 1) % goals.length;
        goal = goals[goalIndex];
        t.x = start[0];
        t.y = start[1];
        t.theta = 0;
        t.arrived = false;
        console.log("------------------------")
    } else {
        seek(t)
    }
    drawGoal();
    drawTracker(t);
}

/**
 * Update a Tracker to move towards the target
 * @param {*} t Tracker to update
 */
function seek(t) {
    // //desired vector
    // desired = setMag(subtract(t.xy(), goal), t.speed);

    // //modify linear output based on angle difference
    // dTheta = Math.abs(t.theta - heading(desired));
    // t.speed *= mag(subtract(t.xy(), goal)) > 30 ? angleScale(dTheta) : 1;

    // current = t.velVector();
    // steering = limit(subtract(current, desired), t.ang); //limit to the current angular speed

    // //rotate
    // vel = add(current, steering);

    // //update
    // t.move(vel[0], vel[1]);
    // t.theta = heading(vel)

    //----------------------------

    // desired = setMag(subtract(t.xy(), goal), t.speed);
    // current = t.velVector();
    // steering = subtract(current, desired);
    // // twist = Math.min(t.maxAng, angleBetween(desired, current) * 0.2);
    // t.theta += (heading(steering) - t.theta) * 0.01;
    // t.step();

    delta = subtract(t.xy(), goal);
    distance = mag(delta);

    absAng = heading(delta);
    relAng = absAng - (t.theta - Math.PI/2);
    relAng = relAng - 2*Math.PI * Math.floor((relAng + Math.PI) / (2*Math.PI));
    console.log(relAng)
    relX = Math.cos(relAng) * distance;
    relY = Math.sin(relAng) * distance;
    relTurn = relAng - Math.PI/2;
    t.theta += relTurn * 0.1
    t.step();
}

/**
 * Slow a Tracker down based on how far it is from the goal
 * @param {*} t Tracker to adjust
 */
function arrive(t) {
    //distance away from goal and finish distance
    goalDist = 30;
    endDist = 5;

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
 */
function setMag(xy, magnitude) {
    xyMag = mag(xy);
    return [xy[0] * (magnitude / xyMag), xy[1] * (magnitude / xyMag)]; 
}

/**
 * Return the difference between two vectors
 * @param {*} v1 First vector
 * @param {*} v2 Second vector
 */
function subtract(v1, v2) {
    return [v2[0] - v1[0], v2[1] - v1[1]];
}

/**
 * Return the sum of two vectors
 * @param {*} v1 First vector
 * @param {*} v2 Second vector
 */
function add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

/**
 * Draw the goal point
 */
function drawGoal() {
    c.fillStyle = "red"
    c.beginPath();
    c.arc(goal[0], goal[1], 10, 0, 2 * Math.PI);
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
 * Move the tracker
 * @param {*} dx Change in x
 * @param {*} dy Change in y
 */
function moveTracker(dx, dy) {
    t.move(dx, dy);
    draw(t);
}

/**
 * Draw a Tracker object
 */
function drawTracker(t) {
    half = t.imgsize / 2;
    c.save();
    c.translate(t.x, t.y);
    c.rotate(t.theta + Math.PI/2);
    c.drawImage(t.img, -half, -half, t.imgsize, t.imgsize);
    c.restore();

    //draw vectors
    // c.save();
    // // c.translate(t.x, t.y)
    // c.fillStyle = "green";
    // drawLine(c, 0, 0, t.desired[0], t.desired[1]);
    // c.fillStyle = "black";
    // drawLine(c, 0, 0, t.velVector()[0], t.velVector()[1]);
    // c.fillStyle = "red";
    // drawLine(c, 0, 0, t.steering[0], t.steering[1]);
    // c.restore();
}

function drawLine(c, x1, y1, x2, y2) {
    c.beginPath()
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.moveTo(0, 0);
}

initialize();
main();