// Configuration de base - OPTIMISÉE
const CONFIG = {
    CHUNK_SIZE: 16,
    WORLD_HEIGHT: 128,
    RENDER_DISTANCE: 4,  // Réduit de 8 à 4
    BLOCK_SIZE: 1,
    PLAYER_HEIGHT: 1.62,
    MOVEMENT_SPEED: 0.1,
    ROTATION_SPEED: 0.005,
    REACH_DISTANCE: 5
};

// Variables globales
let scene, camera, renderer, world;
let player = {
    position: new THREE.Vector3(0, 100, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    speed: CONFIG.MOVEMENT_SPEED,
    canFly: true,
    isFlying: false,
    isJumping: false
};

let gameState = {
    selectedBlock: 'dirt',
    showGrid: false,
    gameMode: 'creative',
    blockCount: 0,
    fps: 0,
    isLoaded: false
};

const keys = {};
const mouse = { x: 0, y: 0, locked: false };
const raycaster = new THREE.Raycaster();
let frameCount = 0;
let lastTime = Date.now();

// Initialisation
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 200, 400);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.copy(player.position);

    // Renderer - OPTIMISÉ
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.shadowMap.enabled = false;  // Désactiver les ombres
    document.body.appendChild(renderer.domElement);

    // Lights
    setupLights();

    // World
    world = new World();
    world.generateChunks(player.position);

    // Event listeners
    setupEventListeners();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        gameState.isLoaded = true;
    }, 1000);

    // Animation loop
    animate();
}

function setupLights() {
    // Sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
}

function setupEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;

        if (e.key === 'c' || e.key === 'C') {
            player.canFly = !player.canFly;
            player.isFlying = player.canFly;
        }

        if (e.key === 'g' || e.key === 'G') {
            gameState.showGrid = !gameState.showGrid;
            updateWorldVisuals();
        }

        // Number keys for block selection
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
            const blocks = ['dirt', 'stone', 'grass', 'wood', 'sand', 'water'];
            selectBlock(blocks[num - 1]);
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Mouse
    document.addEventListener('pointerlockchange', () => {
        mouse.locked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (e) => {
        if (!mouse.locked) return;

        const deltaX = e.movementX || 0;
        const deltaY = e.movementY || 0;

        player.rotation.setFromQuaternion(
            new THREE.Quaternion().setFromEuler(player.rotation)
        );

        player.rotation.y -= deltaX * CONFIG.ROTATION_SPEED;
        player.rotation.x -= deltaY * CONFIG.ROTATION_SPEED;

        if (player.rotation.x > Math.PI / 2) {
            player.rotation.x = Math.PI / 2;
        }
        if (player.rotation.x < -Math.PI / 2) {
            player.rotation.x = -Math.PI / 2;
        }
    });

    document.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    // Mouse clicks
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) destroyBlock(); // Left click
        if (e.button === 2) placeBlock(); // Right click
    });

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Hotbar selection
    document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
        slot.addEventListener('click', () => {
            selectBlock(slot.dataset.block);
        });
    });

    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function selectBlock(blockType) {
    gameState.selectedBlock = blockType;
    document.querySelectorAll('.hotbar-slot').forEach((slot) => {
        if (slot.dataset.block === blockType) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    });
    updateUI();
}

function destroyBlock() {
    const direction = new THREE.Vector3(0, 0, -1)
        .applyEuler(player.rotation);
    raycaster.set(camera.position, direction);

    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].distance > CONFIG.REACH_DISTANCE) break;
        if (intersects[i].object.userData.block) {
            world.removeBlock(intersects[i].object.userData.blockPos);
            return;
        }
    }
}

function placeBlock() {
    const direction = new THREE.Vector3(0, 0, -1)
        .applyEuler(player.rotation);
    raycaster.set(camera.position, direction);

    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].distance > CONFIG.REACH_DISTANCE) break;
        if (intersects[i].object.userData.block) {
            const pos = intersects[i].object.userData.blockPos.clone();
            const normal = intersects[i].face.normal;
            pos.add(normal);
            world.addBlock(pos, gameState.selectedBlock);
            return;
        }
    }
}

