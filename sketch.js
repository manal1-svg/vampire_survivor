/**
 * =============================================
 *  MAIN.JS 
 *  Auteur : Ejjebli Manal
 *  Date   : 16 novembre 2025
 *  Description : Jeu de tir top-down avec joueur, ennemis, serpents,
 *                obstacles, XP, niveaux, et système de mort/replay.
 * =============================================
 */

// =============================================
// ÉTAT GLOBAL DU JEU
// =============================================
let gameState = {
  player: null,           // Instance du joueur
  enemies: [],            // Liste des ennemis vivants/morts
  bullets: [],            // Projectiles tirés par le joueur
  obstacles: [],          // Rochers, arbres, etc.
  snakes: [],             // Serpents (ennemis composés de segments)
  xpOrbs: [],             // Orbes d'expérience collectables
  gameRunning: true,      // Indique si la partie est active
  canShoot: true,         // Contrôle du taux de tir
  frameCount: 0,          // Compteur de frames pour les spawns
  deathTimer: 0,          // Délai avant affichage du Game Over
  replayButton: null,     // Bouton HTML "Rejouer"
  images: {
    enemies: {
      attack: [],         // Animations d'attaque des ennemis
      dead: []            // Animations de mort
    }
  }
};

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

// --- Découpe une feuille de sprites en images individuelles ---
function sliceSpriteSheet(sheet, frameWidth, frameHeight, frames) {
  let images = [];
  for (let frame of frames) {
    let img = sheet.get(frame.x, frame.y, frameWidth, frameHeight);
    images.push(img);
  }
  return images;
}

// --- Supprime l'arrière-plan d'une image (transparence) ---
function removeBackground(img, bgColor = {r:255, g:255, b:255}, threshold = 60) {
  if (!img || !img.pixels) return img;

  img.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    const r = img.pixels[i];
    const g = img.pixels[i + 1];
    const b = img.pixels[i + 2];
    const distance = Math.sqrt(
      (r - bgColor.r)**2 + (g - bgColor.g)**2 + (b - bgColor.b)**2
    );
    if (distance <= threshold) {
      img.pixels[i + 3] = 0; // Alpha = 0 → transparent
    }
  }
  img.updatePixels();
  return img;
}

// Expose l'état global pour debug ou modules externes
window.gameState = gameState;
console.log('main.js module evaluated — registering p5 lifecycle functions (preload/setup/draw)');

// =============================================
// PRELOAD — Chargement des assets
// =============================================
window.preload = function() {
  console.log('=== PRELOAD START ===');
  try {
    // --- Joueur ---
    gameState.images.player = loadImage('assets/player.png');
    console.log('✓ Player image loaded');

    gameState.images.playerDead = loadImage('assets/player_x.png');
    console.log('✓ Dead player image loaded');

    // --- Projectiles ---
    window.imgBullet = loadImage('assets/bullets.png');
    console.log('✓ Bullet image loaded');

    // --- Orbes d'XP ---
    gameState.images.xp = loadImage('assets/xp.png');
    gameState.images.xp2 = loadImage('assets/xp2.png');
    console.log('✓ XP orb images loaded');

    // --- Obstacles ---
    gameState.images.obstacles = [
      loadImage('assets/sprites by CornerLord/spr_big_rock_0.png'),
      loadImage('assets/sprites by CornerLord/spr_spruce_0.png'),
      loadImage('assets/sprites by CornerLord/spr_tree_0.png')
    ];
    console.log('✓ Obstacle images loaded');

    // --- Ennemis (animations) ---
    for (let i = 1; i <= 8; i++) {
      const img = loadImage(`assets/png/female/Attack (${i}).png`);
      gameState.images.enemies.attack.push(img);
    }
    for (let i = 1; i <= 12; i++) {
      const img = loadImage(`assets/png/female/Dead (${i}).png`);
      gameState.images.enemies.dead.push(img);
    }
    console.log(`✓ Loaded ${gameState.images.enemies.attack.length} enemy attack frames.`);
    console.log(`✓ Loaded ${gameState.images.enemies.dead.length} enemy dead frames.`);

    // --- Serpents (nouveaux ennemis modulaires) ---
    gameState.images.snake = {};
    gameState.images.snake.head = loadImage('assets/PixelSnakes/snake-head.png');
    gameState.images.snake.body = loadImage('assets/PixelSnakes/body.jpg');
    gameState.images.snake.tail = loadImage('assets/PixelSnakes/snake-tail.png');
    console.log('✓ Snake head, body, and tail images loaded');

  } catch (e) {
    console.error('⚠️ Error during preload:', e.message);
  }
};

