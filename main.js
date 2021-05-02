// Help Section
var help = false;
function Help() {
  var h = document.getElementById("help-content");
  if (help) {
    h.style.display = "none";
    help = false;
  } else {
    h.style.display = "block";
    help = true;
  }
}

// Canvas Initailization
let c = document.getElementById("game-canvas");
let ctx = c.getContext("2d");

let x_offset = 0;
let y_offset = 80;
let x_limit = 300;

// Load particular Image
let loadImage = (src, callback) => {
  let img = document.createElement("img");
  img.onload = () => callback(img);

  img.src = src;
};

let imagePath = (animation, frameNumber) => {
  return "images/" + animation + "/" + frameNumber + ".png";
};

let frames = {
  backward: [1, 2, 3, 4, 5, 6],
  block: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  forward: [1, 2, 3, 4, 5, 6],
  idle: [1, 2, 3, 4, 5, 6, 7, 8],
  kick: [1, 2, 3, 4, 5, 6, 7],
  punch: [1, 2, 3, 4, 5, 6, 7],
};

let loadImages = (callback) => {
  let images = {
    backward: [],
    block: [],
    forward: [],
    idle: [],
    kick: [],
    punch: [],
  };
  let imagesToLoad = 0;

  ["backward", "block", "forward", "idle", "kick", "punch"].forEach(
    (animation) => {
      let animationFrames = frames[animation];
      imagesToLoad = imagesToLoad + animationFrames.length;

      animationFrames.forEach((frameNumber) => {
        let path = imagePath(animation, frameNumber);

        loadImage(path, (image) => {
          images[animation][frameNumber - 1] = image;
          imagesToLoad = imagesToLoad - 1;

          if (imagesToLoad === 0) {
            callback(images);
          }
        });
      });
    }
  );
};

let animate = (ctx, images, animation, callback) => {
  images[animation].forEach((image, index) => {
    setTimeout(() => {
      ctx.clearRect(x_offset, y_offset, 500, 500);
      ctx.drawImage(image, x_offset, y_offset, 500, 500);
    }, index * 100);
  });

  setTimeout(callback, images[animation].length * 100);
};

loadImages((images) => {
  let queuedAnimation = [];

  let aux = () => {
    let selectedAnimation;

    if (queuedAnimation.length === 0) {
      selectedAnimation = "idle";
    } else {
      selectedAnimation = queuedAnimation.shift();
    }

    animate(ctx, images, selectedAnimation, aux);
  };

  document.getElementById("backward").onclick = () => {
    queuedAnimation.push("backward");
    if (x_offset >= 0) {
      x_offset = x_offset - 70;
    }
  };

  document.getElementById("block").onclick = () => {
    queuedAnimation.push("block");
    setTimeout(block, 700);
  };

  document.getElementById("forward").onclick = () => {
    queuedAnimation.push("forward");
    if (x_offset <= x_limit) {
      x_offset = x_offset + 70;
    }
  };

  document.getElementById("kick").onclick = () => {
    queuedAnimation.push("kick");
    setTimeout(kick, 650);
  };

  document.getElementById("punch").onclick = () => {
    queuedAnimation.push("punch");
    setTimeout(punch, 600);
  };

  document.addEventListener("keyup", (event) => {
    const key = event.key;

    // console.log(key);
    if (key === "ArrowLeft" || key.toUpperCase() === "A") {
      queuedAnimation.push("backward");
      if (x_offset >= 0) {
        x_offset = x_offset - 70;
      }
    } else if (key === "ArrowRight" || key.toUpperCase() === "D") {
      queuedAnimation.push("forward");
      if (x_offset <= x_limit) {
        x_offset = x_offset + 70;
      }
    } else if (key === "ArrowUp" || key.toUpperCase() === "W") {
      queuedAnimation.push("kick");
      setTimeout(kick, 650);
    } else if (key === "ArrowDown" || key.toUpperCase() === "S") {
      queuedAnimation.push("punch");
      setTimeout(punch, 600);
    } else if (key === " ") {
      queuedAnimation.push("block");
      setTimeout(block, 700);
    }
  });

  aux();
});

let kick = () => {
  createAttack("kick");
};

let punch = () => {
  createAttack("punch");
};

