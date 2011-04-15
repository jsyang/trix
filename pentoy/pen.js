// pen doodler toy for web pages
// by JSYang ~ mie_686@yahoo.com
// last version: 5:19 AM 9/2/2009

// note: requires main library "yang.js"

//function debug(){ window.status="pen.d: "+pen.d; setTimeout("debug()",20); }

var pen={
	// --- states ---
	isD:0,				// mouse is down
	cZ:1,				// canvas z-index
	c: null,			// ref: canvas context object
	m:[-1,-1],			// old mouse coords
	d:"",				// data string (paths delimited by |, points by .)
	
	// --- functions ---
	uD: function(e){	// update Drawing
		if(!pen.isD) return 1;
		pen.c.moveTo(pen.m[0],pen.m[1]); 	pen.c.lineTo(e.pageX,e.pageY);
		pen.c.stroke();						pen.m=[e.pageX,e.pageY];
		pen.d+="."+pen.m;
	},
	
	lD: function(drawingData){		// load Drawing
		pen.d=drawingData;
		var a=pen.d.split("|"), i=a.length;
		while(i--){
			if(!a[i].length) continue;
			var b=a[i].split("."), j=b.length;
			if(j==1){	// dot case
				var c=b[--j].split(",");
				pen.c.fillRect(parseInt(c[0])-1,parseInt(c[1])-1,2,2);
				continue;
			}
			var c=b[--j].split(",");
			pen.c.beginPath();
			pen.c.moveTo(parseInt(c[0]),parseInt(c[1]));
			while(j--){
				if(!b[j].length) continue;
				var c=b[j].split(",");
				pen.c.lineTo(parseInt(c[0]),parseInt(c[1]));
				pen.c.stroke();
			}
			pen.c.closePath();
		}
	},
	
	setup0:function(){	// setup canvas
		var body = document.body,
	    html = document.documentElement;
		var height=Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
			width=Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
		document.body.innerHTML+="<canvas style='z-index:1;position:absolute;left:0;top:0;' width="+width+" height="+height+" id=c></canvas>";
		setTimeout("pen.c=y.o('c').getContext('2d');pen.c.lineWidth=2;pen.c.strokeStyle='rgb(0,0,0)';",180);
	},
	
	setup1:function(){	// setup event handlers
		window.onkeydown=function(e){
			switch(e.keyCode){
				case 90: pen.cZ*=-1; y.o('c').style.zIndex=pen.cZ; break;
				// save and load from cookies
				case 89: y.cookie.set("drawing",pen.d,7); break;
				case 88: pen.lD(y.cookie.get("drawing")); break;
			}
		};
				window.onmousedown=function(e){pen.isD=1; pen.m=[e.pageX,e.pageY]; pen.c.beginPath(); pen.d+="|"+pen.m;};
		window.onmouseup=function(e){pen.isD=0; pen.c.closePath();}; 
		window.onmousemove=pen.uD;
		window.onclick=function(e){ pen.c.fillRect(e.pageX-1,e.pageY-1,2,2); };
	},

	setup:function(){ pen.setup0(); pen.setup1(); }

};

setTimeout("pen.setup()",500);
