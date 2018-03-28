console.log("init");

var deviceQuaternion;
var lastDeviceQuaternion = new THREE.Quaternion(0, 0, 0, 0);
var deviceOrientationEulers = new THREE.Vector3();
var gravityDirection = new THREE.Vector3();

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

// var deviceOrientation = new THREE.DeviceOrientationControls(camera);

// camera.position = new THREE.Vector3(0, 0, 5);
// console.log("sumpin");
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;

var animate = function () {
	geometry.colorsNeedUpdate = true;
	requestAnimationFrame( animate );
	
	// cube.position.y += 0.01;
	// cube.position.x += 0.01;



	if(deviceQuaternion != undefined) {

		// console.log("device quat: " + deviceQuaternion);
		if(!lastDeviceQuaternion.equals(deviceQuaternion)) {
			lastDeviceQuaternion = deviceQuaternion.clone();
			var conjugate = deviceQuaternion.clone();
			conjugate = conjugate.conjugate();
			cube.setRotationFromQuaternion(conjugate);
		}


		// var rotObjectMatrix = new THREE.Matrix4();
		// rotObjectMatrix.makeRotationFromQuaternion(conjugatedDeviceQuaternion);
		// cube.quaternion.setFromRotationMatrix(rotObjectMatrix);



		// console.log("grav" + gravityDirection.x + ", " + gravityDirection.y + ", " + gravityDirection.z);
		// cube.lookAt(gravityDirection);
	}

	// cube.rotation.x = deviceOrientationEulers.x;
	// cube.rotation.y = deviceOrientationEulers.y;
	// cube.rotation.z = deviceOrientationEulers.z;

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

	renderer.render(scene, camera);
};

animate();

window.addEventListener("devicemotion", function(event) {
	var accelerationVector = new THREE.Vector3(event.acceleration.x, event.acceleration.y, event.acceleration.z);

	//console.log("acc" + accelerationVector.x + ", " + accelerationVector.y + ", " + accelerationVector.z);
	//console.log("acc grav" + event.accelerationIncludingGravity.x + ", " + event.accelerationIncludingGravity.y + ", " + event.accelerationIncludingGravity.z);
	var accelerationGravityVector = new THREE.Vector3(event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z);

	gravityDirection = accelerationGravityVector.sub(accelerationVector);
});

window.addEventListener("deviceorientation", function(event) {

	deviceOrientationEulers = new THREE.Vector3(degToRad(event.beta), degToRad(event.gamma), degToRad(event.alpha));
	// console.log("device eulers: " + deviceOrientationEulers.x + ", " + deviceOrientationEulers.y + ", " + deviceOrientationEulers.z);

	deviceQuaternion = computeQuaternionFromEulers(event.alpha, event.beta, event.gamma);
	// console.log("device quat: " + deviceQuaternion.x + ", " + deviceQuaternion.y + ", " + deviceQuaternion.z + ", " + deviceQuaternion.w);

}, true);

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
	return theta * (Math.PI / 180);
}

