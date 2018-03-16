/**
 * @author Tyler Lindberg
 * @copyright 2018 Vertebrae, Inc
 */




// import {
//     Scene,
//     WebGLRenderer,
//     Vector3,
//     CullFaceNone,
//     Group,
//     PlaneBufferGeometry,
//     // BoxBufferGeometry, // for debug visualization
//     MeshBasicMaterial,
//     Mesh,
//     DoubleSide,
//     PerspectiveCamera,
//     Plane,
//     Ray
// } from 'three';

// export 
// default 
class VirtualPlane {

    constructor() {
        let plane = this;

        plane.canvas = null;
        plane.camera = null;
        plane.device = null;
        plane.lastUpdate = Date.now();
        plane.updateInterval = 33;

        plane.width = 0.5;
        plane.height = 0.5;

        let geom = new PlaneBufferGeometry(plane.width, plane.height);
        let mat = new MeshBasicMaterial({
            color: 0x00ffff,
            side: DoubleSide,
            opacity: 0.2
        });
        plane.geometry = geom;
        plane.mesh = new Mesh(geom, mat);
        plane.mesh.rotation.set(Math.PI / 2, 0, 0);
        plane.corners = [];
        plane.scene = new Scene();
        plane.scene.add(plane.mesh);

        // Debug
        // let cornerMesh = new BoxBufferGeometry(0.1, 0.1, 0.1);
        // let cornerMat = new MeshBasicMaterial({
        //     color: 0xff0000,
        //     side: DoubleSide,
        // });

        for(var i = 0; i < 6; i++) {
            plane.corners.push(new Group());
            // plane.corners.push(new Mesh(cornerMesh, cornerMat));
            plane.mesh.add(plane.corners[i]);
        }
        plane.corners[0].position.set(-plane.width / 2, -plane.height / 2, 0);
        plane.corners[1].position.set(plane.width / 2, -plane.height / 2, 0);
        plane.corners[2].position.set(0, -plane.height, 0);     //horizontal middle, double bottom
        plane.corners[3].position.set(0, 0, 0);                 //square absolute middle
        plane.corners[4].position.set(plane.width / 2, plane.height / 2, 0);
        plane.corners[5].position.set(-plane.width / 2, plane.height / 2, 0);

        plane.groundPlane = new Plane(new Vector3(0, 1, 0));
    }

    /**
     * @param {object} Tracker
     */
    initialize(tracker) {
        let plane = this;

        plane.tracker = tracker;
        plane.canvas = tracker.sceneCanvas.cloneNode();
        plane.canvas.id = 'virtualPlane';
        let parent = tracker.canvas.parentNode;
        parent.insertBefore(plane.canvas, tracker.sceneCanvas);
        let camera = plane.camera = new PerspectiveCamera(50.93, tracker.canvas.width / tracker.canvas.height, 0.1, 10000);
        camera.setFocalLength(29);
        //1.5m ~5'
        camera.position.set(0, 1.5, 0);
        camera.updateProjectionMatrix();
        if (tracker.deviceEnabled) {
            // Handles camera orientation
            plane.device = new THREE.DeviceOrientationControls(camera);
        }
        let renderer = plane.renderer = new WebGLRenderer({
            canvas: plane.canvas,
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });
        renderer.setPixelRatio(1);
        renderer.setSize(tracker.canvas.width, tracker.canvas.height, true);
        renderer.setFaceCulling(CullFaceNone);

        plane.scene.add(camera);
        plane.castRay = new Ray(plane.camera.position, plane.camera.getWorldDirection());
    }

    getPixelCoords() {
        let plane = this;
        let worldPoints = plane.corners.map(x => x.getWorldPosition());
        return worldPoints.map(x => plane.worldToScreen(x));
    }

    worldToScreen(worldPoint) {
        let clonePoint = worldPoint.clone();
        clonePoint.project(this.camera);

        clonePoint.x = Math.round((clonePoint.x + 1) * this.canvas.width / 2);
        clonePoint.y = Math.round((-clonePoint.y + 1) * this.canvas.height / 2);
        clonePoint.z = 0;

        return clonePoint;
    }

    render() {
        let plane = this;
        plane.renderer.render(plane.scene, plane.camera);
    }

    update() {
        let plane = this;
        if (Date.now() < plane.lastUpdate + plane.updateInterval) {
            return;
        }
        plane.lastUpdate = Date.now();
        if (plane.tracker.deviceEnabled) {
            plane.device.update();
        }
        plane.camera.getWorldDirection(plane.castRay.direction);
        // Adjust mesh position to reflect the position on the ground
        plane.castRay.intersectPlane(plane.groundPlane, plane.mesh.position);
        plane.mesh.rotation.set(Math.PI / 2, plane.camera.rotation.y, 0, 'YXZ');
        plane.renderer.render(plane.scene, plane.camera);
    }
}
