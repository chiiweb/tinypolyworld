var Colors = {
	red:0xf25346,
	yellow:0xedeb27,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
	green:0x458248,
	purple:0x551A8B,
	lightgreen:0x629265,
};



var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;


function createScene() {
	// Get the width and height of the screen
	// and use them to setup the aspect ratio
	// of the camera and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene.
	scene = new THREE.Scene();

	// Add FOV Fog effect to the scene. Same colour as the BG int he stylesheet.
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);
	// Position the camera
	camera.position.x = 0;
	camera.position.y = 150;
	camera.position.z = 100;	

	// Create the renderer

	renderer = new THREE.WebGLRenderer ({
	// Alpha makes the background transparent, antialias is performant heavy
		alpha: true,
		antialias:true
	});

	//set the size of the renderer to fullscreen
	renderer.setSize (WIDTH, HEIGHT);
	//enable shadow rendering
	renderer.shadowMapEnabled = true;

	// Add the Renderer to the DOM, in the world div.
	container = document.getElementById('world');
	container.appendChild (renderer.domElement);

	//RESPONSIVE LISTENER
	window.addEventListener('resize', handleWindowResize, false);
}

//RESPONSIVE FUNCTION
function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}


var hemispshereLight, shadowLight;

function createLights(){
	// Gradient coloured light - Sky, Ground, Intensity
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	// Parallel rays
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);



	shadowLight.position.set(0,350,350);
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadowCameraLeft = -650;
	shadowLight.shadowCameraRight = 650;
	shadowLight.shadowCameraTop = 650;
	shadowLight.shadowCameraBottom = -650;
	shadowLight.shadowCameraNear = 1;
	shadowLight.shadowCameraFar = 1000;

	// Shadow map size
	shadowLight.shadowMapWidth = 2048;
	shadowLight.shadowMapHeight = 2048;

	// Add the lights to the scene
	scene.add(hemisphereLight);  

	scene.add(shadowLight);
}	


Land = function(){
	var geom = new THREE.CylinderGeometry(600,600,1700,40,10);
	//rotate on the x axis
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	//create a material
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.lightgreen,
		shading:THREE.FlatShading,
	});

	//create a mesh of the object
	this.mesh = new THREE.Mesh(geom, mat);
	//receive shadows
	this.mesh.receiveShadow = true;
}

Orbit = function(){

	var geom =new THREE.Object3D();

	this.mesh = geom;
	//this.mesh.add(sun);
}

Sun = function(){

	this.mesh = new THREE.Object3D();

	var sunGeom = new THREE.SphereGeometry( 400, 20, 10 );
	var sunMat = new THREE.MeshPhongMaterial({
		color: Colors.yellow,
		shading:THREE.FlatShading,
	});
	var sun = new THREE.Mesh(sunGeom, sunMat);
	//sun.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	sun.castShadow = false;
	sun.receiveShadow = false;
	this.mesh.add(sun);
}

Cloud = function(){
	// Create an empty container for the cloud
	this.mesh = new THREE.Object3D();
	// Cube geometry and material
	var geom = new THREE.DodecahedronGeometry(20,0);
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});

	var nBlocs = 3+Math.floor(Math.random()*3);

	for (var i=0; i<nBlocs; i++ ){
		//Clone mesh geometry
		var m = new THREE.Mesh(geom, mat);
			//Randomly position each cube
			m.position.x = i*15;
			m.position.y = Math.random()*10;
			m.position.z = Math.random()*10;
			m.rotation.z = Math.random()*Math.PI*2;
			m.rotation.y = Math.random()*Math.PI*2;

			//Randomly scale the cubes
			var s = .1 + Math.random()*.9;
			m.scale.set(s,s,s);
			this.mesh.add(m);
	}
}

Sky = function(){

	this.mesh = new THREE.Object3D();

	// Number of cloud groups
	this.nClouds = 25;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nClouds;

	// Create the Clouds

	for(var i=0; i<this.nClouds; i++){
	
		var c = new Cloud();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the cloud itself
		var h = 800 + Math.random()*200;
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;		

		// rotate the cloud according to its position
		c.mesh.rotation.z = a + Math.PI/2;

		// random depth for the clouds on the z-axis
		c.mesh.position.z = -400-Math.random()*400;

		// random scale for each cloud
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		this.mesh.add(c.mesh);
	}
}

Tree = function () {

	this.mesh = new THREE.Object3D();

	var matTreeLeaves = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});

	var geonTreeBase = new THREE.BoxGeometry( 10,20,10 );
	var matTreeBase = new THREE.MeshBasicMaterial( { color:Colors.brown});
	var treeBase = new THREE.Mesh(geonTreeBase,matTreeBase);
	treeBase.castShadow = true;
	treeBase.receiveShadow = true;
	this.mesh.add(treeBase);

	var geomTreeLeaves1 = new THREE.CylinderGeometry(1, 12*3, 12*3, 4 );
	var treeLeaves1 = new THREE.Mesh(geomTreeLeaves1,matTreeLeaves);
	treeLeaves1.castShadow = true;
	treeLeaves1.receiveShadow = true;
	treeLeaves1.position.y = 20
	this.mesh.add(treeLeaves1);

	var geomTreeLeaves2 = new THREE.CylinderGeometry( 1, 9*3, 9*3, 4 );
	var treeLeaves2 = new THREE.Mesh(geomTreeLeaves2,matTreeLeaves);
	treeLeaves2.castShadow = true;
	treeLeaves2.position.y = 40;
	treeLeaves2.receiveShadow = true;
	this.mesh.add(treeLeaves2);

	var geomTreeLeaves3 = new THREE.CylinderGeometry( 1, 6*3, 6*3, 4);
	var treeLeaves3 = new THREE.Mesh(geomTreeLeaves3,matTreeLeaves);
	treeLeaves3.castShadow = true;
	treeLeaves3.position.y = 55;
	treeLeaves3.receiveShadow = true;
	this.mesh.add(treeLeaves3);

}

