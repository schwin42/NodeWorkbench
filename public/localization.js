console.log("init");

var deviceQuaternion;
var lastDeviceQuaternion = new THREE.Quaternion(0, 0, 0, 0);
var deviceOrientationEulers = new THREE.Vector3();
// var gravityDirection = new THREE.Vector3();
// var isBleedingOff = false;

var testX = 0;
var testY = 0;
var testZ = 0;
var accelerationVector = new THREE.Vector3(0, 0, 0);
var estimatedVelocity = new THREE.Vector3(0, 0, 0);
var deltaPosition = new THREE.Vector3(0, 0, 0);
var estimatedPosition = new THREE.Vector3(0, 0, 0);

var position = new THREE.Vector3(0, 0, 0);
var lastPosition = new THREE.Vector3(-1, -1, -1);

var lastUpdate;

var scene = new THREE.Scene();
var renderer;
var camera, cameraHandle;
var debugCanvas;

var yRotOffset;
var orientationInitialized = false;

var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

window.onload = function() {
	//Add element to DOM
	var threeJsCanvas = document.getElementById('threeJsCanvas');
	console.log("canvas: " + threeJsCanvas)
	renderer = new THREE.WebGLRenderer( { canvas: threeJsCanvas } );
	renderer.setSize(window.innerWidth, window.innerHeight);
	debugCanvas = document.getElementById('debugCanvas');

	lastUpdate = Date.now();

	render();
}

//Raw values
var posX = new THREE.Color(1, 0, 0); //Red
var negX = new THREE.Color(1, .6, .6); //Light red
var posY = new THREE.Color(0, 1, 0);  //Green
var negY = new THREE.Color(0.6, 1, 0.6); //Light green
var posZ = new THREE.Color(0, 0, 1); //Blue
var negZ = new THREE.Color(0.6, 0.6, 1); //Light blue

//Fixed values
// var negZ = new THREE.Color(1, 0, 0); //Red
// var posZ = new THREE.Color(1, .6, .6); //Light red
// var posX = new THREE.Color(0, 1, 0);  //Green
// var negX = new THREE.Color(0.6, 1, 0.6); //Light green
// var posY = new THREE.Color(0, 0, 1); //Blue
// var negY = new THREE.Color(0.6, 0.6, 1); //Light blue

var createCube = function(position, color) {

	var material;

	if(color != null) {
		material = new THREE.MeshBasicMaterial( {
			color: color,
			vertexColors: THREE.FaceColors
		} );
	} else {
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
		material = new THREE.MeshBasicMaterial( {
			color: 0xffffff,
			vertexColors: THREE.FaceColors
		} );
	}


	var cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	cube.position.x = position.x;
	cube.position.y = position.y;
	cube.position.z = position.z;

	// cube.rotateX(Math.PI / 8);
	// cube.rotateY(Math.PI / 8);
	// cube.rotateZ(Math.PI / 8);

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

	ctx.fillStyle = '#bad3e6';

	ctx.fillText(`acc x: ${accelerationVector.x.toFixed(4)}`, 200, 70);
	ctx.fillText(`acc y: ${accelerationVector.y.toFixed(4)}`, 200, 100);
	ctx.fillText(`acc z: ${accelerationVector.z.toFixed(4)}`, 200, 130);

	// if(isBleedingOff) {
	// 	ctx.fillStyle = '#d22d2d';
	// } else {
	// 	ctx.fillStyle = '#2ed73a';
	// }

	ctx.fillText(`vel x: ${estimatedVelocity.x.toFixed(4)}`, 200, 160);

	// ctx.fillStyle = '#bad3e6';

	ctx.fillText(`vel y: ${estimatedVelocity.y.toFixed(4)}`, 200, 190);
	ctx.fillText(`vel z: ${estimatedVelocity.z.toFixed(4)}`, 200, 220);



	ctx.fillText(`pos x: ${estimatedPosition.x.toFixed(4)}`, 200, 250);



	ctx.fillText(`pos y: ${estimatedPosition.y.toFixed(4)}`, 200, 280);
	ctx.fillText(`pos z: ${estimatedPosition.z.toFixed(4)}`, 200, 310);
	ctx.fillText(`r_a x: ${testX.toFixed(4)}`, 200, 340);
	ctx.fillText(`r_a y: ${testY.toFixed(4)}`, 200, 370);
	ctx.fillText(`r_a z: ${testZ.toFixed(4)}`, 200, 400);
	// ctx.fillText(`x: ${tvec.x}`, 10, 75);
	// ctx.fillText(`y: ${tvec.y}`, 10, 105);
	// ctx.fillText(`z: ${tvec.z}`, 10, 135);
	//what the user sees
	// var roi = [...Array(6).keys()].map((v) => plane.get(v));
	/* only useful when debugging to see the points in the downsampled canvas
	var rectBuffer = [ planeBuffer.get(0), planeBuffer.get(1), planeBuffer.get(2), planeBuffer.get(3) ]; */
	// let fillStyle = ctx.fillStyle;
	ctx.fillStyle = '#44FF66';
	// ctx.color = 'White';

	// var i = 0;
	// for ( ; i < roi.length; i++) {
	// 	ctx.beginPath();
	// 	ctx.arc(roi[i].x, roi[i].y, 4, 0, 2 * Math.PI);
	// 	//ctx.arc(rectBuffer[i].x, rectBuffer[i].y, 4, 0, 2 * Math.PI);
	// 	ctx.fill();
	// }
	// ctx.fillStyle = fillStyle;
}

