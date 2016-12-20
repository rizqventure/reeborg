var tape = require('tape');
var silencer =  require('silencer');
global.window = {};
global.RUR = {};
global.Image = function () {
    return {};
};

function test(info, fn) {
    tape("Obstacle.js: "+info, fn)
}

test('adding known object', function (assert) {
    require("../../../src/js/world_set/obstacle.js");
    RUR.CURRENT_WORLD = {};
    RUR.OBJECTS = {};
    RUR.KNOWN_TILES = ['a'];
    RUR.untranslated['a'] = true;
    global.RUR.toggle_obstacle_at_position('a', 2, 3, 4);
    assert.ok(RUR.CURRENT_WORLD.obstacles['2,3'].a, "solid objects ok");
    assert.end();
});

test('adding and removing known solid object', function (assert) {
    var identical = require("../../../src/js/utils/identical.js").identical;
    require("../../../src/js/world_set/obstacle.js");
    RUR.CURRENT_WORLD = {};
    RUR.OBJECTS = {};
    RUR.KNOWN_TILES = ['a'];
    RUR.untranslated['a'] = true;
    RUR.toggle_obstacle_at_position('a', 2, 3);
    RUR.toggle_obstacle_at_position('a', 2, 3);
    assert.ok(identical(RUR.CURRENT_WORLD, {}), "nb solid objects left");
    assert.end();
});

test('adding two and removing one known solid objects', function (assert) {
    var identical = require("../../../src/js/utils/identical.js").identical;
    require("../../../src/js/world_set/obstacle.js");
    RUR.CURRENT_WORLD = {};
    RUR.OBJECTS = {};
    RUR.KNOWN_TILES = ['a', 'b'];
    RUR.untranslated['a'] = true;
    RUR.untranslated['b'] = true;
    RUR.toggle_obstacle_at_position('b', 2, 3);
    RUR.toggle_obstacle_at_position('a', 2, 3);
    RUR.toggle_obstacle_at_position('b', 2, 3);
    assert.ok(RUR.CURRENT_WORLD.obstacles['2,3'].a, "solid objects ok");
    assert.end();
});


test('adding unknown solid object', function (assert) {
    silencer.reset();
    silencer.disable();
    require("../../../src/js/world_set/obstacle.js");
    RUR.OBJECTS = {};
    RUR.KNOWN_TILES = [];
    RUR.translation = {};
    try {
        RUR.toggle_obstacle_at_position('a', 2, 3, 4);
    } catch (e) {
        silencer.restore();
        assert.equal(e.message, "Unknown object", "error message");
        assert.equal(e.reeborg_shouts, "Unknown object", "reeborg_shouts");
        assert.equal(e.name, "ReeborgError", "error name ok");
        assert.ok(silencer.getOutput('warn')[0][0].startsWith("Translation needed for"),
                  "Console log ok.");
        assert.end();
    }
});