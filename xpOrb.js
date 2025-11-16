class XPOrb extends Vehicle {
  constructor(x, y, amount = 1, type = 'xp') { // <-- Added 'type'
    super(x, y, 9);
    this.amount = amount;
    this.collected = false;
    this.maxSpeed = 3;
    this.maxForce = 0.25;
    this.type = type; // <-- Store the type
  }

  update(player) {
    let d = p5.Vector.dist(this.pos, player.pos);
    
    // SEEK avec forces
    if (d < 100) {
      let seek = this.seek(player.pos);
      seek.mult(2.5);
      this.applyForce(seek);
    }
    
    // Utilise update() du Vehicle (Newton)
    super.update();
    
    // Vérifie collision
    if (d < player.r + this.r) {
      this.collected = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    imageMode(CENTER);
    
    // --- THIS IS THE NEW LOGIC ---
    let img = null;
    if (this.type === 'xp2' && window.gameState.images.xp2) {
      img = window.gameState.images.xp2;
    } else if (window.gameState.images.xp) {
      img = window.gameState.images.xp;
    }

    if (img) {
      image(img, 0, 0, 20, 20); // Draw the image
    } else {
      // Fallback if images didn't load
      if (this.type === 'xp2') {
        fill(255, 0, 255, 200); // Magenta for XP2
      } else {
        fill(100, 255, 255, 200); // Cyan for XP
      }
      noStroke();
      ellipse(0, 0, this.r * 2);
    }
    // --- END OF NEW LOGIC ---
    
    pop();
  }
}