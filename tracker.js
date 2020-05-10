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
 function Tracker(x, y, theta) {
     this.x = x;
     this.y = y;
     this.theta = theta;
     this.maxLin = 5.5;
     this.maxAng = 0.8;
     this.speed = this.maxLin;
     this.ang = this.maxAng;
     this.mass = 1;

     this.move = function(dx, dy) {this.x += dx; this.y += dy;};
     this.step = function() {this.x += this.velVector()[0]; this.y += this.velVector()[1];}
     this.velVector = () => [this.speed * Math.cos(this.theta), this.speed * Math.sin(this.theta)];
     this.dirVector = (mag) => [mag * Math.cos(theta), mag * Math.sin(theta)];
     this.getX = () => this.x;
     this.getY = () => this.y;
     this.xy = function() {return [this.x, this.y]};
     this.setPose = function(x,y,theta) {this.x = x; this.y = y; this.theta = theta;};
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