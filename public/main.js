console.log("init");
// var alpha, beta, gamma;
var deviceQuaternion;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { 
	color: 0xffffff,
	vertexColors: THREE.FaceColors
	} );

var posX = new THREE.Color(1, 0, 0); //Red
var negX = new THREE.Color(1, .6, .6); //Light red
var posY = new THREE.Color(0, 1, 0);  //Green
var negY = new THREE.Color(0.6, 1, 0.6); //Light green
var posZ = new THREE.Color(0, 0, 1); //Blue
var negZ = new THREE.Color(0.6, 0.6, 1); //Light blue

geometry.faces[0].color = posX;
geometry.faces[1].color = posX;
geometry.faces[2].color = negX;
geometry.faces[3].color = negX;
geometry.faces[4].color = posY;
geometry.faces[5].color = posY;
geometry.faces[6].color = negY;
geometry.faces[7].color = negY;
geometry.faces[8].color = posZ;
geometry.faces[9].color = posZ;
geometry.faces[10].color = negZ;
geometry.faces[11].color = negZ;

var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

cube.position.x = 0;
cube.position.y = 0;
cube.position.z = 0;

// camera.position = new THREE.Vector3(0, 0, 5);
// console.log("sumpin");
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;

var animate = function () {
	geometry.colorsNeedUpdate = true;
	requestAnimationFrame( animate );
	
	// cube.position.y += 0.01;
	// cube.position.x += 0.01;

	if(deviceQuaternion != undefined) {
		// var rotObjectMatrix = new THREE.Matrix4();
		// rotObjectMatrix.makeRotationFromQuaternion(deviceQuaternion);
		// cube.quaternion.setFromRotationMatrix(rotObjectMatrix);

		// cube.quaternion = deviceQuaternion;
		// cube.rotation.Quaternion = deviceQuaternion;

		// cube.rotation.setEulerFromQuaternion(deviceQuaternion);
		cube.setRotationFromQuaternion(deviceQuaternion);
	}


	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render(scene, camera);
};

animate();

window.addEventListener("deviceorientation", function(event) {
	alpha = event.alpha;
	beta = event.beta;
	gamma = event.gamma;
	deviceQuaternion = computeQuaternionFromEulers(event.alpha, event.beta, event.gamma);
	console.log("device quat: " + deviceQuaternion.x + ", " + deviceQuaternion.y + ", " + deviceQuaternion.z + ", " + deviceQuaternion.w);

}, true);

var computeQuaternionFromEulers = function(alpha,beta,gamma) {
	// var x = degToRad(beta); // beta value
	// var y = degToRad(gamma); // gamma value
	// var z = degToRad(alpha); // alpha value

	var x = degToRad(beta); // beta value
	var y = degToRad(gamma); // gamma value
	var z = degToRad(alpha); // alpha value

	//precompute to save on processing time
	var cX = Math.cos( x/2 );
	var cY = Math.cos( y/2 );
	var cZ = Math.cos( z/2 );
	var sX = Math.sin( x/2 );
	var sY = Math.sin( y/2 );
	var sZ = Math.sin( z/2 );

	var w = cX * cY * cZ - sX * sY * sZ;
	var x = sX * cY * cZ - cX * sY * sZ;
	var y = cX * sY * cZ + sX * cY * sZ;
	var z = cX * cY * sZ + sX * sY * cZ;

	return new THREE.Quaternion(x, y, z, w);      
}

var degToRad = function(theta) {
	return theta * (Math.PI / 180);
}