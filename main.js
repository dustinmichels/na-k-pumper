// Additional PixiJS Libraries
const b = new Bump(PIXI);
const c = new Charm(PIXI);

//Aliases
const Application = PIXI.Application;
const Container = PIXI.Container;
const loader = PIXI.Loader.shared;
const resources = PIXI.Loader.shared.resources;
const Graphics = PIXI.Graphics;
const TextureCache = PIXI.utils.TextureCache;
const Sprite = PIXI.Sprite;
const Text = PIXI.Text;
const TextStyle = PIXI.TextStyle;

//Create a Pixi Application
const app = new Application({
  width: 1000,
  height: 565,
  antialiasing: true,
  transparent: false,
  resolution: 1,
});

const TEST = false;

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader
  .add([
    "assets/bg1.png",
    "assets/bg2.png",
    "assets/wiggle1.png",
    "assets/na_guy.png",
    "assets/kGuy.png",
  ])
  .load(setup);

//Define variables that might be used in more
//than one function
let state,
  bg1,
  wiggle1,
  bg2,
  naGuys,
  naHero,
  kGuys,
  bound1,
  bound2,
  bound3,
  transitionText,
  chimes,
  exit,
  message,
  gameScene,
  gameOverScene,
  id;

const targetPoints = [
  { x: 570, y: 386, lastTouched: null, circle: null, filled: false },
  { x: 590, y: 307, lastTouched: null, circle: null, filled: false },
  { x: 608, y: 236, lastTouched: null, circle: null, filled: false },
];

