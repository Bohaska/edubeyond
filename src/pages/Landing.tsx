import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { useEffect, useRef } from "react";

// Physics particle system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  charge: number; // +1 or -1
  mass: number;
  radius: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

function PhysicsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const numParticles = 50;
      
      for (let i = 0; i < numParticles / 2; i++) {
        // Add a positive particle
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          charge: 1,
          mass: 1,
          radius: 8,
          color: '#3b82f6', // blue for positive
          trail: []
        });
        // Add a negative particle
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          charge: -1,
          mass: 1,
          radius: 6,
          color: '#ef4444', // red for negative
          trail: []
        });
      }
    };
    initParticles();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        // Add a positive particle
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          charge: 1,
          mass: 1,
          radius: 8,
          color: '#3b82f6', // blue for positive
          trail: []
        });
        // Add a negative particle
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          charge: -1,
          mass: 1,
          radius: 6,
          color: '#ef4444', // red for negative
          trail: []
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Physics constants
    const k = 500; // Coulomb constant (scaled for visualization)
    const damping = 0.999; // Energy damping
    const maxSpeed = 5;
    const trailLength = 15;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Calculate forces and update positions
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let fx = 0, fy = 0;

        // Calculate electromagnetic forces from other particles
        for (let j = 0; j < particles.length; j++) {
          if (i === j) continue;
          const p2 = particles[j];
          
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0 && distance < 300) {
            // Add a softening factor to prevent extreme forces at close range
            const minDistance = 15;
            const effectiveDistance = Math.max(distance, minDistance);

            // Coulomb force: F = k * q1 * q2 / r^2
            const force = (k * p1.charge * p2.charge) / (effectiveDistance * effectiveDistance);
            const forceX = -force * (dx / distance); // Use original distance for direction
            const forceY = -force * (dy / distance);
            
            fx += forceX;
            fy += forceY;
          }
        }

        // Update velocity (F = ma, so a = F/m)
        p1.vx += fx / p1.mass * 0.016; // 60fps timestep
        p1.vy += fy / p1.mass * 0.016;

        // Apply damping
        p1.vx *= damping;
        p1.vy *= damping;

        // Limit speed
        const speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
        if (speed > maxSpeed) {
          p1.vx = (p1.vx / speed) * maxSpeed;
          p1.vy = (p1.vy / speed) * maxSpeed;
        }

        // Update position
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Boundary conditions (elastic collision with walls)
        if (p1.x < p1.radius || p1.x > canvas.width - p1.radius) {
          p1.vx *= -0.8;
          p1.vy += (Math.random() - 0.5) * 2; // Add randomness to bounce angle
          p1.x = Math.max(p1.radius, Math.min(canvas.width - p1.radius, p1.x));
        }
        if (p1.y < p1.radius || p1.y > canvas.height - p1.radius) {
          p1.vy *= -0.8;
          p1.vx += (Math.random() - 0.5) * 2; // Add randomness to bounce angle
          p1.y = Math.max(p1.radius, Math.min(canvas.height - p1.radius, p1.y));
        }

        // Update trail
        p1.trail.push({ x: p1.x, y: p1.y, alpha: 1 });
        if (p1.trail.length > trailLength) {
          p1.trail.shift();
        }
        
        // Fade trail
        p1.trail.forEach((point, index) => {
          point.alpha = index / trailLength;
        });
      }

      // Draw particles and trails
      particles.forEach(particle => {
        // Draw trail
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        particle.trail.forEach((point, index) => {
          ctx.globalAlpha = point.alpha * 0.3;
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();

        // Draw particle
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw charge symbol
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.charge > 0 ? '+' : '−', particle.x, particle.y);

        // Draw subtle glow
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-60"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    />
  );
}

export default function Landing() {
  return (
    <div className="overflow-hidden min-h-screen">
      <PhysicsBackground />
      <div className="container mx-auto px-6 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Your Personal AP Physics C Tutor
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Generate unlimited practice questions, explore curated datasets, and master AP Physics C with your AI-powered learning assistant.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <AuthButton
              trigger={<Button size="lg">Get Started for Free</Button>}
              dashboardTrigger={
                <Button size="lg" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              }
            />
            <Button size="lg" variant="outline" asChild>
              <Link to="/question-generator">
                Try the Generator
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 flow-root sm:mt-24"
        >
          <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-sm">
            <img
              src="/assets/hero-1.png"
              alt="Personalized AP Physics C Tutor"
              width={2432}
              height={1442}
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </motion.div>
      </div>

      <div className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Everything You Need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A Better Way to Prepare for the AP Exam
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our platform provides a comprehensive suite of tools to help you succeed. From AI-generated questions to a curated list of resources, we've got you covered.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  AI Question Generation
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Generate unique MCQs and FRQs for any topic, complete with detailed explanations. Never run out of practice problems.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Question Library
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Save and organize your generated questions. Filter by topic, type, and difficulty to focus your study sessions.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Dataset Catalog
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Explore a curated list of the best public AP Physics C resources, with our analysis of their strengths and weaknesses.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Detailed Explanations
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Every question comes with a step-by-step solution, helping you understand the concepts, not just memorize the answers.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}