////////////////////////////////////////////////////////////////////////////////
// Read lines from a file and execute a pre-defined func on each line
////////////////////////////////////////////////////////////////////////////////

function ProcFile(path,f)
{
    // Return string, do something with f(line N), add it to the return string.
        var r="";
    
    // INIT: file system stuff
        var fs=new ActiveXObject("Scripting.FileSystemObject");
        var file=fs.OpenTextFile(path,1,-2);
    
    // READ: each line of le file!
        while(!file.AtEndOfStream) r+=f(file.ReadLine());

    // CLEAN: remove .raw files and close text streams
        file.Close();
    
    return r;
}
