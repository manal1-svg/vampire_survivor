// Classe Enemy : représente un ennemi autonome avec IA simple (seek + avoid + separation)
class Enemy extends Vehicle {
  constructor(x, y) {
    // J'utilise la classe Vehicle comme base (position, vitesse, forces)
    super(x, y, 16);

    // Vitesse max légèrement randomisée pour donner un comportement plus naturel
    this.maxSpeed = random(1.4, 2.4);
    this.maxForce = 0.12;

    // L'ennemi possède 2 points de vie
    this.health = 2;
    this.alive = true;

    // Paramètres d’animation
    this.animationSpeed = 4;
    this.deathFrameCount = 0;

    // Direction affichée (pour retourner le sprite)
    this.facingDirection = 1;
  }

  // Comportements : attraction vers le joueur + répulsion des autres + évitement des obstacles
  behaviors(player, others, obstacles) {
    // 1) Seek : l’ennemi cherche activement le joueur
    let seek = this.seek(player.pos);
    seek.mult(1.4);
    this.applyForce(seek);

    // 2) Separation : éviter de se coller aux autres ennemis
    let separate = this.separate(others);
    separate.mult(1.7);
    this.applyForce(separate);

    // 3) Avoid : éviter les obstacles du décor
    let avoid = this.avoid(obstacles);
    avoid.mult(2.2);
    this.applyForce(avoid);
  }

  // Mise à jour du mouvement via la physique (héritée de Vehicle)
  update() {
    // Détecter la direction pour retourner le sprite
    if (this.vel.x > 0.1) this.facingDirection = 1;
    else if (this.vel.x < -0.1) this.facingDirection = -1;

    // Calcul physique
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  // Gestion des bords : wrap screen (l’ennemi réapparaît de l'autre côté)
  boundaries(w, h) {
    if (this.pos.x < -this.r) this.pos.x = w + this.r;
    if (this.pos.x > w + this.r) this.pos.x = -this.r;
    if (this.pos.y < -this.r) this.pos.y = h + this.r;
    if (this.pos.y > h + this.r) this.pos.y = -this.r;
  }

  // Lorsqu'il est touché, il perd 1 PV puis déclenche l’animation de mort
  hit() {
    if (!this.alive) return;

    this.health--;

    if (this.health <= 0) {
      this.alive = false;
      this.deathFrameCount = 0;
    }
  }

  // Affichage du sprite (animation marche/attaque + animation mort)
  show() {
    let g = window.gameState;

    push();
    translate(this.pos.x, this.pos.y);
    scale(this.facingDirection, 1);
    imageMode(CENTER);

    // Animation de mort
    if (!this.alive) {
      let deadFrames = g.images.enemies.dead;
      if (deadFrames?.length > 0) {
        let frameIndex = floor(this.deathFrameCount / this.animationSpeed);
        if (frameIndex < deadFrames.length) {
          image(deadFrames[frameIndex], 0, 0, 40, 40);
        }
      } else {
        ellipse(0, 0, 32);
      }

    // Animation normale (walk/attack)
    } else {
      let attackFrames = g.images.enemies.attack;
      if (attackFrames?.length > 0) {
        let frameIndex = floor(g.frameCount / this.animationSpeed) % attackFrames.length;
        image(attackFrames[frameIndex], 0, 0, 40, 40);
      } else {
        ellipse(0, 0, 32);
      }

      // Effet visuel quand l’ennemi a été touché (clignotement rouge)
      if (this.health === 1) {
        tint(255, 100);
        if (attackFrames?.length > 0) {
          let frameIndex = floor(g.frameCount / this.animationSpeed) % attackFrames.length;
          image(attackFrames[frameIndex], 0, 0, 40, 40);
        } else {
          ellipse(0, 0, 32);
        }
        noTint();
      }
    }

    pop();
  }
}