// =============================================
// INITIALISATION DU JEU
// =============================================
function initializeGame() {
  console.log('--- INITIALIZING GAME ---');
  let g = gameState;

  // Réinitialise le joueur au centre
  g.player = new Player(width / 2, height / 2);

  // Vide toutes les listes
  g.enemies = [];
  g.bullets = [];
  g.obstacles = [];
  g.snakes = [];
  g.xpOrbs = [];

  // Réinitialise les variables de contrôle
  g.gameRunning = true;
  g.canShoot = true;
  g.frameCount = 0;
  g.deathTimer = 0;

  // --- Création des obstacles ---
  for (let i = 0; i < 8; i++) {
    g.obstacles.push(new Obstacle(
      random(100, width - 100),
      random(100, height - 100),
      random(30, 60)
    ));
  }
  console.log('✓ Obstacles created:', g.obstacles.length);

  // --- Spawn initial des ennemis ---
  for (let i = 0; i < 8; i++) {
    g.enemies.push(new Enemy(random(50, width - 50), random(50, height - 50)));
  }
  console.log('✓ Enemies created:', g.enemies.length);

  console.log('✓ Game initialized');
}

// --- Fonction appelée par le bouton "Rejouer" ---
function resetGame() {
  console.log('REPLAYING GAME');
  if (gameState.replayButton) {
    gameState.replayButton.style('display', 'none');
  }
  initializeGame();
}

// =============================================
// SETUP — Configuration initiale de p5.js
// =============================================
window.setup = function() {
  console.log('=== SETUP START ===');
  createCanvas(1000, 700);
  console.log('✓ Canvas created');

  // --- Bouton HTML "Rejouer" ---
  gameState.replayButton = select('#replay-button');
  if (gameState.replayButton) {
    gameState.replayButton.mousePressed(resetGame);
    gameState.replayButton.style('display', 'none'); // Caché au démarrage
    console.log('✓ Replay button selected and event attached.');
  } else {
    console.warn('Could not find #replay-button in DOM.');
  }

  // --- Traitement des images (suppression fond) ---
  console.log('Processing loaded images for transparency...');
  try {
    // Joueur
    if (gameState.images.player) {
      removeBackground(gameState.images.player, {r:255,g:255,b:255}, 60);
      console.log('✓ Background removed from player image.');
    }
    if (gameState.images.playerDead) {
      removeBackground(gameState.images.playerDead, {r:0,g:0,b:0}, 60);
      console.log('✓ Background removed from dead player image.');
    }

    // Ennemis
    gameState.images.enemies.attack.forEach(img => removeBackground(img, {r:0,g:0,b:0}, 30));
    gameState.images.enemies.dead.forEach(img => removeBackground(img, {r:0,g:0,b:0}, 30));
    console.log('✓ Background removed from enemy animations.');

    // Serpents
    if (gameState.images.snake?.head) {
      removeBackground(gameState.images.snake.head, {r:255,g:255,b:255}, 120);
      console.log('✓ Background removed from snake head (threshold 120).');
    }
    if (gameState.images.snake?.tail) {
      removeBackground(gameState.images.snake.tail, {r:255,g:255,b:255}, 60);
      console.log('✓ Background removed from snake tail.');
    }
    // Le corps est en JPG → fond non supprimé automatiquement

  } catch (e) {
    console.error('Error processing images in setup:', e);
  }

  // --- Démarrage du jeu ---
  initializeGame();
  console.log('✓ Setup complete');
};

