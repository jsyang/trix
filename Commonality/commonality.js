/*******************************************************************************
    Commonality object (pseudo-unique abstract tag set)
    JSYANG.CA @ gmail.com
    23/10/2010
*******************************************************************************/
    
    

function Commonality(){
	this.words={};		// hashtable of words
	this.commons={};	// hashtable of common words for all blocks
	
	// we save the blocks of text that from the same source
	this.blocks=[];
	this.keyphrases={};

	this.commonsSize=0;
	
	// histogram / freq table of all the words
    /* to do... */
	
	// cMinFreq = commons word frequency min bound
	// needs to appear more than this # of times to be "common" in the
	// commonality

	// recompute the common theme
	this.recomp=function(cMinFreq){
		/*********************************** compute the common words */
		this.commons={};
        this.commonsSize=0;
		for(var i in this.words){
			if(this.words[i]>cMinFreq){
                this.commons[i]=0;
                this.commonsSize++;
            }
		}
	};

	
	// the THEME of the Commonality
	this.theme=function(){
		var a="";
		for(var i in this.commons){ a+=i+" "; }
		return a;
	};

	// add an entire body (logical collection of blocks -- article)
	this.addbody=function(a){
		/******************** split the body into blocks (paragraphs) */
		a=a.split("\n");
		var b=[];
		for(var i in a){
			if(a[i].length) b.push(a[i]);
		}
		
		for(var i in b){
			this.add(b[i]);
		}

	};

	// add a block
	this.add=function(a){
		/***************************************** remove punctuation */
		// .,!?;:
		a=a.replace(new RegExp("[\\.,!\\?;:\\)\\(]",["g"]),"");
		// to all lowercase 
		a=a.toLowerCase();
		// apostroph'd words, contractions and possessives
		var b=["m","s","t","d","ll","re","ve"];
		for(var i in b){
			a=a.replace(new RegExp("(\\S)+(�|\\')("+b[i]+")",["gi"]), "");
		}
		// " and ' and the special quote characters
		a=a.replace(new RegExp("[\\'��\"��]",["g"]),"");
	
		//-------- split into word array, remove empties and duplicates
		var b=a.split(" ");
	
		this.blocks.push(b);	// push the word array
	
		// convert the array into an object and add the words in the 
		// paragraph into the object as members and then reconvert the 
		// object back
		var c={}; for(var i in b){
			if(b[i].length) c[b[i]]={};
		}
	
		b=[]; for(var i in c){
			if(i.length>1 && w[i]==undefined) b.push(i);
		}

		/************************************* tally the unique words */
		for(var i in b){
			if(typeof(this.words[b[i]])!='undefined'){
				this.words[b[i]]++;
			}else{
				this.words[b[i]]=1;
			}
		}
		
	};

}