Flower = function () {

	this.mesh = new THREE.Object3D();

	var geomStem = new THREE.BoxGeometry( 5,50,5,1,1,1 );
	var matStem = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});
	var stem = new THREE.Mesh(geomStem,matStem);
	stem.castShadow = false;
	stem.receiveShadow = true;
	this.mesh.add(stem);


	var geomPetalCore = new THREE.BoxGeometry(10,10,10,1,1,1);
	var matPetalCore = new THREE.MeshPhongMaterial({color:Colors.yellow, shading:THREE.FlatShading});
	petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
	petalCore.castShadow = false;
	petalCore.receiveShadow = true;

	var petalColor = petalColors [Math.floor(Math.random()*3)];

	var geomPetal = new THREE.BoxGeometry( 15,20,5,1,1,1 );
	var matPetal = new THREE.MeshBasicMaterial( { color:petalColor});
	geomPetal.vertices[5].y-=4;
	geomPetal.vertices[4].y-=4;
	geomPetal.vertices[7].y+=4;
	geomPetal.vertices[6].y+=4;
	geomPetal.applyMatrix(new THREE.Matrix4().makeTranslation(12.5, 0, 3));

		var petals = [];
		for(var i=0; i<4; i++){	

			petals[i]=new THREE.Mesh(geomPetal,matPetal);
			petals[i].rotation.z = i*Math.PI/2;
			petals[i].castShadow = true;
			petals[i].receiveShadow = true;
		}

	petalCore.add(petals[0],petals[1],petals[2],petals[3]);
	petalCore.position.y = 25;
	petalCore.position.z = 3;
	this.mesh.add(petalCore);

}

var petalColors = [Colors.red, Colors.yellow, Colors.blue];

// --- Lily of the valley, for the night map ---------------------------------
LilyOfValley = function () {

	this.mesh = new THREE.Object3D();

	var leafMat = new THREE.MeshPhongMaterial({ color: 0x2f6b3a, shading: THREE.FlatShading });
	for (var l = 0; l < 2; l++) {
		var leaf = new THREE.Mesh(new THREE.SphereGeometry(10, 6, 4), leafMat);
		leaf.scale.set(0.35, 1.3, 0.08);
		leaf.position.set(l === 0 ? -3 : 3, 11, 0);
		leaf.rotation.z = l === 0 ? 0.4 : -0.4;
		leaf.rotation.y = l === 0 ? 0.5 : -0.5;
		leaf.castShadow = true;
		leaf.receiveShadow = true;
		this.mesh.add(leaf);
	}

	var stemMat = new THREE.MeshPhongMaterial({ color: 0x3c7a44, shading: THREE.FlatShading });
	var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 32, 5), stemMat);
	stem.position.y = 22;
	stem.rotation.z = 0.15;
	stem.castShadow = true;
	this.mesh.add(stem);

	// tiny drooping white bells along the stem - the classic raceme shape
	var bellMat = new THREE.MeshPhongMaterial({ color: 0xfbfbf5, shading: THREE.FlatShading, emissive: 0x2b2b1c });
	var nBells = 5;
	for (var i = 0; i < nBells; i++) {
		var t = i / (nBells - 1);
		var bell = new THREE.Mesh(new THREE.SphereGeometry(2.6, 7, 6, 0, Math.PI * 2, 0, Math.PI * 0.65), bellMat);
		bell.position.set(1.6 + t * 7, 36 - t * 13, 0);
		bell.rotation.x = Math.PI;
		bell.rotation.z = 0.35 + t * 0.15;
		bell.castShadow = true;
		bell.receiveShadow = true;
		this.mesh.add(bell);
	}
}

// --- Glowing bioluminescent flower, for the aurora map ----------------------
AuroraFlower = function (color) {

	this.mesh = new THREE.Object3D();

	var stemMat = new THREE.MeshPhongMaterial({ color: 0x2d6a4f, shading: THREE.FlatShading });
	var stem = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 38, 5), stemMat);
	stem.position.y = 19;
	stem.castShadow = true;
	this.mesh.add(stem);

	// bright, unlit core + petals so they read as glowing under the aurora
	var core = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
	core.position.y = 40;
	this.mesh.add(core);

	var petalMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.85 });
	var nPetals = 5;
	for (var i = 0; i < nPetals; i++) {
		var a = (i / nPetals) * Math.PI * 2;
		var petal = new THREE.Mesh(new THREE.SphereGeometry(6, 6, 4), petalMat);
		petal.position.set(Math.cos(a) * 8, 40 + Math.sin(a) * 3, Math.sin(a) * 8);
		petal.scale.set(1.4, 0.6, 0.9);
		this.mesh.add(petal);
	}
}

// --- Sakura (cherry blossom) tree, for the spring map -----------------------
SakuraTree = function () {

	this.mesh = new THREE.Object3D();

	var trunkMat = new THREE.MeshPhongMaterial({ color: 0x6b4a3a, shading: THREE.FlatShading });
	var trunk = new THREE.Mesh(new THREE.CylinderGeometry(5, 7, 46, 7), trunkMat);
	trunk.position.y = 23;
	this.mesh.add(trunk);

	// a handful of puffy, overlapping blossom clusters instead of one
	// solid canopy, so it reads as fluffy flowers rather than a leaf ball
	var blossomColors = [0xffd1e6, 0xffb6d0, 0xfff0f5];
	var canopyMat = new THREE.MeshPhongMaterial({ color: blossomColors[Math.floor(Math.random() * blossomColors.length)], shading: THREE.FlatShading });
	var nClusters = 5;
	for (var i = 0; i < nClusters; i++) {
		var cluster = new THREE.Mesh(new THREE.DodecahedronGeometry(13 + Math.random() * 5, 0), canopyMat);
		var a = (i / nClusters) * Math.PI * 2;
		cluster.position.set(Math.cos(a) * 12, 50 + Math.sin(a) * 6, Math.sin(a) * 12);
		cluster.castShadow = true;
		this.mesh.add(cluster);
	}
	var topCluster = new THREE.Mesh(new THREE.DodecahedronGeometry(16, 0), canopyMat);
	topCluster.position.y = 63;
	topCluster.castShadow = true;
	this.mesh.add(topCluster);
}

