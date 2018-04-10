console.log("init");

var deviceQuaternion;
var lastDeviceQuaternion = new THREE.Quaternion(0, 0, 0, 0);
var deviceOrientationEulers = new THREE.Vector3();
// var gravityDirection = new THREE.Vector3();

var accelerationVector = new THREE.Vector3(0, 0, 0);
var estimatedVelocity = new THREE.Vector3(0, 0, 0);
var estimatedPosition = new THREE.Vector3(0, 0, 0);

var position = new THREE.Vector3(0, 0, 0);
var lastPosition = new THREE.Vector3(-1, -1, -1);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer;
var debugCanvas;

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( {
	color: 0xffffff,
	vertexColors: THREE.FaceColors
} );

window.onload = function() {

//Add element to DOM
var threeJsCanvas = document.getElementById('threeJsCanvas');
console.log("canvas: " + threeJsCanvas)
renderer = new THREE.WebGLRenderer( { canvas: threeJsCanvas } );
debugCanvas = document.getElementById('debugCanvas');


// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
render();
}

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

var drawConsole = function() {
		let ctx = debugCanvas.getContext('2d');
	// 	let ctx = markerless.ctx;
	// 	let tracking = markerless.tracking;
	// 	let plane = markerless.plane;
	// 	let canvas = markerless.canvas;
	// 	let tvec = tracking.translation;
		ctx.font = '30px Arial';
		ctx.color = 'White';
		//Make human readable
		ctx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
		// ctx.moveTo(150, 20);
		ctx.textAlign = "end";
		ctx.fillText(`x: ${accelerationVector.x.toFixed(2)}`, 200, 75);
		ctx.fillText(`y: ${accelerationVector.y.toFixed(2)}`, 200, 105);
		ctx.fillText(`z: ${accelerationVector.z.toFixed(2)}`, 200, 135);
		// ctx.fillText(`x: ${tvec.x}`, 10, 75);
		// ctx.fillText(`y: ${tvec.y}`, 10, 105);
		// ctx.fillText(`z: ${tvec.z}`, 10, 135);
		//what the user sees
		// var roi = [...Array(6).keys()].map((v) => plane.get(v));
		/* only useful when debugging to see the points in the downsampled canvas
		var rectBuffer = [ planeBuffer.get(0), planeBuffer.get(1), planeBuffer.get(2), planeBuffer.get(3) ]; */
		// let fillStyle = ctx.fillStyle;
		ctx.fillStyle = '#44FF66';
		ctx.color = 'White';

		// var i = 0;
		// for ( ; i < roi.length; i++) {
		// 	ctx.beginPath();
		// 	ctx.arc(roi[i].x, roi[i].y, 4, 0, 2 * Math.PI);
		// 	//ctx.arc(rectBuffer[i].x, rectBuffer[i].y, 4, 0, 2 * Math.PI);
		// 	ctx.fill();
		// }
		// ctx.fillStyle = fillStyle;
	}

var cube = createCube(new THREE.Vector3(0, 0, 0));

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;

var render = function () {
	geometry.colorsNeedUpdate = true;
	requestAnimationFrame( render );

	//Draw debug values
	drawConsole();

	//Update position
	if(!position.equals(lastPosition)) {
		console.log("setting object position: " + position.x + ", " + position.y + ", " + position.z);
		cube.position.x = position.x;
		cube.position.y = position.y;
		cube.position.z = position.z;
		lastPosition = position;
	}

	if(deviceQuaternion != undefined) {
		if(!lastDeviceQuaternion.equals(deviceQuaternion)) {
			lastDeviceQuaternion = deviceQuaternion.clone();
			var conjugate = deviceQuaternion.clone();
			conjugate = conjugate.conjugate();
			cube.setRotationFromQuaternion(conjugate);
		}
	}

	renderer.render(scene, camera);
};



window.addEventListener("devicemotion", function(event) {
	console.log("estimated event: " + event.acceleration.x + ", " + event.acceleration.y + ", " + event.acceleration.z);

	accelerationVector = new THREE.Vector3(event.acceleration.x, event.acceleration.y, event.acceleration.z);
	// console.log("estimated acc: " + accelerationVector.x + ", " + accelerationVector.y + ", " + accelerationVector.z);

	// var accelerationGravityVector = new THREE.Vector3(event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z);

	// gravityDirection = accelerationGravityVector.sub(accelerationVector);
	estimatedVelocity = estimatedVelocity.add(accelerationVector);
	estimatedPosition = estimatedPosition.add(estimatedVelocity);
	console.log("estimated velocity: " + estimatedVelocity.x + ", " + estimatedVelocity.y + ", " + estimatedVelocity.z);
});

window.addEventListener("deviceorientation", function(event) {
	deviceOrientationEulers = new THREE.Vector3(degToRad(event.beta), degToRad(event.gamma), degToRad(event.alpha));
	deviceQuaternion = computeQuaternionFromEulers(event.alpha, event.beta, event.gamma);
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

