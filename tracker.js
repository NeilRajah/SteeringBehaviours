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
     this.x = x; //x position
     this.y = y; //y position
     this.theta = theta; //heading
     this.maxLin = 7.5; //linear speed
     this.maxAng = 0.8; //max turning speed
     this.speed = this.maxLin;
     this.ang = this.maxAng;
     this.mass = 1;
     this.turnConst = 0.2; //multiply angle error by this

     //functions
     this.move = function(dx, dy) {this.x += dx; this.y += dy;};
     this.step = function() {this.x += this.velVector()[0]; this.y += this.velVector()[1];}
     this.velVector = () => [this.speed * Math.cos(this.theta), this.speed * Math.sin(this.theta)];
     this.dirVector = (mag) => [mag * Math.cos(theta), mag * Math.sin(theta)];
     this.getX = () => this.x;
     this.getY = () => this.y;
     this.xy = function() {return [this.x, this.y]};
     this.setPose = function(x,y,theta) {this.x = x; this.y = y; this.theta = theta;};
 }