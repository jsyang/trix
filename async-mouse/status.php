<?php

// from http://www.laughing-buddha.net/jon/php/dirlist/
function dirList($directory){
    $results = array();
    $handler = opendir($directory);
    while($file = readdir($handler)){
        if ($file != '.' && $file != '..') $results[] = $file;
    }
    closedir($handler);
    return $results;
}

/* ------------------------- stuff ------------------------- */

	$ip=isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
	
	if (isset($_GET['enter'])){
		$f=fopen("visit","a+");	
		fwrite($f,"User " . $ip . " entered.\n");
		fclose($f);

		$f=fopen("users/".$ip,"a+");
		fclose($f);
		echo implode(",",dirList("users"));

/*
	}else{
		$f=fopen("visit","a+");	
		fwrite($f,"User " . $ip . " left.\n");
		fclose($f);		
		unlink("users/".$ip);
*/
	}
?>