// --- Tulip flower, for the spring map ---------------------------------------
TulipFlower = function () {

	this.mesh = new THREE.Object3D();

	var stemMat = new THREE.MeshPhongMaterial({ color: 0x4f8a3d, shading: THREE.FlatShading });
	var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 24, 5), stemMat);
	stem.position.y = 12;
	this.mesh.add(stem);

	var tulipColors = [0xe0416b, 0xff8fa3, 0xf6c945, 0x9d6fd1, 0xffffff];
	var petalMat = new THREE.MeshPhongMaterial({ color: tulipColors[Math.floor(Math.random() * tulipColors.length)], shading: THREE.FlatShading });
	var nPetals = 6;
	for (var i = 0; i < nPetals; i++) {
		var a = (i / nPetals) * Math.PI * 2;
		var petal = new THREE.Mesh(new THREE.SphereGeometry(4, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.7), petalMat);
		petal.position.set(Math.cos(a) * 2, 26, Math.sin(a) * 2);
		petal.scale.set(1, 1.6, 1);
		petal.rotation.x = Math.PI * 0.15;
		this.mesh.add(petal);
	}
}

// --- Acacia tree, flat-topped savanna silhouette for the sunset map --------
AcaciaTree = function () {

	this.mesh = new THREE.Object3D();

	var trunkMat = new THREE.MeshPhongMaterial({ color: 0x4a3320, shading: THREE.FlatShading });
	var trunk = new THREE.Mesh(new THREE.CylinderGeometry(4, 7, 55, 6), trunkMat);
	trunk.position.y = 27;
	trunk.rotation.z = 0.08;
	trunk.castShadow = true;
	trunk.receiveShadow = true;
	this.mesh.add(trunk);

	var canopyMat = new THREE.MeshPhongMaterial({ color: 0x3f3319, shading: THREE.FlatShading });
	var canopy = new THREE.Mesh(new THREE.CylinderGeometry(46, 50, 10, 8), canopyMat);
	canopy.position.y = 58;
	canopy.castShadow = true;
	canopy.receiveShadow = true;
	this.mesh.add(canopy);

	var canopy2 = new THREE.Mesh(new THREE.CylinderGeometry(30, 40, 8, 8), canopyMat);
	canopy2.position.y = 50;
	canopy2.castShadow = true;
	this.mesh.add(canopy2);
}

// --- Sunset flower - poppy-like, warm reds and oranges ----------------------
SunsetFlower = function () {

	this.mesh = new THREE.Object3D();

	var stemMat = new THREE.MeshPhongMaterial({ color: 0x5c7a3a, shading: THREE.FlatShading });
	var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 20, 5), stemMat);
	stem.position.y = 10;
	this.mesh.add(stem);

	var petalColor = Math.random() > 0.5 ? 0xe8542a : 0xf2a13a;
	var petalMat = new THREE.MeshPhongMaterial({ color: petalColor, shading: THREE.FlatShading });
	var nPetals = 5;
	for (var i = 0; i < nPetals; i++) {
		var a = (i / nPetals) * Math.PI * 2;
		var petal = new THREE.Mesh(new THREE.SphereGeometry(5, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), petalMat);
		petal.position.set(Math.cos(a) * 3, 22, Math.sin(a) * 3);
		petal.rotation.x = Math.PI / 2 + 0.3;
		petal.rotation.z = a;
		this.mesh.add(petal);
	}

	var center = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 5), new THREE.MeshPhongMaterial({ color: 0x3a2a1a, shading: THREE.FlatShading }));
	center.position.y = 23;
	this.mesh.add(center);
}



Forest = function(){

	this.mesh = new THREE.Object3D();

	// Number of Trees
	this.nTrees = 300;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nTrees;

	// Create the Trees

	for(var i=0; i<this.nTrees; i++){
	
		var t = new Tree();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the tree itself
		var h = 605;
		t.mesh.position.y = Math.sin(a)*h;
		t.mesh.position.x = Math.cos(a)*h;		

		// rotate the tree according to its position
		t.mesh.rotation.z = a + (Math.PI/2)*3;

		//Andreas Trigo funtime
		//t.mesh.rotation.z = Math.atan2(t.mesh.position.y, t.mesh.position.x)-Math.PI/2;

		// random depth for the tree on the z-axis
		// spread across a wider, more centered range so the ring
		// doesn't have a bare gap as it spins around
		t.mesh.position.z = 250-Math.random()*1000;

		// random scale for each tree
		var s = .3+Math.random()*.75;
		t.mesh.scale.set(s,s,s);

		this.mesh.add(t.mesh);
	}

	// Number of Trees
	this.nFlowers = 350;

	var stepAngle = Math.PI*2 / this.nFlowers;


	for(var i=0; i<this.nFlowers; i++){	

		var f = new Flower();
		var a = stepAngle*i;

		var h = 605;
		f.mesh.position.y = Math.sin(a)*h;
		f.mesh.position.x = Math.cos(a)*h;		

		f.mesh.rotation.z = a + (Math.PI/2)*3;

		f.mesh.position.z = 250-Math.random()*1000;

		var s = .1+Math.random()*.3;
		f.mesh.scale.set(s,s,s);

		this.mesh.add(f.mesh);
	}

}

