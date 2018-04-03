console.log("init");

var deviceQuaternion;
var lastDeviceQuaternion = new THREE.Quaternion(0, 0, 0, 0);
var deviceOrientationEulers = new THREE.Vector3();
// var gravityDirection = new THREE.Vector3();

var position = new THREE.Vector3(0, 0, 0);
var lastPosition = new THREE.Vector3(-1, -1, -1);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { 
	color: 0xffffff,
	vertexColors: THREE.FaceColors
} );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var posX = new THREE.Color(1, 0, 0); //Red
var negX = new THREE.Color(1, .6, .6); //Light red
var posY = new THREE.Color(0, 1, 0);  //Green
var negY = new THREE.Color(0.6, 1, 0.6); //Light green
var posZ = new THREE.Color(0, 0, 1); //Blue
var negZ = new THREE.Color(0.6, 0.6, 1); //Light blue

var createCube = function(position) {


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

	return cube;
}

var cube = createCube(new THREE.Vector3(0, 0, 0));

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;

var render = function () {

	geometry.colorsNeedUpdate = true;
	requestAnimationFrame( render );

	//Update position
	if(!position.equals(lastPosition)) {
		console.log("setting object position: " + position.x + ", " + position.y + ", " + position.z);
		cube.position.x = position.x;
		cube.position.y = position.y;
		cube.position.z = position.z;
		// cube.position.set(position);
		lastPosition = position;
	}

	if(deviceQuaternion != undefined) {

		// console.log("device quat: " + deviceQuaternion);
		if(!lastDeviceQuaternion.equals(deviceQuaternion)) {
			lastDeviceQuaternion = deviceQuaternion.clone();
			var conjugate = deviceQuaternion.clone();
			conjugate = conjugate.conjugate();
			cube.setRotationFromQuaternion(conjugate);
		}
	}

	renderer.render(scene, camera);
};

render();

// window.addEventListener("devicemotion", function(event) {
// 	var accelerationVector = new THREE.Vector3(event.acceleration.x, event.acceleration.y, event.acceleration.z);

// 	var accelerationGravityVector = new THREE.Vector3(event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z);

// 	gravityDirection = accelerationGravityVector.sub(accelerationVector);
// });

window.addEventListener("deviceorientation", function(event) {

	deviceOrientationEulers = new THREE.Vector3(degToRad(event.beta), degToRad(event.gamma), degToRad(event.alpha));
	// console.log("device eulers: " + deviceOrientationEulers.x + ", " + deviceOrientationEulers.y + ", " + deviceOrientationEulers.z);

	deviceQuaternion = computeQuaternionFromEulers(event.alpha, event.beta, event.gamma);
	// console.log("device quat: " + deviceQuaternion.x + ", " + deviceQuaternion.y + ", " + deviceQuaternion.z + ", " + deviceQuaternion.w);

}, true);

window.addEventListener('click', on_click, false);


function on_click(e) {

	var vector = new THREE.Vector3();
	var mouse = new THREE.Vector2();
	mouse.x = (e.x / window.innerWidth) * 2 -1;
	mouse.y = - (e.y / window.innerHeight) * 2 + 1;

	vector.set(mouse.x, mouse.y, 0.5);

	vector.unproject(camera);

	var dir = vector.sub(camera.position).normalize();
	var targetZ = 0;
	var distance = (targetZ - camera.position.z) / dir.z;
	// var distance = - camera.position.z / dir.z;

	position = camera.position.clone().add(dir.multiplyScalar(distance));

	// var coords = window.relMouseCoords(e);
	// console.log("coords: " + e.x);
}

var computeQuaternionFromEulers = function(alpha,beta,gamma) {
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
	return theta * (Math.PI / 180); //TODO This value should be precomputed
}