// =============================================
// DRAW — Boucle principale (60 FPS)
// =============================================
window.draw = function() {
  try {
    let g = gameState;
    background(20, 25, 40); // Fond sombre

    // --- Gestion de la mort du joueur ---
    if (g.player.health <= 0) {
      g.player.alive = false;
      if (g.gameRunning) g.gameRunning = false;
      g.deathTimer++;
    }

    // === BOUCLE PRINCIPALE (si jeu actif) ===
    if (g.gameRunning) {
      g.frameCount++;

      // --- Mouvement du joueur (WASD ou flèches) ---
      if (keyIsDown(37) || keyIsDown(65)) g.player.applyForce(createVector(-4, 0)); // Gauche / A
      if (keyIsDown(39) || keyIsDown(68)) g.player.applyForce(createVector(4, 0));  // Droite / D
      if (keyIsDown(38) || keyIsDown(87)) g.player.applyForce(createVector(0, -4)); // Haut / W
      if (keyIsDown(40) || keyIsDown(83)) g.player.applyForce(createVector(0, 4));  // Bas / S

      // Mise à jour du joueur (avec collisions obstacles)
      g.player.update(g.obstacles);
      g.player.boundaries(width, height);

      // --- Affichage des obstacles ---
      g.obstacles.forEach(obs => obs.show());

      // --- Mise à jour des projectiles ---
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        let b = g.bullets[i];
        if (!b?.alive || b.isOffScreen()) {
          g.bullets.splice(i, 1);
          continue;
        }
        b.update();
        b.show();

        // Collision bullet → ennemi
        for (let j = g.enemies.length - 1; j >= 0; j--) {
          let e = g.enemies[j];
          if (e?.alive && collide(b, e)) {
            e.hit();
            b.alive = false;
            if (!e.alive) {
              // Drop 3 orbes XP autour du corps
              for (let k = 0; k < 3; k++) {
                let angle = (TWO_PI / 3) * k;
                let x = e.pos.x + cos(angle) * 30;
                let y = e.pos.y + sin(angle) * 30;
                g.xpOrbs.push(new XPOrb(x, y, 10, 'xp'));
              }
            }
            break;
          }
        }

        // Collision bullet → serpent
        if (b.alive) {
          for (let s of g.snakes) {
            for (let seg of s.segments) {
              if (seg?.alive && collide(b, seg)) {
                seg.hit();
                b.alive = false;
                if (!seg.alive) {
                  for (let k = 0; k < 2; k++) {
                    let angle = (TWO_PI / 2) * k;
                    let x = seg.pos.x + cos(angle) * 25;
                    let y = seg.pos.y + sin(angle) * 25;
                    g.xpOrbs.push(new XPOrb(x, y, 8, 'xp2'));
                  }
                }
                break;
              }
            }
          }
        }
      }

      // --- Mise à jour des ennemis ---
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        let e = g.enemies[i];
        if (!e) {
          g.enemies.splice(i, 1);
          continue;
        }
        if (e.alive) {
          e.behaviors(g.player, g.enemies, g.obstacles);
          e.update();
          e.boundaries(width, height);
          if (collide(e, g.player)) g.player.takeDamage(0.1);
        } else {
          e.deathFrameCount++;
          if (e.deathFrameCount >= g.images.enemies.dead.length * e.animationSpeed) {
            g.enemies.splice(i, 1);
            continue;
          }
        }
        e.show();
      }

      // --- Mise à jour des serpents ---
      for (let i = g.snakes.length - 1; i >= 0; i--) {
        let s = g.snakes[i];
        if (!s) {
          g.snakes.splice(i, 1);
          continue;
        }
        s.update(g.player, g.obstacles);
        s.show();
        if (s.isDead()) g.snakes.splice(i, 1);
      }

      // --- Mise à jour des orbes XP ---
      for (let i = g.xpOrbs.length - 1; i >= 0; i--) {
        let orb = g.xpOrbs[i];
        if (!orb) continue;
        orb.update(g.player);
        orb.show();
        if (orb.collected) {
          orb.type === 'xp2' ? g.player.gainXP2(orb.amount) : g.player.gainXP(orb.amount);
          g.xpOrbs.splice(i, 1);
        }
      }

      // --- Spawn progressif des ennemis ---
      if (g.frameCount % 120 === 0 && g.enemies.filter(e => e.alive).length < 80) {
        g.enemies.push(new Enemy(random(50, width - 50), random(50, height - 50)));
      }

      // --- Spawn des serpents (max 3) ---
      if (g.frameCount % 300 === 0 && g.snakes.length < 3) {
        g.snakes.push(new Snake(random(100, width - 100), random(100, height - 100), g.player));
      }

    } else {
      // --- Jeu terminé : afficher les éléments statiques ---
      g.obstacles.forEach(obs => obs.show());
      g.enemies.forEach(e => e.show());
      g.snakes.forEach(s => s.show());
    }

    // --- Affichage du joueur (vivant ou mort) ---
    g.player.show();

    // =============================================
    // INTERFACE UTILISATEUR (UI)
    // =============================================

    // --- Infos en haut à gauche ---
    fill(0, 255, 0);
    textSize(18);
    textStyle(BOLD);
    textAlign(LEFT, BASELINE);
    text(`LEVEL: ${g.player.level}`, 20, 30);
    text(`XP: ${g.player.xp}/${g.player.xpToNext}`, 20, 55);
    text(`XP2: ${g.player.xp2}`, 20, 80);
    text(`ENEMIES: ${g.enemies.filter(e => e.alive).length}`, 20, 105);
    text(`SNAKES: ${g.snakes.length}`, 20, 130);

    // --- Barre de vie centrée en haut ---
    const maxHealth = 100;
    const barW = 300, barH = 25;
    const barX = (width / 2) - (barW / 2), barY = 20;

    // Fond sombre
    noStroke();
    fill(50);
    rect(barX, barY, barW, barH, 5);

    // Barre de vie
    let healthWidth = map(g.player.health, 0, maxHealth, 0, barW);
    healthWidth = constrain(healthWidth, 0, barW);
    fill(g.player.health > 25 ? [0, 255, 0] : [255, 50, 50]);
    rect(barX, barY, healthWidth, barH, 5);

    // Bordure
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(barX, barY, barW, barH, 5);

    // Texte de vie
    noStroke();
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(`${max(0, g.player.health).toFixed(0)} / ${maxHealth}`, width / 2, barY + barH / 2);

    // --- Contrôles en bas à gauche ---
    textAlign(LEFT, BASELINE);
    fill(255, 200, 0);
    textSize(14);
    textStyle(NORMAL);
    text(`Move: WASD/Arrows | Shoot: Click`, 20, height - 20);

    // =============================================
    // ÉCRAN DE GAME OVER
    // =============================================
    if (!g.gameRunning && g.deathTimer > 60) {
      // Fond sombre semi-transparent
      fill(0, 0, 0, 200);
      rect(0, 0, width, height);

      // Titre
      textAlign(CENTER, CENTER);
      textSize(80);
      fill(255, 50, 50);
      textStyle(BOLD);
      text("GAME OVER", width / 2, height / 2 - 40);

      // Niveau atteint
      textSize(30);
      fill(255);
      text(`Level Reached: ${g.player.level}`, width / 2, height / 2 + 30);

      // Afficher le bouton rejouer
      if (g.replayButton) {
        g.replayButton.style('display', 'block');
      }
    }

  } catch (err) {
    console.error('Error in draw loop:', err);
  }
};

// =============================================
// TIR AU CLICK (avec spread de 3 balles)
// =============================================
window.mousePressed = function() {
  let g = gameState;

  if (
    g.gameRunning &&
    g.canShoot &&
    mouseX > 0 && mouseX < width &&
    mouseY > 0 && mouseY < height
  ) {
    let angle = atan2(mouseY - g.player.pos.y, mouseX - g.player.pos.x);
    const spread = PI / 5;  // Angle total du cône de tir
    const n = 3;           // Nombre de balles

    for (let i = 0; i < n; i++) {
      let a = angle - spread / 2 + (spread * i) / (n - 1);
      g.bullets.push(new Bullet(g.player.pos.x, g.player.pos.y, a));
    }

    // Limite de tir : 160ms entre chaque salve
    g.canShoot = false;
    setTimeout(() => g.canShoot = true, 160);
  }
};

// =============================================
// EXPORT POUR DEBUG / MODULES
// =============================================
window.enemies = gameState.enemies;
window.bullets = gameState.bullets;
window.xpOrbs = gameState.xpOrbs;

console.log('main.js — Fully loaded and commented.');