let block = () => {
  createAttack("block");
};

// Brick
var bricks = new Array();
let b_width = 70;
let b_height = 30;
let b_color = "#6e311c";
let y_options = [180, 210, 240];

function Brick(x, y) {
  this.x = x;
  this.y = y;

  this.move = (num) => {
    // console.log("Moving Brick");
    ctx.clearRect(this.x, this.y, b_width, b_height);
    if (this.x >= x_offset + 400) {
      this.x = this.x - 20;
    } else {
      removeBrick(num);
    }
    ctx.fillStyle = b_color;
    ctx.fillRect(this.x, this.y, b_width, b_height);
  };
}

let createBrick = (x, y) => {
  var brick = new Brick(x, y);
  bricks.push(brick);
};

let removeBrick = (num) => {
  ctx.clearRect(bricks[num].x, bricks[num].y, b_width, b_height);
  bricks.splice(num, 1);
};

let drawBrick = () => {
  let y = y_options[Math.floor(Math.random() * 3)];
  let x = c.width - b_width;
  createBrick(x, y);
};

let updateBricks = () => {
  for (let i = 0; i < bricks.length; i++) {
    bricks[i].move(i);
  }
};

// Attack
var attacks = new Array();
let size = 30;
let a_color = "gray";

function Attack(x, y, type) {
  this.x = x;
  this.y = y;
  this.type = type;
  this.limit = x + 600;

  this.moveAttack = (num) => {
    // console.log("Moving Attack: " + num);
    ctx.clearRect(this.x, this.y, size, size);
    if (this.x <= this.limit) {
      this.x = this.x + 10;
      ctx.fillStyle = a_color;
      ctx.fillRect(this.x, this.y, size, size);
    } else {
      removeAttack(num);
    }
  };

  this.drawAttack = () => {
    ctx.fillStyle = b_color;
    ctx.fillRect(this.x, this.y, b_width, b_height);
  };
}

let createAttack = (type) => {
  let x_component = 0;
  let y_component = 0;
  if (type == "kick") {
    x_component = x_offset + 370;
    y_component = 180;
  } else if (type == "punch") {
    x_component = x_offset + 450;
    y_component = 240;
  } else if (type == "block") {
    x_component = x_offset + 300;
    y_component = 210;
  }
  var attack = new Attack(x_component, y_component, type);
  attacks.push(attack);
  // attacks[0].drawAttack();
};

let removeAttack = (num) => {
  // console.log("Removed Attack");
  ctx.clearRect(attacks[num].x, attacks[num].y, size, size);
  attacks.splice(num, 1);
};

let updateAttacks = () => {
  for (let i = 0; i < attacks.length; i++) {
    attacks[i].moveAttack(i);
  }
};

var score = 0;

let hitTest = () => {
  for (var i = 0; i < bricks.length; i++) {
    for (var j = 0; j < attacks.length; j++) {
      if (
        attacks[j].type == "kick" &&
        bricks[i].y == 180 &&
        attacks[j].x >= bricks[i].x
      ) {
        removeBrick(i);
        removeAttack(j);
        score = score + 1;
      } else if (
        attacks[j].type == "punch" &&
        bricks[i].y == 240 &&
        attacks[j].x >= bricks[i].x
      ) {
        removeBrick(i);
        removeAttack(j);
        score = score + 1;
      } else if (
        attacks[j].type == "block" &&
        bricks[i].y == 210 &&
        attacks[j].x >= bricks[i].x
      ) {
        removeBrick(i);
        removeAttack(j);
        score = score + 1;
      }
    }
  }
  changeScore();
};
let scoreElement = document.getElementById("score");

let changeScore = () => {
  scoreElement.innerHTML = score;
};

let loop = () => {
  setInterval(drawBrick, 3000);
  setInterval(updateBricks, 50);
  setInterval(updateAttacks, 50);
  setInterval(hitTest, 50);
};

alert(
  "Hello, Welcome to Martial Arts Game!!!\n\nYou have to crush the incoming bricks using your mighty \npunch and kicks, before they reach you.\n\nGame starts in 5 seconds.\nFor navigation, click on help icon.\n\n\t\t\tAll the best!!!"
);

setTimeout(loop, 2000);
