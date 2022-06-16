import {} from "../node_modules/jquery/dist/jquery.js";

export default class CanvasVisualization {
    constructor(){
        /** @type {HTMLCanvasElement} */
        this.canvas = $("<canvas />").appendTo("body").get(0);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.boundTrigger = this.trigger.bind(this);
        this.f = [];
        requestAnimationFrame(this.boundTrigger)
    }
    draw(ctx = this.ctx, W = 0, H = 0){
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0,0,W,H);

        if(this.f.length == 0) 
            return;

        let sectionWidth = W / this.f.length;
        for(let j = 0; j < this.f.length; j++){
            let 
                stripes = this.f[j].f / 31.25,
                t = 0,
                amp = this.f[j].a,
                x = j * sectionWidth,
                stripeHeight = H / stripes;

            for(let i = 0; i < stripes; i++){
                ctx.fillStyle = `hsl(0deg, 0%, ${ (( amp * t + ((1-amp)/2) ) * 100).toFixed(1) }%)`;
                ctx.fillRect(x, i * stripeHeight, sectionWidth + 1, stripeHeight + 1);
    
                t = 1 - t;
            }
        }

        
    }
    doTrigger(){
        this.draw(this.ctx, this.canvas.width, this.canvas.height);
    }
    trigger(){
        this.doTrigger();
        // requestAnimationFrame(this.boundTrigger);
        setTimeout(this.boundTrigger, 1000/30);
    }
    setFreq(f){
        let a = [];
        if(f.length > 0)
            a.push(...f)
        this.f = a;
    }
}