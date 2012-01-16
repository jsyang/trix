// Primitive gate. (we can "cheat" here)
function NAND(a,b)
{
    return !(a&&b)-0;
}

function NOT(a)
{
    return NAND(1,a)-0;
}

function AND(a,b)
{
    return NOT(NAND(a,b))-0;
}

function OR(a,b)
{
    return NAND(NOT(a),NOT(b))-0;
}

function XOR(a,b)
{
    return AND(NAND(a,b),OR(a,b))-0;
}

function MUX(a,b,sel)
{
    return OR(AND(a,NOT(sel)),AND(b,sel))-0;
}

function DMUX(input,sel)
{
    return [AND(NOT(sel),input)-0,AND(sel,input)-0];
}

function NOT16(in16)
{
    var out16=[];
    for(var i in in16) out16.push(NOT(in16[i])-0);
    return out16;
}

function AND16(a16,b16)
{
    var out16=[];
    for(var i in a16) out16.push(AND(a16[i],b16[i])-0);
    return out16;
}

function OR16(a16,b16)
{
    var out16=[];
    for(var i in a16) out16.push(OR(a16[i],b16[i])-0);
    return out16;
}

function MUX16(a16,b16,sel)
{
    var out16=[];
    for(var i in a16) out16.push(MUX(a16[i],b16[i],sel)-0);
    return out16;
}

function OR8WAY(in8)
{
    var r=0;
    for(var i in in8)
    {
        r=OR(r,in8[i])-0;
    }
    return r;
}

function MUX4WAY16(a16,b16,c16,d16,sel)
{
    var a_=AND(NOT(sel[1]),NOT(sel[2]));
    var b_=AND(NOT(sel[0]),sel[1]);
    var c_=AND(sel[0],NOT(sel[1]));
    var d_=AND(sel[0],sel[1]);
    
    var out16=[];
    for(var i in a16)
    {
        out16.push(
            OR(
                OR(
                    OR(
                        AND(a_,a16[i]),
                        AND(b_,b16[i])
                    ),
                    AND(c_,c16[i])
                ),
                AND(d_,d16[i])
            )
            -0
        );
    }
    return out16;
}

function MUX8WAY16(a16,b16,c16,d16,e16,f16,g16,h16,sel)
{
    var first8_=[];
    for(var i=16;i-->0;) first8_.push(NOT(sel[0]));
    var last8_=NOT16(first8_);
    
    return OR16(
        AND16(first8_,MUX4WAY16(a16,b16,c16,d16, [sel[1],sel[2]])),
        AND16(last8_, MUX4WAY16(e16,f16,g16,h16, [sel[1],sel[2]]))
    );
}

/* test:
    
MUX8WAY16(
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
[0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
[0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
[0,0,0]
);

-->

[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]

*/

function DMUX4WAY(input,sel)
{
    var a_=AND(NOT(sel[1]),NOT(sel[2]));
    var b_=AND(NOT(sel[0]),sel[1]);
    var c_=AND(sel[0],NOT(sel[1]));
    var d_=AND(sel[0],sel[1]);
    return [
        AND(input,a_)-0,
        AND(input,b_)-0,
        AND(input,c_)-0,
        AND(input,d_)-0
    ];
}
       
function DMUX8WAY(input,sel)
{

    var a_=AND(NOT(sel[0]),AND(NOT(sel[1]),NOT(sel[2])));
    var b_=AND(NOT(sel[0]),AND(NOT(sel[1]),sel[2]));
    var c_=AND(NOT(sel[0]),AND(sel[1],NOT(sel[2])));
    var d_=AND(NOT(sel[0]),AND(sel[1],sel[2]));
    var e_=AND(sel[0],AND(NOT(sel[1]),NOT(sel[2])));
    var f_=AND(sel[0],AND(NOT(sel[1]),sel[2]));
    var g_=AND(sel[0],AND(sel[1],NOT(sel[2])));
    var h_=AND(sel[0],AND(sel[1],sel[2]));    
    
    return [
        AND(a_,input)-0,
        AND(b_,input)-0,
        AND(c_,input)-0,
        AND(d_,input)-0,
        AND(e_,input)-0,
        AND(f_,input)-0,
        AND(g_,input)-0,
        AND(h_,input)-0       
    ];
}
       
