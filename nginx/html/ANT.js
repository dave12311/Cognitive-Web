var ctx;
var keyboardActive = false;
var clock;
var startTime, stopTime;
var cueTime;

var Direction;
var Data = [];

function init(){
    var canvas = document.getElementById("ANT");
    if(canvas.getContext){
        /** @type {CanvasRenderingContext2D} */
        ctx = canvas.getContext("2d");

        //Resize canvas to 80% of the window
        ctx.canvas.width = window.innerWidth * 0.8;
        ctx.canvas.height = window.innerHeight * 0.8;

        //Setup keyboard hooks
        window.onkeydown = keyboardHandler;

        drawPlus();
    }
}

function start(){
    //Generate random cue
    var cue = getRandomInt(0, 4);           //0: NO, 1: TOP, 2: BOTTOM, 3: CENTER, 4: BOTH

    //Generate random target location, congruency and direction
    var targetLoc;
    if(cue == 1 || cue == 2){
        targetLoc = cue-1;
    }else{
        var targetLoc = getRandomInt(0, 1);     //0: TOP, 1: BOTTOM
    }
    var targetCong = getRandomInt(0, 2);    //0: NEUTRAL, 1: CONGRUENT, 2: INCONGRUENT
    Direction = getRandomInt(0, 1);     //0: LEFT, 1: RIGHT


    //Generate random cue time in ms
    cueTime = getRandomInt(400, 1600);

    //Create new data entry
    var myData = {cueLoc: cue, targetLoc: targetLoc, targetCong: targetCong, targetDir: Direction};
    Data.push(myData);

    function showCue(){
        drawCue(cue);
        clock = new adjustingInterval(hideCue, 100);
    }

    function hideCue(){
        clear();
        drawPlus();
        clock = new adjustingInterval(showTarget, 400);
    }

    function showTarget(){
        drawTarget(targetCong, targetLoc, Direction);
        startTime = window.performance.now();
        keyboardActive = true;
        clock = new adjustingInterval(timeout, 1700);
    }

    function timeout(){
        //Reset
        keyboardActive = false;
        Data[Data.length-1].reactionTime = -1;
        Data[Data.length-1].success = false;
        console.log(Data);
        //start();
    }

    if(cue != 0){
        clock = new adjustingInterval(showCue, cueTime);
    }else{
        clock = new adjustingInterval(showTarget, cueTime+500);
    }
}

function keyboardHandler(e){
    if(keyboardActive == true){
        if(e.key == "ArrowRight" || "ArrowLeft"){
            stopTime = window.performance.now();
            clock.stop();
            clear();
            drawPlus();
            Data[Data.length-1].reactionTime = Math.round(stopTime-startTime);
            if((e.key == "ArrowRight" && Direction == 1) || (e.key == "ArrowLeft" && Direction == 0)){
                Data[Data.length-1].success = true;
            }else{
                Data[Data.length-1].success = false;
            }
            keyboardActive = false;
            clock = new adjustingInterval(start, 3500-cueTime-(stopTime-startTime));
        }
    }
}

class adjustingInterval {
    constructor(workFunc, delay) {
        var count = Math.floor(delay/10);
        var expected, timeout;
        var interval = 10;  //Step size of 10 ms
        this.stop = function() {
            clearTimeout(timeout);
        }
        function step() {
            var drift = window.performance.now() - expected;
            //console.log(drift);
            if (drift > interval) {
                console.error("Drift too high!");
            }
            if(count-- == 1){
                workFunc();
            }else{
                expected += interval;
                timeout = setTimeout(step, Math.max(0, interval - drift));
            }
        }
        expected = window.performance.now() + interval;
        timeout = setTimeout(step, interval);
    }
}

function getRandomInt(min, max){
    //Both included
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clear(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawPlus(){
    ctx.font = "50px sans-serif";
    ctx.fillText("+", ctx.canvas.width/2, ctx.canvas.height/2);
}

function drawCue(type){
    ctx.font = "50px sans-serif";
    switch(type){
        case 1:
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.25+8);
            break;
        case 2:
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.75+16);
            break;
        case 3:
            clear();
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height/2+8);
            break;
        case 4:
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.25+8);
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.75+16);
            break;
    }

}

function drawTarget(cong, loc, dir){
    ctx.font = "50px sans-serif";
    var height, width;
    switch(loc){
        case 0:
            //Top
            height = ctx.canvas.height*0.25-1;
            break;
        case 1:
            //Bottom
            height = ctx.canvas.height*0.75+7;
            break;
    }

    //0 or 1
    var str;
    switch(cong){
        case 0:
            //Neutral
            if(dir == 0){
                str = "\u2500 \u2500 \u2190 \u2500 \u2500";
            }else{
                str = "\u2500 \u2500 \u2192 \u2500 \u2500";
            }
            width = ctx.canvas.width/2-92;
            break;
        case 1:
            //Congruent
            if(dir == 0){
                str = "\u2190 \u2190 \u2190 \u2190 \u2190";
            }else{
                str = "\u2192 \u2192 \u2192 \u2192 \u2192";
            }
            width = ctx.canvas.width/2-116;
            break;
        case 2:
            //Incongruent
            if(dir == 0){
                str = "\u2192 \u2192 \u2190 \u2192 \u2192";
            }else{
                str = "\u2190 \u2190 \u2192 \u2190 \u2190";
            }
            width = ctx.canvas.width/2-116;
            break;
    }
    ctx.fillText(str, width, height);
}