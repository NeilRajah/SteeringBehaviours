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

 /**
  * Create the canvas and run the main loop
  */
function main() {
    //update goal on mouse move
    window.addEventListener('mousemove', function (e) {
        offset = 10
        goal = [e.x - offset, e.y - offset];
    });
    this.interval = setInterval(loop, 1000/30) //loop at 30fps
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
    t = new Tracker(20, 20, 0, 0);
    img = new Image();
    img.src = "https://tinyurl.com/y99qsysr";
    t.img = img;
    t.imgsize = 30;

    //create goal
    goal = [400, 225];

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
    seek(t);
    drawGoal();
    drawTracker(t);
}

/**
 * Update a Tracker to move towards the target
 * @param {*} t Tracker to update
 */
function seek(t) {
    //desired vector
    desired = setMag(subtract(t.xy(), goal), t.maxLin);
    // console.log(mag([380, 205]))
    // console.log(t.xy(), goal)

    //steering vector
    current = t.velVector();
    steering = setMag(subtract(current, desired), t.ang);

    //rotate
    vel = add(current, steering);

    //update
    t.move(vel[0], vel[1]);
    t.theta = heading(vel)
}

function arrive(t) {
    goalDist = 20;
    endDist = 2;
    if (isWithinBounds(t.xy(), goal, goalDist)) {
        dist = mag(subtract(goal, t.xy()));
        scale = dist < endDist ? 0 : dist / (goalDist - endDist);
        t.speed = t.maxLin * scale;
        t.ang = 0;
    } else {
        t.speed = t.maxLin;
        t.ang = t.maxAng;
    }
}

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
 * Return the angle the vector is pointing at, between -pi/2 and pi/2
 * @param {*} xy 
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
}

//Main Script
// window.onload = initialize()
// window.onload = function () {
//     img = document.getElementById('tracker')
// }
initialize();
main();