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
  `;
  document.body.appendChild(menu);

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
