var ctx;

function init(){
    var canvas = document.getElementById("ANT");
    if(canvas.getContext){
        /** @type {CanvasRenderingContext2D} */
        ctx = canvas.getContext("2d");

        //Resize canvas to 80% of the window
        ctx.canvas.width = window.innerWidth * 0.8;
        ctx.canvas.height = window.innerHeight * 0.8;

        drawPlus();        
    }
}

function start(){
    drawCue("both");
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
        case "top":
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.25+8);
            break;
        case "bottom":
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.75+16);
            break;
        case "center":
            clear();
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height/2+8);
            break;
        case "both":
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.25+8);
            ctx.fillText("*", ctx.canvas.width/2+8, ctx.canvas.height*0.75+16);
            break;
    }

}

function drawTarget(cong, loc){
    ctx.font = "50px sans-serif";
    var height, width;
    switch(loc){
        case "top":
            height = ctx.canvas.height*0.25+8;
            break;
        case "bottom":
            height = ctx.canvas.height*0.75+8;
            break;
    }

    //0 or 1
    var dir = Math.floor(Math.random()*2);
    var str;
    switch(cong){
        case "n":
            if(dir == 0){
                str = "\u2190";
            }else{
                str = "\u2192";
            }
            width = ctx.canvas.width/2;
            break;
        case "c":
            if(dir == 0){
                str = "\u2190 \u2190 \u2190 \u2190 \u2190";
            }else{
                str = "\u2192 \u2192 \u2192 \u2192 \u2192";
            }
            width = ctx.canvas.width/2-120;
            break;
        case "i":
            if(dir == 0){
                str = "\u2192 \u2192 \u2190 \u2192 \u2192";
            }else{
                str = "\u2190 \u2190 \u2192 \u2190 \u2190";
            }
            width = ctx.canvas.width/2-120;
            break;
    }
    ctx.fillText(str, width, height);
}