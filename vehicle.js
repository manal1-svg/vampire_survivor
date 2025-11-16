/**
 * Classe Vehicle (Véhicule)
 * * Il s'agit de la classe DE BASE pour tous les objets mobiles du jeu
 * (Joueur, Ennemis, Serpents, Balles, Orbes XP).
 * Elle implémente une physique Newtonienne simple (position, vélocité, accélération)
 * et, surtout, les "Steering Behaviors" (Comportements de direction) :
 * - seek (chercher)
 * - separate (séparer)
 * - avoid (éviter)

 */
class Vehicle {
  constructor(x, y, r = 8) {
    // Physique de base
    this.pos = createVector(x, y); // Position (un vecteur p5)
    this.vel = createVector(0, 0); // Vélocité
    this.acc = createVector(0, 0); // Accélération

    // Limites de mouvement
    this.maxSpeed = 4; // Vitesse maximale
    this.maxForce = 0.2; // Force de direction maximale

    // Propriétés physiques/jeu
    this.r = r; // Rayon (pour les collisions et la séparation)
    this.alive = true;
  }
  
  // Applique une force à l'accélération (Loi de Newton: F=ma, mais on suppose m=1)
  applyForce(force) {
    this.acc.add(force);
  }

  /**
   * Comportement SEEK (Chercher)
   * Calcule la force nécessaire pour se diriger vers une cible.
   * C'est la base de la plupart des déplacements "intelligents".
   */
  seek(target) {
    // 1. Calculer la vélocité "désirée" (un vecteur pointant vers la cible, à vitesse max)
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);

    // 2. Calculer la force de direction ("steer")
    //    Force = Vélocité Désirée - Vélocité Actuelle
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce); // Limiter la force pour un virage réaliste
    
    return steer;
  }

  /**
   * Comportement SEPARATE (Séparer)
   * Calcule une force pour éviter de s'agglutiner avec d'autres agents.
   * Regarde tous les 'autres' agents à proximité et s'en éloigne.
   */
  separate(others) {
    let desiredSeparation = this.r * 2.5; // Distance minimale souhaitée
    let steer = createVector(0, 0); // Force de séparation totale
    let count = 0; // Nb d'agents trop proches
    
    // Vérifie chaque agent dans le tableau 'others'
    for (let other of others) {
      if (other === this) continue; // Ne pas se comparer à soi-même
      
      let d = p5.Vector.dist(this.pos, other.pos);
      
      // Si l'autre agent est trop proche
      if (d > 0 && d < desiredSeparation) {
        // Calculer un vecteur qui pointe à l'opposé de l'autre agent
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d); // La force est inversement proportionnelle à la distance
        
        steer.add(diff);
        count++;
      }
    }
    
    // Moyenne des forces de répulsion
    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    
    return steer;
  }

 /**
  * Comportement AVOID (Éviter)
  * Calcule une force pour éviter les obstacles statiques.
  * L'algorithme projette un ou deux points "devant" le véhicule 
  * et vérifie s'ils entrent en collision avec un obstacle.
  */
  avoid(obstacles) {
    // Distance de projection "devant" le véhicule
    let aheadDistance = 50; 
    let ahead = p5.Vector.mult(this.vel, aheadDistance / this.vel.mag() || 1);
    let ahead2 = p5.Vector.mult(ahead, 0.5); // Un point à mi-chemin

    let steer = createVector(0, 0);
    let count = 0;

    for (let obs of obstacles) {
      // Calcule les points de détection
      let aheadPoint = p5.Vector.add(this.pos, ahead);
      let ahead2Point = p5.Vector.add(this.pos, ahead2);
      
      // Trouve la distance au point de détection le plus proche de l'obstacle
      let posToObsDist = p5.Vector.dist(this.pos, obs.pos);
      let aheadToObsDist = p5.Vector.dist(aheadPoint, obs.pos);
      let ahead2ToObsDist = p5.Vector.dist(ahead2Point, obs.pos);

      let minDist = Math.min(posToObsDist, aheadToObsDist, ahead2ToObsDist);
      let closestPoint = aheadPoint;
      if (ahead2ToObsDist < minDist) closestPoint = ahead2Point;
      if (posToObsDist < minDist) closestPoint = this.pos;

      // Si le point de détection le plus proche est DANS l'obstacle
      if (minDist < obs.r + this.r) {
        // On calcule une force d'évitement
        // La force pousse le véhicule à l'opposé du centre de l'obstacle
        let diff = p5.Vector.sub(closestPoint, obs.pos); 
        diff.normalize();
        diff.mult(this.maxSpeed);
        
        let steerForce = p5.Vector.sub(diff, this.vel);
        steerForce.limit(this.maxForce * 1.5); // Force d'évitement plus forte
        steer.add(steerForce);
        count++;
      }
    }

    if (count > 0) steer.div(count); // Moyenne des forces d'évitement
    return steer;
  }

  /**
   * Mise à jour de la physique (Intégration d'Euler)
   * C'est ici que le mouvement est calculé à chaque frame.
   */
  update() {
    // 1. Vélocité = Vélocité + Accélération
    this.vel.add(this.acc);
    // 2. Limiter la vélocité à la vitesse max
    this.vel.limit(this.maxSpeed);
    // 3. Position = Position + Vélocité
    this.pos.add(this.vel);
    // 4. Réinitialiser l'accélération à 0 pour la prochaine frame
    this.acc.mult(0);
  }

  // Gère le "wrapping" (passage d'un bord de l'écran à l'autre)
  boundaries(w, h) {
    if (this.pos.x < -this.r) this.pos.x = w + this.r;
    if (this.pos.x > w + this.r) this.pos.x = -this.r;
    if (this.pos.y < -this.r) this.pos.y = h + this.r;
    if (this.pos.y > h + this.r) this.pos.y = -this.r;
  }
}