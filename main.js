//Aliases
let Application = PIXI.Application,
  Container = PIXI.Container,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Graphics = PIXI.Graphics,
  TextureCache = PIXI.utils.TextureCache,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  TextStyle = PIXI.TextStyle;

let b = new Bump(PIXI);
let c = new Charm(PIXI);

//Create a Pixi Application
let app = new Application({
  width: 1000,
  height: 565,
  antialiasing: true,
  transparent: false,
  resolution: 1,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader
  .add(["assets/bg1.png", "assets/na_guy.png", "assets/kGuy.png"])
  .load(setup);

//Define variables that might be used in more
//than one function
let state,
  bg1,
  naGuy,
  kGuys,
  circle,
  bound1,
  bound2,
  bound3,
  pt,
  chimes,
  exit,
  message,
  gameScene,
  gameOverScene,
  id;

function setup() {
  //Make the game scene and add it to the stage
  gameScene = new Container();
  app.stage.addChild(gameScene);

  // bg1
  bg1 = new Sprite(resources["assets/bg1.png"].texture);
  gameScene.addChild(bg1);

  // naGuy
  naGuy = new Sprite(resources["assets/na_guy.png"].texture);
  naGuy.scale.set(0.52, 0.52);
  naGuy.x = 300;
  naGuy.y = gameScene.height - naGuy.height - 30;
  naGuy.radius = naGuy.height / 2;
  naGuy.circular = true;
  naGuy.vx = 0;
  naGuy.vy = 0;
  naGuy.accelerationX = 0;
  naGuy.accelerationY = 0;
  naGuy.frictionX = 1;
  naGuy.frictionY = 1;
  naGuy.speed = 0.15;
  naGuy.drag = 0.98;
  gameScene.addChild(naGuy);

  // kGuys
  let numberOfKGuys = 3;
  kGuys = [];
  for (let i = 0; i < numberOfKGuys; i++) {
    let kGuy = new Sprite(resources["assets/kGuy.png"].texture);
    kGuy.scale.set(0.52, 0.52);
    //let x = spacing * i + xOffset;
    let x = randomInt(0, gameScene.width - kGuy.width);
    let y = randomInt(0, 182 - kGuy.height - 60);
    kGuy.x = x;
    kGuy.y = y;
    kGuys.push(kGuy);

    c.slide(kGuy, kGuy.x, kGuy.y + 60, 120, "smoothstep", true);

    gameScene.addChild(kGuy);
  }

  // circle
  circle = new Graphics();
  circle.beginFill(0x36ba01);
  circle.drawCircle(596, 386, 35);
  circle.endFill();
  circle.alpha = 0.5;
  circle.visible = false;
  gameScene.addChild(circle);

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

  // pt
  pt = new Graphics();
  pt.beginFill(0xe50e0e);
  pt.drawCircle(0, 0, 2);
  pt.x = 570;
  pt.y = 376;
  pt.endFill();
  gameScene.addChild(pt);

  //Create the `gameOver` scene
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible = false;

  //Create the text sprite and add it to the `gameOver` scene
  let style = new TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white",
  });
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
    naGuy.accelerationX = -naGuy.speed;
    naGuy.frictionX = 1;
  };
  left.release = () => {
    if (!right.isDown) {
      naGuy.accelerationX = 0;
      naGuy.frictionX = naGuy.drag;
    }
  };

  //Up
  up.press = () => {
    naGuy.accelerationY = -naGuy.speed;
    naGuy.frictionY = 1;
  };
  up.release = () => {
    if (!down.isDown) {
      naGuy.accelerationY = 0;
      naGuy.frictionY = naGuy.drag;
    }
  };
  //Right
  right.press = () => {
    naGuy.accelerationX = naGuy.speed;
    naGuy.frictionX = 1;
  };
  right.release = () => {
    if (!left.isDown) {
      naGuy.accelerationX = 0;
      naGuy.frictionX = naGuy.drag;
    }
  };
  //Down
  down.press = () => {
    naGuy.accelerationY = naGuy.speed;
    naGuy.frictionY = 1;
  };
  down.release = () => {
    if (!up.isDown) {
      naGuy.accelerationY = 0;
      naGuy.frictionY = naGuy.drag;
    }
  };

  //Set the game state
  state = play;

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
  //Apply acceleration by adding the acceleration to the sprite's velocity
  naGuy.vx += naGuy.accelerationX;
  naGuy.vy += naGuy.accelerationY;
  //Apply friction by multiplying sprite's velocity by the friction
  naGuy.vx *= naGuy.frictionX;
  naGuy.vy *= naGuy.frictionY;
  //Apply the velocity to the sprite's position to make it move
  naGuy.x += naGuy.vx;
  naGuy.y += naGuy.vy;

  b.contain(naGuy, { x: 0, y: 0, width: 1000, height: 565 }, true);

  b.hit(naGuy, bound1, true, true);
  b.hit(naGuy, bound2, true, true);
  b.hit(naGuy, bound3, true, true);

  // check for collision b/w naGuy and pt
  if (b.hit({ x: 570, y: 376 }, naGuy)) {
    console.log("hit");
    circle.visible = true;
    naGuy.accelerationX = 0;
    naGuy.accelerationY = 0;
    naGuy.frictionX = 1;
    naGuy.frictionY = 1;
    naGuy.vx = 0;
    naGuy.vy = 0;
    naGuy.x = 570;
    naGuy.y = 358;
  }
}

function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}

/* Helper functions */

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
