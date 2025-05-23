let points = 0;
let autoClickPower = 1;

const mameImage = document.getElementById('mame-image');
const upgradeButton = document.getElementById('upgrade-button');
const pointsDisplay = document.getElementById('points-display');

// 画像クリックでポイント加算
mameImage.addEventListener('click', () => {
  points++;
  updateDisplay();

  // アニメーション効果
  mameImage.classList.add('clicked');
  setTimeout(() => {
    mameImage.classList.remove('clicked');
  }, 100);
});

upgradeButton.addEventListener('click', () => {
  if (points >= 100) {
    points -= 100;
    autoClickPower += 1;
    updateDisplay();
    alert(`オート加算量が +1 されました！ 現在: ${autoClickPower}/秒`);
  } else {
    alert('アップグレードには100豆が必要です');
  }
});

function updateDisplay() {
  pointsDisplay.textContent = `豆: ${points}`;
}

// 自動加算
setInterval(() => {
  points += autoClickPower;
  updateDisplay();
}, 1000);

// アニメーション
//
//

const canvas = document.getElementById('bean-canvas');
const ctx = canvas.getContext('2d');
const beans = [];
const MAX_BEANS = 100;

// const mameImage = document.getElementById('mame-image');
// const upgradeButton = document.getElementById('upgrade-button');
// const pointsDisplay = document.getElementById('points-display');

// 豆画像（Canvas用）
const beanImage = new Image();
beanImage.src = mameImageSrc;

mameImage.addEventListener('click', () => {
  points++;
  updateDisplay();
  mameImage.classList.add('clicked');
  setTimeout(() => mameImage.classList.remove('clicked'), 100);
  addAnimatedBean();
});

function addAnimatedBean() {
  if (beans.length >= MAX_BEANS) beans.shift();
  beans.push({
    x: Math.random() * canvas.width,
    y: canvas.height,
    vy: -2 - Math.random() * 2,
    alpha: 1.0
  });
}

function animateBeans() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  beans.forEach(bean => {
    bean.y += bean.vy;
    bean.alpha -= 0.01;
  });

  for (let i = beans.length - 1; i >= 0; i--) {
    if (beans[i].alpha <= 0) beans.splice(i, 1);
  }

  beans.forEach(bean => {
    ctx.globalAlpha = bean.alpha;
    ctx.drawImage(beanImage, bean.x - 8, bean.y - 8, 16, 16);
  });
  ctx.globalAlpha = 1.0;

  requestAnimationFrame(animateBeans);
}

function updateDisplay() {
  pointsDisplay.textContent = `豆: ${points}`;
}

animateBeans();