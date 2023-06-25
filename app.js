const utils = {
  getRandom: function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  getPos(el) {
    return {
      l: Number(window.getComputedStyle(el).left.split("px")[0]),
      r: Number(window.getComputedStyle(el).right.split("px")[0]),
      t: Number(window.getComputedStyle(el).top.split("px")[0]),
      b: Number(window.getComputedStyle(el).bottom.split("px")[0]),
    };
  },
  getSize(el) {
    return {
      w: Number(window.getComputedStyle(el).width.split("px")[0]),
      h: Number(window.getComputedStyle(el).height.split("px")[0]),
    };
  },
  setPos(el, pos) {
    if (pos.l !== undefined) {
      el.style.left = pos.l + "px";
    }
    if (pos.r !== undefined) {
      el.style.right = pos.r + "px";
    }
    if (pos.t !== undefined) {
      el.style.top = pos.t + "px";
    }
    if (pos.b !== undefined) {
      el.style.bottom = pos.b + "px";
    }
  },
};

const ui = {
  frame: document.querySelector(".frame"),
  menu: document.querySelector('.menu'),
  player: document.querySelector(".player"),
  enemies: [],
};

const sizes = {
  frameWidth: utils.getSize(ui.frame).w,
  frameHeight: utils.getSize(ui.frame).h,
};

const settings = {
    music: false,
}

const game = {
  playing: false,
};

const stats = {
  shotSpeed: 8,
};

const dev = {
  playerPos: document.querySelector(".dev .playerPos"),
  enemiesCount: document.querySelector(".dev .enemiesCount"),
  bulletsCount: document.querySelector(".dev .bulletsCount"),
};

function spawn() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  let enemyType = "enemy";
  if (utils.getRandom(0, 3) === 3) {
    enemy.classList.add("enemy2");
    enemyType = "enemy2";
  } else if (utils.getRandom(0, 3) === 3) {
    enemy.classList.add("boss");
    enemyType = "boss";
  }
  const enemySizes = {
    enemy: { w: 32, h: 32 },
    enemy2: { w: 42, h: 42 },
    boss: { w: 230, h: 127 },
  };
  const posLeft = utils.getRandom(32, sizes.frameWidth - 64);
  const posRight = posLeft + enemySizes[enemyType].w;
  const posTop = (enemySizes[enemyType].h + 16) * -1;
  const posBottom = posTop + enemySizes[enemyType].h;
  enemy.dataset.posLeft = posLeft;
  enemy.dataset.posRight = posRight;
  enemy.dataset.posTop = posTop;
  enemy.dataset.posBottom = posBottom;
  enemy.dataset.height = enemySizes[enemyType].h;
  utils.setPos(enemy, {
    t: posTop,
    l: posLeft,
  });
  ui.frame.append(enemy);
}

function shoot() {
  if (!game.playing) return;
  const playerPosL = utils.getPos(ui.player).l;
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  ui.frame.append(bullet);
  const bulletSize = utils.getSize(bullet);
  utils.setPos(bullet, {
    l: playerPosL + utils.getSize(ui.player).w / 2 - bulletSize.w / 2,
    b: 46,
  });
}

// document.addEventListener("keyup", (e) => {
//   const posL = utils.getPos(ui.player).l;

//   if (e.key === "ArrowLeft") {
//     if (posL > 48) {
//       utils.setPos(ui.player, { l: posL - 32 });
//     } else {
//       utils.setPos(ui.player, { l: 0 });
//     }
//   }
//   if (e.key === "ArrowRight") {
//     if (posL + 128 >= sizes.frameWidth) {
//       utils.setPos(ui.player, { l: sizes.frameWidth - 64 });
//     } else {
//       utils.setPos(ui.player, { l: posL + 32 });
//     }
//   }
// });

setInterval(() => {
  if (!game.playing) return;
  const playerPos = utils.getPos(ui.player);
  ui.enemies = document.querySelectorAll(".enemy");
  ui.bullets = document.querySelectorAll(".bullet");
  ui.enemies.forEach((e) => {
    const pos = utils.getPos(e);
    if (pos.t > sizes.frameHeight) {
      e.remove();
    } else {
      const newPosTop = pos.t + 2;
      utils.setPos(e, { t: newPosTop });
      e.dataset.posTop = newPosTop;
      e.dataset.posBottom = newPosTop + Number(e.dataset.height);
      if (
        playerPos.l < Number(e.dataset.posRight) &&
        playerPos.l > pos.l &&
        playerPos.t > e.dataset.posBottom &&
        playerPos.t < pos.t
      ) {
        game.playing = false;
      }
    }
  });
  ui.bullets.forEach((b) => {
    const pos = utils.getPos(b);
    if (pos.t <= 8) {
      b.remove();
    } else {
      utils.setPos(b, { t: pos.t - stats.shotSpeed });
    }

    let bulletExists = true;
    ui.enemies.forEach((e) => {
      if (!bulletExists) return;
      if (
        pos.t < e.dataset.posBottom - e.dataset.height / 4 &&
        pos.l + 8 > e.dataset.posLeft &&
        pos.l < e.dataset.posRight &&
        pos.t > e.dataset.posTop
      ) {
        e.classList.add("exploding");
        // console.log("Touch at : " + pos.t + " / " + e.dataset.posBottom);
        setTimeout(() => {
          e.remove();
        }, 500);
        bulletExists = false;
        b.remove();
      }
    });
  });

  const backgroundPos = Number(
    window.getComputedStyle(ui.frame).backgroundPositionY.split("px")[0]
  );
  if (backgroundPos > 1024) {
    ui.frame.style.backgroundPositionY = "0px";
  } else {
    ui.frame.style.backgroundPositionY = backgroundPos + 0.5 + "px";
  }
}, 16);

// setInterval(() => {
//   if (!game.playing) return;
//   dev.playerPos.innerText = utils.getPos(ui.player).l;
//   dev.enemiesCount.innerText = ui.enemies.length;
//   dev.bulletsCount.innerText = ui.bullets.length;
// }, 250);

document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    game.playing = !game.playing;
  }
});

setInterval(() => {
  if (!game.playing) return;
  const rand = utils.getRandom(0, 3);
  if (rand === 1) {
    spawn();
  } else if (rand === 2) {
    setTimeout(() => {
      spawn();
    }, 720);
  } else if (rand === 3)
    setTimeout(() => {
      spawn();
    }, 1185);
}, 1000);

document.addEventListener("keyup", (e) => {
  if (e.key === "a") {
    shoot();
  }
});

document.addEventListener("mousemove", (e) => {
  if (e.screenX < sizes.frameWidth) {
    utils.setPos(ui.player, { l: e.screenX - 32 });
  }
});

document.addEventListener("click", (e) => {
  shoot();
});

ui.menu.addEventListener('click', e => {
    if (e.target.classList.contains('startGame')) {
        setTimeout(() => {
            game.playing = true;
        }, 500);
        ui.menu.classList.add('hidden')
    }
})