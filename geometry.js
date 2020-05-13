/**
 * geometry
 * Author: Neil Balaskandarajah
 * Created on: 13/05/2020
 * Functions for vector and circle math
 */

/**
 * Find the intersection points between a circle and a line segment
 * Implementation of https://stackoverflow.com/a/1084899/11752569
 * @param {*} E Beginning point of line segment
 * @param {*} L End point of line segment
 * @param {*} C Center of the circle (Tracker center)
 * @param {*} r Radius of the circle (lookahead distance)
 * @returns Intersection between the circle and the line segment
 */
function lcIntersect(E, L, C, r) {
    d = subtract(E, L); //direction of line segment
    f = subtract(C, E); //from center to line segment

    //quadratic constants
    a = dot(d, d);
    b = 2 * dot(f, d);
    u = dot(f, f) - r*r;
    disc = b*b - 4*a*u;

    //if disc is less than zero, no intersections
    if (disc < 0) {return []};

    //if disc is greater than zero, there are up to two intersections
    disc = Math.sqrt(disc);
    t1 = (-b - disc) / (2*a);
    t2 = (-b + disc) / (2*a);
    
    //calculate the points at each t value
    intersects = [];
    p1 = add(E, scale(d, t1))
    p2 = add(E, scale(d, t2))

    //if the points are on the line segment, add them to the returns list
    if (pointOnLine(p1, E, L)) {
        intersects.push(p1);
    } 
    if (pointOnLine(p2, E, L)) {
        intersects.push(p2);
    }
    return intersects;
}

/**
 * Return whether a point is on a line within a tolerance
 * @param {*} p Point to check
 * @param {*} a First point of line segment
 * @param {*} b Second point of line segment
 * @param {*} epsilon Distance to be within to be considered 'on the line'
 * @returns True if p is close enough to ab, false if not
 */
function pointOnLine(p, a, b, epsilon=0.001) {
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
 * @returns v2 - v1
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

/**
 * Scale a vector by a constant
 * @param {*} a Vector to scale
 * @param {*} k Scalar constant
 * @returns [k*a.x, k*a.y]
 */
function scale(a, k) {
    return [a[0]*k, a[1]*k]
}