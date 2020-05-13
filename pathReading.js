/**
 * pathReading
 * Author: Neil Balaskandarajah
 * Created on: 13/05/2020
 * Reads path files
 */

 function readPath() {
    lines = niceLongCurve.innerHTML.split('<br>');
    for (i = 1; i < lines.length-1; i++) {
        items = lines[i].split(' ');
    }
 }

 readPath();