function updateWorldVisuals() {
    scene.children.forEach((child) => {
        if (child.userData.isChunk) {
            child.children.forEach((block) => {
                if (block.userData.block) {
                    block.material.wireframe = gameState.showGrid;
                }
            });
        }
    });
}

function updatePlayerMovement() {
    if (!gameState.isLoaded) return;

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(player.rotation);
    const right = new THREE.Vector3(1, 0, 0).applyEuler(player.rotation);

    if (keys['z'] || keys['w']) player.velocity.add(forward.multiplyScalar(player.speed));
    if (keys['s']) player.velocity.add(forward.multiplyScalar(-player.speed));
    if (keys['q'] || keys['a']) player.velocity.add(right.multiplyScalar(-player.speed));
    if (keys['d']) player.velocity.add(right.multiplyScalar(player.speed));

    if (player.canFly) {
        if (keys[' ']) player.velocity.y += player.speed;
        if (keys['shift']) player.velocity.y -= player.speed;
        player.velocity.y *= 0.95;
    } else {
        // Gravity
        player.velocity.y -= 0.01;
        if (player.velocity.y < -0.5) player.velocity.y = -0.5;

        // Jump
        if (keys[' '] && !player.isJumping) {
            player.velocity.y = 0.3;
            player.isJumping = true;
        }
    }

    player.velocity.x *= 0.9;
    player.velocity.z *= 0.9;

    player.position.add(player.velocity);

    // Collision with world border
    if (player.position.y < 0) player.position.y = 100;

    // Update camera
    camera.position.copy(player.position);
    camera.quaternion.setFromEuler(player.rotation);

    // Update chunks around player
    world.generateChunks(player.position);
}

function updateUI() {
    document.getElementById('posX').textContent = Math.floor(player.position.x);
    document.getElementById('posY').textContent = Math.floor(player.position.y);
    document.getElementById('posZ').textContent = Math.floor(player.position.z);
    document.getElementById('selectedBlock').textContent =
        gameState.selectedBlock.charAt(0).toUpperCase() +
        gameState.selectedBlock.slice(1);
    document.getElementById('gameMode').textContent = player.canFly ? 'Créatif' : 'Survie';
    document.getElementById('blockCount').textContent = gameState.blockCount;
    document.getElementById('fps').textContent = gameState.fps;
}

function animate() {
    requestAnimationFrame(animate);

    frameCount++;
    const currentTime = Date.now();
    if (currentTime - lastTime >= 1000) {
        gameState.fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
    }

    updatePlayerMovement();
    updateUI();

    renderer.render(scene, camera);
}

// World manager - OPTIMISÉ
class World {
    constructor() {
        this.chunks = new Map();
        this.blockTypes = {
            air: { color: 0x87ceeb, visible: false },
            dirt: { color: 0x8b6914 },
            stone: { color: 0x808080 },
            grass: { color: 0x2d8659 },
            wood: { color: 0xa0522d },
            sand: { color: 0xf4d03f },
            water: { color: 0x1e90ff, transparent: true }
        };
    }

    getChunkKey(pos) {
        const chunkX = Math.floor(pos.x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(pos.z / CONFIG.CHUNK_SIZE);
        return `${chunkX},${chunkZ}`;
    }

    generateChunks(playerPos) {
        const renderDist = CONFIG.RENDER_DISTANCE;
        const chunkX = Math.floor(playerPos.x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(playerPos.z / CONFIG.CHUNK_SIZE);

        for (let x = chunkX - renderDist; x <= chunkX + renderDist; x++) {
            for (let z = chunkZ - renderDist; z <= chunkZ + renderDist; z++) {
                const key = `${x},${z}`;
                if (!this.chunks.has(key)) {
                    this.generateChunk(x, z);
                }
            }
        }

        // Remove distant chunks
        this.chunks.forEach((chunk, key) => {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - chunkX) > renderDist + 1 || Math.abs(cz - chunkZ) > renderDist + 1) {
                scene.remove(chunk.mesh);
                this.chunks.delete(key);
            }
        });
    }

