// Chapter 5 implementations
// need to implement a screen interface, probably will do this through canvas.

// ROM we can load from a string and then convert to 32K array
function ROM32K()
{
    this.mem="";
    this.load=function(memString)
    {
        this.mem=memString;
    };
    this.run=function(address15)
    {
        // truncate from the front
        while(address15.length>15) address15.shift();
        
        // convert 15 bit address to a number we can use to substr.
        var addr_dec=parseInt(address15.join(''),2);
        var memContents=this.mem.substr(addr_dec*16,16).split('');
        for(var i in memContents) memContents[i]=parseInt(memContents[i]);
        return memContents;
    };
}

/*/ Sample ROM32K
var aROM32K=new ROM32K();
aROM32K.load(       // address
"0000000000000000"+ // 0
"1111111111111111"+ // 1
"1010101010101010"+ // 2
"0001000100010001"+ // 3
"1110111011101110"  // 4
);
/*/

/* sample access of ROM32K

aROM32K.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
);

*/

// need further debugging
// Screen object (mem-mapped)
function Screen()
{
    var c=document.createElement("canvas");
    c.width=512;
    c.height=256;
    c.style.border="1px solid #0a0";
    document.body.appendChild(c);
    this.c=c.getContext("2d");
    this.RAM4K1=new RAM4K();
    this.RAM4K2=new RAM4K();
    this.run=function(in16,address,load,clock)
    {
        if(load)
        {
            var address_dec=parseInt(address.join(""),2);
            // convert address into word-pixelgroup
            var word_=[
                (address_dec%32)<<4,
                address_dec>>5
            ];
            var imgdata=this.c.createImageData(16,1);
            var pdata=imgdata.data;
            for(var i in in16)
            {
                // pixel location
                var pl=(parseInt(i)<<2);
                var p=in16[i] ? 0 : 255;
                pdata[ pl + 0 ]=p;
                pdata[ pl + 1 ]=p;                    
                pdata[ pl + 2 ]=p;
                pdata[ pl + 3 ]=255;
            }           
            
            // manipulate canvas if load bit is 1
            this.c.putImageData(imgdata,word_[0],word_[1]);
            this.c.save();
            this.c.restore();
        }
        
        // access the underlying RAM8K
        return (!address.shift()) ? this.RAM4K1.run(in16,address,load,clock) : this.RAM4K2.run(in16,address,load,clock);        
    };
}

// sample Screen and draw command
// should probably use a different clock for system than for video
// video refresh should be independent of CPU...
/* var aScreen;
window.onload=function()
{
    aScreen=new Screen();
    aScreen.run(
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        1,
        aClock
    );
};
//*/

// global var to capture KB events for the simulated KB

var KB=0;
//window.onkeydown=function(e){ KB=e.which; };
//window.onkeyup=function(){ KB=0; };


// mem-mapped KB object
// only the ascii keys are accounted for right now, no uppercase.
function Keyboard()
{
    this.KBREGISTER=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.run=function()
    {
        if(!KB)
        {
            this.REGISTER=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        }
        else
        {
            var kbval=KB.toString(2);
            while(kbval.length<16) kbval='0'+kbval;
            for(var i in kbval)
            {
                var j=parseInt(kbval[i]);
                this.KBREGISTER[parseInt(i)]=j;
            }
        }    
        return this.KBREGISTER;
    };
}

// RAM--Data Memory with mapped IO devices
function Memory()
{
    this.RAM=new RAM16K();      // first 16K of mem
    this.SCREEN=new Screen();   // next 8K of mem-mapped screen
    this.KEYBOARD=new Keyboard();
    this.run=function(in16,address15,load,clock)
    {
        if(!address15[0])
        {
            // RAM chosen
            return this.RAM.run(in16,address15.slice(1),load,clock);
        }
        else
        {
            // memory mapping to IO
            if(!address15[1])
            {
                // accessing 8K mem-mapped Screen
                return this.SCREEN.run(in16,address15.slice(1),load,clock);
            }        
            else
            {
                // always return KB from KB range forth.
                return this.KEYBOARD.run();
            }
        }
    };
}

/*/ sample I/O of system Memory chip
var aMemory;
window.onload=function()
{
    aMemory=new Memory();
    // Draw a line
    //aMemory.run([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],1,aClock);
    // Read most recent KB press
    //aMemory.run([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],0,aClock);
    
    // Draw a smiley
    aMemory.run([0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0],[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],[1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,1,1,0,0,1,0,1,0,1,1,0,0,0],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],[1,0,0,0,0,0,0,1,0,1,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,1,1,0,1,0,1,0,0,1,1,0,0,0],[1,0,0,0,0,0,0,1,1,0,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,0,1,1,0,1,1,0,0,1,1,0,0,0,0],[1,0,0,0,0,0,0,1,1,1,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0],[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0],1,aClock);
    aMemory.run([0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],[1,0,0,0,0,0,1,0,0,1,0,0,0,0,0],1,aClock);
    
    aMemory.run([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],1,aClock);

};
//*/




