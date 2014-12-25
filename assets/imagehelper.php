<?php
$prefix = "../";
$tHDeg = 360;
$tVDeg = 180;
$tHPx = 4096;
$tVPx = 2048;
$tFmt = "image/jpeg";

$file = $_REQUEST["f"];
$sHDeg = $_REQUEST["w"];
$sVDeg = $_REQUEST["h"];

if (strpos($file, "..") !== false ||
    !is_numeric($sHDeg) ||
    !is_numeric($sVDeg)) {
    exit;
}

header("Content-Type: " . $tFmt);

$canvas = imagecreatetruecolor($tHPx, $tVPx);
$source = imagecreatefromstring(file_get_contents($prefix . $file));

$rHs = floor(($sHDeg/$tHDeg)*$tHPx);
$rVs = floor(($sVDeg/$tVDeg)*$tVPx);

imageantialias($canvas, true);
imageantialias($source, true);

imagecopyresampled($canvas, $source, floor(($tHPx-$rHs)/2), floor(($tVPx-$rVs)/2), 0, 0, $rHs, $rVs, imagesx($source)-1, imagesy($source)-1);

imagejpeg($canvas);
imagedestroy($canvas);
imagedestroy($source);

?>