var AirPlane = function() {
	
	this.mesh = new THREE.Object3D();

	// Create the cabin
	var geomCockpit = new THREE.BoxGeometry(80,50,50,1,1,1);
	var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	geomCockpit.vertices[4].y-=10;
	geomCockpit.vertices[4].z+=20;
	geomCockpit.vertices[5].y-=10;
	geomCockpit.vertices[5].z-=20;
	geomCockpit.vertices[6].y+=30;
	geomCockpit.vertices[6].z+=20;
	geomCockpit.vertices[7].y+=30;
	geomCockpit.vertices[7].z-=20;
	var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);
	
	// Create the engine
	var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
	var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 40;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);
	
	// Create the tail
	var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-35,25,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);
	
	// Create the wing
	var geomSideWing = new THREE.BoxGeometry(40,4,150,1,1,1);
	var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

	var sideWingTop = new THREE.Mesh(geomSideWing, matSideWing);
	var sideWingBottom = new THREE.Mesh(geomSideWing, matSideWing);
	sideWingTop.castShadow = true;
	sideWingTop.receiveShadow = true;
	sideWingBottom.castShadow = true;
	sideWingBottom.receiveShadow = true;

	sideWingTop.position.set(20,12,0);
	sideWingBottom.position.set(20,-3,0);
	this.mesh.add(sideWingTop);
	this.mesh.add(sideWingBottom);

	var geomWindshield = new THREE.BoxGeometry(3,15,20,1,1,1);
	var matWindshield = new THREE.MeshPhongMaterial({color:Colors.white,transparent:true, opacity:.3, shading:THREE.FlatShading});;
	var windshield = new THREE.Mesh(geomWindshield, matWindshield);
	windshield.position.set(5,27,0);

	windshield.castShadow = true;
	windshield.receiveShadow = true;

	this.mesh.add(windshield);

	var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
	geomPropeller.vertices[4].y-=5;
	geomPropeller.vertices[4].z+=5;
	geomPropeller.vertices[5].y-=5;
	geomPropeller.vertices[5].z-=5;
	geomPropeller.vertices[6].y+=5;
	geomPropeller.vertices[6].z+=5;
	geomPropeller.vertices[7].y+=5;
	geomPropeller.vertices[7].z-=5;
	var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;


	var geomBlade1 = new THREE.BoxGeometry(1,100,10,1,1,1);
	var geomBlade2 = new THREE.BoxGeometry(1,10,100,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
	
	var blade1 = new THREE.Mesh(geomBlade1, matBlade);
	blade1.position.set(8,0,0);
	blade1.castShadow = true;
	blade1.receiveShadow = true;

	var blade2 = new THREE.Mesh(geomBlade2, matBlade);
	blade2.position.set(8,0,0);
	blade2.castShadow = true;
	blade2.receiveShadow = true;
	this.propeller.add(blade1, blade2);
	this.propeller.position.set(50,0,0);
	this.mesh.add(this.propeller);

	var wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
	var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
	wheelProtecR.position.set(25,-20,25);
	this.mesh.add(wheelProtecR);

	var wheelTireGeom = new THREE.BoxGeometry(24,24,4);
	var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
	var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
	wheelTireR.position.set(25,-28,25);

	var wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
	var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
	wheelTireR.add(wheelAxis);

	this.mesh.add(wheelTireR);

	var wheelProtecL = wheelProtecR.clone();
	wheelProtecL.position.z = -wheelProtecR.position.z ;
	this.mesh.add(wheelProtecL);

	var wheelTireL = wheelTireR.clone();
	wheelTireL.position.z = -wheelTireR.position.z;
	this.mesh.add(wheelTireL);

	var wheelTireB = wheelTireR.clone();
	wheelTireB.scale.set(.5,.5,.5);
	wheelTireB.position.set(-35,-5,0);
	this.mesh.add(wheelTireB);

	var suspensionGeom = new THREE.BoxGeometry(4,20,4);
	suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
	var suspensionMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
	suspension.position.set(-35,-5,0);
	suspension.rotation.z = -.3;
	this.mesh.add(suspension);
};

