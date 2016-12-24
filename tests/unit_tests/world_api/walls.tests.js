 /** @function test_walls
 * @memberof UnitTest
 * @instance
*
* @desc The file listed below as the source contains unit tests for 
* {@link RUR#set_nb_object_at_position}.
*
*/

// setting global environment
var tape_test = require('./../test_globals.js').tape_test;
function test(test_name, fn) {
    tape_test("wall.js: ", test_name, fn);
}

// intercepting record_frame
var mock = require('mock-require');
mock("../../../src/js/recorder/record_frame.js", {});
RUR.record_frame = function () {};

// main module to test
require("../../../src/js/world_api/wall.js");


/* testing exceptions =============================================*/

test('list_walls_at_position: invalid position', function (assert) {  
    assert.plan(3);  
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    try {
        RUR.list_walls_at_position(0, 0);
    } catch (e) {
        assert.equal(e.message, "(0, 0) is an invalid position.", "error message");
        assert.equal(e.reeborg_shouts, "(0, 0) is an invalid position.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});

test('is_wall_at_position: invalid position', function (assert) {  
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    assert.plan(3);  
    try {
        RUR.is_wall_at_position("north", 1, 100);
    } catch (e) {
        assert.equal(e.message, "(1, 100) is an invalid position.", "error message");
        assert.equal(e.reeborg_shouts, "(1, 100) is an invalid position.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});


test('is_wall_at_position: invalid orientation', function (assert) {  
    assert.plan(3);  
    try {
        RUR.is_wall_at_position("n", 1, 2);
    } catch (e) {
        assert.equal(e.message, "'n' is an unknown orientation.", "error message");
        assert.equal(e.reeborg_shouts, "'n' is an unknown orientation.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});

test('add_wall: invalid position', function (assert) {  
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    assert.plan(3);  
    try {
        RUR.add_wall("north", 1, 100, true);  // test for goal wall
    } catch (e) {
        assert.equal(e.message, "(1, 100) is an invalid position.", "error message");
        assert.equal(e.reeborg_shouts, "(1, 100) is an invalid position.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});

test('add_wall: invalid orientation', function (assert) {  
    assert.plan(3);  
    try {
        RUR.add_wall("n", 1, 2, true);
    } catch (e) {
        assert.equal(e.message, "'n' is an unknown orientation.", "error message");
        assert.equal(e.reeborg_shouts, "'n' is an unknown orientation.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});

test('remove_wall: invalid position', function (assert) {  
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    assert.plan(3);  
    try {
        RUR.remove_wall("north", 1, 100);
    } catch (e) {
        assert.equal(e.message, "(1, 100) is an invalid position.", "error message");
        assert.equal(e.reeborg_shouts, "(1, 100) is an invalid position.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});

test('remove_wall: invalid orientation', function (assert) {  
    assert.plan(3);  
    try {
        RUR.remove_wall("n", 1, 2);
    } catch (e) {
        assert.equal(e.message, "'n' is an unknown orientation.", "error message");
        assert.equal(e.reeborg_shouts, "'n' is an unknown orientation.", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
    }
    assert.end();
});

//
//
//
// Need to add test when attempting to remove missing wall or adding
// wall where there is one already
/* ========================================================================= */

test('list empty walls', function (assert) {    
    require("../../../src/js/world_api/wall.js");
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    assert.deepEqual(RUR.list_walls_at_position(3, 3), [], "No walls present");
    assert.end();
});


test('Add and list walls', function (assert) {    
    require("../../../src/js/world_api/wall.js");
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    RUR.add_wall("east", 3, 3);
    assert.deepEqual(RUR.list_walls_at_position(3, 3), ["east"], "east wall");
    RUR.add_wall("west", 3, 3);
    assert.deepEqual(RUR.list_walls_at_position(3, 3), ["east", "west"], "two walls");
    RUR.add_wall("north", 3, 3);
    // walls are found by list_walls_at position in order as ["east", "north", "west", "south"]
    assert.deepEqual(RUR.list_walls_at_position(3, 3), ["east", "north", "west"], "three walls");
    RUR.add_wall("south", 3, 3);
    assert.deepEqual(RUR.list_walls_at_position(3, 3), ["east", "north", "west", "south"], "four walls");
    // looking from other positions
    assert.deepEqual(RUR.list_walls_at_position(4, 3), ["west"], "west wall");
    assert.deepEqual(RUR.list_walls_at_position(2, 3), ["east"], "east wall");
    assert.deepEqual(RUR.list_walls_at_position(3, 2), ["north"], "north wall");
    assert.deepEqual(RUR.list_walls_at_position(3, 4), ["south"], "south wall");
    assert.end();
});

test('Add and get wall at', function (assert) {    
    require("../../../src/js/world_api/wall.js");
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    RUR.add_wall("east", 3, 3);  // west of (4, 3)
    RUR.add_wall("north", 3, 3);  // south of (3, 4)
    assert.ok(RUR.is_wall_at_position("east", 3, 3), "east wall present");
    assert.ok(RUR.is_wall_at_position("north", 3, 3), "north wall present");
    assert.notOk(RUR.is_wall_at_position("south", 3, 3), "south wall not present");
    assert.notOk(RUR.is_wall_at_position("west", 3, 3), "west wall not present");
    //
    assert.ok(RUR.is_wall_at_position("west", 4, 3), "west wall present");
    assert.ok(RUR.is_wall_at_position("south", 3, 4), "south wall present");
    assert.end();
});


test('Add and list goal walls', function (assert) {    
    require("../../../src/js/world_api/wall.js");
    var goal = true;
    RUR.CURRENT_WORLD = RUR.create_empty_world();
    RUR.add_wall("east", 3, 3, goal);
    assert.deepEqual(RUR.list_walls_at_position(3, 3, goal), ["east"], "east wall");
    RUR.add_wall("west", 3, 3, goal);
    assert.deepEqual(RUR.list_walls_at_position(3, 3, goal), ["east", "west"], "two walls");
    RUR.add_wall("north", 3, 3, goal);
    // walls are found by list_walls_at position in order as ["east", "north", "west", "south"]
    assert.deepEqual(RUR.list_walls_at_position(3, 3, goal), ["east", "north", "west"], "three walls");
    RUR.add_wall("south", 3, 3, goal);
    assert.deepEqual(RUR.list_walls_at_position(3, 3, goal), ["east", "north", "west", "south"], "four walls");
    // looking from other positions
    assert.deepEqual(RUR.list_walls_at_position(4, 3, goal), ["west"], "west wall");
    assert.deepEqual(RUR.list_walls_at_position(2, 3, goal), ["east"], "east wall");
    assert.deepEqual(RUR.list_walls_at_position(3, 2, goal), ["north"], "north wall");
    assert.deepEqual(RUR.list_walls_at_position(3, 4, goal), ["south"], "south wall");
    assert.end();
});