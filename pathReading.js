/**
 * pathReading
 * Author: Neil Balaskandarajah
 * Created on: 13/05/2020
 * Reads path files
 */

 function readPath() {
    lines = niceLongCurve.innerHTML.split('<br>'); //split into individual lines

    //first line is just number of points so skip it
    for (i = 1; i < lines.length-1; i++) {
        items = lines[i].split(' ');
        goals[i-1] = ([parseFloat(items[0])*1.5, parseFloat(items[1])*1.5])
    }
    //items 1 and 2 are x and y
    //item 3 is distance along the path
    //item 4 is path radius
    //item 5 is the speed in in/s (max 144)
 }

//  var goalpoints;
//  var goalpoint;
//  readPath();
//  goalpoint = goalpoints[0]
//  canvas.goals = goalpoints;
//  canvas.goal = goalpoint;