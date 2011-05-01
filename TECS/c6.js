// Chapter 6 implementations

function alert(s){ WScript.Echo(""+s); }

var fs=new ActiveXObject("Scripting.FileSystemObject");

// Types of commands.
var EnumCommandType=
{
    NULL_COMMAND:0,
    A_COMMAND:1,
    C_COMMAND:2,
    L_COMMAND:3
};

function PadLeft0s(n,l)
{
    n=""+n;
    while(n.length<l) n='0'+n;
    return n;
}

function SymbolTable()
{
    this.table=
    // Predefined symbols.
    {
        "SP":0,
        "LCL":1,
        "ARG":2,
        "THIS":3,
        "THAT":4,
        "R0":0, "R1":1, "R2":2, "R3":3, "R4":4, "R5":5, "R6":6, "R7":7,
        "R8":8, "R9":9, "R10":10, "R11":11, "R12":12, "R13":13, "R14":14, "R15":15,
        "SCREEN":16384,
        "KBD":24576
    };
    this.addEntry=function(symbol,address)
    {
        if(this.contains(symbol)) return;
        return isNaN(address)? undefined : this.table[""+symbol]=address;
    };
    this.contains=function(symbol){ return !!this.table[""+symbol]; };
    this.GetAddress=function(symbol){ return this.table[""+symbol]; };
}

var Code=
{
    dest:function(mnemonic)
    {
        switch(mnemonic)
        {
            case "M":   return 1;
            case "D":   return 2;
            case "MD":  return 3;
            case "A":   return 4;
            case "AM":  return 5;
            case "AD":  return 6;
            case "AMD": return 7;
            default:    return 0;
        }
    },
    
    comp:function(mnemonic)
    {
        switch(mnemonic)
        {
            case "0":   return 42;
            case "1":   return 63;
            case "-1":  return 58;
            case "D":   return 12;
            case "A":   return 48;
            case "!D":  return 13;
            case "!A":  return 49;
            case "-D":  return 31;
            case "-A":  return 51;
            case "D+1": return 31;
            case "A+1": return 55;
            case "D-1": return 14;
            case "A-1": return 50;
            case "D+A": return 2;
            case "D-A": return 19;
            case "A-D": return 7;
            case "D&A": return 0;
            case "D|A": return 21;
            case "M":   return 64+48;
            case "!M":  return 64+49;
            case "-M":  return 64+51;
            case "M+1": return 64+55;
            case "M-1": return 64+50;
            case "D+M": return 64+2;
            case "D-M": return 64+19;
            case "M-D": return 64+7;
            case "D&M": return 64+0;
            case "D|M": return 64+21;
            default:    return;
        }
    },
    
    jump:function(mnemonic)
    {
        switch(mnemonic)
        {
            case "JGT": return 1;
            case "JEQ": return 2;
            case "JGE": return 3;
            case "JLT": return 4;
            case "JNE": return 5;
            case "JLE": return 6;
            case "JMP": return 7;
            default:    return 0;
        }    
    }
}

function Parser(inputFile)
{
    this.inputFile=fs.OpenTextFile(inputFile,1,-2);
    this.currentCommand={type:EnumCommandType.NULL_COMMAND};    
    this.currentROMAddress=0;
    
    this.currentLineString="";
    
    this.hasMoreCommands=function() { return !this.inputFile.AtEndOfStream; };
    
    this.advance=function()
    {
        if(!this.hasMoreCommands()) { this.inputFile.Close(); return; }        
        var line=this.inputFile.ReadLine();
        
        // Strip comments and whitespace from the line.
        line=line.split("//")[0];
        line=line.replace(/\s/g,"");
        line=line.replace(/\n/g,"");
        
        this.currentLineString=line;
                
        // Find type of command.
        if(line.indexOf('@')!=-1)
            { this.currentCommand={type:EnumCommandType.A_COMMAND}; this.currentROMAddress++; }
        else if(line.indexOf('(')!=-1)
            { this.currentCommand={type:EnumCommandType.L_COMMAND}; }
        else if(line.length)
            { this.currentCommand={type:EnumCommandType.C_COMMAND}; this.currentROMAddress++; }
        else
            this.currentCommand={type:EnumCommandType.NULL_COMMAND};
        
        if(this.currentCommand.type==EnumCommandType.A_COMMAND) this.currentCommand.symbol=line.replace(/[@]/g,'');        
        if(this.currentCommand.type==EnumCommandType.L_COMMAND) this.currentCommand.symbol=line.replace(/[\(\)]/g,'');
        if(this.currentCommand.type==EnumCommandType.C_COMMAND)
        {
            if(line.indexOf('=')!=-1)
            {
                line=line.split('=');
                this.currentCommand.dest=line.shift();
                line=line[0];
            }
            if(line.indexOf(';')!=-1)
            {
                line=line.split(';');
                this.currentCommand.jump=line.pop();
                line=line[0];
            }
            this.currentCommand.comp=line;
        }
    };
    
    this.commandType=function() { return this.currentCommand.type; };
    
    this.symbol=function() { return this.currentCommand.symbol; };
    this.dest=function()   { return this.currentCommand.dest; };
    this.comp=function()   { return this.currentCommand.comp; };
    this.jump=function()   { return this.currentCommand.jump; };    
}

function Assembler(asmFile)
{
    this.symbolTable=new SymbolTable();
    this.asmFile=asmFile;
    this.assemble=function()
    {
        
        var s=this.symbolTable;
        var p=new Parser(this.asmFile);
        
        // First pass: build the motherfucking symbol table.
        while(p.hasMoreCommands())
        {
            p.advance();
            if(p.currentCommand.type==EnumCommandType.L_COMMAND) s.addEntry(p.symbol(),p.currentROMAddress);
        }        
    
        var code="";
        var currentRAMAddress=16;
        p=new Parser(this.asmFile);
        // Second pass: resolve the symbols and generate some code.
        while(p.hasMoreCommands())
        {
            p.advance();
            switch(p.currentCommand.type)
            {
                case EnumCommandType.A_COMMAND:
                
                    // Is this a variable (not a label)?
                    if(!s.contains(p.symbol()))
                    {
                        // Check if the symbol is a string or an integer.
                        var sym=parseInt(p.symbol());
                        if(!isNaN(sym) && (sym+"").length==p.symbol().length)
                        {
                            s.addEntry(p.symbol(),sym);
                        }
                        else
                        {
                            s.addEntry(p.symbol(),currentRAMAddress);
                            currentRAMAddress++;
                        }
                    }
                    
                    code+=PadLeft0s(s.GetAddress(p.symbol()).toString(2),16)+'\n';
                    break;
                    
                case EnumCommandType.C_COMMAND:
                    var comp=Code.comp(p.comp());
                    var dest=Code.dest(p.dest());
                    var jump=Code.jump(p.jump());                    
                    code+="111"+PadLeft0s(comp.toString(2),7)+PadLeft0s(dest.toString(2),3)+PadLeft0s(jump.toString(2),3)+'\n';
                    break;
            }
        }
        
        return code;
    };
}

var blah=new Assembler('Rect.asm');
alert(blah.assemble());