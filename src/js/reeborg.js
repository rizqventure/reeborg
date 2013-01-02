
// Array Remove - By John Resig (MIT Licensed) from http://ejohn.org/blog/javascript-array-remove/
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function World () {
    "use strict";
    this.EAST = 0;
    this.NORTH = 1;
    this.WEST = 2;
    this.SOUTH = 3;

    this.reset = function (){
        this.robots = {};
        this.robot_counter = 0;
        this.needs_update = true;   // true indicates that we should redraw
        this.walls = {};
    };
    this.reset();

    this.add_robot = function (robot) {
        this.robots["robot" + this.robot_counter] = robot;
        this.robot_counter++;
        this.needs_update = true;
    };

    this.update = function(){
        this.needs_update = false;
    };

    this.move_robot = function(robot){
        switch (robot.orientation){
            case this.EAST:
                robot.x += 1;
                break; 
            case this.NORTH:
                robot.y += 1;
                break;
            case this.WEST:
                if (robot.x===1){
                    throw "Hit wall exception";
                } else {
                    robot.x -= 1;
                }
                break;
            case this.SOUTH:
                if (robot.y===1){
                    throw "Hit wall exception";
                } else {
                    robot.y -= 1;
                }
                break;      
            default:
                console.log("Should not happen: unhandled case in World.move_robot().");
                console.log("robot.x= ", robot.x, " robot.y= ", robot.y, "robot.orientation= ", robot.orientation);
                throw "Should not happen: unhandled case in World.move_robot().";
        }
    };

    this.toggle_wall = function (x, y, orientation){
        var index;
        var coords = x + "," + y;
        if (this.walls[coords] === undefined){
            this.walls[coords] = [orientation];
        } else {
            index = this.walls[coords].indexOf(orientation);
            if (index === -1) {
                this.walls[coords].push(orientation);
            } else {
                this.walls[coords].remove(index);
                if (this.walls[coords].length == 0){
                    delete this.walls[coords];
                }
            }
        }
    };
}

var WORLD = new World();

function UsedRobot(x, y, orientation, coins) {
    "use strict";
    this.x = x || 1;
    this.y = y || 1;
    this.coins = coins || 0;
    this["pièces"] = this.coins;    // pièces de monnaie == coins
    this.changed = true;
    WORLD.add_robot(this);

    if (orientation === undefined){
        this.orientation = WORLD.EAST;
    } else {
        switch (orientation.toLowerCase()){
            case "e":
            case "east":
            case "est":
                this.orientation = WORLD.EAST;
                break;
            case "n":
            case "north":
            case "nord":
                this.orientation = WORLD.NORTH;
                break;
            case "w":
            case "o":
            case "west":
            case "ouest":
                this.orientation = WORLD.WEST;
                break;
            case "s":
            case "south":
            case "sud":
                this.orientation = WORLD.SOUTH;
                break;
            default:
                throw "Should not happen: unknown orientation";
                // TODO: turn this into a warning
        }
    }
}

var RobotUsagé = UsedRobot;

UsedRobot.prototype.turn_left = function(){
    "use strict";
    this.orientation += 1;
    this.orientation %= 4;
};

UsedRobot.prototype["tourne_à_gauche"] = UsedRobot.prototype.turn_left;

UsedRobot.prototype.move = function(){
    "use strict";
    WORLD.move_robot(this);
};

UsedRobot.prototype.avance = UsedRobot.prototype.move;

