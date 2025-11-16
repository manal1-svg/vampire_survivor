/**
 * Classe Snake (Serpent)
 * C'est un objet "composite" qui GÈRE une liste de SnakeSegments.
 * C'est lui qui applique les forces à ses segments pour créer
 * le mouvement de "chaîne".
 */
class Snake {
  constructor(x, y, player) {
    this.segments = []; // La liste des segments
    this.player = player;
    
    // Crée la tête
    this.segments.push(new SnakeSegment(x, y, true)); 
    // Crée 3 segments de corps
    for (let i = 1; i < 4; i++) {
      this.segments.push(new SnakeSegment(x - i * 20, y, false));
    }
  }

  // Mise à jour de TOUS les segments
  update(player, obstacles) {
    let head = this.segments[0];
    
    // --- 1. Logique de la TÊTE ---
    if (head.alive) {
      // La tête se comporte comme un Ennemi :
      // Elle 'seek' le joueur
      let seek = head.seek(player.pos);
      seek.mult(1.2);
      head.applyForce(seek);
      
      // Elle 'separate' des autres segments (pour ne pas s'emmêler)
      let allSegments = this.segments.filter(s => s !== head);
      let separate = head.separate(allSegments);
      separate.mult(1.5);
      head.applyForce(separate);
      
      // Elle 'avoid' les obstacles
      let avoid = head.avoid(obstacles);
      avoid.mult(3.5);
      head.applyForce(avoid);
      
      // Applique la physique à la tête
      head.update();
      head.boundaries(width, height);
    }

    // --- 2. Logique des SEGMENTS DU CORPS ---
    // Boucle à partir du deuxième segment (index 1)
    for (let i = 1; i < this.segments.length; i++) {
      let curr = this.segments[i]; // Segment actuel
      let prev = this.segments[i - 1]; // Segment juste devant lui
      
      if (curr.alive) {
        // --- Logique de "Chaîne" (liaison) ---
        // Le segment 'curr' essaie de suivre 'prev'
        let desired = p5.Vector.sub(prev.pos, curr.pos);
        let distance = desired.mag();
        
        // Distance "au repos" souhaitée (très courte pour un serpent serré)
        let restDistance = 6; 
        
        // Comportement de type "ressort"
        if (distance > restDistance) {
          // Si trop loin, il "tire" (seek) vers le segment précédent
          desired.setMag(curr.maxSpeed);
          let steer = p5.Vector.sub(desired, curr.vel);
          steer.limit(curr.maxForce * 0.8);
          curr.applyForce(steer);
        } else if (distance < restDistance * 0.5) {
          // Si trop près, il "pousse" (s'éloigne)
          desired.mult(-1).setMag(curr.maxSpeed * 0.5);
          let steer = p5.Vector.sub(desired, curr.vel);
          steer.limit(curr.maxForce * 0.6);
          curr.applyForce(steer);
        }
        
        // Sépare aussi des autres segments (sauf lui-même et celui d'avant)
        let otherSegments = this.segments.filter(s => s !== curr && s !== prev);
        let separate = curr.separate(otherSegments);
        separate.mult(1.2);
        curr.applyForce(separate);
        
        // Applique la physique au segment
        curr.update();
        curr.boundaries(width, height);
      }
    }
  }

  // Affichage du serpent
  show() {
    let g = window.gameState;
    if (!g.images.snake || !g.images.snake.head || !g.images.snake.body || !g.images.snake.tail) {
      return; // Ne rien dessiner si les images ne sont pas chargées
    }

    // Dessine de la QUEUE vers la TÊTE
    // (pour que la tête soit affichée au-dessus du corps)
    for (let i = this.segments.length - 1; i >= 0; i--) {
      let seg = this.segments[i];
      let img;
      let segmentType = 'body'; // Par défaut

      if (i === 0) {
        img = g.images.snake.head;
        segmentType = 'head';
      } else if (i === this.segments.length - 1) {
        img = g.images.snake.tail;
        segmentType = 'tail';
      } else {
        img = g.images.snake.body;
      }
      
      this.drawSegment(seg, img, segmentType);
    }
  }

  // Fonction d'aide pour dessiner un seul segment
  drawSegment(seg, img, type) {
    // Gère les segments morts (un simple cercle gris)
    if (!seg.alive) {
      push();
      translate(seg.pos.x, seg.pos.y);
      fill(80); 
      noStroke();
      ellipse(0, 0, seg.r * 2);
      pop();
      return;
    }
    
    // Si le segment est vivant, dessiner l'image
    push();
    translate(seg.pos.x, seg.pos.y);
    
    // --- Logique de ROTATION ---
    let rotation = 0;
    if (seg.vel.mag() > 0.1) {
        // Fait pointer le segment dans la direction de sa vélocité
        rotation = seg.vel.heading(); 
    } else {
        rotation = PI / 2; // Position par défaut
    }

    // Ajuste la rotation car les sprites ne sont pas tous orientés pareil
    if (type === 'body' || type === 'tail') {
       rotation += PI / 2; // Ajoute 90 degrés
    }
    
    rotate(rotation);
    // --- Fin Rotation ---
    
    imageMode(CENTER);
    if (img) {
      let displayWidth = 30;
      let displayHeight = 30;
      if (type === 'body') {
        displayWidth = 24; 
        displayHeight = 24;
      }
      image(img, 0, 0, displayWidth, displayHeight); 
    } else {
      fill(150, 0, 150); // Violet de secours
      noStroke();
      ellipse(0, 0, seg.r * 2);
    }
    pop();
  }

  // Le serpent est mort si sa TÊTE est morte
  isDead() {
    return !this.segments[0].alive;
  }
}