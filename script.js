let scene, camera, renderer, table;
let candles = [];
let apologyFrame, leftPhoto, rightPhoto;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let musicStarted = false;

// Müzik çalma fonksiyonu
function playMusic() {
    if (!musicStarted) {
        const music = document.getElementById('background-music');
        if (music) {
            music.play().then(() => {
                musicStarted = true;
                console.log('Müzik çalıyor');
            }).catch(e => {
                console.log('Müzik henüz başlatılamadı (Kullanıcı etkileşimi bekleniyor)');
            });
        }
    }
}

// Sahne oluştur
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Kamera - POV masa başında oturan kişi
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Işıklar
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd4a3, 0.6);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Mum ışıkları
    const candleLightPositions = [[-1.5, 3, 0], [0, 3, 0], [1.5, 3, 0]];
    candleLightPositions.forEach(pos => {
        const light = new THREE.PointLight(0xff9933, 1.5, 15);
        light.position.set(...pos);
        scene.add(light);
    });

    const textureLoader = new THREE.TextureLoader();

    // Arka plan yükleme denemesi
    textureLoader.load('background.jpg', (texture) => {
        scene.background = texture;
    }, undefined, () => console.log("Arka plan dosyası bulunamadı, düz renk kullanılıyor."));

    createTable();
    createCandles();
    createApologyFrame();
    createLeftPhoto(textureLoader);
    createRightPhoto(textureLoader);
    createDecorations();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // YÜKLEME EKRANINI KAPAT (Zamanlayıcı ile garantiye alındı)
    setTimeout(() => {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'none';
    }, 1200);
    
    animate();
}

function createTable() {
    const tableGeometry = new THREE.BoxGeometry(10, 0.3, 5);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2c2a, roughness: 0.8 });
    table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = 2;
    table.receiveShadow = true;
    scene.add(table);

    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3d1f1e });
    const legPositions = [[-3.5, 1, -2], [-3.5, 1, 2], [3.5, 1, -2], [3.5, 1, 2]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        scene.add(leg);
    });
}

function createCandles() {
    const candlePositions = [[-1.5, 2.3, 0.5], [0, 2.3, 0.5], [1.5, 2.3, 0.5]];
    candlePositions.forEach((pos, index) => {
        const candleGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0x8B0000 }));
        body.castShadow = true;
        
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.9 }));
        flame.position.y = 0.7;
        flame.name = 'flame';
        
        candleGroup.add(body, flame);
        candleGroup.position.set(...pos);
        candles.push(candleGroup);
        scene.add(candleGroup);
    });
}

function createApologyFrame() {
    const frameGroup = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.15), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    const textBoard = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.7), new THREE.MeshStandardMaterial({ color: 0xFFF8DC }));
    textBoard.position.z = 0.08;
    frameGroup.add(frame, textBoard);
    frameGroup.position.set(0, 3.5, -2);
    apologyFrame = frameGroup;
    scene.add(frameGroup);
}

function createLeftPhoto(loader) {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.12), new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }));
    group.add(frame);
    loader.load('photo1.jpg', (tex) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshStandardMaterial({ map: tex }));
        mesh.position.z = 0.07;
        group.add(mesh);
    }, undefined, () => console.log("photo1.jpg yüklenemedi."));
    group.position.set(-4, 2.8, 1.5);
    group.rotation.y = Math.PI / 8;
    scene.add(group);
}

function createRightPhoto(loader) {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.12), new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
    group.add(frame);
    loader.load('photo2.jpg', (tex) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.6), new THREE.MeshStandardMaterial({ map: tex }));
        mesh.position.z = 0.07;
        group.add(mesh);
    }, undefined, () => console.log("photo2.jpg yüklenemedi."));
    group.position.set(4, 2.8, 1.5);
    group.rotation.y = -Math.PI / 8;
    scene.add(group);
}

function createDecorations() {
    for (let i = 0; i < 20; i++) {
        const petal = new THREE.Mesh(new THREE.CircleGeometry(0.1, 8), new THREE.MeshStandardMaterial({ color: 0xFF69B4, side: THREE.DoubleSide }));
        petal.position.set((Math.random() - 0.5) * 8, 2.16, (Math.random() - 0.5) * 4);
        petal.rotation.x = -Math.PI / 2;
        scene.add(petal);
    }
}

function onMouseClick(event) {
    playMusic();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(apologyFrame.children, true);
    if (intersects.length > 0) {
        document.getElementById('message-overlay').classList.add('active');
    }
}

function onMouseDown(e) { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; playMusic(); }
function onMouseUp() { isDragging = false; }
function onMouseMove(e) {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        camera.position.x += deltaX * 0.008;
        camera.position.y -= deltaY * 0.008;
        camera.position.y = Math.max(1.5, Math.min(4, camera.position.y));
        camera.lookAt(0, 2, 0);
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;
    candles.forEach((c, i) => {
        const flame = c.getObjectByName('flame');
        if (flame) {
            flame.scale.y = 1 + Math.sin(time * 3 + i) * 0.15;
            flame.position.y = 0.7 + Math.sin(time * 2 + i) * 0.05;
        }
    });
    renderer.render(scene, camera);
}

// Başlatma
window.addEventListener('load', init);