function setup() {
  //Make the game scene and add it to the stage

  gameScene = new Container();
  app.stage.addChild(gameScene);

  // background1
  bg1 = new Sprite(resources["assets/bg1.png"].texture);
  gameScene.addChild(bg1);

  // wiggle background1
  wiggle1 = new Sprite(resources["assets/wiggle1.png"].texture);
  wiggle1.visible = false;
  gameScene.addChild(wiggle1);

  // background2
  bg2 = new Sprite(resources["assets/bg2.png"].texture);
  bg2.visible = false;
  gameScene.addChild(bg2);

  // --- Sodium (Na) Guys ---
  let numberOfSodiumGuys = 5;
  naGuys = [];
  for (let i = 0; i < numberOfSodiumGuys; i++) {
    let naGuy = new Sprite(resources["assets/na_guy.png"].texture);
    naGuy.scale.set(0.5, 0.5);
    naGuy.x = randomInt(
      (gameScene.width / numberOfSodiumGuys) * i,
      (gameScene.width / numberOfSodiumGuys) * (i + 1) - naGuy.width
    );
    naGuy.y = gameScene.height - naGuy.height - 30;
    naGuy.circular = true;
    naGuy.vx = 0;
    naGuy.vy = 0;
    naGuy.accelerationX = 0;
    naGuy.accelerationY = 0;
    naGuy.frictionX = 1;
    naGuy.frictionY = 1;
    naGuy.speed = 0.15;
    naGuy.drag = 0.98;
    naGuys.push(naGuy);
    gameScene.addChild(naGuy);
  }
  naHero = naGuys[0];
  let glowFilter = new PIXI.filters.GlowFilter();
  naHero.filters = [glowFilter];

  // --- Potassium (K) Guys ---
  // background kGuy
  let kGuy = new Sprite(resources["assets/kGuy.png"].texture);
  kGuy.scale.set(0.25, 0.25);
  let x = randomInt(0, gameScene.width - kGuy.width);
  let y = randomInt(0, 182 - kGuy.height - 60);
  kGuy.x = x;
  kGuy.y = y;
  kGuy.alpha = 0.5;
  let blurFilter = new PIXI.filters.BlurFilter();
  blurFilter.blur = 1;
  kGuy.filters = [blurFilter];
  c.slide(kGuy, kGuy.x, kGuy.y + 60, 120, "smoothstep", true);
  gameScene.addChild(kGuy);

  // kGuys
  let numberOfKGuys = 4;
  kGuys = [];
  for (let i = 0; i < numberOfKGuys; i++) {
    let kGuy = new Sprite(resources["assets/kGuy.png"].texture);
    kGuy.scale.set(0.5, 0.5);
    let x = randomInt(
      (gameScene.width / numberOfKGuys) * i,
      (gameScene.width / numberOfKGuys) * (i + 1) - kGuy.width
    );
    let y = randomInt(0, 182 - kGuy.height - 60);
    kGuy.x = x;
    kGuy.y = y;
    kGuys.push(kGuy);
    c.slide(kGuy, kGuy.x, kGuy.y + 60, 120, "smoothstep", true);
    gameScene.addChild(kGuy);
  }

  // bound 1
  bound1 = new Graphics();
  bound1.beginFill(0x36ba01);
  bound1.drawRect(0, 0, 560, 242);
  bound1.endFill();
  bound1.x = 0;
  bound1.y = 182;
  bound1.alpha = 0.5;
  bound1.visible = false;
  gameScene.addChild(bound1);

  // bound 2
  bound2 = new Graphics();
  bound2.beginFill(0x0ecae5);
  bound2.drawRect(0, 0, 300, 242);
  bound2.endFill();
  bound2.x = 730;
  bound2.y = 182;
  bound2.alpha = 0.5;
  bound2.visible = false;
  gameScene.addChild(bound2);

  // bound 3
  bound3 = new Graphics();
  bound3.beginFill(0xff71ce);
  bound3.drawRect(0, 0, 160, 25);
  bound3.endFill();
  bound3.x = 570;
  bound3.y = 165;
  bound3.alpha = 0.5;
  bound3.visible = false;
  gameScene.addChild(bound3);

  // target points and circles
  targetPoints.forEach((pt) => {
    // pt
    let target = new Graphics();
    target.beginFill(0xe50e0e);
    target.drawCircle(0, 0, 2);
    target.x = pt.x;
    target.y = pt.y;
    target.endFill();
    gameScene.addChild(target);
    // circle
    let radius = naHero.height / 2;
    let circle = new Graphics();
    circle.beginFill(0xffffff);
    circle.drawCircle(pt.x + radius, pt.y, radius + 5);
    circle.endFill();
    circle.alpha = 0.5;
    circle.visible = true;
    gameScene.addChild(circle);
    pt.circle = circle;
  });

  //Create the text sprite and add it to the `gameOver` scene
  let style = new TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white",
    stroke: "teal",
    strokeThickness: 10,
    dropShadow: true,
    dropShadowDistance: 20,
  });
  transitionText = new Text("Phosphorylated!", style);
  transitionText.x = 150;
  transitionText.y = 90;
  transitionText.rotation = -0.15;
  transitionText.visible = false;
  gameScene.addChild(transitionText);

  // ----- game over scene -----
  //Create the `gameOver` scene
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible = false;

  //Create the text sprite and add it to the `gameOver` scene
  // let style = new TextStyle({
  //   fontFamily: "Futura",
  //   fontSize: 64,
  //   fill: "white",
  // });
  message = new Text("The End!", style);
  message.x = 120;
  message.y = app.stage.height / 2 - 32;
  gameOverScene.addChild(message);

  //Capture the keyboard arrow keys
  let left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

  //Left
  left.press = () => {
    naHero.accelerationX = -naHero.speed;
    naHero.frictionX = 1;
  };
  left.release = () => {
    if (!right.isDown) {
      naHero.accelerationX = 0;
      naHero.frictionX = naHero.drag;
    }
  };

  //Up
  up.press = () => {
    naHero.accelerationY = -naHero.speed;
    naHero.frictionY = 1;
  };
  up.release = () => {
    if (!down.isDown) {
      naHero.accelerationY = 0;
      naHero.frictionY = naHero.drag;
    }
  };
  //Right
  right.press = () => {
    naHero.accelerationX = naHero.speed;
    naHero.frictionX = 1;
  };
  right.release = () => {
    if (!left.isDown) {
      naHero.accelerationX = 0;
      naHero.frictionX = naHero.drag;
    }
  };
  //Down
  down.press = () => {
    naHero.accelerationY = naHero.speed;
    naHero.frictionY = 1;
  };
  down.release = () => {
    if (!up.isDown) {
      naHero.accelerationY = 0;
      naHero.frictionY = naHero.drag;
    }
  };

  //Set the game state
  state = play;

  if (TEST) {
    naGuys[0].x = targetPoints[0].x;
    naGuys[0].y = targetPoints[0].y - naHero.height / 2;
    targetPoints[0].lastTouched = naGuys[0];

    naGuys[1].x = targetPoints[1].x;
    naGuys[1].y = targetPoints[1].y - naHero.height / 2;
    targetPoints[1].lastTouched = naGuys[1];

    naGuys[2].x = targetPoints[2].x;
    naGuys[2].y = targetPoints[2].y - naHero.height / 2;
    targetPoints[2].lastTouched = naGuys[2];

    state = transition;
    // setTimeout(() => {
    //   state = transition;
    // }, 1000);
  }

  //Start the game loop
  app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
  //Update the current game state:
  state(delta);

  //Update charm
  c.update();
}

