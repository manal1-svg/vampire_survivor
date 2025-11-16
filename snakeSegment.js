/**
 * Classe SnakeSegment (Segment de Serpent)
 * Hérite de Vehicle.
 * C'est UNE SEULE partie du corps du serpent.
 * La classe 'Snake' (ci-dessous) gère une LISTE de ces segments.
 */
class SnakeSegment extends Vehicle {
  constructor(x, y, isHead = false) {
    // Rayon plus petit pour la hitbox
    super(x, y, isHead ? 8 : 6); 
    this.isHead = isHead;
    this.maxSpeed = 3.5;
    this.maxForce = 0.2;
    this.health = isHead ? 5 : 2; // La tête a plus de vie
    this.alive = true;
    
    // Pour l'animation
    this.deathFrame = 0;
    this.animationSpeed = 6;
    this.isGone = false; 
  }

  // Logique de dégâts
  hit() {
    if (!this.alive) return;
    this.health--;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
      this.deathFrame = 0;
    }
  }
  
  // Pas de méthode show() ici, c'est la classe Snake qui gère le dessin
  // Pas de méthode update() ou behaviors() ici, c'est Snake qui applique les forces
}