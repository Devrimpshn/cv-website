// Three.js scene setup
let scene, camera, renderer, controls;
let currentModel = null;

// Model verileri
const modelList = [
    {
        name: "Dünya Modeli",
        description: "Low Poly Dünya Modeli",
        path: "/cv-website/models/lowpolyworld.fbx",
        scale: 0.075,
        cameraDistance: 85,
        position: { y: 0 },
        cameraRotation: { x: 0.5, y: 0.6, z: 0 }
    },
    {
        name: "Karakter",
        description: "Low Poly Oyun Karakteri",
        path: "/cv-website/models/LowPolyCharacter.fbx",
        scale: 0.15,
        cameraDistance: 85,
        position: { x: 0, y: 0, z: 0 },
        cameraRotation: { x: 0.4, y: 1.2 , z: 0 }
    },
    {
        name: "Kahve Dükkanı",
        description: "Detaylı Kahve Dükkanı Modeli",
        path: "/cv-website/models/coffeshop.fbx",
        scale: 0.075,
        cameraDistance: 125,
        position: { x: 0, y: 0, z: 0 },
        cameraRotation: { x: 0.5 , y: 1 , z: 0 }
    },
    {
        name: "Yatak Odası",
        description: "Modern Yatak Odası Modeli",
        path: "/cv-website/models/Bedroom.fbx",
        scale: 0.075,
        cameraDistance: 40,
        position: { x: 0, y: 1.4, z: 10 },
        cameraRotation: { x: 0.5, y: -4, z: 0 }
    }
];

// Initialize the 3D viewer
function init() {
    try {
        console.log('Başlatılıyor...');
        
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        const container = document.getElementById('model-viewer');
        if (!container) {
            throw new Error('Model viewer container bulunamadı');
        }
        console.log('Container bulundu:', container);

        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 5000);
        camera.position.set(5, 5, 5);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        console.log('Renderer oluşturuldu');

        // Controls setup
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;
        controls.minDistance = 1;
        controls.maxDistance = 1000;
        console.log('Controls oluşturuldu');

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        console.log('Işıklar eklendi');

        // Grid helper
        const gridHelper = new THREE.GridHelper(500, 100);
        scene.add(gridHelper);

        // Ground plane for better visualization
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        ground.receiveShadow = true;
        scene.add(ground);

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        // URL'den model parametresini al
        const urlParams = new URLSearchParams(window.location.search);
        const modelParam = urlParams.get('model');
        
        if (modelParam) {
            // URL'den gelen modeli yükle
            loadModel("models/" + modelParam);
        } else if (modelList.length > 0) {
            // URL'de model belirtilmemişse ilk modeli yükle
            loadModel(modelList[0].path);
        }

        // Start animation loop
        animate();
        console.log('Animasyon başlatıldı');

    } catch (error) {
        console.error('Başlatma hatası:', error);
        showError('Başlatma hatası: ' + error.message);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Handle window resize
function onWindowResize() {
    if (!camera || !renderer) return;
    const container = document.getElementById('model-viewer');
    if (!container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Show loading indicator
function showLoading(message = 'Model yükleniyor...') {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = message;
        loadingText.style.display = 'block';
        loadingText.classList.remove('error');
    }
}

// Hide loading indicator
function hideLoading() {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    console.error(message);
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = message;
        loadingText.style.display = 'block';
        loadingText.classList.add('error');
    }
}

// Load and display FBX model
function loadModel(modelPath) {
    try {
        console.log('Model yükleme başlıyor:', modelPath);
        showLoading('Model yükleniyor...');

        // Remove current model if exists
        if (currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        // Model verilerini bul
        const modelData = modelList.find(model => model.path === modelPath || "models/" + model.path.split('/').pop() === modelPath);
        if (!modelData) {
            throw new Error('Model verisi bulunamadı: ' + modelPath);
        }

        const loader = new FBXLoader();
        console.log('FBX Loader oluşturuldu');

        loader.load(
            modelPath,
            (fbx) => {
                try {
                    console.log('Model başarıyla yüklendi');
                    currentModel = fbx;

                    // Scale
                    fbx.scale.setScalar(modelData.scale);

                    // Center model horizontally
                    const box = new THREE.Box3().setFromObject(fbx);
                    const center = box.getCenter(new THREE.Vector3());
                    
                    // Position the model
                    fbx.position.x = modelData.position.x || 0;
                    fbx.position.y = modelData.position.y || 0;
                    fbx.position.z = modelData.position.z || 0;
                    
                    scene.add(fbx);
                    console.log('Model sahneye eklendi');

                    // Update camera position and rotation
                    const distance = modelData.cameraDistance;
                    camera.position.set(
                        distance * Math.cos(modelData.cameraRotation?.y || 0),
                        distance * Math.sin(modelData.cameraRotation?.x || 0) + (modelData.position.y || 0),
                        distance * Math.sin(modelData.cameraRotation?.y || 0)
                    );

                    // Set camera rotation
                    if (modelData.cameraRotation) {
                        camera.rotation.set(
                            modelData.cameraRotation.x || 0,
                            modelData.cameraRotation.y || 0,
                            modelData.cameraRotation.z || 0
                        );
                    }

                    controls.target.set(
                        modelData.position.x || 0,
                        modelData.position.y || 0,
                        modelData.position.z || 0
                    );
                    controls.update();

                    hideLoading();
                } catch (error) {
                    console.error('Model işleme hatası:', error);
                    showError('Model işlenemedi: ' + error.message);
                }
            },
            (xhr) => {
                const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                console.log('Yükleme durumu:', percent + '%');
                showLoading(`Yükleniyor: %${percent}`);
            },
            (error) => {
                console.error('Model yükleme hatası:', error);
                showError('Model yüklenemedi: ' + error.message);
            }
        );
    } catch (error) {
        console.error('loadModel hatası:', error);
        showError('Model yükleme hatası: ' + error.message);
    }
}

// Make loadModel globally available
window.loadModel = loadModel;

// Initialize everything when modules are loaded
function waitForModules() {
    return new Promise((resolve, reject) => {
        const maxAttempts = 50; // 5 seconds maximum
        let attempts = 0;
        
        const check = () => {
            attempts++;
            console.log('Modül kontrolü:', {
                THREE: !!window.THREE,
                OrbitControls: !!window.OrbitControls,
                FBXLoader: !!window.FBXLoader
            });
            
            if (window.THREE && window.OrbitControls && window.FBXLoader) {
                console.log('Tüm modüller yüklendi');
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Modüller zamanında yüklenemedi'));
            } else {
                setTimeout(check, 100);
            }
        };
        
        check();
    });
}

// Start initialization
waitForModules()
    .then(() => {
        console.log('Başlatılıyor...');
        init();
    })
    .catch(error => {
        console.error('Başlatma hatası:', error);
        showError('Uygulama başlatılamadı: ' + error.message);
    });