function play(delta) {
  naGuys.map((naGuy) => {
    // make them move
    naGuy.vx += naGuy.accelerationX;
    naGuy.vy += naGuy.accelerationY;
    naGuy.vx *= naGuy.frictionX;
    naGuy.vy *= naGuy.frictionY;
    naGuy.x += naGuy.vx;
    naGuy.y += naGuy.vy;

    // contain in game area
    b.contain(naGuy, { x: 0, y: 0, width: 1000, height: 565 }, true);
    b.hit(naGuy, bound1, true, true);
    b.hit(naGuy, bound2, true, true);
    b.hit(naGuy, bound3, true, true);

    // check for collision b/w naGuy and target pt
    targetPoints.forEach((pt) => {
      if (b.hit({ x: pt.x, y: pt.y }, naGuy)) {
        pt.lastTouched = naGuy;
        naGuy.accelerationX = 0;
        naGuy.accelerationY = 0;
        naGuy.frictionX = 1;
        naGuy.frictionY = 1;
        naGuy.vx = 0;
        naGuy.vy = 0;
        naGuy.x = pt.x;
        naGuy.y = pt.y - naGuy.height / 2;
      }
    });
  });

  // illuminate circles when they are still touching
  // the guy that "hit" them.
  targetPoints.forEach((pt) => {
    if (
      pt.circle &&
      pt.lastTouched &&
      pt.lastTouched.x === pt.x &&
      pt.lastTouched.y === pt.y - naHero.height / 2
    ) {
      pt.filled = true;
      pt.circle.tint = 0x36ba01;
    } else {
      pt.filled = false;
      pt.circle.tint = 0xffffff;
    }
  });

  if (targetPoints.every((pt) => pt.filled)) {
    state = transition;
    //console.log("done!");
  }

  // make everyone collibe with each other
  k_combinations(naGuys, 2).map((pair) => {
    b.movingCircleCollision(pair[0], pair[1]);
  });
}

function transition(delta) {
  // stop movement
  naGuys.forEach((naGuy) => {
    naGuy.accelerationX = 0;
    naGuy.accelerationY = 0;
    naGuy.frictionX = 1;
    naGuy.frictionY = 1;
    naGuy.vx = 0;
    naGuy.vy = 0;
  });

  // reposition my guys
  bound3.y = bound3.y - 100;

  // flash animation
  wait(1000).then(() => {
    transitionText.visible = true;
    wiggle1.visible = true;
  });
  wait(2000).then(() => {
    wiggle1.visible = false;
  });
  wait(3000).then(() => {
    wiggle1.visible = true;
  });
  wait(4000).then(() => {
    wiggle1.visible = false;
    transitionText.visible = false;
    bg1.visible = false;
    bg2.visible = true;

    targetPoints[0].lastTouched.visible = true;
    targetPoints[0].circle.visible = false;
    targetPoints[0].lastTouched.x = 580;
    targetPoints[0].lastTouched.y = 320;

    targetPoints[1].lastTouched.visible = true;
    targetPoints[1].circle.visible = false;
    targetPoints[1].lastTouched.x = 520;
    targetPoints[1].lastTouched.y = 280;

    targetPoints[2].lastTouched.visible = true;
    targetPoints[2].circle.visible = false;
    targetPoints[2].lastTouched.x = 558;
    targetPoints[2].lastTouched.y = 180;
  });
  // TODO: animate chaning of guards

  state = play;
}

function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}

/*
 * ----------------
 * Helper functions
 * ----------------
 */

//The `randomInt` helper function
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//The `keyboard` helper function
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener("keydown", key.downHandler.bind(key), false);
  window.addEventListener("keyup", key.upHandler.bind(key), false);
  return key;
}

function wait(duration = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}
