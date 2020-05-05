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

 /**
  * Create the canvas and run the main loop
  */
function main() {
    initialize() //set up the canvas
    this.interval = setInterval(loop, 20) //loop at 50fps
}

/**
 * Set up the program
 */
function initialize() {
    console.log("initialize")
    canvas = document.querySelector('canvas')
    canvas.width = 500;
    canvas.height = 500;
    c = canvas.getContext('2d');

    //create tracker
    t = new Tracker(20, 20, 0, 5)
    draw(t)

    //add key listeners
    window.addEventListener('keydown', function (e) {this.key = e.keyCode});
    window.addEventListener('keyup', function (e) {this.key = false});   
}

/**
 * Update the tracker
 */
function loop() {
    dx = 0; dy = 0;
    if (this.key && this.key == 37) {moveTracker(-t.speed, 0); }
    if (this.key && this.key == 39) {moveTracker(t.speed, 0); }
    if (this.key && this.key == 38) {moveTracker(0, -t.speed); }
    if (this.key && this.key == 40) {moveTracker(0, t.speed); }
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
function draw(t) {
    c.fillStyle = "red";
    c.fillRect(t.x, t.y, 30, 30)
}

//Main Script
main()