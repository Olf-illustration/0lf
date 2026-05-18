document.addEventListener('DOMContentLoaded', () => {
    const labyrinth = document.getElementById('labyrinth');
    const threshold = document.getElementById('threshold');
    const monolith = document.querySelector('.monolith');
    const monolithText = document.getElementById('monolith-text');
    let hasLeftHome = false;

    // Click to advance from Stage 1
    if (monolith) {
        monolith.addEventListener('click', () => {
            labyrinth.scrollBy({ left: window.innerWidth, behavior: 'auto' });
        });
    }

    // Stage 2: The Linear Labyrinth (Scroll Mechanics)
    let isWheelLock = false;
    labyrinth.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            if (isWheelLock) return;
            
            const direction = Math.sign(e.deltaY);
            labyrinth.scrollBy({
                left: direction * window.innerWidth,
                behavior: 'auto' // Instant jump, mechanically locked
            });
            
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
        
        if (Math.abs(deltaY) > 5) {
            e.preventDefault();
            labyrinth.scrollBy({
                left: deltaY,
                behavior: 'auto'
            });
            touchStartY = touchEndY;
        }
    }, { passive: false });

    // Track background for Stage 3 (Dynamic Contrast)
    let currentBackground = 'white';
    
    // Correction de l'ID cible : archive-contact correspond à ton HTML
    const archiveSection = document.getElementById('archive-contact');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id === 'archive-contact') {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    currentBackground = 'black';
                } else {
                    currentBackground = 'white';
                }
            }

            // Track Threshold Return State (OLF Illustration text reveal)
            if (entry.target.id === 'threshold') {
                if (!entry.isIntersecting) {
                    hasLeftHome = true;
                } else if (entry.isIntersecting && hasLeftHome && entry.intersectionRatio > 0.5) {
                    if (monolithText) monolithText.style.opacity = '1';
                }
            }
        });
    }, { threshold: [0, 0.5, 1] });
    
    if (archiveSection) observer.observe(archiveSection);
    if (threshold) observer.observe(threshold);

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
        // Enregistre les points partout, la couleur s'adaptera dynamiquement
        points.push({
            x: e.clientX,
            y: e.clientY,
            birth: Date.now(),
            colorMode: currentBackground // Enregistre si on est sur fond blanc ou noir
        });
    });

    const renderCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const now = Date.now();
        points = points.filter(p => now - p.birth < MAX_LIFESPAN);

        ctx.lineWidth = 1;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const age = now - p.birth;
            const opacity = 1 - (age / MAX_LIFESPAN);
            
            ctx.globalAlpha = opacity;
            
            // Inversion intelligente de la couleur de la traque
            if (p.colorMode === 'black') {
                ctx.strokeStyle = '#ffffff'; // Hachures blanches sur fond noir
            } else {
                ctx.strokeStyle = '#000000'; // Hachures noires sur fond blanc
            }

            ctx.beginPath();
            const connectCount = Math.min(3, i);
            for (let j = 1; j <= connectCount; j++) {
                const target = points[i - j];
                if (target && target.colorMode === p.colorMode) {
                    ctx.moveTo(p.x, p.y);
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
});
