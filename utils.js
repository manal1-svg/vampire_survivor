// Collision entre deux cercles basée sur les rayons
// Deux véhicules collisionnent si: distance(centre1, centre2) < rayon1 + rayon2
function collide(a, b) {
  let d = p5.Vector.dist(a.pos, b.pos);
  return d < (a.r + b.r);
}

// Fonction utilitaire pour créer des orbes XP
function dropXP(a, b) {
  if (random() < 0.85) {
    let xpOrbs = window.gameState?.xpOrbs || [];
    const XPOrb = window.XPOrb;
    if (XPOrb) {
      xpOrbs.push(new XPOrb(x, y, 1));
      if (window.gameState) window.gameState.xpOrbs = xpOrbs;
    }
  }
}