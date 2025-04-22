(function () {
  const bullets = [];
  const runner = Runner.instance_;
  const tRex = runner.tRex;
  const gameContainer = document.querySelector('.runner-container');

  const bulletStyle = document.createElement('style');
  bulletStyle.innerHTML = `
    .dino-bullet {
      position: fixed;
      width: 20px;
      height: 5px;
      background: red;
      z-index: 9999;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(bulletStyle);

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f') fireBullet();
  });

  function fireBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'dino-bullet';

    const top = gameContainer.getBoundingClientRect().top + tRex.yPos + 30;
    const left = gameContainer.getBoundingClientRect().left + tRex.xPos + 44;

    bullet.style.top = top + 'px';
    bullet.style.left = left + 'px';

    document.body.appendChild(bullet);
    bullets.push({ el: bullet, x: left, top });
  }

  // Make updateBullets globally accessible
  window.updateBullets = function () {
    const obs = runner.horizon.obstacles;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += 25;
      bullet.el.style.left = bullet.x + 'px';

      for (let j = obs.length - 1; j >= 0; j--) {
        const ob = obs[j];
        const obLeft = gameContainer.getBoundingClientRect().left + ob.xPos;
        const obRight = obLeft + ob.width;
        const obTop = gameContainer.getBoundingClientRect().top + ob.yPos;
        const obBottom = obTop + ob.typeConfig.height;

        if (
          bullet.x >= obLeft && bullet.x <= obRight &&
          bullet.top >= obTop && bullet.top <= obBottom
        ) {
          obs.splice(j, 1); // Remove obstacle
          bullet.el.remove();
          bullets.splice(i, 1);
          break;
        }
      }

      if (bullet.x > window.innerWidth) {
        bullet.el.remove();
        bullets.splice(i, 1);
      }
    }

    requestAnimationFrame(updateBullets);
  };

  const style = document.createElement("style");
  style.innerHTML = `
    #hackMenu {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 10px;
      border-radius: 10px;
      z-index: 9999;
      font-family: monospace;
      box-shadow: 0 0 10px #0f0;
      cursor: move;
      user-select: none;
      display: none; /* Hidden by default */
    }
    #hackMenu button {
      display: block;
      margin: 5px 0;
      padding: 5px 10px;
      background: #111;
      color: #0f0;
      border: 1px solid #0f0;
      border-radius: 5px;
      cursor: pointer;
    }
    #hackMenu button:hover {
      background: #0f0;
      color: #000;
    }
    #hackIcon {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #0f0;
      color: black;
      padding: 15px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 24px;
      font-family: monospace;
      z-index: 10000;
      box-shadow: 0 0 10px #0f0;
    }
  `;
  document.head.appendChild(style);

  const menu = document.createElement("div");
  menu.id = "hackMenu";
  menu.innerHTML = `
    <div><strong>🦖 Dino Hack Menu</strong></div>
    <button onclick="Runner.instance_.gameOver = () => {}">🛡️ Bật Bất Tử</button>
    <button onclick="Runner.instance_.gameOver = Runner.prototype.gameOver">❌ Tắt Bất Tử</button>
    <button onclick="Runner.instance_.setSpeed(1000)">⚡ Max Speed</button>
    <button onclick="Runner.instance_.setSpeed(10)">🐢 Slow Motion</button>
    <button onclick="Runner.instance_.horizon.obstacles = []">🧹 Xoá chướng ngại</button>
    <button onclick="Runner.instance_.gameOver()">💀 Tự thua</button>
    <button onclick="Runner.instance_.playingIntro = true">🧊 Đứng im</button>
    <button onclick="Runner.instance_.playingIntro = false">🏃 Tiếp tục chạy</button>
    <button onclick="activateFireworkJump()">🎇 Bật Nhảy Pháo Hoa</button>
    <button onclick="Runner.instance_.tRex.config.WIDTH = 88">🦖 Khủng long có ny</button>
    <button onclick="randomBackgroundColor()">🎨 Đổi nền màu ngẫu nhiên</button>
    <button onclick="toggleAutoJump()">🕹️ Bật Nhảy Tự Động</button>
    <button onclick="updateBullets()">🔫 Súng F</button>
  `;
  document.body.appendChild(menu);

  // Create the hack icon
  const icon = document.createElement("div");
  icon.id = "hackIcon";
  icon.innerHTML = "⚙️"; // Gear icon for the hack menu
  document.body.appendChild(icon);

  let isDragging = false, offsetX = 0, offsetY = 0;
  menu.addEventListener("mousedown", function (e) {
    isDragging = true;
    offsetX = e.clientX - menu.offsetLeft;
    offsetY = e.clientY - menu.offsetTop;
  });
  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      menu.style.left = e.clientX - offsetX + "px";
      menu.style.top = e.clientY - offsetY + "px";
      menu.style.right = "auto";
    }
  });
  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  // Toggle the visibility of the hack menu
  icon.addEventListener("click", function () {
    const isMenuVisible = menu.style.display === "block";
    menu.style.display = isMenuVisible ? "none" : "block";
  });

  window.autoJumpID = 0;
  window.autoJump = function () {
    const jumpSpeed = 50;
    const distBeforeJump = 120;
    const instance = window.Runner.instance_;
    const tRex = instance.tRex;
    const tRexPos = tRex.xPos;
    const obstacles = instance.horizon.obstacles;

    // Check if the T-Rex is in the air (already jumped)
    if (tRex.jumping || tRex.ducking) {
      requestAnimationFrame(autoJump);
      return;
    }

    // Find the next obstacle ahead of the T-Rex
    const nextObstacle = obstacles.find(o => o.xPos > tRexPos);

    if (nextObstacle && (nextObstacle.xPos - tRexPos) <= distBeforeJump) {
      // Start the jump if the obstacle is within the jump distance
      tRex.startJump(jumpSpeed);
    }

    requestAnimationFrame(autoJump);
  };

  window.activateFireworkJump = function () {
    const trex = Runner.instance_.tRex;
    if (!trex.__originalJump) {
      trex.__originalJump = trex.startJump;
      trex.startJump = new Proxy(trex.__originalJump, {
        apply(target, thisArg, args) {
          document.body.style.background = `hsl(${Math.random() * 360}, 100%, 10%)`;
          return Reflect.apply(target, thisArg, args);
        }
      });
    }
  };

  window.randomBackgroundColor = function () {
    document.body.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  };

  window.toggleAutoJump = function () {
    if (autoJumpID) {
      clearInterval(autoJumpID);
      autoJumpID = 0;
      console.log("🛑 Auto Jump: OFF");
    } else {
      autoJump();
      console.log("✅ Auto Jump: ON");
    }
  };
})();