    generateChunk(chunkX, chunkZ) {
        const chunkGroup = new THREE.Group();
        chunkGroup.userData.isChunk = true;

        const chunkData = {};

        // Generate terrain
        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;
                const height = this.generateHeight(worldX, worldZ);

                for (let y = 0; y < Math.min(height + 5, CONFIG.WORLD_HEIGHT); y++) {
                    const pos = `${x},${y},${z}`;
                    if (y < height) {
                        if (y === height - 1) {
                            chunkData[pos] = 'grass';
                        } else if (y > height - 5) {
                            chunkData[pos] = 'dirt';
                        } else {
                            chunkData[pos] = 'stone';
                        }
                    }
                }
            }
        }

        // Add blocks to chunk
        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                for (let y = 0; y < CONFIG.WORLD_HEIGHT; y++) {
                    const pos = `${x},${y},${z}`;
                    if (chunkData[pos]) {
                        this.addBlockToChunk(
                            chunkGroup,
                            chunkData[pos],
                            x,
                            y,
                            z,
                            chunkX,
                            chunkZ
                        );
                    }
                }
            }
        }

        scene.add(chunkGroup);
        this.chunks.set(`${chunkX},${chunkZ}`, { mesh: chunkGroup, data: chunkData });
    }

    generateHeight(x, z) {
        // Simple Perlin-like noise simulation
        const octaves = 3;
        let height = 0;
        let amplitude = 1;
        let frequency = 0.01;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            height += Math.sin(x * frequency) * Math.cos(z * frequency) * amplitude * 25;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return Math.floor(height / maxValue + 40);
    }

    addBlockToChunk(group, blockType, x, y, z, chunkX, chunkZ) {
        const geometry = new THREE.BoxGeometry(
            CONFIG.BLOCK_SIZE,
            CONFIG.BLOCK_SIZE,
            CONFIG.BLOCK_SIZE
        );

        const material = new THREE.MeshLambertMaterial({
            color: this.blockTypes[blockType].color
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.block = blockType;
        mesh.userData.blockPos = new THREE.Vector3(
            chunkX * CONFIG.CHUNK_SIZE + x,
            y,
            chunkZ * CONFIG.CHUNK_SIZE + z
        );

        mesh.position.set(
            chunkX * CONFIG.CHUNK_SIZE + x,
            y,
            chunkZ * CONFIG.CHUNK_SIZE + z
        );

        group.add(mesh);
        gameState.blockCount++;
    }

    addBlock(pos, blockType) {
        const chunkX = Math.floor(pos.x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(pos.z / CONFIG.CHUNK_SIZE);
        const key = `${chunkX},${chunkZ}`;

        if (!this.chunks.has(key)) return;

        const chunk = this.chunks.get(key);

        const geometry = new THREE.BoxGeometry(
            CONFIG.BLOCK_SIZE,
            CONFIG.BLOCK_SIZE,
            CONFIG.BLOCK_SIZE
        );
        const material = new THREE.MeshLambertMaterial({
            color: this.blockTypes[blockType].color
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.block = blockType;
        mesh.userData.blockPos = pos.clone();
        mesh.position.copy(pos);

        chunk.mesh.add(mesh);
        gameState.blockCount++;
    }

    removeBlock(pos) {
        const chunkX = Math.floor(pos.x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(pos.z / CONFIG.CHUNK_SIZE);
        const key = `${chunkX},${chunkZ}`;

        if (!this.chunks.has(key)) return;

        const chunk = this.chunks.get(key);
        chunk.mesh.children.forEach((block, index) => {
            if (block.userData.blockPos && block.userData.blockPos.equals(pos)) {
                chunk.mesh.remove(block);
                gameState.blockCount--;
            }
        });
    }
}

// Start the game
init();