// function precisionRound(number, precision) {
// 	var factor = Math.pow(10, precision);
// 	return Math.round(number * factor) / factor;
// }

function round(number, precision) {
	var shift = function (number, precision, reverseShift) {
	  if (reverseShift) {
		precision = -precision;
	  }  
	  numArray = ("" + number).split("e");
	  return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
	};
	return shift(Math.round(shift(number, precision, false)), precision, true);
  }

// var cube = createCube(new THREE.Vector3(0, 0, 5));
// for(int i = 0; i < 3; i++) {
// 	for int j = 0; j < 2; j++) {

// 	}
// }
var cube = createCube(new THREE.Vector3(-1, 0, 0), negX);
var cube = createCube(new THREE.Vector3(1, 0, 0), posX);
var cube = createCube(new THREE.Vector3(0, -1, 0), negY);
var cube = createCube(new THREE.Vector3(0, 1, 0), posY);
var cube = createCube(new THREE.Vector3(0, 0, -1), negZ);
var cube = createCube(new THREE.Vector3(0, 0, 1), posZ);

camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0;
cameraHandle = new THREE.Group();
cameraHandle.position = THREE.Vector3(0, 0, 0);
cameraHandle.add(camera);
// camera.rotateX(Math.PI / 2);
// camera.rotateY(Math.PI / 2);
scene.add(cameraHandle);

var render = function () {
	geometry.colorsNeedUpdate = true;
	requestAnimationFrame( render );

	//Draw debug values
	drawConsole();

	//Update camera position from acceleromter
	if(!camera.position.equals(lastPosition)) {
	// 	console.log("printing position");

		//Set position and fix axes
		camera.position.x = estimatedPosition.x;
		camera.position.y = estimatedPosition.y;
		camera.position.z = estimatedPosition.z;
		lastPosition = estimatedPosition;
	}

	//Update camera rotation from gyroscope
	if(deviceQuaternion != undefined) {
		if(!lastDeviceQuaternion.equals(deviceQuaternion)) {
			lastDeviceQuaternion = deviceQuaternion.clone();

			camera.setRotationFromQuaternion(lastDeviceQuaternion);
			// camera.rotateX(Math.PI / 2);
			// camera.rotateY(Math.PI / 2);
		}
	}

	renderer.render(scene, camera);
};



