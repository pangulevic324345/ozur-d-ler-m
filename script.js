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
        music.play().then(() => {
            musicStarted = true;
            console.log('Müzik çalıyor');
        }).catch(e => {
            console.log('Müzik çalınamadı:', e);
        });
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

    // Işıklar - Romantik ortam
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd4a3, 0.6);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Mumlardan gelen ışık
    const candleLight1 = new THREE.PointLight(0xff9933, 1.5, 15);
    candleLight1.position.set(-1.5, 3, 0);
    scene.add(candleLight1);

    const candleLight2 = new THREE.PointLight(0xff9933, 1.5, 15);
    candleLight2.position.set(0, 3, 0);
    scene.add(candleLight2);

    const candleLight3 = new THREE.PointLight(0xff9933, 1.5, 15);
    candleLight3.position.set(1.5, 3, 0);
    scene.add(candleLight3);

    createTable();
    createCandles();
    createApologyFrame();
    createLeftPhoto();
    createRightPhoto();
    createDecorations();

    // İlk tıklamada müziği çal
    document.addEventListener('click', playMusic, { once: false });
    document.addEventListener('touchstart', playMusic, { once: false });

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    document.getElementById('loading').style.display = 'none';
    
    // Müziği hemen dene
    playMusic();
    
    animate();
}

// Masa oluştur
function createTable() {
    const tableGeometry = new THREE.BoxGeometry(10, 0.3, 5);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a2c2a,
        roughness: 0.8,
        metalness: 0.2
    });
    table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = 2;
    table.receiveShadow = true;
    table.castShadow = true;
    scene.add(table);

    // Masa bacakları
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3d1f1e });
    const legPositions = [[-3.5, 1, -2], [-3.5, 1, 2], [3.5, 1, -2], [3.5, 1, 2]];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        scene.add(leg);
    });
}

// 3 Romantik mum oluştur
function createCandles() {
    const candlePositions = [
        [-1.5, 2.3, 0.5],
        [0, 2.3, 0.5],
        [1.5, 2.3, 0.5]
    ];

    candlePositions.forEach((pos, index) => {
        const candleGroup = new THREE.Group();
        
        // Mum gövdesi - Kırmızı romantik
        const candleGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 16);
        const candleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B0000,
            roughness: 0.6
        });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.castShadow = true;
        candleGroup.add(candle);

        // Mum ışığı - Parlak alev
        const flameGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff6600,
            transparent: true,
            opacity: 0.9
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 0.7;
        flame.name = 'flame';
        
        // İç ışık
        const innerFlameGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const innerFlameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial);
        innerFlame.position.y = 0.7;
        innerFlame.name = 'innerFlame';
        
        candleGroup.add(flame);
        candleGroup.add(innerFlame);

        candleGroup.position.set(...pos);
        candleGroup.name = `candle_${index}`;
        candles.push(candleGroup);
        scene.add(candleGroup);
    });
}

// Özür yazısı çerçevesi
function createApologyFrame() {
    const frameGroup = new THREE.Group();

    // Çerçeve
    const frameGeometry = new THREE.BoxGeometry(3, 2, 0.15);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.3
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frameGroup.add(frame);

    // Çerçeve içi - Yazı alanı
    const textBoardGeometry = new THREE.PlaneGeometry(2.7, 1.7);
    const textBoardMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFF8DC,
        roughness: 0.9
    });
    const textBoard = new THREE.Mesh(textBoardGeometry, textBoardMaterial);
    textBoard.position.z = 0.08;
    frameGroup.add(textBoard);

    // Kalp dekorasyon
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
    heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
    heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);

    const heartGeometry = new THREE.ShapeGeometry(heartShape);
    const heartMaterial = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.position.set(0, -0.6, 0.09);
    heart.scale.set(0.15, 0.15, 0.15);
    frameGroup.add(heart);

    frameGroup.position.set(0, 3.5, -2);
    frameGroup.name = 'apologyFrame';
    apologyFrame = frameGroup;
    scene.add(frameGroup);
}

