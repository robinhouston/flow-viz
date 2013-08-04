function Streamer(options) {
    if (!options.hasOwnProperty("canvas")) throw "The 'canvas' option must be specified";
    if (!options.hasOwnProperty("velocity")) throw "The 'velocity' option must be specified";
    
    var canvas = options.canvas,
        cx = canvas.getContext("2d"),
        w = canvas.width, h = canvas.height,
    
        num_streams = options.num_streams || 1000,
        ms_per_repeat = options.ms_per_repeat || 1000,
        max_age = options.max_age || 10,
        fade_rate = options.fade_rate || 0.02,
        border = options.border || 100,
        velocity = options.velocity;

    function fadeCanvas(alpha) {
        cx.save();
        cx.globalAlpha = alpha;
        cx.globalCompositeOperation = "copy";
        cx.drawImage(canvas, 0, 0);
        cx.restore();
    }

    var streams = initStreams();

    function initStreams() {
        var streams = [];
    
        for (var i=0; i<num_streams; i++)
            streams.push([
                Math.round(Math.random() * (w + 2*border)) - border,
                Math.round(Math.random() * (h + 2*border)) - border,
                Math.round(Math.random() * max_age) + 1
            ]);
    
        return streams;
    }

    function frame(t) {
        fadeCanvas(1 - fade_rate);
        
        cx.save();
        cx.setTransform(1, 0, 0, 1, 0, 0);
        
        for (var i=0; i<streams.length; i++) {
            var stream = streams[i];
            if (stream[2] == 0) {
                stream[0] = Math.round(Math.random() * (w + 2*border)) - border;
                stream[1] = Math.round(Math.random() * (h + 2*border)) - border;
                stream[2] = MAX_AGE;
            }
            
            var v = velocity(stream[0], stream[1], t);
            cx.beginPath();
            cx.moveTo(stream[0], stream[1]);
            cx.lineTo(stream[0] + v[0], stream[1] + v[1]);
            cx.stroke();
            
            stream[0] += v[0];
            stream[1] += v[1];
            stream[2]--;
        }
        
        cx.restore();
    }

    var first_timestamp, animation_frame_id;
    function loop(timestamp) {
        if (!first_timestamp) first_timestamp = timestamp;
        frame(((timestamp - first_timestamp) % ms_per_repeat) / ms_per_repeat);
        animation_frame_id = requestAnimationFrame(loop);
    }

    return {
        "start": function() { animation_frame_id = requestAnimationFrame(loop); },
        "stop": function() { cancelAnimationFrame(animation_frame_id); }
    };
}
