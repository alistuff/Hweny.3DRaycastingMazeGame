/*
 *game main
*/
(function (core, level,entities, render) {

    var game = new core.Game('canvas');

    function game_run(result) {
        if (result) {
            document.getElementById('progressbar').innerHTML = '';
            game.start();
        } else {
            alert('load resources failed');
        }
    };

    function game_init(context) {
        game.setState(new core.GameAnimationState());
    };

    function game_update(time) {
        game.stateManager.update(time);
    };

    function game_render(context) {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.strokeRect(0, 0, context.canvas.width, context.canvas.height);
        game.stateManager.render(context);
    };

    game.queueImage('wall0', 'res/tex/wall/wall0.png');
    game.queueImage('wall0_blood', 'res/tex/wall/wall0_blood.png');
    game.queueImage('wall0_cage', 'res/tex/wall/wall0_cage.png');
    game.queueImage('wall0_door', 'res/tex/wall/wall0_door.png');
    game.queueImage('wall0_einstein', 'res/tex/wall/wall0_einstein.png');
    game.queueImage('wall0_msg', 'res/tex/wall/wall0_msg.png');
    game.queueImage('wall0_radiator', 'res/tex/wall/wall0_radiator.png');
    game.queueImage('wall0_russell', 'res/tex/wall/wall0_russell.png');
    game.queueImage('wall0_sign', 'res/tex/wall/wall0_sign.png');
    game.queueImage('wall0_wittgenstein', 'res/tex/wall/wall0_wittgenstein.png');
    game.queueImage('wall1', 'res/tex/wall/wall1.png');
    game.queueImage('wall1_crack', 'res/tex/wall/wall1_crack.png');
    game.queueImage('wall1_hole', 'res/tex/wall/wall1_hole.png');
    game.queueImage('wall1_lamp', 'res/tex/wall/wall1_lamp.png');
    game.queueImage('wall1_window', 'res/tex/wall/wall1_window.png');
    game.queueImage('wall1_wittgenstein', 'res/tex/wall/wall1_wittgenstein.png');
    game.queueImage('wall2','res/tex/wall/wall2.png');
    game.queueImage('wall2_water', 'res/tex/wall/wall2_water.png');

    game.queueImage('floor0', 'res/tex/floor/floor0.png');
    game.queueImage('floor0_blood', 'res/tex/floor/floor0_blood.png');

    game.queueImage('ceiling0', 'res/tex/ceiling/ceiling0.png');
    game.queueImage('ceiling1', 'res/tex/ceiling/ceiling1.png');

    game.queueImage('enemy_android', 'res/tex/entity/enemy/enemy_android.png');
    game.queueImage('enemy_html5', 'res/tex/entity/enemy/enemy_html5.png');
    game.queueImage('enemy_java', 'res/tex/entity/enemy/enemy_java.png');
    game.queueImage('enemy_skull', 'res/tex/entity/enemy/enemy_skull.png');
    game.queueImage('enemy_ghost', 'res/tex/entity/enemy/enemy_ghost.png');

    game.queueImage('item_chair', 'res/tex/entity/objects/chair.png');
    game.queueImage('item_table', 'res/tex/entity/objects/table.png');
    game.queueImage('item_computer', 'res/tex/entity/objects/computer.png');
    game.queueImage('item_skull', 'res/tex/entity/objects/skull.png');
    game.queueImage('item_tree', 'res/tex/entity/objects/tree.png');
    game.queueImage('item_flower1', 'res/tex/entity/objects/flower1.png');
    game.queueImage('item_flower2', 'res/tex/entity/objects/flower2.png');
    game.queueImage('item_flower3', 'res/tex/entity/objects/flower3.png');
    game.queueImage('item_cloud', 'res/tex/entity/objects/cloud.png');

    game.queueImage('left_hand', 'res/tex/entity/weapon/left_hand.png');
    game.queueImage('right_hand', 'res/tex/entity/weapon/right_hand.png');

    game.queueImage('dungeonLevel', 'res/level/dungeonLevel.png');
    game.queueImage('outsideLevel', 'res/level/outsideLevel.png');

    game.loadImages(game_run, function (e) {
        document.getElementById('progressbar').innerHTML = 'loading:' + e + '%';
    });

    game.init = game_init;
    game.update = game_update;
    game.render = game_render;

})(Alistuff.fps);
