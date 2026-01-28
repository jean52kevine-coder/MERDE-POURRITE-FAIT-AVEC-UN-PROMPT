/**
 * particles.js
 * Système d'animation de fond avec particules et étoiles filantes
 * Agence ALTÉRA - Premium Digital Agency
 */

(function() {
  'use strict';

  const canvas = document.getElementById('background');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let shootingStars = [];
  let animationFrame;

  // Configuration
  const config = {
    particleCount: 120,
    particleSpeed: 0.3,
    particleSize: 2,
    connectionDistance: 150,
    shootingStarFrequency: 0.002,
    colors: {
      particles: 'rgba(138, 43, 226, 0.6)',
      connections: 'rgba(138, 43, 226, 0.15)',
      shootingStar: 'rgba(200, 150, 255, 1)'
    }
  };

  // Initialisation des dimensions
  function setCanvasSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  // Classe Particule
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * config.particleSpeed;
      this.vy = (Math.random() - 0.5) * config.particleSpeed;
      this.radius = Math.random() * config.particleSize + 1;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Rebond sur les bords
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Contraintes
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = config.colors.particles;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Classe Étoile Filante
  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * 0.5;
      this.length = Math.random() * 80 + 60;
      this.speed = Math.random() * 8 + 6;
      this.opacity = 1;
      this.angle = Math.PI / 4;
      this.fadeSpeed = 0.02;
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity -= this.fadeSpeed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x - Math.cos(this.angle) * this.length,
        this.y - Math.sin(this.angle) * this.length
      );
      
      gradient.addColorStop(0, config.colors.shootingStar);
      gradient.addColorStop(1, 'rgba(200, 150, 255, 0)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.length,
        this.y - Math.sin(this.angle) * this.length
      );
      ctx.stroke();
      
      ctx.restore();
    }

    isDead() {
      return this.opacity <= 0 || this.x > width || this.y > height;
    }
  }

  // Créer les particules
  function createParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Dessiner les connexions entre particules
  function drawConnections() {
    ctx.strokeStyle = config.colors.connections;
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          ctx.globalAlpha = 1 - (distance / config.connectionDistance);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // Générer des étoiles filantes aléatoires
  function generateShootingStar() {
    if (Math.random() < config.shootingStarFrequency) {
      shootingStars.push(new ShootingStar());
    }
  }

  // Animation principale
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Mise à jour et dessin des particules
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Dessiner les connexions
    drawConnections();

    // Générer et animer les étoiles filantes
    generateShootingStar();
    shootingStars = shootingStars.filter(star => {
      star.update();
      star.draw();
      return !star.isDead();
    });

    animationFrame = requestAnimationFrame(animate);
  }

  // Gestion du redimensionnement
  function handleResize() {
    setCanvasSize();
    createParticles();
  }

  // Initialisation
  function init() {
    setCanvasSize();
    createParticles();
    animate();

    window.addEventListener('resize', handleResize);
  }

  // Démarrage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Nettoyage
  window.addEventListener('beforeunload', () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener('resize', handleResize);
  });

})();
