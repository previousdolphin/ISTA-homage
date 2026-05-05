document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js failed to load.');
        return;
    }

    const container = document.getElementById('canvas-container');
    
    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 4, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- PROCEDURAL TEXTURES ---
    function createTranslucentDiamondTexture() {
        const canvas = document.createElement('canvas');
        const S = 512;
        canvas.width = S; 
        canvas.height = S;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, S, S);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, S, S);
        
        ctx.fillStyle = '#f5f2eb'; 
        ctx.beginPath();
        ctx.moveTo(S/2, 0); ctx.lineTo(S, S/2); ctx.lineTo(S/2, S); ctx.lineTo(0, S/2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    function createDoubleRainbowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; 
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createLinearGradient(0, 1024, 0, 0); 
        grad.addColorStop(0.00, '#e61c28'); 
        grad.addColorStop(0.12, '#ff6600'); 
        grad.addColorStop(0.25, '#ffcc00'); 
        grad.addColorStop(0.38, '#00cc44'); 
        grad.addColorStop(0.47, '#00d4ff'); 
        grad.addColorStop(0.50, '#1a0066'); 
        grad.addColorStop(0.53, '#00d4ff'); 
        grad.addColorStop(0.62, '#00cc44'); 
        grad.addColorStop(0.75, '#ffcc00'); 
        grad.addColorStop(0.88, '#ff6600'); 
        grad.addColorStop(1.00, '#e61c28'); 
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 1024);
        return new THREE.CanvasTexture(canvas);
    }

    function createRoofTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; 
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createLinearGradient(0, 0, 0, 1024);
        grad.addColorStop(0.00, '#00d4ff');
        grad.addColorStop(0.25, '#00cc44');
        grad.addColorStop(0.50, '#ffcc00');
        grad.addColorStop(0.75, '#ff6600');
        grad.addColorStop(1.00, '#e61c28');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 1024);
        return new THREE.CanvasTexture(canvas);
    }

    // --- ENVIRONMENT BUILDING ---
    const floorTex1 = createTranslucentDiamondTexture();
    const floorMat1 = new THREE.MeshBasicMaterial({ map: floorTex1, transparent: true, side: THREE.DoubleSide });
    const floor1Geo = new THREE.PlaneGeometry(20, 52);
    floorTex1.repeat.set(10, 26);
    const floor1 = new THREE.Mesh(floor1Geo, floorMat1);
    floor1.rotation.x = -Math.PI / 2;
    floor1.position.set(0, 0, -4); 
    scene.add(floor1);

    const floorTex2 = createTranslucentDiamondTexture();
    const floorMat2 = new THREE.MeshBasicMaterial({ map: floorTex2, transparent: true, side: THREE.DoubleSide });
    const floor2Geo = new THREE.PlaneGeometry(60, 50);
    floorTex2.repeat.set(30, 25); 
    const floor2 = new THREE.Mesh(floor2Geo, floorMat2);
    floor2.rotation.x = -Math.PI / 2;
    floor2.position.set(0, 0, -55); 
    scene.add(floor2);

    const wallTex = createDoubleRainbowTexture();
    const wallColorMat = new THREE.MeshBasicMaterial({ map: wallTex });
    const wallDarkMat = new THREE.MeshBasicMaterial({ color: 0x020202 }); 
    const wallLength = 52, wallHeight = 16;
    
    const leftWallMats = [wallColorMat, wallDarkMat, wallDarkMat, wallDarkMat, wallDarkMat, wallDarkMat];
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallLength), leftWallMats);
    leftWall.position.set(-10.5, wallHeight/2, -4); 
    scene.add(leftWall);

    const rightWallMats = [wallDarkMat, wallColorMat, wallDarkMat, wallDarkMat, wallDarkMat, wallDarkMat];
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallLength), rightWallMats);
    rightWall.position.set(10.5, wallHeight/2, -4); 
    scene.add(rightWall);

    const roofTex = createRoofTexture();
    const roofMat = new THREE.MeshBasicMaterial({ map: roofTex, side: THREE.DoubleSide });
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 15, 32, 1, true, Math.PI / 2, Math.PI), roofMat);
    roof.rotation.x = Math.PI / 2; 
    roof.position.set(0, wallHeight, -22.5); 
    scene.add(roof);

    const columnMat = new THREE.MeshStandardMaterial({ color: 0xe61c28, roughness: 0.4, metalness: 0.1 });
    function createColumn(xPos) {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 3.5), columnMat);
        base.position.y = 0.6;
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 14, 32), columnMat);
        shaft.position.y = 8.2;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.2, 3.8), columnMat);
        cap.position.y = 15.8;
        group.add(base, shaft, cap);
        group.position.set(xPos, 0, 22); 
        scene.add(group);
    }
    createColumn(-10.5); 
    createColumn(10.5);  

    const leftSpot = new THREE.PointLight(0xffffff, 1.0, 25);
    leftSpot.position.set(-8, 8, 28);
    scene.add(leftSpot);

    const rightSpot = new THREE.PointLight(0xffffff, 1.0, 25);
    rightSpot.position.set(8, 8, 28);
    scene.add(rightSpot);

    // --- SHRINE OF THE BELL ---
    const shrine = new THREE.Group();
    const shrineMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.7, metalness: 0.05 });
    
    const sBase1 = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.4, 8.0), shrineMat); sBase1.position.y = 0.2;
    const sBase2 = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.4, 7.0), shrineMat); sBase2.position.y = 0.6;
    const sBase3 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.4, 6.0), shrineMat); sBase3.position.y = 1.0;
    shrine.add(sBase1, sBase2, sBase3);

    const cornerOffsets = [ [-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4] ];
    cornerOffsets.forEach(pos => {
        const colGroup = new THREE.Group();
        const ped = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), shrineMat); ped.position.y = 1.7;
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.0, 32), shrineMat); shaft.position.y = 4.2;
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 16, 32), shrineMat); ring1.position.y = 2.6; ring1.rotation.x = Math.PI/2;
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 16, 32), shrineMat); ring2.position.y = 5.8; ring2.rotation.x = Math.PI/2;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), shrineMat); cap.position.y = 6.5;
        colGroup.add(ped, shaft, ring1, ring2, cap);
        colGroup.position.set(pos[0], 0, pos[1]);
        shrine.add(colGroup);
    });

    const entab1 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.5, 7.6), shrineMat); entab1.position.y = 7.05;
    const entab2 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.4, 8.2), shrineMat); entab2.position.y = 7.5;
    const entab3 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 7.2), shrineMat); entab3.position.y = 7.95;
    shrine.add(entab1, entab2, entab3);

    const domeGroup = new THREE.Group();
    domeGroup.position.y = 8.2;
    const dRing1 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.2, 16, 64), shrineMat); dRing1.rotation.x = Math.PI/2; dRing1.position.y = 0.2;
    const dRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.15, 16, 64), shrineMat); dRing2.rotation.x = Math.PI/2; dRing2.position.y = 0.5;
    const domeMesh = new THREE.Mesh(new THREE.SphereGeometry(3.1, 64, 32, 0, Math.PI*2, 0, Math.PI/2), shrineMat); domeMesh.position.y = 0.3;
    domeGroup.add(dRing1, dRing2, domeMesh);
    shrine.add(domeGroup);

    const finialGroup = new THREE.Group();
    finialGroup.position.y = 11.5;
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32), shrineMat); fBase.position.y = 0.15;
    const fBulb = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 16), shrineMat); fBulb.position.y = 0.7;
    const fSpire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.5, 32), shrineMat); fSpire.position.y = 1.8;
    finialGroup.add(fBase, fBulb, fSpire);
    shrine.add(finialGroup);

    const bellGroup = new THREE.Group();
    bellGroup.position.y = 6.8;
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.3, metalness: 0.8 });
    const hanger = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 16, 32), bronzeMat); hanger.position.y = -0.3;
    
    const bellPoints = [];
    for(let i=0; i<=20; i++){
        let t = i/20;
        let r = 0.3 + 0.9 * Math.pow(t, 2.5);
        let y = 1.4 * (1 - t);
        bellPoints.push(new THREE.Vector2(r, y));
    }
    bellPoints.push(new THREE.Vector2(1.3, -0.1), new THREE.Vector2(1.15, -0.1));
    const bellMesh = new THREE.Mesh(new THREE.LatheGeometry(bellPoints, 64), bronzeMat); bellMesh.position.y = -2.0;
    const clapperShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16), bronzeMat); clapperShaft.position.y = -1.5;
    const clapperBall = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 16), bronzeMat); clapperBall.position.y = -2.25;
    
    bellGroup.add(hanger, bellMesh, clapperShaft, clapperBall);
    
    // Tag all bell parts so they can be clicked
    bellGroup.children.forEach(child => child.userData.isBell = true);
    
    shrine.add(bellGroup);
    shrine.position.set(0, 0, -45); 
    scene.add(shrine);

    // --- LIGHTING ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const shrineLight = new THREE.PointLight(0xffffff, 1.2, 60); shrineLight.position.set(0, 12, -35); scene.add(shrineLight);
    const internalGlow = new THREE.PointLight(0xffaa55, 1.0, 15); internalGlow.position.set(0, 4.0, -45); scene.add(internalGlow);

    // --- CONTROLS SYSTEM ---
    const keys = { w: false, a: false, s: false, d: false };
    let pitch = 0, yaw = 0;
    const moveSpeed = 0.15;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const menu = document.getElementById('start-menu');
    const uiLayer = document.getElementById('ui-layer');
    const crosshair = document.getElementById('crosshair');
    
    let leftTouchId = null, rightTouchId = null;
    let leftJoyStart = {x: 0, y: 0}, leftJoyDelta = {x: 0, y: 0};
    let lastRightTouch = {x: 0, y: 0};

    if (isTouch) {
        document.getElementById('desktop-inst').style.display = 'none';
        document.getElementById('mobile-inst').style.display = 'block';
    }

    menu.addEventListener('click', () => {
        uiLayer.style.display = 'none';
        if (!isTouch) document.body.requestPointerLock();
        else document.getElementById('mobile-hint').style.display = 'block';
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === document.body) crosshair.style.display = 'block';
        else { uiLayer.style.display = 'flex'; crosshair.style.display = 'none'; }
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === document.body) {
            yaw -= e.movementX * 0.002;
            pitch -= e.movementY * 0.002;
            pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
            camera.rotation.set(pitch, yaw, 0, 'YXZ');
        }
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = true;
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) keys[key] = false;
    });

    // --- INTERACTION / RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    
    function checkBellClick(ray) {
        const intersects = ray.intersectObjects(scene.children, true);
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.userData.isBell) {
                // The center of the bell is at z = -45
                // Intersecting a point with z < -45 means we hit the backside of the bell.
                if (intersects[i].point.z < -45.0) {
                    window.open("https://youtu.be/59BzjTCNLSA", "_blank");
                }
                break;
            }
        }
    }

    // Desktop Interaction (Click while pointer locked)
    document.addEventListener('mousedown', (e) => {
        if (document.pointerLockElement === document.body) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            checkBellClick(raycaster);
        }
    });

    // Mobile Touch System
    let touchStartTime = 0;
    let initialTouchPos = {x: 0, y: 0};

    window.addEventListener('touchstart', (e) => {
        if (uiLayer.style.display !== 'none') return;
        touchStartTime = Date.now();
        
        for(let i=0; i<e.changedTouches.length; i++) {
            let t = e.changedTouches[i];
            initialTouchPos = {x: t.clientX, y: t.clientY};
            
            if (t.clientX < window.innerWidth / 2 && leftTouchId === null) {
                leftTouchId = t.identifier;
                leftJoyStart = {x: t.clientX, y: t.clientY};
                leftJoyDelta = {x: 0, y: 0};
            } else if (t.clientX >= window.innerWidth / 2 && rightTouchId === null) {
                rightTouchId = t.identifier;
                lastRightTouch = {x: t.clientX, y: t.clientY};
            }
        }
    }, {passive: false});

    window.addEventListener('touchmove', (e) => {
        if (uiLayer.style.display !== 'none') return;
        e.preventDefault();
        for(let i=0; i<e.changedTouches.length; i++) {
            let t = e.changedTouches[i];
            if (t.identifier === leftTouchId) {
                leftJoyDelta.x = t.clientX - leftJoyStart.x;
                leftJoyDelta.y = t.clientY - leftJoyStart.y;
            } else if (t.identifier === rightTouchId) {
                yaw -= (t.clientX - lastRightTouch.x) * 0.004;
                pitch -= (t.clientY - lastRightTouch.y) * 0.004;
                pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
                camera.rotation.set(pitch, yaw, 0, 'YXZ');
                lastRightTouch = {x: t.clientX, y: t.clientY};
            }
        }
    }, {passive: false});

    window.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        for(let i=0; i<e.changedTouches.length; i++) {
            let t = e.changedTouches[i];
            
            // Treat as a tap interaction if quick and hasn't dragged far
            const distMoved = Math.hypot(t.clientX - initialTouchPos.x, t.clientY - initialTouchPos.y);
            if (touchDuration < 300 && distMoved < 15) {
                const touchX = (t.clientX / window.innerWidth) * 2 - 1;
                const touchY = -(t.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(new THREE.Vector2(touchX, touchY), camera);
                checkBellClick(raycaster);
            }
            
            if (t.identifier === leftTouchId) {
                leftTouchId = null;
                leftJoyDelta = {x: 0, y: 0};
            } else if (t.identifier === rightTouchId) {
                rightTouchId = null;
            }
        }
    });

    // --- MOVEMENT LOGIC ---
    function updateMovement() {
        if (uiLayer.style.display !== 'none') return;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);

        let moveX = 0, moveZ = 0;
        if (keys.w) moveZ += 1;
        if (keys.s) moveZ -= 1;
        if (keys.a) moveX -= 1;
        if (keys.d) moveX += 1;

        if (leftTouchId !== null) {
            moveX += Math.max(-1, Math.min(1, leftJoyDelta.x / 40));
            moveZ += Math.max(-1, Math.min(1, -leftJoyDelta.y / 40)); 
        }

        const mag = Math.sqrt(moveX*moveX + moveZ*moveZ);
        if (mag > 1) { moveX /= mag; moveZ /= mag; }

        camera.position.addScaledVector(forward, moveZ * moveSpeed);
        camera.position.addScaledVector(right, moveX * moveSpeed);

        // Collisions
        if (camera.position.z > -30) { 
            if (camera.position.x < -9) camera.position.x = -9;
            if (camera.position.x > 9) camera.position.x = 9;
        } else { 
            if (camera.position.x < -29) camera.position.x = -29;
            if (camera.position.x > 29) camera.position.x = 29;
            if (camera.position.z < -78) camera.position.z = -78;
        }

        if (camera.position.z > 45) camera.position.z = 45; 
        
        // Soft collision for the shrine structure
        if (camera.position.z < -38 && camera.position.z > -52 && Math.abs(camera.position.x) < 5.0) {
            camera.position.subScaledVector(forward, moveZ * moveSpeed);
            camera.position.subScaledVector(right, moveX * moveSpeed);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        updateMovement();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});