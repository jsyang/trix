// Chapter 7 - Virtual Machine I: Stack Arithmetic
// .vm files are the code for VM programs (like .c)

/*

  VM:   program : file  : functions
  OOP:  program : class : methods
  
*/

function alert(s){ WScript.Echo(""+s); }

var fs=new ActiveXObject("Scripting.FileSystemObject");

var Enum=
{
  CommandType:
  {
    C_NULL:-1,
    C_ARITHMETIC:0,
    C_PUSH:1,
    C_POP:2,
    C_LABEL:3,
    C_GOTO:4,
    C_IF:5,
    C_FUNCTION:6,
    C_RETURN:7,
    C_CALL:8    
  }
};


function CodeWriter(ASMfile)
{
  this.ASMfile=ASMfile? fs.OpenTextFile(ASMFile,2,-2) : 0;
  this.setFileName=function(fileName)
  {
    if(this.ASMfile) this.ASMfile.Close();
    this.ASMfile=fs.OpenTextFile(fileName,2,-2);
  };
  this.writeArithmetic=function(command)
  {
    this.ASMfile.WriteLine(STUFF);
  };
  this.writePushPop=function(command,segment,index)
  {
  
  };
  this.Close=function(){ this.ASMfile.Close(); this.ASMfile=0; };
}

function Parser(VMfile)
{  
  this.sourceFile=fs.OpenTextFile(VMfile,1,-2);
  this.currentCommand={type:Enum.CommandType.C_NULL};
  
  this.hasMoreCommands=function(){ return !this.inputFile.AtEndOfStream; };
  this.advance=function()
  {
    if(!this.hasMoreCommands()) { this.inputFile.Close(); return; }     
    // Strip comments and whitespace from the line.
    line=line.split("//")[0];
    line=line.replace(/\B\s/g,"").replace(/\s$/g,"").replace(/\n/g,"");
    
    if(line.indexOf('push')+line.indexOf('pop')==-2)
      this.currentCommand={type:Enum.CommandType.C_NULL};
    else
    {
      
    }
  };
  this.commandType=function(){ return this.currentCommand.type; };
  this.arg1=function()
  {
    if(this.currentCommand.type==Enum.CommandType.C_NULL) return;
    
  };
  this.arg2=function()
  {
    if(this.currentCommand.type==Enum.CommandType.C_NULL) return;
    
  };
   
}

function main()
{
  var CW=new CodeWriter();

  for(var args=WScript.Arguments, i=args.length; i--; )
  {
    // A file or a folder?
    if(fs.FolderExists(args(i)))
    {
      var folder=fs.GetFolder(args(i));
      var files=new Enumerator(folder.files);
      for(;!files.atEnd();files.moveNext())
      {
        var p=new Parser(files.item()+"");
        
      }
    }
    else
    {    
      var p=new Parser(args(i));
      
    }
    
    
    
  }
}

main();