var Fox = function() {
	
	this.mesh = new THREE.Object3D();
	
	var redFurMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

	// Create the Body
	var geomBody = new THREE.BoxGeometry(100,50,50,1,1,1);
	var body = new THREE.Mesh(geomBody, redFurMat);
	body.castShadow = true;
	body.receiveShadow = true;
	this.mesh.add(body);
	
	// Create the Chest
	var geomChest = new THREE.BoxGeometry(50,60,70,1,1,1);
	var chest = new THREE.Mesh(geomChest, redFurMat);
	chest.position.x = 60;
	chest.castShadow = true;
	chest.receiveShadow = true;
	this.mesh.add(chest);

	// Create the Head
	var geomHead = new THREE.BoxGeometry(40,55,50,1,1,1);
	this.head = new THREE.Mesh(geomHead, redFurMat);
	this.head.position.set(80, 35, 0);
	this.head.castShadow = true;
	this.head.receiveShadow = true;

	// Create the Snout
	var geomSnout = new THREE.BoxGeometry(40,30,30,1,1,1);
	var snout = new THREE.Mesh(geomSnout, redFurMat);
	geomSnout.vertices[0].y-=5;
	geomSnout.vertices[0].z+=5;
	geomSnout.vertices[1].y-=5;
	geomSnout.vertices[1].z-=5;
	geomSnout.vertices[2].y+=5;
	geomSnout.vertices[2].z+=5;
	geomSnout.vertices[3].y+=5;
	geomSnout.vertices[3].z-=5;
	snout.castShadow = true;
	snout.receiveShadow = true;
	snout.position.set(30,0,0);
	this.head.add(snout);

	// Create the Nose
	var geomNose = new THREE.BoxGeometry(10,15,20,1,1,1);
	var matNose = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	var nose = new THREE.Mesh(geomNose, matNose);
	nose.position.set(55,0,0);
	this.head.add(nose);

	// Create the Ears
	var geomEar = new THREE.BoxGeometry(10,40,30,1,1,1);
	var earL = new THREE.Mesh(geomEar, redFurMat);
	earL.position.set(-10,40,-18);
	this.head.add(earL);
	earL.rotation.x=-Math.PI/10;
	geomEar.vertices[1].z+=5;
	geomEar.vertices[4].z+=5;
	geomEar.vertices[0].z-=5;
	geomEar.vertices[5].z-=5;

	// Create the Ear Tips
	var geomEarTipL = new THREE.BoxGeometry(10,10,20,1,1,1);
	var matEarTip = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var earTipL = new THREE.Mesh(geomEarTipL, matEarTip);
	earTipL.position.set(0,25,0);
	earL.add(earTipL);

	var earR = earL.clone();
	earR.position.z = -earL.position.z;
	earR.rotation.x = -	earL.rotation.x;
	this.head.add(earR);

	this.mesh.add(this.head);

	
	// Create the tail
	var geomTail = new THREE.BoxGeometry(80,40,40,2,1,1);
	geomTail.vertices[4].y-=10;
	geomTail.vertices[4].z+=10;
	geomTail.vertices[5].y-=10;
	geomTail.vertices[5].z-=10;
	geomTail.vertices[6].y+=10;
	geomTail.vertices[6].z+=10;
	geomTail.vertices[7].y+=10;
	geomTail.vertices[7].z-=10;
	this.tail = new THREE.Mesh(geomTail, redFurMat);
	this.tail.castShadow = true;
	this.tail.receiveShadow = true;

	// Create the tail Tip
	var geomTailTip = new THREE.BoxGeometry(20,40,40,1,1,1);
	var matTailTip = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var tailTip = new THREE.Mesh(geomTailTip, matTailTip);
	tailTip.position.set(80,0,0);
	tailTip.castShadow = true;
	tailTip.receiveShadow = true;
	this.tail.add(tailTip);
	this.tail.position.set(-40,10,0);
	geomTail.translate(40,0,0);
	geomTailTip.translate(10,0,0);
	this.tail.rotation.z = Math.PI/1.5;
	this.mesh.add(this.tail);


	// Create the Legs
	var geomLeg = new THREE.BoxGeometry(20,60,20,1,1,1);
	this.legFR = new THREE.Mesh(geomLeg, redFurMat);
	this.legFR.castShadow = true;
	this.legFR.receiveShadow = true;

	// Create the feet
	var geomFeet = new THREE.BoxGeometry(20,20,20,1,1,1);
	var matFeet = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
	var feet = new THREE.Mesh(geomFeet, matFeet);
	feet.position.set(0,0,0);
	feet.castShadow = true;
	feet.receiveShadow = true;
	this.legFR.add(feet);
	this.legFR.position.set(70,-12,25);
	geomLeg.translate(0,40,0);
	geomFeet.translate(0,80,0);
	this.legFR.rotation.z = 16;
	this.mesh.add(this.legFR);

	this.legFL = this.legFR.clone();
	this.legFL.position.z = -this.legFR.position.z;
	this.legFL.rotation.z = -this.legFR.rotation.z;
	this.mesh.add(this.legFL);

	this.legBR = this.legFR.clone();
	this.legBR.position.x = -(this.legFR.position.x)+50;
	this.legBR.rotation.z = -this.legFR.rotation.z;
	this.mesh.add(this.legBR);

	this.legBL = this.legFL.clone();
	this.legBL.position.x = -(this.legFL.position.x)+50;
	this.legBL.rotation.z = -this.legFL.rotation.z;
	this.mesh.add(this.legBL);

};


var sky;
var forest;
var land;
var orbit;
var airplane;
var sun;
var fox;
var stars;

var mousePos={x:0, y:0};
var touchPos={x:0, y:0};
var keyboardSteer={x:0, y:0};
var offSet = -600;
var joystickActive = false;
var joystickBase = null;
var joystickHandle = null;
var joystickCenter = {x:0, y:0};
var currentMap = 'forest';
var cameraMode = 'follow';
var cameraAngle = 0;
var cameraViewIndex = 0;
var cameraViews = ['follow', 'orbit', 'chase'];
var mapDecor = null;
var mapDecorRing = null;
var mapThemes = {
	forest: {sky:0xe4e0ba, fog:0xf7d9aa, land:0x629265, cloud:0xffffff, sun:0xedeb27, tree:0x458248, accent:0x68c3c0},
	spring: {sky:0xbfe6f5, fog:0xf7cfe0, land:0x8fc76e, cloud:0xffffff, sun:0xfff2a8, tree:0xf2a7c3, accent:0xffb3c6},
	night: {sky:0x09111d, fog:0x1a2b4c, land:0x274c4b, cloud:0x9ea8c3, sun:0xffe082, tree:0x365c4b, accent:0x7bdff2},
	aurora: {sky:0x1c2648, fog:0x264653, land:0x2a9d8f, cloud:0xb7f2ff, sun:0x89c2d9, tree:0x2d6a4f, accent:0x8eecf5},
	sunset: {sky:0xf6a57a, fog:0xd96c4b, land:0x7a4e2e, cloud:0xfff3d6, sun:0xff7f50, tree:0x8b4d1f, accent:0xf4a261}
};


function createSky(){
  sky = new Sky();
  sky.mesh.position.y = offSet;
  scene.add(sky.mesh);
}

function createLand(){
  land = new Land();
  land.mesh.position.y = offSet;
  scene.add(land.mesh);
}

function createOrbit(){
  orbit = new Orbit();
  orbit.mesh.position.y = offSet;
  orbit.mesh.rotation.z = -Math.PI/6; 
  scene.add(orbit.mesh);
}

function createForest(){
  forest = new Forest();
  forest.mesh.position.y = offSet;
  scene.add(forest.mesh);
}

function createSun(){ 
	sun = new Sun();
	sun.mesh.scale.set(1,1,.3);
	sun.mesh.position.set(0,-30,-850);
	scene.add(sun.mesh);
}

function createStars(){
	var geometry = new THREE.Geometry();
	for (var i = 0; i < 700; i++) {
		var star = new THREE.Vector3(
			Math.random() * 2400 - 1200,
			150 + Math.random() * 900,
			Math.random() * 800 - 900
		);
		geometry.vertices.push(star);
	}

	// THREE.ParticleSystem / ParticleBasicMaterial don't exist in this
	// build of three.js, so stars were silently failing to ever appear -
	// fall back through the newer names so this works regardless of version.
	// Also: scene fog fades things out with distance/darkness, so without
	// fog:false the stars were getting blended almost invisibly into the
	// night sky color - turning fog off on this material fixes that.
	var StarMaterial = THREE.PointsMaterial || THREE.ParticleBasicMaterial || THREE.PointCloudMaterial;
	var material = new StarMaterial({
		color: 0xffffff,
		size: 6,
		transparent: true,
		opacity: 1,
		sizeAttenuation: false,
		fog: false,
		depthWrite: false
	});

	var StarSystem = THREE.Points || THREE.PointCloud || THREE.ParticleSystem;
	stars = new StarSystem(geometry, material);
	stars.position.y = offSet;
	scene.add(stars);
}

