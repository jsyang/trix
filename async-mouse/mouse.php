<?php
	$ip=isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
	if (isset($_GET['x'])){
		$f=fopen("users/".$ip,"w");	
		fwrite($f,$_GET['x'].",".$_GET['y']);
		fclose($f);
	}
?>
