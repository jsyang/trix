<?php
	$ip=isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
	
	if(isset($_GET['come'])){
		$f=fopen("visit","a+");	
		fwrite($f,"User @ " . $ip . " entered.\n");
		fclose($f);
	}

	if(isset($_GET['go'])){
		$f=fopen("visit","a+");	
		fwrite($f,"User @ " . $ip . " left.\n");
		fclose($f);
	}
?>