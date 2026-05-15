document.addEventListener('DOMContentLoaded', () => {
    // Stage 1: The Threshold (Integrated)
    const threshold = document.getElementById('threshold');
    const monolith = document.querySelector('.monolith');
    const monolithText = document.getElementById('monolith-text');
    let hasLeftHome = false;

    // Click to advance
    monolith.addEventListener('click', () => {
        labyrinth.scrollBy({ left: window.innerWidth, behavior: 'auto' });
    });

    // Stage 2: The Linear Labyrinth (Scroll Mechanics)
    const labyrinth = document.getElementById('labyrinth');
    const sections = document.querySelectorAll('.gallery-section');
    
    // Desktop Wheel: map vertical wheel to horizontal scroll (Full Viewport Jumps)
    let isWheelLock = false;
    labyrinth.addEventListener('wheel', (e) => {
        // Check if user is scrolling vertically
        if (e.deltaY !== 0) {
            e.preventDefault();
            if (isWheelLock) return;
            
            const direction = Math.sign(e.deltaY);
            labyrinth.scrollBy({
                left: direction * window.innerWidth,
                behavior: 'auto' // Instant jump, mechanically locked
            });
            
            // Add a small lock to prevent free-spinning wheel from skipping multiple artworks
            isWheelLock = true;
            setTimeout(() => { isWheelLock = false; }, 400);
        }
    }, { passive: false });

    // Touch swipe vertical to horizontal translation
    let touchStartY = 0;
    labyrinth.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    labyrinth.addEventListener('touchmove', (e) => {
        let touchEndY = e.touches[0].clientY;
        let deltaY = touchStartY - touchEndY;
        
        // If it's a vertical swipe, prevent default and translate to horizontal scroll
        if (Math.abs(deltaY) > 5) {
            e.preventDefault();
            labyrinth.scrollBy({
                left: deltaY,
                behavior: 'auto'
            });
            touchStartY = touchEndY; // Update for continuous scroll mapping
        }
    }, { passive: false });

    // Track background for Stage 3 (canvas trail only over white sections)
    let currentBackground = 'white';
    
    // Use IntersectionObserver to determine if the final black section is visible
    const archiveSection = document.getElementById('archive');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Track background color for canvas
            if (entry.target.id === 'archive') {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    currentBackground = 'black';
                } else {
                    currentBackground = 'white';
                }
            }

            // Track Threshold Return State
            if (entry.target.id === 'threshold') {
                if (!entry.isIntersecting) {
                    hasLeftHome = true;
                } else if (entry.isIntersecting && hasLeftHome && entry.intersectionRatio > 0.5) {
                    // Homecoming! Reveal the text
                    monolithText.style.opacity = '1';
                }
            }
        });
    }, { threshold: [0, 0.5, 1] });
    
    observer.observe(archiveSection);
    observer.observe(threshold);

    // Stage 3: Surveillance Layer (Canvas Trail)
    const canvas = document.getElementById('surveillance-layer');
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let points = [];
    const MAX_LIFESPAN = 1500; // 1.5 seconds

    window.addEventListener('mousemove', (e) => {

        // Only record points if background is white
        if (currentBackground === 'white') {
            points.push({
                x: e.clientX,
                y: e.clientY,
                birth: Date.now()
            });
        }
    });

    const renderCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const now = Date.now();
        // Filter out dead points
        points = points.filter(p => now - p.birth < MAX_LIFESPAN);

        // Draw chaotic cross-hatching
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const age = now - p.birth;
            // Opacity decays linearly
            const opacity = 1 - (age / MAX_LIFESPAN);
            ctx.globalAlpha = opacity;

            ctx.beginPath();
            // Connect to a few recent points randomly to create hatching
            const connectCount = Math.min(3, i);
            for (let j = 1; j <= connectCount; j++) {
                const target = points[i - j];
                if (target) {
                    ctx.moveTo(p.x, p.y);
                    // Add slight chaotic jitter
                    const jitterX = (Math.random() - 0.5) * 15;
                    const jitterY = (Math.random() - 0.5) * 15;
                    ctx.lineTo(target.x + jitterX, target.y + jitterY);
                }
            }
            ctx.stroke();
        }

        ctx.globalAlpha = 1; // Reset alpha
        requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    // Prevent default scrolling globally to enforce the labyrinth lockdown
    window.addEventListener('touchmove', (e) => {
        if(e.cancelable) e.preventDefault();
    }, { passive: false });
    
    // Stage 4: Form override
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('[SYSTEM: ARCHIVE SUBMITTED]');
    });
});