window.addEventListener("devicemotion", function(event) {
	// console.log("estimated event: " + event.acceleration.x + ", " + event.acceleration.y + ", " + event.acceleration.z);

	let now = Date.now();
	let deltaTime = (now - lastUpdate) / 1000;
	// console.log("delta time: " + deltaTime);
	lastUpdate = now;

	//Convert from m/s/s to m/s/f (meters, second, frame)
	// accelerationVector = new THREE.Vector3(event.acceleration.x * deltaTime, event.acceleration.y * deltaTime, event.acceleration.z * deltaTime);

	//Update velocity in m/s
	estimatedVelocity.add(accelerationVector);

	//Bleed off noise from velocity
	let noiseConstant = 0.001;

	//If acceleration has same sign as velocity, adjust towards zero
	// if(accelerationVector.x * estimatedVelocity.x < 0) { //If different sign
	// 	estimatedVelocity.x = estimatedVelocity.x > 0 ? estimatedVelocity.x - noiseConstant : estimatedVelocity.x + noiseConstant; //If positive, subtract noise; if negative, add noise
	// 	isBleedingOff = true;
	// } else {
	// 	isBleedingOff = false;
	// }


	estimatedVelocity.x = estimatedVelocity.x > 0 ? estimatedVelocity.x - noiseConstant : estimatedVelocity.x + noiseConstant; //If positive, subtract noise; if negative, add noise
	estimatedVelocity.y = estimatedVelocity.y > 0 ? estimatedVelocity.y - noiseConstant : estimatedVelocity.y + noiseConstant;
	estimatedVelocity.z = estimatedVelocity.z > 0 ? estimatedVelocity.z - noiseConstant : estimatedVelocity.z + noiseConstant;

	//Convert from m/s to m/f
	deltaPosition = estimatedVelocity.clone().multiplyScalar(deltaTime);

	//Update position in m/f
	estimatedPosition.add(deltaPosition);

	//Apply device quaternion to acceleration vector
	accelerationVector = new THREE.Vector3(event.acceleration.x * deltaTime, event.acceleration.y * deltaTime, event.acceleration.z * deltaTime);
	accelerationVector.applyQuaternion(deviceQuaternion);

	//Acquire new acceleration
	// accelerationVector = new THREE.Vector3(event.acceleration.x * deltaTime, event.acceleration.y * deltaTime, event.acceleration.z * deltaTime);
	if(Math.abs(accelerationVector.x) > 0.01) {
		console.log("x: " + accelerationVector.x);
	}
	if(Math.abs(accelerationVector.y) > 0.01) {
		console.log("y: " + accelerationVector.y);
	}
	if(Math.abs(accelerationVector.z) > 0.01) {
		console.log("z: " + accelerationVector.z);
	}


	// accelerationVector = new THREE.Vector3(Math.round(event.acceleration.x * deltaTime, 5), Math.round(event.acceleration.y * deltaTime, 5), Math.round(event.acceleration.z * deltaTime, 5));
	// let roundedAcceleration = 
	// console.log("x acc vel pos: " + accelerationVector.x + ", " + estimatedVelocity.x + ", " + estimatedPosition.x);
	// console.log("acc vel pos: " + accelerationVector.x + ", " + accelerationVector.y + ", " + accelerationVector.z + " - " + estimatedVelocity.x + ", " + estimatedVelocity.y + ", " + estimatedVelocity.z + " - " + estimatedPosition.x + ", " + estimatedPosition.y + ", " + estimatedPosition.z);
});

window.addEventListener("deviceorientation", function(event) {
	if(!orientationInitialized) {
		yRotOffset = event.alpha;
		orientationInitialized = true;
	}
	
	deviceQuaternion = computeQuaternionFromEulers(event.alpha - yRotOffset, event.beta, event.gamma);
}, true);

window.addEventListener('click', on_click, false);


function on_click(e) {

	// var vector = new THREE.Vector3();
	// var mouse = new THREE.Vector2();
	// mouse.x = (e.x / window.innerWidth) * 2 -1;
	// mouse.y = - (e.y / window.innerHeight) * 2 + 1;

	// vector.set(mouse.x, mouse.y, 0.5);

	// vector.unproject(camera);

	// var dir = vector.sub(camera.position).normalize();
	// var targetZ = 0;
	// var distance = (targetZ - camera.position.z) / dir.z;
	// // var distance = - camera.position.z / dir.z;

	// position = camera.position.clone().add(dir.multiplyScalar(distance));

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