// CPU object. holds 3 chips within it: A register, D register, an instance of PC
// We no longer tweak the clock inside of each sequential chip, we only take
// clock output --> clock value after the tick/tock.
function CPU()
{
    this.A=new Register();
    this.D=new Register();
    this.PC=new PC();
    
    this.run=function(inM16,instruction16,reset,clock)
    {
        // A register value, after we've decoded the instructions.
        // Keep the old A register value.
        var A_;
        var A_0=this.A.run( instruction16, 0, clock );
        var PC_incr=1;
        
        // By default we don't jump: continue execution with the instruction
        // addressed by A register value.
        var JUMP=0;
        
        // CPU outputs
        // If !writeM, outM16 can be any value, let's default it to 0
        var outM16=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        var writeM=0;
        var addressM15=A_0.slice();
        var pc15=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        
        
        // 1. Instruction decoding.
        // Break down what we're supposed to do with instruction16
        if(instruction16[0])
        {
            // C-instruction
            
            // Components of the C-instr
            var comp=instruction16.slice(3,3+7);
            var dest=instruction16.slice(10,10+3);
            var jump=instruction16.slice(13,13+3);
        
            // We can actually MUX this away so that it's not repeated...
            // Use the current A register value (!load) 
            A_ = this.A.run( instruction16.slice(), 0, clock );
            
            // Assign comp bits, A or M as x16 for ALU
            var a=comp[0];
            var x16=MUX16( A_, inM16, a );
            
            // The other required bits for ALU
            var zx=comp[1];
            var nx=comp[2];
            var zy=comp[3];
            var ny=comp[4];
            var f= comp[5];
            var no=comp[6];
            
            // D as y16 for ALU operations
            var y16 = this.D.run( inM16, 0, clock );
            
            // 2. Instruction execution.        
            // Compute our stuff with the ALU
            // returns { out16, zr, ng }
            var ALU_=ALU(x16,y16,zx,nx,zy,ny,f,no);
            
            // Fill in our A,D,M dests.
            if(dest[0]) A_ = this.A.run( ALU_["out16"], 1, clock );
            if(dest[1]) this.D.run( ALU_["out16"], 1, clock );
            if(dest[2]) 
            {
                outM16=ALU_["out16"].slice();
                writeM=1;
                addressM15=A_.slice();
            }
            
            // Jump to conclusions! We alter the the PC!
            // Edit: fuck the nested IFs, we can switch this bitch!
            
            var jump_=parseInt(jump.join(''),2);
            switch(jump_)
            {
                case 0: JUMP=0; break;                                          // null -- never jump
            
                case 1: if(!ALU_["ng"] && !ALU_["zr"]) JUMP=1; break;           // JGT
                case 2: if(ALU_["zr"]) JUMP=1; break;                           // JEQ
                case 3: if(!ALU_["ng"]) JUMP=1; break;                          // JGE
                
                case 4: if(ALU_["ng"] && !ALU_["zr"]) JUMP=1; break;            // JLT
                case 5: if(!ALU_["zr"]) JUMP=1; break;                          // JNE
                case 6: if(ALU_["ng"]) JUMP=1; break;                           // JLE
                
                case 7: JUMP=1; break;                                          // JMP
                
                default: alert("CPU encountered bad jump bits for C-instruction!");
            }
            
            /* So at this point, the following outputs are ready:
                outM16
                writeM
                addressM15 -- this is the value of A register = A_ (15 bits)
                
               And we know if we want to JUMP or not.            
            */
        }
        else
        {
            // A-instruction -- easy enough, only 1 thing to do
            // No computation with ALU
            // Push our shit into the A register as per Hack ML specs
            A_ = this.A.run( instruction16.slice(), 1, clock );
        }
        
        if(JUMP) PC_incr=0;
        
        // Run the PC after all the computation's done.
        pc15=this.PC.run(A_,PC_incr,JUMP,reset,clock);

        return {
            "outM16":       outM16,
            "writeM":       writeM,
            "addressM15":   addressM15,
            "pc15":         pc15
        };
    };
}


// Top-level chip: the computer itself.
// Dec. 2, 2010: I think this is more or less complete. Only need to implement and test CPU
function Computer()
{
    this.CPU=new CPU();
    this.clock=new Clock();
    this.ROM=new ROM32K();
    this.RAM=new Memory();
    this.reset=0;
    
    // starts off as a tock
    this.lastClock=1;
    this.lastCPUcycle={
        outM16:     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        writeM:     0,
        addressM15: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        pc15:       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    };
    
    
    // execution of the computer platform
    this.run=function()
    {
        // update the state of the computer by running a CPU cycle
        this.lastCPUcycle=this.CPU.run(
        
            // inM16 = input from RAM (data memory)
            this.RAM.run(
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],  // just a read (empty 16)
                this.lastCPUcycle["addressM15"].slice(1),
                0,
                this.lastClock
            ),
            
            // instruction16 = input from ROM (instruction memory)
            this.ROM.run(this.lastCPUcycle["pc15"].slice(1)),
            
            // reset button
            this.reset,
            
            // clock
            this.lastClock
        );

var poo=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
alert(
"A: "+this.CPU.A.run(poo,0,0).join("")+
"\nD: "+this.CPU.D.run(poo,0,0).join("")+
"\nPC: "+this.CPU.PC.run(poo,0,0,0,0).join("")+
"\n"
);

        
        // update the computer's clock
        this.lastClock=this.clock.run();
    };
}

var compy=new Computer();

// Load Add.hack
compy.ROM.load(
"0000000000000010"+
"1110110000010000"+
"0000000000000011"+
"1110000010010000"+
"0000000000000000"+
"1110001100001000"
);


/*

// Watch the contents of the PC, move
compy.run(); compy.CPU.PC.run(poo,0,0,0,1);

compy.RAM.run(poo,goo,0,0);

*/

// Needs to be debugged! Doesn't work properly!
