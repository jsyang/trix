// Chapter 2 implementation

function HALFADDER(a,b)
{
    var sum=XOR(a,b);
    var carry=AND(a,b);
    return {
        "carry":carry-0,
        "sum":sum-0
    };
}

function FULLADDER(a,b,c)
{
    var sum=XOR(a,XOR(b,c));
    var carry=MUX(
        AND(b,c),
        OR(b,c),
        a
    );
    return {
        "carry":carry-0,
        "sum":sum-0
    };
}

function ADD16(a16,b16)
{
    var out16=[];
    var lastCarry=0;
    // Add them in order... array index order is reverse of normal "expected"
    // order, so we reverse the out16 array before it's returned.
    for(var i=a16.length-1; i>=0; i--)
    {
        var FA_RESULT=FULLADDER(a16[i],b16[i],lastCarry);
        out16.push(FA_RESULT.sum-0);
        lastCarry=FA_RESULT.carry;
    }
    return out16.reverse();
}

function INC16(in16)
{
    var one=[];
    for(var i in in16) one.push(0);
    one[one.length-1]=1;
    return ADD16(in16,one);
}

function ALU(x16,y16,zx,nx,zy,ny,f,no)
{
    var out16=[];
    var zr=1;
    var ng=0;
    
    // [zx, ..., zx]
    var zx16=[]; for(var i in x16) zx16.push(NOT(zx));
    var zy16=[]; for(var i in y16) zy16.push(NOT(zy));
      
    var x16_=AND16(x16,zx16);           // zx
    x16_=MUX16(x16_,NOT16(x16_),nx);    // nx
    
    var y16_=AND16(y16,zy16);           // zy
    y16_=MUX16(y16_,NOT16(y16_),ny);    // ny
    
    out16=MUX16(AND16(x16_,y16_),ADD16(x16_,y16_),f);
    out16=MUX16(out16,NOT16(out16),no);
    
    for(var i in out16) zr&=NOT(out16[i]);
    
    return {
        "out16":out16,
        "zr":zr,
        "ng":out16[0]
    };
}

/*

ALU(
[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
0,
0,
0,
0,
0,
1
).out16

*/
