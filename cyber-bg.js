/**
 * Cyber Grid Canvas - Calm & Elegant Ambient Light Stream Engine
 * ・落ち着いた大人のサイバーエンジニアリング背景
 * ・同時に走る光はわずか2〜3本。間隔を空けて優雅に滑走
 * ・文字やカードの視認性を邪魔しない、極めて淡く上品なネオン発光
 * ・直角（90度）に静かに曲がる知的な回路ギミック
 * ・尾に向かって自然に細く薄く消えていくテーパード残像
 */
(function() {
  const canvas = document.getElementById('cyberCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const GRID_SIZE = 42; // グリッド間隔（少し広げてスッキリ落ち着かせる）
  let beams = [];
  const MAX_BEAMS = 3; // 同時に走るのは最大3本（引き算の美学）

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // 上品で眩しくないディープサイバーパレット（明度を抑え、背景に調和）
  const PALETTES = [
    { core: 'rgba(255, 255, 255, 0.65)', glow: '#0284c7', ambient: 'rgba(2, 132, 199, 0.09)' }, // アビスシアン
    { core: 'rgba(255, 255, 255, 0.60)', glow: '#0369a1', ambient: 'rgba(3, 105, 161, 0.07)' }, // ディープサファイア
    { core: 'rgba(255, 255, 255, 0.65)', glow: '#0d9488', ambient: 'rgba(13, 148, 136, 0.08)' }, // 落ち着いたエメラルドシアン
    { core: 'rgba(255, 255, 255, 0.60)', glow: '#d97706', ambient: 'rgba(217, 119, 6, 0.07)' }   // 静かなアンバーゴールド
  ];

  class CyberBeam {
    constructor(initialDelay = 0) {
      this.trail = [];
      this.delay = initialDelay;
      this.active = false;
      this.decaying = false;
      this.reset();
    }

    reset() {
      const gridCols = Math.floor(width / GRID_SIZE);
      const gridRows = Math.floor(height / GRID_SIZE);

      this.color = PALETTES[Math.floor(Math.random() * PALETTES.length)];

      // 速度：落ち着いた優雅な巡航スピード (3.2 ~ 4.8 px/frame)
      this.speed = Math.random() * 1.6 + 3.2;

      // 残像の長さ：長すぎず品のある長さ
      this.maxTrail = Math.floor(Math.random() * 10 + 20); // 20 ~ 30 ステップ
      this.trail = [];

      // 直角に曲がる確率（約40%）
      this.willTurn = Math.random() < 0.42;
      this.hasTurned = false;

      // スタート位置と方向 (0:右, 1:下, 2:左, 3:上)
      const startEdge = Math.floor(Math.random() * 4);
      if (startEdge === 0) { // 上から下
        this.x = (Math.floor(Math.random() * gridCols) + 0.5) * GRID_SIZE;
        this.y = -40;
        this.dir = 1;
        this.turnPoint = (Math.floor(Math.random() * (gridRows - 4)) + 2) * GRID_SIZE;
      } else if (startEdge === 1) { // 左から右
        this.x = -40;
        this.y = (Math.floor(Math.random() * gridRows) + 0.5) * GRID_SIZE;
        this.dir = 0;
        this.turnPoint = (Math.floor(Math.random() * (gridCols - 4)) + 2) * GRID_SIZE;
      } else if (startEdge === 2) { // 下から上
        this.x = (Math.floor(Math.random() * gridCols) + 0.5) * GRID_SIZE;
        this.y = height + 40;
        this.dir = 3;
        this.turnPoint = (Math.floor(Math.random() * (gridRows - 4)) + 2) * GRID_SIZE;
      } else { // 右から左
        this.x = width + 40;
        this.y = (Math.floor(Math.random() * gridRows) + 0.5) * GRID_SIZE;
        this.dir = 2;
        this.turnPoint = (Math.floor(Math.random() * (gridCols - 4)) + 2) * GRID_SIZE;
      }

      this.active = false;
      this.decaying = false;
      // 次の出走までの落ち着いたインターバル（約1秒〜3.5秒待機）
      this.delay = Math.floor(Math.random() * 120 + 60);
    }

    update() {
      // 待機カウントダウン
      if (this.delay > 0) {
        this.delay--;
        return;
      }
      this.active = true;

      if (!this.decaying) {
        this.trail.unshift({ x: this.x, y: this.y });

        // 直角ターン
        if (this.willTurn && !this.hasTurned) {
          if (this.dir === 0 && this.x >= this.turnPoint) {
            this.x = this.turnPoint;
            this.dir = Math.random() < 0.5 ? 1 : 3;
            this.hasTurned = true;
          } else if (this.dir === 1 && this.y >= this.turnPoint) {
            this.y = this.turnPoint;
            this.dir = Math.random() < 0.5 ? 0 : 2;
            this.hasTurned = true;
          } else if (this.dir === 2 && this.x <= this.turnPoint) {
            this.x = this.turnPoint;
            this.dir = Math.random() < 0.5 ? 1 : 3;
            this.hasTurned = true;
          } else if (this.dir === 3 && this.y <= this.turnPoint) {
            this.y = this.turnPoint;
            this.dir = Math.random() < 0.5 ? 0 : 2;
            this.hasTurned = true;
          }
        }

        // 移動
        if (this.dir === 0) this.x += this.speed;
        else if (this.dir === 1) this.y += this.speed;
        else if (this.dir === 2) this.x -= this.speed;
        else if (this.dir === 3) this.y -= this.speed;

        // 画面外判定
        if (this.x < -80 || this.x > width + 80 || this.y < -80 || this.y > height + 80) {
          this.decaying = true;
        }
      }

      // トレイル消化
      if (this.decaying) {
        this.trail.pop();
        if (this.trail.length === 0) {
          this.reset();
        }
      } else if (this.trail.length > this.maxTrail) {
        this.trail.pop();
      }
    }

    draw(ctx) {
      if (!this.active || this.trail.length < 2) return;

      const head = this.trail[0];

      // 1. 周囲をフワッと微かに照らす極めて穏やかなアンビエントグロー
      if (!this.decaying && head.x >= 0 && head.x <= width && head.y >= 0 && head.y <= height) {
        const glowRad = 20;
        const radialGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, glowRad);
        radialGlow.addColorStop(0, this.color.ambient);
        radialGlow.addColorStop(1, 'transparent');

        ctx.save();
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, glowRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. テーパード残像（細く薄く消えていく流麗ストローク）
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'miter';

      for (let i = 0; i < this.trail.length - 1; i++) {
        const p1 = this.trail[i];
        const p2 = this.trail[i + 1];

        const progress = i / this.trail.length; // 0 ~ 1
        // 全体の透明度を控えめ（最大0.45）に抑え、文字を邪魔しない
        const alpha = Math.pow(1 - progress, 2.0) * 0.45;
        // 先端2.0px → 尾0.5pxへと上品に細くなる
        const width = Math.max(0.4, (1 - progress) * 2.0);

        ctx.strokeStyle = this.color.glow;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = width;
        ctx.shadowColor = this.color.glow;
        ctx.shadowBlur = i < 3 ? 4 : 1;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 3. 先端の控えめな光点（眩しすぎないソフトな輝き）
      if (!this.decaying && head.x >= 0 && head.x <= width && head.y >= 0 && head.y <= height) {
        ctx.shadowColor = this.color.glow;
        ctx.shadowBlur = 4;
        ctx.fillStyle = this.color.core;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 3本のビームを適度な時間差で初期化
  beams = [
    new CyberBeam(10),
    new CyberBeam(100),
    new CyberBeam(220)
  ];

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < beams.length; i++) {
      beams[i].update();
      beams[i].draw(ctx);
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
