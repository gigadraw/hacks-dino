(function () {
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
      display: none;
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
    #hackMenu input {
      width: 100%;
      padding: 5px;
      margin-top: 5px;
      border: 1px solid #0f0;
      border-radius: 5px;
      background: #000;
      color: #0f0;
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
    <button onclick="fireBullet()">🔫 Súng F</button>
    <button onclick="toggleFlyHack()">🦋 Bay bằng WASD</button>
    <input type="number" id="pointInput" placeholder="Số điểm cần thêm" />
    <button onclick="addPoints()">➕ Thêm điểm</button>
  `;
  document.body.appendChild(menu);

  const icon = document.createElement("div");
  icon.id = "hackIcon";
  icon.innerHTML = "⚙️";
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

  icon.addEventListener("click", function () {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  // ===== Auto Jump =====
  let autoJumpID = 0;
  window.autoJump = function () {
    const jumpSpeed = 50;
    const distBeforeJump = 120;
    const instance = window.Runner.instance_;
    const tRex = instance.tRex;
    const tRexPos = tRex.xPos;
    const obstacles = instance.horizon.obstacles;
    if (tRex.jumping || tRex.ducking) return requestAnimationFrame(autoJump);
    const nextObstacle = obstacles.find(o => o.xPos > tRexPos);
    if (nextObstacle && (nextObstacle.xPos - tRexPos) <= distBeforeJump) {
      tRex.startJump(jumpSpeed);
    }
    requestAnimationFrame(autoJump);
  };
  window.toggleAutoJump = function () {
    if (autoJumpID) {
      clearInterval(autoJumpID);
      autoJumpID = 0;
    } else {
      autoJump();
    }
  };

  // ===== Firework Jump =====
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

  window.addPoints = function () {
    const points = parseInt(document.getElementById("pointInput").value, 10);
    const r = Runner.instance_;
    if (!isNaN(points) && points > 0) {
      r.distanceRan += points;
      r.distanceMeter.digits = ('' + Math.floor(r.distanceRan)).padStart(5, '0').split('');
      r.distanceMeter.update(0, Math.floor(r.distanceRan));
    }
  };

  // ===== SÚNG F GỐC =====
  const bullets = [];
  function fireBullet() {
    const rex = Runner.instance_.tRex;
    const bullet = {
      x: rex.xPos + 44,
      y: rex.yPos + 20,
      width: 10,
      height: 5,
      speed: 15,
      el: document.createElement("div")
    };
    bullet.el.style.position = "absolute";
    bullet.el.style.width = bullet.width + "px";
    bullet.el.style.height = bullet.height + "px";
    bullet.el.style.background = "red";
    bullet.el.style.left = bullet.x + "px";
    bullet.el.style.top = bullet.y + "px";
    document.body.appendChild(bullet.el);
    bullets.push(bullet);
  }
  window.fireBullet = fireBullet;

  function moveBullets() {
    const obstacles = Runner.instance_.horizon.obstacles;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.speed;
      b.el.style.left = b.x + "px";
      if (b.x > innerWidth) {
        b.el.remove();
        bullets.splice(i, 1);
        continue;
      }
      for (let j = 0; j < obstacles.length; j++) {
        const o = obstacles[j];
        if (b.x + b.width > o.xPos && b.x < o.xPos + o.width) {
          obstacles.splice(j, 1);
          b.el.remove();
          bullets.splice(i, 1);
          break;
        }
      }
    }
    requestAnimationFrame(moveBullets);
  }
  moveBullets();
  document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "f") fireBullet();
  });

  // ===== BAY BẰNG WASD =====
  let flyEnabled = false;
  let keyState = { w: false, s: false, a: false, d: false };
  let flyLoopID = null;
  const tRex = Runner.instance_.tRex;
  const gravityBackup = tRex.config.GRAVITY;

  function flyLoop() {
    if (!flyEnabled) return;
    if (keyState.w) tRex.yPos -= 5;
    if (keyState.s) tRex.yPos += 5;
    if (keyState.a) tRex.xPos -= 5;
    if (keyState.d) tRex.xPos += 5;
    tRex.update(0);
    flyLoopID = requestAnimationFrame(flyLoop);
  }

  window.toggleFlyHack = function () {
    if (flyEnabled) {
      flyEnabled = false;
      tRex.config.GRAVITY = gravityBackup;
      cancelAnimationFrame(flyLoopID);
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("keyup", keyUpHandler);
      document.removeEventListener("keydown", preventJump);
    } else {
      flyEnabled = true;
      tRex.config.GRAVITY = 0;
      document.addEventListener("keydown", keyHandler);
      document.addEventListener("keyup", keyUpHandler);
      document.addEventListener("keydown", preventJump);
      flyLoop();
    }
  };

  function keyHandler(e) {
    if (e.key.toLowerCase() === "w") keyState.w = true;
    if (e.key.toLowerCase() === "s") keyState.s = true;
    if (e.key.toLowerCase() === "a") keyState.a = true;
    if (e.key.toLowerCase() === "d") keyState.d = true;
  }

  function keyUpHandler(e) {
    if (e.key.toLowerCase() === "w") keyState.w = false;
    if (e.key.toLowerCase() === "s") keyState.s = false;
    if (e.key.toLowerCase() === "a") keyState.a = false;
    if (e.key.toLowerCase() === "d") keyState.d = false;
  }

  function preventJump(e) {
    if (e.key === " ") e.preventDefault();
  }
})();
