// Additional PixiJS Libraries
const b = new Bump(PIXI);
const c = new Charm(PIXI);
// const su = new SpriteUtilities(PIXI);

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
const autoDetectRenderer = PIXI.autoDetectRenderer;

//Create a Pixi Application
const app = new Application({
  width: 1000,
  height: 565,
  antialiasing: true,
  transparent: false,
  resolution: 1,
  // resolution: window.devicePixelRatio || 1,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

const TEST_MODE = false;

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
  timeCounter,
  bg1,
  wiggle1,
  bg2,
  naGuys,
  naHero,
  kGuys,
  kAnimationGuys,
  kGuyAnimationTween,
  // naGuyAnimationTweens,
  transitionText,
  boundingBoxes,
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

const boundingBoxParams = [
  { x: 0, y: 182, width: 560, height: 242, fill: 0x36ba01 },
  { x: 730, y: 182, width: 300, height: 242, fill: 0x0ecae5 },
  { x: 570, y: 165, width: 160, height: 25, fill: 0xff71ce },
];

function setup() {
  //Make the game scene and add it to the stage

  gameScene = new Container();
  app.stage.addChild(gameScene);

  // create an animated sprite
  animatedBg = PIXI.AnimatedSprite.fromFrames([
    "assets/bg1.png",
    "assets/wiggle1.png",
  ]);
  gameScene.addChild(animatedBg);

  // background1
  // bg1 = new Sprite(resources["assets/bg1.png"].texture);
  // gameScene.addChild(bg1);

  // wiggle background1
  // wiggle1 = new Sprite(resources["assets/wiggle1.png"].texture);
  // wiggle1.visible = false;
  // gameScene.addChild(wiggle1);

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
  let glowFilter = new PIXI.filters.GlowFilter({ color: 0xe75f5b });
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
  // c.slide(kGuy, kGuy.x, kGuy.y + 60, 120, "smoothstep", true);
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
    // c.slide(kGuy, kGuy.x, kGuy.y + 60, 120, "smoothstep", true);
    gameScene.addChild(kGuy);
  }

  // add bounding boxes
  boundingBoxes = [];
  boundingBoxParams.forEach((box) => {
    let bound = new Graphics();
    bound.beginFill(box.fill);
    bound.drawRect(0, 0, box.width, box.height);
    bound.endFill();
    bound.x = box.x;
    bound.y = box.y;
    bound.alpha = 0.5;
    bound.visible = false;
    boundingBoxes.push(bound);
    gameScene.addChild(bound);
  });

  // target points and circles
  targetPoints.forEach((pt) => {
    // pt
    let target = new Graphics();
    target.beginFill(0xe50e0e);
    target.drawCircle(0, 0, 2);
    target.x = pt.x;
    target.y = pt.y;
    target.endFill();
    target.visible = false;
    gameScene.addChild(target);
    // circle
    let radius = naHero.height / 2;
    let circle = new Graphics();
    circle.beginFill(0xffffff);
    circle.drawCircle(pt.x + radius, pt.y, radius + 5);
    circle.endFill();
    circle.alpha = 0.3;
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

  if (TEST_MODE) {
    // gridlines
    for (i = 1; i < app.stage.width / 100; i++) {
      let line = new Graphics();
      if (i === 5) {
        line.lineStyle(6, 0xffffff, 1);
      } else {
        line.lineStyle(2, 0xffffff, 1);
      }
      line.moveTo(100 * i, 0);
      line.lineTo(100 * i, app.stage.height);
      gameScene.addChild(line);
    }
    for (i = 1; i < app.stage.height / 100; i++) {
      let line = new Graphics();
      if (i === 3) {
        line.lineStyle(6, 0xffffff, 1);
      } else {
        line.lineStyle(2, 0xffffff, 1);
      }
      line.moveTo(0, 100 * i);
      line.lineTo(app.stage.width, 100 * i);
      gameScene.addChild(line);
    }

    boundingBoxes.forEach((box) => (box.visible = true));

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
  }

  //Start the game loop
  app.ticker.add((delta) => gameLoop(delta));
  // gameLoop();
}

function gameLoop(delta) {
  //Run the current state
  state(delta);

  // Update Charm
  c.update();

  //app.renderer.render(app.stage);
  // renderer.render(stage);
}

function play(delta) {
  naGuys.forEach((naGuy) => {
    // make them move
    naGuy.vx += naGuy.accelerationX;
    naGuy.vy += naGuy.accelerationY;
    naGuy.vx *= naGuy.frictionX;
    naGuy.vy *= naGuy.frictionY;
    naGuy.x += naGuy.vx;
    naGuy.y += naGuy.vy;

    // contain in game area
    b.contain(naGuy, { x: 0, y: 0, width: 1000, height: 565 }, true);
    boundingBoxes.forEach((box) => {
      b.hit(naGuy, box, true, true);
    });

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
    console.log("changing state to transition");
    state = transition;
    //console.log("done!");
  }

  // make everyone collibe with each other
  k_combinations(naGuys, 2).map((pair) => {
    b.movingCircleCollision(pair[0], pair[1]);
  });
}

// ------------------------------
// Transition Animation
//
// This whole thing is a mess...
// ------------------------------

function transition(delta) {
  timeCounter = 0;
  state = transitionPt1;
}

/**
 * TRANSITION PT 1
 *
 * Freeze movement, flash background animation
 * Change protein shape & reposition sodium guys
 */
function transitionPt1(delta) {
  console.log("Transition part 1");
  timeCounter += 1;

  // stop movement
  naGuys.forEach((naGuy) => {
    naGuy.accelerationX = 0;
    naGuy.accelerationY = 0;
    naGuy.frictionX = 1;
    naGuy.frictionY = 1;
    naGuy.vx = 0;
    naGuy.vy = 0;
  });

  // hide target circles
  targetPoints.forEach((pt) => (pt.circle.visible = false));

  // change background
  animatedBg.filters = [new PIXI.filters.GodrayFilter()];
  transitionText.visible = true;
  animatedBg.animationSpeed = 0.024;
  animatedBg.play();

  // if (timeCounter > 10) {
  if (timeCounter > 230) {
    animatedBg.stop();
    transitionText.visible = false;
    bg2.visible = true;
    animatedBg.gotoAndStop(0);
    animatedBg.filters = [];

    // remove boundary boxes
    removeBoundingBoxes();

    // reposition my boys
    targetPoints[0].lastTouched.x = 610;
    targetPoints[0].lastTouched.y = 332;

    targetPoints[1].lastTouched.x = 590;
    targetPoints[1].lastTouched.y = 264;

    targetPoints[2].lastTouched.x = 570;
    targetPoints[2].lastTouched.y = 186;

    timeCounter = 0;
    state = transitionPt2;
  }
}

/**
 * TRANSITION PT 2
 *
 * In which we animate out the Na guys,
 * animate in the potassium guys
 */
function transitionPt2(delta) {
  console.log("Transition part 2");

  timeCounter += 1;

  // console.log(timeCounter);

  // --- remove Na Guys ---
  let naSprites = [
    {
      s: targetPoints[0].lastTouched,
      target1: [620, 300],
      target2: [750, 60],
      target3: [350, 60],
      duration: 250,
    },
    {
      s: targetPoints[1].lastTouched,
      target1: [650, 250],
      target2: [550, 70],
      target3: [850, 80],
      duration: 200,
    },
    {
      s: targetPoints[2].lastTouched,
      target1: [700, 40],
      target2: [500, 40],
      target3: [250, 100],
      duration: 150,
    },
  ];

  // naGuyAnimationTweens = [];
  naSprites.forEach((sprite) => {
    // animate movement
    let curve = [
      [sprite.s.x, sprite.s.y],
      sprite.target1,
      sprite.target2,
      sprite.target3,
    ];

    c.followCurve(
      sprite.s, //The sprite
      curve, //The Bezier curve array
      sprite.duration, //Duration, in milliseconds
      "smoothstep", //Easing type
      false //Should the tween yoyo?
    );
  });

  // --- place K guys ---
  if (timeCounter > 100) {
    // sort by closeness to pump
    kGuys.sort(function (a, b) {
      return Math.abs(a.x - 650) - Math.abs(b.x - 650);
    });

    let kGuy1 = kGuys.pop();
    let kGuy2 = kGuys.pop();

    kAnimationGuys = [kGuy1, kGuy2];

    let kSprites = [
      {
        s: kAnimationGuys[0],
        target1: [600, 50],
        target2: [580, 50],
        target3: [675, 224],
        duration: 200,
      },
      {
        s: kAnimationGuys[1],
        target1: [600, 250],
        target2: [580, 70],
        target3: [650, 303],
        duration: 250,
      },
    ];

    let kGuyAnimationTweens = [];
    kSprites.forEach((sprite) => {
      // animate movement
      let curve = [
        [sprite.s.x, sprite.s.y],
        sprite.target1,
        sprite.target2,
        sprite.target3,
      ];
      kGuyAnimationTweens.push(
        c.followCurve(
          sprite.s, //The sprite
          curve, //The Bezier curve array
          sprite.duration, //Duration, in milliseconds
          "smoothstep", //Easing type
          false //Should the tween yoyo?
        )
      );
    });
    kGuyAnimationTween = kGuyAnimationTweens.pop();
    state = transitionPt3;
    // state = pause;
  }
}

/**
 * TRANSITION PT 3
 *
 * In which we change the background
 * once the last kGuy has arrived.
 */
function transitionPt3() {
  console.log("Transition part 3");
  kGuyAnimationTween.onComplete = () => {
    console.log("slide completed");
    bg2.visible = false;

    // reposition
    kAnimationGuys[0].x = 640;
    kAnimationGuys[0].y = 236;
    kAnimationGuys[1].x = 654;
    kAnimationGuys[1].y = 311;

    timeCounter = 0;
    state = transitionPt4;
  };
}

/**
 * TRANSITION PT 4
 *
 * In which we move the kGuys
 * out of the protein
 */
function transitionPt4() {
  console.log("Transition part 4");
  timeCounter += 1;

  if (timeCounter > 50) {
    let kSprites = [
      {
        s: kAnimationGuys[0],
        target1: [650, 500],
        target2: [290, 500],
        target3: [290, 463],
        duration: 200,
      },
      {
        s: kAnimationGuys[1],
        target1: [650, 500],
        target2: [380, 500],
        target3: [390, 442],
        duration: 250,
      },
    ];

    let kGuyAnimationTweens = [];
    kSprites.forEach((sprite) => {
      // animate movement
      let curve = [
        [sprite.s.x, sprite.s.y],
        sprite.target1,
        sprite.target2,
        sprite.target3,
      ];
      kGuyAnimationTweens.push(
        c.followCurve(
          sprite.s, //The sprite
          curve, //The Bezier curve array
          sprite.duration, //Duration, in milliseconds
          "smoothstep", //Easing type
          false //Should the tween yoyo?
        )
      );
    });
    kGuyAnimationTween = kGuyAnimationTweens.pop();
    state = pause;
  }
}

function pause() {
  return;
}

function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}

function removeBoundingBoxes() {
  boundingBoxes.forEach((box) => {
    box.y = box.y + 1000;
  });
}

function replaceBoundingBoxes() {
  boundingBoxes.forEach((box) => {
    box.y = box.y - 1000;
  });
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