function recolorObject(obj, color) {
	if (!obj) return;
	if (obj.material) {
		if (obj.material.color) {
			obj.material.color.setHex(color);
		}
	}
	if (obj.children) {
		for (var i = 0; i < obj.children.length; i++) {
			recolorObject(obj.children[i], color);
		}
	}
}

// Places `count` items made by `factory` around the same circular ring
// the trees and flowers use (radius ~605, offset applied at the group
// level). Using this instead of flat x/y/z coordinates is what keeps
// ground decor (cacti, flowers, palms, etc.) glued to the curved land
// at any lateral position, instead of floating above or below it -
// and rotating this group each frame keeps it moving in sync with the
// spinning land/forest rather than sitting frozen while the ground
// scrolls underneath it.
function scatterOnRing(count, radius, factory) {
	var group = new THREE.Object3D();
	var stepAngle = Math.PI * 2 / count;
	for (var i = 0; i < count; i++) {
		var item = factory(i);
		var a = stepAngle * i + Math.random() * stepAngle;
		item.position.x = Math.cos(a) * radius;
		item.position.y = Math.sin(a) * radius;
		item.position.z = 250 - Math.random() * 1000;
		item.rotation.z = (item.rotation.z || 0) + a + (Math.PI / 2) * 3;
		group.add(item);
	}
	return group;
}

function applyMap(mapName) {
	currentMap = mapName;
	var style = mapThemes[mapName] || mapThemes.forest;
	if (renderer) {
		renderer.setClearColor(style.sky, 1);
	}
	if (scene && scene.fog) {
		scene.fog.color.setHex(style.fog);
	}
	if (land && land.mesh && land.mesh.material) {
		land.mesh.material.color.setHex(style.land);
	}
	if (sun && sun.mesh) {
		recolorObject(sun.mesh, style.sun);
	}
	if (sky && sky.mesh) {
		recolorObject(sky.mesh, style.cloud);
	}
	if (forest && forest.mesh) {
		recolorObject(forest.mesh, style.tree);
	}
	var hud = document.getElementById('hud');
	if (hud) {
		hud.classList.toggle('night-mode', mapName === 'night' || mapName === 'aurora');
	}
	var buttons = document.querySelectorAll('.map-btn');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].classList.toggle('active', buttons[i].getAttribute('data-map') === mapName);
	}
	buildEnvironmentForMap(mapName);
}

function buildEnvironmentForMap(mapName) {
	if (!scene) return;
	if (forest && forest.mesh) {
		scene.remove(forest.mesh);
	}
	if (sky && sky.mesh) {
		scene.remove(sky.mesh);
	}
	if (land && land.mesh) {
		scene.remove(land.mesh);
	}
	if (orbit && orbit.mesh) {
		scene.remove(orbit.mesh);
	}
	if (stars) {
		scene.remove(stars);
		stars = null;
	}
	if (mapDecor) {
		scene.remove(mapDecor);
		mapDecor = null;
	}
	if (mapDecorRing) {
		scene.remove(mapDecorRing);
		mapDecorRing = null;
	}
	createLand();
	createOrbit();
	createSky();
	createForest();
	// the default ring is pine trees + flowers - great for the forest map,
	// but recoloring them pink for spring still leaves pine-tree-shaped
	// silhouettes poking through the blossoms, so just hide the ring there
	// and use dedicated sakura trees instead
	if (forest && forest.mesh) {
		forest.mesh.visible = (mapName !== 'spring');
	}
	var built = null;
	if (mapName === 'night') {
		createStars();
		built = createNightScene();
	} else if (mapName === 'spring') {
		built = createSpringScene();
	} else if (mapName === 'aurora') {
		built = createAuroraScene();
	} else if (mapName === 'sunset') {
		built = createSunsetScene();
	}
	if (built) {
		// distant, fixed scenery (moon, aurora curtains, far dune wall) -
		// these don't need to move, same as the sun never moving
		if (built.backdrop) {
			mapDecor = built.backdrop;
			scene.add(mapDecor);
		}
		// ground-level flora/props - placed on the same ring as the trees,
		// so it needs the same y offset as forest/land and needs to spin
		// with them every frame (handled in loop())
		if (built.ring) {
			mapDecorRing = built.ring;
			mapDecorRing.position.y = offSet;
			scene.add(mapDecorRing);
		}
	}
}

function createSpringScene() {
	var ring = new THREE.Object3D();

	// sakura (cherry blossom) trees dotted around the ring
	ring.add(scatterOnRing(10, 605, function () {
		var tree = new SakuraTree();
		var s = 0.8 + Math.random() * 0.5;
		tree.mesh.scale.set(s, s, s);
		return tree.mesh;
	}));

	// tulips in mixed spring colors carpeting the ground
	ring.add(scatterOnRing(32, 605, function () {
		var tulip = new TulipFlower();
		var s = 0.8 + Math.random() * 0.6;
		tulip.mesh.scale.set(s, s, s);
		return tulip.mesh;
	}));

	return { backdrop: null, ring: ring };
}


