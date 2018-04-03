console.log("init");

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

var posX = new THREE.Color(1, 0, 0); //Red
var negX = new THREE.Color(1, .6, .6); //Light red
var posY = new THREE.Color(0, 1, 0);  //Green
var negY = new THREE.Color(0.6, 1, 0.6); //Light green
var posZ = new THREE.Color(0, 0, 1); //Blue
var negZ = new THREE.Color(0.6, 0.6, 1); //Light blue



var createCube = function(position) {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { 
		color: 0xffffff,
		vertexColors: THREE.FaceColors
	} );

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

	cube.position.x = position.x;
	cube.position.y = position.y;
	cube.position.z = position.z;

	return cube;
}

$(window).load(function() {
    "use strict";

    // lets do some fun
    var video = document.getElementById('webcam');
    var canvas = document.getElementById('canvas');
    try {
        var attempts = 0;
        var readyListener = function(event) {
            findVideoSize();
        };
        var findVideoSize = function() {
            if(video.videoWidth > 0 && video.videoHeight > 0) {
                video.removeEventListener('loadeddata', readyListener);
                onDimensionsReady(video.videoWidth, video.videoHeight);
            } else {
                if(attempts < 10) {
                    attempts++;
                    setTimeout(findVideoSize, 200);
                } else {
                    onDimensionsReady(640, 480);
                }
            }
        };
        var onDimensionsReady = function(width, height) {
            demo_app(width, height);
            compatibility.requestAnimationFrame(tick);


            //Three JS Init

            // var renderer = new THREE.WebGLRenderer( { alpha: true } );
            // renderer.setClearColor( 0x000000, 0);
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );


            var cube = createCube(new THREE.Vector3(0, 0, 0));

            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 5;

        };

        video.addEventListener('loadeddata', readyListener);

        compatibility.getUserMedia({video: true}, function(stream) {
            try {
                video.src = compatibility.URL.createObjectURL(stream);
            } catch (error) {
                video.src = stream;
            }
            setTimeout(function() {
                    video.play();
                }, 500);
        }, function (error) {
            $('#canvas').hide();
            $('#log').hide();
            $('#no_rtc').html('<h4>WebRTC not available.</h4>');
            $('#no_rtc').show();
        });
    } catch (error) {
        $('#canvas').hide();
        $('#log').hide();
        $('#no_rtc').html('<h4>Something goes wrong...</h4>');
        $('#no_rtc').show();
    }



    var stat = new profiler();

    var gui,options,ctx,canvasWidth,canvasHeight;
    var curr_img_pyr, prev_img_pyr, point_count, point_status, prev_xy, curr_xy;

    var demo_opt = function(){
        this.win_size = 20;
        this.max_iterations = 30;
        this.epsilon = 0.01;
        this.min_eigen = 0.001;
    }

    function demo_app(videoWidth, videoHeight) {
        canvasWidth  = canvas.width;
        canvasHeight = canvas.height;
        ctx = canvas.getContext('2d');

        ctx.fillStyle = "rgb(0,255,0)";
        ctx.strokeStyle = "rgb(0,255,0)";

        curr_img_pyr = new jsfeat.pyramid_t(3);
        prev_img_pyr = new jsfeat.pyramid_t(3);
        curr_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
        prev_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);

        point_count = 0;
        point_status = new Uint8Array(100);
        prev_xy = new Float32Array(100*2);
        curr_xy = new Float32Array(100*2);

        options = new demo_opt();
        gui = new dat.GUI();

        gui.add(options, 'win_size', 7, 30).step(1);
        gui.add(options, 'max_iterations', 3, 30).step(1);
        gui.add(options, 'epsilon', 0.001, 0.1).step(0.0025);
        gui.add(options, 'min_eigen', 0.001, 0.01).step(0.0025);

        stat.add("grayscale");
        stat.add("build image pyramid");
        stat.add("optical flow lk");
    }

    function tick() {
        compatibility.requestAnimationFrame(tick);
        stat.new_frame();
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            ctx.drawImage(video, 0, 0, 640, 480);
            var imageData = ctx.getImageData(0, 0, 640, 480);

            // swap flow data
            var _pt_xy = prev_xy;
            prev_xy = curr_xy;
            curr_xy = _pt_xy;
            var _pyr = prev_img_pyr;
            prev_img_pyr = curr_img_pyr;
            curr_img_pyr = _pyr;

            stat.start("grayscale");
            jsfeat.imgproc.grayscale(imageData.data, 640, 480, curr_img_pyr.data[0]);
            stat.stop("grayscale");

            stat.start("build image pyramid");
            curr_img_pyr.build(curr_img_pyr.data[0], true);
            stat.stop("build image pyramid");

            stat.start("optical flow lk");
            jsfeat.optical_flow_lk.track(prev_img_pyr, curr_img_pyr, prev_xy, curr_xy, point_count, options.win_size|0, options.max_iterations|0, point_status, options.epsilon, options.min_eigen);
            stat.stop("optical flow lk");

            prune_oflow_points(ctx);



            $('#log').html(stat.log() + '<br/>click to add tracking points: ' + point_count);
        }
    }

    function on_canvas_click(e) {
        var coords = canvas.relMouseCoords(e);
        if(coords.x > 0 & coords.y > 0 & coords.x < canvasWidth & coords.y < canvasHeight) {
            curr_xy[point_count<<1] = coords.x;
            curr_xy[(point_count<<1)+1] = coords.y;

            point_count++;
        }

        createCube(new THREE.Vector3(0, 0, 0));
    }
    canvas.addEventListener('click', on_canvas_click, false);

    function draw_circle(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    }

    function prune_oflow_points(ctx) {
        var n = point_count;
        var i=0,j=0;

        for(; i < n; ++i) {
            if(point_status[i] == 1) {
                if(j < i) {
                    curr_xy[j<<1] = curr_xy[i<<1];
                    curr_xy[(j<<1)+1] = curr_xy[(i<<1)+1];
                }
                draw_circle(ctx, curr_xy[j<<1], curr_xy[(j<<1)+1]);
                ++j;
            }
        }
        point_count = j;
    }

    function relMouseCoords(event) {
        var totalOffsetX=0,totalOffsetY=0,canvasX=0,canvasY=0;
        var currentElement = this;

        do {
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        } while(currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {x:canvasX, y:canvasY}
    }
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

    $(window).unload(function() {
        video.pause();
        video.src=null;
    });
});
