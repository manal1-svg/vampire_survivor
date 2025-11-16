/**
 * Classe Bullet (Balle)
 * Hérite de Vehicle.
 * C'est un projectile simple qui va tout droit et a une durée de vie.
 */
class Bullet extends Vehicle {
  constructor(x, y, angle) {
    super(x, y, 6);

    // Applique une vélocité initiale forte basée sur l'angle de tir
    this.vel = p5.Vector.fromAngle(angle).mult(10);
    this.maxSpeed = 12;
    this.maxForce = 0.2;
    
    // Durée de vie en frames (1 seconde à 60fps)
    this.lifespan = 60; 
    this.alive = true;
    this.targetAngle = angle; // Stocke l'angle
  }

  // Surcharge de update()
  update() {
    // Applique une petite force pour maintenir la direction
    // (utile si on voulait des balles à tête chercheuse plus tard)
    let desired = p5.Vector.fromAngle(this.targetAngle).mult(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.applyForce(steer);

    // Physique de Vehicle
    super.update();

    // Décrémente la durée de vie
    this.lifespan--;
    if (this.lifespan <= 0) this.alive = false;
  }

  // Vérifie si la balle est sortie de l'écran
  isOffScreen() {
    return this.pos.x < -70 || this.pos.x > width + 70 ||
           this.pos.y < -70 || this.pos.y > height + 70;
  }

  // Surcharge de show()
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    // Oriente le sprite dans la direction de la vélocité
    rotate(this.vel.heading()); 
    imageMode(CENTER);

    if (window.imgBullet) {
      image(window.imgBullet, 0, 0, 32, 32);
    } else {
      fill(255, 255, 0); // Jaune de secours
      ellipse(0, 0, 12);
    }
    pop();
  }
}