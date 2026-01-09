// ======================
// GLOBAL VARIABLES
// ======================
let scene, camera, renderer, particles, shapes = [];
let mouse = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

// ======================
// INITIALIZATION
// ======================
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.002);

    // Setup camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Create particle system
    createParticles();

    // Create floating shapes
    createFloatingShapes();

    // Add lighting
    createLights();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);

    // Start animation
    animate();

    // Observe cards for scroll animations
    observeCards();
}

// ======================
// PARTICLE SYSTEM
// ======================
function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i + 1] = (Math.random() - 0.5) * 200;
        positions[i + 2] = (Math.random() - 0.5) * 200;

        // Color (cyan to magenta gradient)
        const color = new THREE.Color();
        const hue = Math.random() * 0.3 + 0.5; // 0.5-0.8 range for cyan to magenta
        color.setHSL(hue, 1, 0.5);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;

        // Size
        sizes[i / 3] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

// ======================
// FLOATING SHAPES
// ======================
function createFloatingShapes() {
    const geometries = [
        new THREE.TorusGeometry(5, 2, 16, 100),
        new THREE.OctahedronGeometry(5, 0),
        new THREE.IcosahedronGeometry(5, 0),
        new THREE.TetrahedronGeometry(5, 0)
    ];

    const positions = [
        { x: -40, y: 30, z: -30 },
        { x: 40, y: -30, z: -20 },
        { x: -30, y: -40, z: -25 },
        { x: 35, y: 35, z: -35 }
    ];

    geometries.forEach((geom, i) => {
        const material = new THREE.MeshPhongMaterial({
            color: i % 2 === 0 ? 0x00f5ff : 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geom, material);
        mesh.position.set(positions[i].x, positions[i].y, positions[i].z);
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatRange: Math.random() * 10 + 5
        };
        scene.add(mesh);
        shapes.push(mesh);
    });
}

// ======================
// LIGHTING
// ======================
function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Point lights
    const light1 = new THREE.PointLight(0x00f5ff, 2, 100);
    light1.position.set(50, 50, 50);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff00ff, 2, 100);
    light2.position.set(-50, -50, 50);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x00ffff, 1.5, 80);
    light3.position.set(0, 50, -50);
    scene.add(light3);
}

// ======================
// ANIMATION LOOP
// ======================
function animate() {
    requestAnimationFrame(animate);

    // Rotate particles
    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0004;

    // Animate floating shapes
    const time = Date.now() * 0.001;
    shapes.forEach((shape, i) => {
        // Rotation
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;

        // Floating motion
        shape.position.y += Math.sin(time * shape.userData.floatSpeed + i) * 0.02;
    });

    // Smooth camera movement following mouse
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

    camera.position.x = currentRotation.x * 20;
    camera.position.y = currentRotation.y * 20;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// ======================
// EVENT HANDLERS
// ======================
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    targetRotation.x = mouse.x;
    targetRotation.y = mouse.y;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
    const scrolled = window.scrollY;
    
    // Rotate particles based on scroll
    particles.rotation.z = scrolled * 0.0002;
    
    // Move shapes based on scroll
    shapes.forEach((shape, i) => {
        shape.position.z = -30 + (scrolled * 0.01 * (i + 1));
    });
}

// ======================
// INTERSECTION OBSERVER
// ======================
function observeCards() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    cards.forEach(card => observer.observe(card));
}

// ======================
// SMOOTH SCROLLING
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// ======================
// TYPING EFFECT (Optional)
// ======================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ======================
// PERFORMANCE OPTIMIZATION
// ======================
// Reduce particle count on mobile
if (window.innerWidth < 768) {
    // This will be handled in the createParticles function
    // by checking window width before creating particles
}

// ======================
// START THE APP
// ======================
// Wait for Three.js to load
if (typeof THREE !== 'undefined') {
    init();
} else {
    window.addEventListener('load', init);
}

// ======================
// LOADING ANIMATION
// ======================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Optional: Add a fade-in effect for the first card
    setTimeout(() => {
        const firstCard = document.querySelector('.card');
        if (firstCard) {
            firstCard.classList.add('visible');
        }
    }, 500);
});

// ======================
// CONSOLE EASTER EGG
// ======================
console.log('%c🚀 Welcome to my Portfolio!', 'color: #00f5ff; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with Three.js and passion for web development', 'color: #ff00ff; font-size: 14px;');
console.log('%cLike what you see? Let\'s connect!', 'color: #00f5ff; font-size: 14px;');
console.log('%c📧 sahantharakadias@gmail.com', 'color: #ffffff; font-size: 12px;');