// Sol köşe fotoğraf
function createLeftPhoto() {
    const photoGroup = new THREE.Group();

    // Çerçeve
    const frameGeometry = new THREE.BoxGeometry(1.5, 1.8, 0.12);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    photoGroup.add(frame);

    // Fotoğraf
    const photoGeometry = new THREE.PlaneGeometry(1.3, 1.6);
    const photoTexture = new THREE.TextureLoader().load('photo1.jpg',
        () => {},
        undefined,
        () => {
            photoMesh.material = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
        }
    );
    const photoMaterial = new THREE.MeshStandardMaterial({ map: photoTexture });
    const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    photoMesh.position.z = 0.07;
    photoGroup.add(photoMesh);

    photoGroup.position.set(-4, 2.8, 1.5);
    photoGroup.rotation.y = Math.PI / 8;
    leftPhoto = photoGroup;
    scene.add(photoGroup);
}

// Sağ köşe fotoğraf
function createRightPhoto() {
    const photoGroup = new THREE.Group();

    // Çerçeve
    const frameGeometry = new THREE.BoxGeometry(1.5, 1.8, 0.12);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    photoGroup.add(frame);

    // Fotoğraf
    const photoGeometry = new THREE.PlaneGeometry(1.3, 1.6);
    const photoTexture = new THREE.TextureLoader().load('photo2.jpg',
        () => {},
        undefined,
        () => {
            photoMesh.material = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
        }
    );
    const photoMaterial = new THREE.MeshStandardMaterial({ map: photoTexture });
    const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    photoMesh.position.z = 0.07;
    photoGroup.add(photoMesh);

    photoGroup.position.set(4, 2.8, 1.5);
    photoGroup.rotation.y = -Math.PI / 8;
    rightPhoto = photoGroup;
    scene.add(photoGroup);
}

// Dekoratif öğeler
function createDecorations() {
    // Gül yaprakları
    for (let i = 0; i < 20; i++) {
        const petalGeometry = new THREE.CircleGeometry(0.1, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF69B4,
            side: THREE.DoubleSide
        });
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        
        petal.position.set(
            (Math.random() - 0.5) * 8,
            2.16,
            (Math.random() - 0.5) * 4
        );
        petal.rotation.x = -Math.PI / 2;
        scene.add(petal);
    }
}

// Tıklama eventi
function onMouseClick(event) {
    // Müziği çal
    playMusic();
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Çerçeveyi kontrol et
    const frameIntersects = raycaster.intersectObjects(apologyFrame.children, true);
    if (frameIntersects.length > 0) {
        openMessage();
    }
}

function openMessage() {
    document.getElementById('message-overlay').classList.add('active');
    playMusic(); // Mesaj açılınca da dene
}

function closeMessage() {
    document.getElementById('message-overlay').classList.remove('active');
}

// Fareyle sahneyi döndürme
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
    playMusic(); // Fare tıklanınca dene
}

function onMouseMove(event) {
    if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        camera.position.x += deltaX * 0.008;
        camera.position.y -= deltaY * 0.008;
        
        // Kamerayı sınırla
        camera.position.y = Math.max(1.5, Math.min(4, camera.position.y));
        
        camera.lookAt(0, 2, 0);

        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}

function onMouseUp() {
    isDragging = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Mumların alevlerini canlandır
    candles.forEach((candleGroup, index) => {
        const flame = candleGroup.getObjectByName('flame');
        const innerFlame = candleGroup.getObjectByName('innerFlame');
        
        if (flame) {
            flame.scale.y = 1 + Math.sin(time * 3 + index) * 0.15;
            flame.position.y = 0.7 + Math.sin(time * 2 + index) * 0.05;
        }
        
        if (innerFlame) {
            innerFlame.scale.set(
                1 + Math.sin(time * 4 + index) * 0.2,
                1 + Math.cos(time * 4 + index) * 0.2,
                1
            );
            innerFlame.position.y = 0.7 + Math.sin(time * 2 + index) * 0.05;
        }
    });

    renderer.render(scene, camera);
}

// Başlat
window.addEventListener('load', init);