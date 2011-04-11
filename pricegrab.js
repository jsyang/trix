function alert(s){ WScript.Echo(""+s); }
function CurrentPath(){ return WScript.ScriptFullName.substring(0,path.lastIndexOf("\\")+1); }

function IE(x,y,w,h,v){
    var IEwin=WScript.CreateObject("InternetExplorer.Application");
    IEwin.Navigate("about:blank");
    IEwin.Left=x;
    IEwin.Top=y;
    IEwin.Width=w;
    IEwin.Height=h;
    IEwin.AddressBar=false;
    IEwin.StatusBar=false;
    IEwin.Resizable=false;
    IEwin.MenuBar=false;
    IEwin.Toolbar=false
    IEwin.Silent=true;
    IEwin.Document.innerHTML="<body></body>";
    IEwin.Document.body.style.overflow="auto";
    IEwin.Visible=v?true:false;
    return IEwin;
}


function IEGetElementsByClassName(c) {    
    var d = ie.Document.all;
    var e = [];
    var re = new RegExp("(?:^|\\s)"+c+"(?:\\s|$)");
    for (var i in d){
        if (re.test(d[i].className)) e.push(d[i]);
    }
    return e;
}

function LoadAllPrices(kword,baseurl){
    var i=1;
    var prices=[];
    var progressWindow=IE(0,-20,180,140,true);
    var progress=progressWindow.Document;    
    progress.body.style.overflow="hidden";
    progress.body.style.font="12px verdana";    
    progress.body.style.verticalAlign="middle";
    progress.body.innerHTML=kword+"<hr><b>Scraping page <span id='page'>0</span></b><br>Sample size: <span id='size'>0</span>";
    var pageProgress=progress.getElementById("page");
    var size=progress.getElementById("size");
    
    while(1){
        pageProgress.innerHTML=""+i;
        
        // Can decrease sleeptime if we've turned off image loading in IE, goes MUCH faster.
        (function(url){ie.Navigate(url);while(ie.Busy){}WScript.Sleep(1000);ie.Stop();}) (baseurl+i);

        var d=ie.Document;

        // Max page number that's not the current page.
        var gPage=IEGetElementsByClassName("notCurrentPage");
        gPage=gPage.length? parseInt(gPage[gPage.length-1].innerText) : 0;
        
        // Current page number.
        var cPage=IEGetElementsByClassName("currentPage");
        cPage=cPage.length? parseInt(cPage[0].innerText) : 1;

        // Max 20 results per page.
        for(var j=0; j<20; j++){            
            var t=d.getElementById("resultRow"+j);
            if(!t) break;
            var title=t.children[2].children[0].innerText;
            var price=t.children[3].innerText;
            price=parseFloat(price.substr(1));
            if(!isNaN(price)) prices.push(price);
            pageProgress.innerHTML+=".";
        }
        
        size.innerText=prices.length;
        
        // No more pages to look at, otherwise flip to next page
        if(cPage>gPage) break; else i++;        
    }
    
    progressWindow.Quit();
    
    return prices;
}

function getAvgPrice(a,keyword){    
    var startTime=(new Date()).valueOf();    
    var kword1=keyword.replace(/ /g,"-");
    var kword2=keyword.replace(/ /g,"Q20");
    var allPrices=LoadAllPrices(keyword,a.url.replace(/__KWORD1__/g,kword1).replace(/__KWORD2__/g,kword2));
    var sum=0; for(var i in allPrices) sum+=allPrices[i];
    
    var elapsed=(new Date()).valueOf()-startTime;
    var seconds=elapsed/1000;
   
    var mean=sum/allPrices.length;
    var variance=0;
    for(var i in allPrices){
        var j=allPrices[i]-mean;
        variance+=j*j;
    }
    variance/=allPrices.length;       
    
    return [[mean,Math.sqrt(variance),seconds,allPrices.length],allPrices];
}

/* URLs for cities offering items with prices ONLY */
var b=[
    {
        city:"Toronto GTA",
        url:"http://toronto.kijiji.ca/f-__KWORD1__-Classifieds-W0QQAdTypeZ2QQKeywordZ__KWORD2__QQPageZ"
    },
    {
        city:"Hamilton",
        url:"http://hamilton.kijiji.ca/f-__KWORD1__-Classifieds-W0QQAdTypeZ2QQKeywordZ__KWORD2__QQPageZ"
    }
];

var ie=IE(0,0,10,10,false);

var search="super nintendo";
var results=getAvgPrice(b[1],search);

var summary=results[0];

var screen=ie.Document.parentWindow.screen;
var c=[screen.width>>1,screen.height>>1];
var resultWindow=IE(c[0]-140,c[1]-110,280,220,true);
var rd=resultWindow.Document.body.innerHTML=
    "Results in "+b[1].city+
    " for '"+search+"'"+
    "<hr>Price mean = "+summary[0]+
    "<br>Price std. dev. = "+summary[1]+
    "<br>Total items = "+summary[3]+
    "<hr>Operation took "+summary[2].toFixed(3)+"s.";

WScript.Sleep(800);    
var wsh=WScript.CreateObject("WScript.Shell");
wsh.AppActivate("Blank Page - Windows Internet Explorer");

ie.Quit();