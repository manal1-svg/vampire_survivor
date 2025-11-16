/**
 * Classe Obstacle
 * C'est un objet simple et STATIQUE.
 * Il n'hérite PAS de Vehicle car il ne bouge pas.
 * Il a juste une position et un rayon pour que les 'Vehicles'
 * puissent l'éviter.
 */
class Obstacle {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.img = null;

    // Choisit une image d'obstacle aléatoire
    if (window.gameState && window.gameState.images.obstacles) {
      let obstacleImages = window.gameState.images.obstacles;
      if (obstacleImages.length > 0) this.img = random(obstacleImages);
    }
  }

  // Affichage
  show() {
    if (this.img) {
      push();
      imageMode(CENTER);
      image(this.img, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
      pop();
    } else {
      // Forme de secours (rocher gris)
      fill(90, 70, 60);
      stroke(60);
      strokeWeight(3);
      ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
  }
}