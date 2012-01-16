// Chapter 3 implementations

// need a clock object (is usually a 555 or some other chip that ticks/tocks)
function Clock()
{
    this.value=0;
    this.run=function()
    {
        this.value=XOR(this.value,1)-0;
        return this.value;
    };
}

// our universal clock instance
//var aClock=new Clock();

/*/ building our elementary sequential logic chip; object
function DFF()
{
    this.oldValue=0;
    this.run=function(inBit,clock)
    {
        // tick to NOT save input
        if(clock.run()) return this.oldValue;
        
        // tock to save input
        this.oldValue=inBit;
        return this.oldValue;
    };
}
*/


// Replaced the DFF: take clock OUTPUT rather than running a clock within it
// Now we have to cycle the clock manually to get output (but we can synch events)
function DFF()
{
    this.oldValue=0;
    this.run=function(inBit,clockOUT)
    {
        // tick to NOT save input
        if(clockOUT) return this.oldValue;
        
        // tock to save input
        this.oldValue=inBit;
        return this.oldValue;
    };
}


// a sample DFF
// var aDFF=new DFF();

function Bit()
{
    this.DFF_=new DFF();
    this.run=function(inBit,load,clock)
    {
        return this.DFF_.run(
            MUX(this.DFF_.run(inBit,clock),inBit,load),
            clock
        );
    };
    
}

// a sample Bit
// var aBit=new Bit();

function Register()
{
    this.bits=[];
    // Register has 16 bits; a word.
    for(var i=16;i-->0;) this.bits.push(new Bit());
    this.run=function(in16,load,clock)
    {
        var out16=[];
        for(var i in in16) out16.push(this.bits[i].run(in16[i],load,clock));
        return out16;       
    };
}

// a sample Register
//var aRegister=new Register();
/*
Sample code for read/writing on a register.

aRegister.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
0,
aClock
);

aRegister.run(
[0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
1,
aClock
);


*/

function RAM8()
{
    this.registers=[];
    for(var i=8;i-->0;) this.registers.push(new Register());
    this.run=function(in16,address,load,clock)
    {
        var load_=DMUX8WAY(load,address);
        return MUX8WAY16(
            this.registers[0].run(in16,load_[0],clock),
            this.registers[1].run(in16,load_[1],clock),
            this.registers[2].run(in16,load_[2],clock),
            this.registers[3].run(in16,load_[3],clock),
            this.registers[4].run(in16,load_[4],clock),
            this.registers[5].run(in16,load_[5],clock),
            this.registers[6].run(in16,load_[6],clock),
            this.registers[7].run(in16,load_[7],clock),
            address
        );        
    };    
}

// a sample RAM8
//var aRAM8=new RAM8();
/*
Sample code for read/writing RAM8.

Read.

aRAM8.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[0,0,0],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]


aRAM8.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
[0,0,1],
1,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1]

aRAM8.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
[0,0,0],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]


aRAM8.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
[0,0,1],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1]


*/

function RAM64()
{
    this.ram8s=[];
    for(var i=8;i-->0;) this.ram8s.push(new RAM8());
    this.run=function(in16,address,load,clock)
    {
        var address_ram8=address.slice(0,3);
        var ram8address_=address.slice(3,6);
        
        // set the load bit for all ram8s in our collection
        var load_=DMUX8WAY(load,address_ram8);

        // choose our ram8 and operate on it
        return MUX8WAY16(
            this.ram8s[0].run(in16,ram8address_,load_[0],clock),
            this.ram8s[1].run(in16,ram8address_,load_[1],clock),
            this.ram8s[2].run(in16,ram8address_,load_[2],clock),
            this.ram8s[3].run(in16,ram8address_,load_[3],clock),
            this.ram8s[4].run(in16,ram8address_,load_[4],clock),
            this.ram8s[5].run(in16,ram8address_,load_[5],clock),
            this.ram8s[6].run(in16,ram8address_,load_[6],clock),
            this.ram8s[7].run(in16,ram8address_,load_[7],clock),
            address_ram8
        ); 
    };    
}

// Sample RAM64
//var aRAM64=new RAM64();
/*
Sample code for read/writing RAM.
Read.

aRAM64.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[0,0,0,0,0,0],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
*/