function createNightScene() {
	var moon = new THREE.Mesh(
		new THREE.SphereGeometry(40, 16, 16),
		new THREE.MeshBasicMaterial({ color: 0xf8f3c4 })
	);
	moon.position.set(-220, 180, -700);

	var ring = new THREE.Object3D();

	ring.add(scatterOnRing(6, 605, function () {
		var crystalTree = new THREE.Object3D();
		var trunk = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 40, 8), new THREE.MeshPhongMaterial({ color: 0x4b2e2b, shading: THREE.FlatShading }));
		trunk.position.y = 20;
		crystalTree.add(trunk);
		var canopy = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshPhongMaterial({ color: 0x7bdff2, shading: THREE.FlatShading }));
		canopy.position.y = 55;
		crystalTree.add(canopy);
		return crystalTree;
	}));

	// lily of the valley, scattered across the ground
	ring.add(scatterOnRing(24, 605, function () {
		var lily = new LilyOfValley();
		var s = 1.3 + Math.random() * 0.9;
		lily.mesh.scale.set(s, s, s);
		return lily.mesh;
	}));

	return { backdrop: moon, ring: ring };
}

function createAuroraScene() {
	var auroraGroup = new THREE.Object3D();
	// real auroras mix green, pink/magenta, and purple bands - not just cyan
	var colors = [0x6fffb0, 0xb98cff, 0xff7fc6, 0x8eecf5, 0x6fffe9];
	for (var i = 0; i < colors.length; i++) {
		var band = new THREE.Mesh(
			new THREE.TorusGeometry(240 + i * 55, 20 - i * 2, 12, 48),
			new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.4 - i * 0.04, side: THREE.DoubleSide })
		);
		// tilt each ring slightly differently so they layer like
		// soft curtains instead of stacking as one flat disc
		band.rotation.x = Math.PI / 2 + (i - 2) * 0.1;
		band.rotation.y = (i - 2) * 0.07;
		band.position.set(0, 150 + i * 30, -350);
		auroraGroup.add(band);
	}
	var glow = new THREE.Mesh(
		new THREE.PlaneGeometry(1400, 600),
		new THREE.MeshBasicMaterial({ color: 0xc48cff, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
	);
	glow.rotation.x = -Math.PI / 2;
	glow.position.set(0, 120, -260);
	auroraGroup.add(glow);
	var glow2 = new THREE.Mesh(
		new THREE.PlaneGeometry(1400, 600),
		new THREE.MeshBasicMaterial({ color: 0x6fffb0, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
	);
	glow2.rotation.x = -Math.PI / 2;
	glow2.position.set(0, 130, -320);
	auroraGroup.add(glow2);

	// glowing flowers on the ground, in aurora colors rather than the
	// standard red/yellow/blue forest palette
	var ring = scatterOnRing(26, 605, function () {
		var flowerColor = colors[Math.floor(Math.random() * colors.length)];
		var auroraFlower = new AuroraFlower(flowerColor);
		var fs = 0.9 + Math.random() * 0.8;
		auroraFlower.mesh.scale.set(fs, fs, fs);
		return auroraFlower.mesh;
	});

	return { backdrop: auroraGroup, ring: ring };
}

function createSunsetScene() {
	var dunes = new THREE.Mesh(
		new THREE.CylinderGeometry(450, 650, 220, 32),
		new THREE.MeshPhongMaterial({ color: 0xc97d3a, shading: THREE.FlatShading })
	);
	dunes.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	dunes.position.set(0, -60, -1200);

	var ring = new THREE.Object3D();

	// a scattered mix of palms and flat-topped acacias, instead of one
	// lone palm tree, for a proper savanna-sunset skyline
	ring.add(scatterOnRing(6, 605, function () {
		var palm = new THREE.Object3D();
		var palmTrunkMat = new THREE.MeshPhongMaterial({ color: 0x8d5a2b, shading: THREE.FlatShading });
		var palmTrunk = new THREE.Mesh(new THREE.CylinderGeometry(6, 9, 55 + Math.random() * 20, 8), palmTrunkMat);
		palmTrunk.position.y = 27;
		palmTrunk.rotation.z = (Math.random() - 0.5) * 0.25;
		palm.add(palmTrunk);
		var nFronds = 4 + Math.floor(Math.random() * 2);
		for (var pf = 0; pf < nFronds; pf++) {
			var palmLeaf = new THREE.Mesh(new THREE.BoxGeometry(75, 5, 10), new THREE.MeshPhongMaterial({ color: 0x4b7b3a, shading: THREE.FlatShading }));
			palmLeaf.position.y = 56;
			palmLeaf.rotation.y = (pf / nFronds) * Math.PI * 2;
			palmLeaf.rotation.z = 0.15;
			palm.add(palmLeaf);
		}
		var ps = 0.8 + Math.random() * 0.6;
		palm.scale.set(ps, ps, ps);
		return palm;
	}));

	ring.add(scatterOnRing(5, 605, function () {
		var acacia = new AcaciaTree();
		var as = 0.9 + Math.random() * 0.7;
		acacia.mesh.scale.set(as, as, as);
		return acacia.mesh;
	}));

	// warm poppy-like flowers scattered across the sand
	ring.add(scatterOnRing(20, 605, function () {
		var sunsetFlower = new SunsetFlower();
		var fs2 = 0.9 + Math.random() * 0.7;
		sunsetFlower.mesh.scale.set(fs2, fs2, fs2);
		return sunsetFlower.mesh;
	}));

	return { backdrop: dunes, ring: ring };
}

function toggleCameraView() {
	cameraViewIndex = (cameraViewIndex + 1) % cameraViews.length;
	cameraMode = cameraViews[cameraViewIndex];
	var cycleButton = document.getElementById('view-cycle');
	if (cycleButton) {
		cycleButton.textContent = 'View: ' + (cameraMode === 'follow' ? 'Follow' : cameraMode === 'orbit' ? 'Orbit' : 'Chase');
	}
}

function updateCamera() {
	if (!airplane || !camera) return;
	var planePosition = airplane.mesh.position;
	if (cameraMode === 'orbit') {
		cameraAngle += 0.005;
		camera.position.x = planePosition.x + Math.sin(cameraAngle) * 220;
		camera.position.y = planePosition.y + 120;
		camera.position.z = planePosition.z + Math.cos(cameraAngle) * 320 + 120;
	} else if (cameraMode === 'chase') {
		camera.position.x = planePosition.x + 90;
		camera.position.y = planePosition.y + 60;
		camera.position.z = planePosition.z + 260;
	} else {
		camera.position.x = planePosition.x + 180;
		camera.position.y = planePosition.y + 80;
		camera.position.z = planePosition.z + 260;
	}
	camera.lookAt(planePosition);
}

function createPlane(){ 
	airplane = new AirPlane();
	airplane.mesh.scale.set(.35,.35,.35);
	airplane.mesh.position.set(-40,110,-250);
	// airplane.mesh.rotation.z = Math.PI/15;
	scene.add(airplane.mesh);
}

function createFox(){ 
	fox = new Fox();
	fox.mesh.scale.set(.35,.35,.35);
	fox.mesh.position.set(-40,110,-250);
	scene.add(fox.mesh);
}


function updatePlane() {
	var controlX = mousePos.x;
	var controlY = mousePos.y;

	if (joystickActive) {
		controlX = touchPos.x;
		controlY = touchPos.y;
	}

	if (Math.abs(keyboardSteer.x) > 0.01 || Math.abs(keyboardSteer.y) > 0.01) {
		controlX = keyboardSteer.x;
		controlY = keyboardSteer.y;
	}

	var targetY = normalize(controlY,-.75,.75, 50, 190);
	var targetX = normalize(controlX,-.75,.75,-100, -20);
	
	// Move the plane at each frame by adding a fraction of the remaining distance
	airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*0.1;

	airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*0.1;

	// Rotate the plane proportionally to the remaining distance
	airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*0.0128;
	airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*0.0064;
	airplane.mesh.rotation.y = (airplane.mesh.position.x-targetX)*0.0064;

	airplane.propeller.rotation.x += 0.3;
}

function normalize(v,vmin,vmax,tmin, tmax){

	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;

}


function loop(){
  land.mesh.rotation.z += .005;
  orbit.mesh.rotation.z += .001;
  sky.mesh.rotation.z += .003;
  forest.mesh.rotation.z += .005;
  if (mapDecorRing) {
    mapDecorRing.rotation.z += .005;
  }
  if (stars) {
    stars.rotation.y += 0.0004;
  }
  updatePlane();
  updateCamera();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function handleMouseMove (event) {
	var tx = -1 + (event.clientX / WIDTH)*2;
	var ty = 1 - (event.clientY / HEIGHT)*2;
	mousePos = {x:tx, y:ty};	
}

function setTouchInput(x, y) {
	var tx = -1 + (x / WIDTH)*2;
	var ty = 1 - (y / HEIGHT)*2;
	touchPos = {x:tx, y:ty};
	mousePos = {x:tx, y:ty};
}

function handleTouchStart(event) {
	if (event.touches.length === 0) return;
	var touch = event.touches[0];
	joystickActive = true;
	joystickCenter = {x: touch.clientX, y: touch.clientY};
	setTouchInput(touch.clientX, touch.clientY);
}

function handleTouchMove(event) {
	if (!joystickActive || event.touches.length === 0) return;
	var touch = event.touches[0];
	var dx = touch.clientX - joystickCenter.x;
	var dy = touch.clientY - joystickCenter.y;
	var maxDistance = 38;
	var dist = Math.min(maxDistance, Math.sqrt(dx*dx + dy*dy));
	var angle = Math.atan2(dy, dx);
	var clampedX = Math.cos(angle) * dist;
	var clampedY = Math.sin(angle) * dist;
	if (joystickHandle) {
		joystickHandle.style.transform = 'translate(' + clampedX + 'px, ' + clampedY + 'px)';
	}
	setTouchInput(joystickCenter.x + clampedX, joystickCenter.y + clampedY);
	event.preventDefault();
}

function handleTouchEnd() {
	joystickActive = false;
	if (joystickHandle) {
		joystickHandle.style.transform = 'translate(0px, 0px)';
	}
	mousePos = {x:0, y:0};
}

function handleKeyDown(event) {
	var key = event.key.toLowerCase();
	if (key === 'arrowleft' || key === 'a') {
		keyboardSteer.x = -1;
	} else if (key === 'arrowright' || key === 'd') {
		keyboardSteer.x = 1;
	} else if (key === 'arrowup' || key === 'w') {
		keyboardSteer.y = -1;
	} else if (key === 'arrowdown' || key === 's') {
		keyboardSteer.y = 1;
	} else if (key === 'v') {
		toggleCameraView();
	}
	if (["arrowleft","arrowright","arrowup","arrowdown","a","s","d","w","v"].indexOf(key) !== -1) {
		event.preventDefault();
	}
}

function handleKeyUp(event) {
	var key = event.key.toLowerCase();
	if (key === 'arrowleft' || key === 'a') {
		keyboardSteer.x = 0;
	} else if (key === 'arrowright' || key === 'd') {
		keyboardSteer.x = 0;
	} else if (key === 'arrowup' || key === 'w') {
		keyboardSteer.y = 0;
	} else if (key === 'arrowdown' || key === 's') {
		keyboardSteer.y = 0;
	}
}

function init(event) {
	createScene();
	createLights();
	createPlane();
	createOrbit();
	createSun();
	createLand();
	createForest();
	createSky();
	createStars();
	//createFox();

	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('touchstart', handleTouchStart, {passive:false});
	document.addEventListener('touchmove', handleTouchMove, {passive:false});
	document.addEventListener('touchend', handleTouchEnd, false);
	document.addEventListener('keydown', handleKeyDown, false);
	document.addEventListener('keyup', handleKeyUp, false);
	joystickBase = document.getElementById('joystick');
	joystickHandle = document.getElementById('joystick-handle');

	var mapButtons = document.querySelectorAll('.map-btn');
	for (var i = 0; i < mapButtons.length; i++) {
		mapButtons[i].addEventListener('click', function() {
			applyMap(this.getAttribute('data-map'));
		});
	}
	document.getElementById('view-cycle').addEventListener('click', toggleCameraView);
	applyMap(currentMap);

	loop();
}

window.addEventListener('load', init, false);