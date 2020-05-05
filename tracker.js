/**
 * tracker
 * Author: Neil Balaskandarajah
 * Created on: 05/05/2020
 * Tracker object that pursues the goal
 */

 /**
  * Create a Tracker object with a pose
  * @param {*} x X value
  * @param {*} y Y value
  * @param {*} theta Angle in radians
  */
 function Tracker(x, y, theta, speed) {
     this.x = x;
     this.y = y;
     this.theta = theta;
     this.speed = speed

     this.move = function(dx, dy) {this.x += dx; this.y += dy;};
 }

 /**
  * Move the tracker in the x and y direction
  * @param {*} dx Change in x
  * @param {*} dy Change in y
  */
function move(dx, dy) {
    this.x += dx;
    this.y += dy;
    console.log(this.x, this.y)
}