function RAM512()
{
    // k=9, n=512
    this.ram64s=[];
    for(var i=8;i-->0;) this.ram64s.push(new RAM64());
    this.run=function(in16,address,load,clock)
    {
        var address_ram64=address.slice(0,3);
        var ram64address_=address.slice(3);
        
        // set the load bit for all ram64s in our collection
        var load_=DMUX8WAY(load,address_ram64);

        // choose our ram64 and operate on it
        return MUX8WAY16(
            this.ram64s[0].run(in16,ram64address_,load_[0],clock),
            this.ram64s[1].run(in16,ram64address_,load_[1],clock),
            this.ram64s[2].run(in16,ram64address_,load_[2],clock),
            this.ram64s[3].run(in16,ram64address_,load_[3],clock),
            this.ram64s[4].run(in16,ram64address_,load_[4],clock),
            this.ram64s[5].run(in16,ram64address_,load_[5],clock),
            this.ram64s[6].run(in16,ram64address_,load_[6],clock),
            this.ram64s[7].run(in16,ram64address_,load_[7],clock),
            address_ram64
        );
    };
}

// Sample RAM512
//var aRAM512=new RAM512();
/*
Sample code for read/writing RAM.
Read.

aRAM512.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[0,0,0,0,0,0,0,0,0],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
*/

function RAM4K()
{
    // k=12, n=4096
    this.ram512s=[];
    for(var i=8;i-->0;) this.ram512s.push(new RAM512());
    this.run=function(in16,address,load,clock)
    {
        var address_ram512=address.slice(0,3);
        var ram512address_=address.slice(3);
        
        // set the load bit for all ram64s in our collection
        var load_=DMUX8WAY(load,address_ram512);

        // choose our ram64 and operate on it
        return MUX8WAY16(
            this.ram512s[0].run(in16,ram512address_,load_[0],clock),
            this.ram512s[1].run(in16,ram512address_,load_[1],clock),
            this.ram512s[2].run(in16,ram512address_,load_[2],clock),
            this.ram512s[3].run(in16,ram512address_,load_[3],clock),
            this.ram512s[4].run(in16,ram512address_,load_[4],clock),
            this.ram512s[5].run(in16,ram512address_,load_[5],clock),
            this.ram512s[6].run(in16,ram512address_,load_[6],clock),
            this.ram512s[7].run(in16,ram512address_,load_[7],clock),
            address_ram512
        );
    };
}

// Sample RAM4K
//var aRAM4K=new RAM4K();
/*
Sample code for read/writing RAM.
Read.

aRAM4K.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[0,0,0,0,0,0,0,0,0,0,0,0],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
*/

function RAM16K()
{
    // k=14, n=16384
    this.ram4Ks=[];
    for(var i=4;i-->0;) this.ram4Ks.push(new RAM4K());
    this.run=function(in16,address,load,clock)
    {
        // only 2 extra address bits up from RAM4K
        var address_ram4K=address.slice(0,2);
        var ram4Kaddress_=address.slice(2);
        
        // set the load bit for all ram64s in our collection
        var load_=DMUX8WAY(load,address_ram4K);

        // choose our ram4K and operate on it
        return MUX4WAY16(
            this.ram4Ks[0].run(in16,ram4Kaddress_,load_[0],clock),
            this.ram4Ks[1].run(in16,ram4Kaddress_,load_[1],clock),
            this.ram4Ks[2].run(in16,ram4Kaddress_,load_[2],clock),
            this.ram4Ks[3].run(in16,ram4Kaddress_,load_[3],clock),
            address_ram4K
        );
    };
}

// Sample RAM16K
//var aRAM16K=new RAM16K();
/*
Sample code for read/writing RAM.
Read.

aRAM16K.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
*/

// 16-bit counter
function PC()
{
    this.bits=[];
    // Register has 15 bits; a word.
    for(var i=16;i-->0;) this.bits.push(new Bit());
    
    this.run=function(in16,inc,load,reset,clock)
    {
        var out16=[];
        for(var i in this.bits) out16.push(this.bits[i].run(0,0,clock));
        
        if(reset)
        {
            for(var i in out16) out16[i]=this.bits[i].run(0,1,clock);
        }
        else
        {
            if(load)
            {
                for(var i in out16) out16[i]=this.bits[i].run(in16[i],1,clock);
            }
            else
            {
                if(inc)
                {                    
                    out16=INC16(out16);
                    for(var i in out16) this.bits[i].run(out16[i],1,clock);
                }
            }
        }
                
        return out16;
    };
}

// Sample Program Counter
//var aPC=new PC();
/*
aPC.run(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
1,
0,
0,
aClock
);
--> [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
*/
