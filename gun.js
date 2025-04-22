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

  function updateBullets() {
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
          obs.splice(j, 1); // Xoá khỏi danh sách => biến mất
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
  }

  updateBullets();
})();
