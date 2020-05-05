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
    this.interval = setInterval(loop, 1000/30) //loop at 50fps
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
    t = new Tracker(20, 20, 0, 5);
    img = new Image();
    img.src = "https://tinyurl.com/y99qsysr";
    // img.onload = function () {c.drawImage(img, 0, 0, 30, 30);}
    t.img = img;
    t.imgsize = 30;

    //create goal
    goal = [300, 300];

    //add key listeners
    window.addEventListener('keydown', function (e) {this.key = e.keyCode});
    window.addEventListener('keyup', function (e) {this.key = false});   
}

/**
 * Update the tracker
 */
function loop() {
    clear();
    drawTracker(t);
    drawGoal();
    // dx = 0; dy = 0;
    // if (this.key && this.key == 37) {moveTracker(-t.speed, 0); }
    // if (this.key && this.key == 39) {moveTracker(t.speed, 0); }
    // if (this.key && this.key == 38) {moveTracker(0, -t.speed); }
    // if (this.key && this.key == 40) {moveTracker(0, t.speed); }
}

/**
 * Draw the goal point
 */
function drawGoal() {
    c.fillStyle = "red"
    c.beginPath();
    c.arc(goal[0], goal[1], 5, 0, 2 * Math.PI);
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
    clear();
    t.move(dx, dy);
    draw(t);
}

/**
 * Draw a Tracker object
 */
function drawTracker(t) {
    // c.fillStyle = "red";
    // c.fillRect(t.x, t.y, 30, 30)
    
    half = t.imgsize / 2;

    c.save();

    c.translate(t.x + half, t.y + half);
    c.rotate(t.theta);
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