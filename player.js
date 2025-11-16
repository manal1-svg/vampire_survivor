/**
 * Classe Player (Joueur)
 * Hérite de Vehicle.
 * C'est le personnage contrôlé par le joueur.
 * Son mouvement est un mélange de :
 * 1. Commandes clavier (forces appliquées dans sketch.js)
 * 2. Comportement 'seek' vers la souris
 * 3. Comportement 'avoid' pour éviter les obstacles
 */
class Player extends Vehicle {
  constructor(x, y) {
    // Appelle le constructeur de Vehicle
    super(x, y, 12); 

    // Statistiques spécifiques au joueur
    this.maxSpeed = 10;
    this.maxForce = 1.0; // Force de direction élevée pour être réactif
    this.level = 1;
    this.xp = 0;
    this.xp2 = 0;
    this.xpToNext = 100;
    this.health = 100;
    this.shootAngle = 0; // Angle de tir (vers la souris)
    this.alive = true; 
  }

  // Surcharge de la méthode update() de Vehicle
  update(obstacles) { 
    // Vérifie si le joueur est mort
    if (this.health <= 0) this.alive = false;
    if (!this.alive) return; // Si mort, ne pas mettre à jour le mouvement

    // --- Application des forces de direction ---
    
    // 1. Force 'seek' vers la souris pour un léger "drift"
    let mousePos = createVector(mouseX, mouseY);
    let seek = this.seek(mousePos);
    this.applyForce(seek.mult(0.5)); // Force modérée

    // 2. Force 'avoid' pour éviter les obstacles
    let avoid = this.avoid(obstacles);
    avoid.mult(2.5); // Force d'évitement élevée
    this.applyForce(avoid);
    
    // Stocke l'angle vers la souris (utilisé pour le tir dans sketch.js)
    this.shootAngle = atan2(mouseY - this.pos.y, mouseX - this.pos.x);
    
    // --- Application de la physique (héritée de Vehicle) ---
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    
    // Ajout d'un "damping" (friction) pour que le joueur s'arrête
    this.vel.mult(0.95);  
    
    this.pos.add(this.vel);
    this.acc.mult(0); // Remise à zéro de l'accélération
  }

  // Surcharge de boundaries() pour le "wrapping"
  boundaries(w, h) {
    if (this.pos.x < -this.r) this.pos.x = w + this.r;
    if (this.pos.x > w + this.r) this.pos.x = -this.r;
    if (this.pos.y < -this.r) this.pos.y = h + this.r;
    if (this.pos.y > h + this.r) this.pos.y = -this.r;
  }

  // Logique de jeu : gagner de l'XP
  gainXP(n) {
    this.xp += n;
    if (this.xp >= this.xpToNext) {
      this.level++;
      this.xp = 0;
      this.xpToNext = floor(this.xpToNext * 1.5);
      this.maxSpeed += 0.35; // Le joueur devient plus rapide
    }
  }

  gainXP2(n) {
    this.xp2 += n;
  }

  // Logique de jeu : prendre des dégâts
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }

  // Surcharge de la méthode show() pour dessiner le joueur
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    imageMode(CENTER);
    
    const isDead = !this.alive || this.health <= 0;
    let imgToDraw;
    
    if (!isDead) {
      // --- Si VIVANT ---
      imgToDraw = window.gameState.images.player;
      
      // Oriente le sprite vers la souris (gauche/droite)
      if (mouseX < this.pos.x) {
        scale(-1, 1); // Inverse l'image horizontalement
      }
    } else {
      // --- Si MORT ---
      imgToDraw = window.gameState.images.playerDead;
      rotate(HALF_PI / 2); // Petite rotation pour l'effet
    }

    // Dessine l'image choisie
    if (imgToDraw) {
      image(imgToDraw, 0, 0, 70, 70);
    } else {
      // Dessin de secours si l'image n'est pas chargée
      fill(isDead ? color(255, 0, 0) : color(0, 255, 0));
      ellipse(0, 0, 40);
    }

    pop();
  }
}