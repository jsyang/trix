//var w=new ActiveXObject("WinHttp.WinHttpRequest.5.1");
var ao=[
"WIA.CommonDialog.1",
"WIA.ImageFile.1",
"ADODB.Stream.2.8"
];

var d=new ActiveXObject(ao[0]);
var device=d.ShowSelectDevice(3, false, true);  // 3 is video
var binStream=new ActiveXObject(ao[2]);


var path=WScript.ScriptFullName;
    path=path.substring(0,path.lastIndexOf("\\")+1);

// we have our device! -- Acer CrystalEye Webcam!
var item=device.ExecuteCommand("{AF933CAC-ACAD-11D2-A093-00C04F72DC3C}");
for(var i in item.Formats){
    if(i=="{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}"){
        var img=(new ActiveXObject(ao[1])).Transfer(i);
        binStream.Type=1;
        binStream.Open();
        binStream.Write(img.FileData.BinaryData);
        binStream.SaveToFile(path+"snap.jpg",1);
        binStream.Close();
    }
}
