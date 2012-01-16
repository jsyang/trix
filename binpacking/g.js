/************************* visualization and output ****************************

	written for binpacking display
	
*******************************************************************************/


function textLevels(b)
{
    var s="";
    for(var i in b.levels)
    {
        var l = b.levels[i];
        s+="\nLevel "+i+" :\t";
        for(var j in l.rects)
        {
            var r=l.rects[j];
            s+="["+r.w+","+r.h+"]\t";
        }
    }
    return s+"\n\nTotal wasted space: "+((b.wastedSpace()*10000)>>0)/100+"%\n";
}

function initCanvas()
{
    var c=document.createElement("canvas");
    c.width=300;
    c.height=500;
    document.body.appendChild(c);
    return c.getContext('2d'); 
}

function drawBin(bin,gfx)
{
    var maxHeight=500;

    var x=0;
    var y=0;

    gfx.fillStyle="rgb(255,64,0)";
    gfx.lineWidth="1";

    // top edge of the bin
    gfx.beginPath();
    gfx.moveTo(0,0);
    gfx.lineTo(bin.w,0);
    gfx.stroke();

    // left edge of the bin
    gfx.beginPath();
    gfx.moveTo(0,0);
    gfx.lineTo(0,maxHeight);
    gfx.stroke();

    // right edge of the bin
    gfx.beginPath();
    gfx.moveTo(bin.w,0);
    gfx.lineTo(bin.w,maxHeight);
    gfx.stroke();

    for(var i in bin.levels){
        var l = bin.levels[i];
        x=0;
        for(var j in l.rects){
            var r = l.rects[j];
            //gfx.fillStyle="rgb(128,64,0)";
            //gfx.fillRect(x,y,r.w,r.h);
            gfx.fillStyle="rgb(255,"+(120*(parseInt(j)%2))+",0)";
            gfx.fillRect(x,y,r.w,r.h);
            x+=r.w;
        }
        y+=l.h;
        // draw the bottom of the next level
        gfx.beginPath();
        gfx.moveTo(0,y);
        gfx.lineTo(bin.w-1,y);
        gfx.stroke();
    }
        
}

