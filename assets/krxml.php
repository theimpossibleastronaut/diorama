<?php
ini_set('display_errors',1);
error_reporting(E_ALL);
$out = array();

if (isset($_REQUEST["f"]) && !empty($_REQUEST["f"]) &&
    isset($_REQUEST["d"]) && !empty($_REQUEST["d"])) {
    $f = @file_get_contents("../" . $_REQUEST["d"] . "/" . $_REQUEST["f"]);
    if (isset($f) && !empty($f)) {
        $x = @simplexml_load_string($f);

        if (isset($x) && !empty($x) && $x != false) {
            $playable = array();


            $fovnx = @$x->xpath('panoview');
            if (is_array($fovnx)) {
                $fovn = $fovnx[0];
                $fov = (string) $fovn["fov"];
            }

            $imagex = @$x->xpath('image');
            if (is_array($imagex)) {

                $image = $imagex[0];
                $imageType = (string) @$image["type"];

                if (isset($image) && $image != false) {
                    $out["fov"] = $fov;
                    $out["imageType"] = strtolower($imageType);

                    if ($out["imageType"] == "cube") {
                        $out["materials"] = array();

                        $out["materials"]["left"] = $_REQUEST["d"] . "/" . (string) $image->left["url"];
                        $out["materials"]["front"] = $_REQUEST["d"] . "/" . (string) $image->front["url"];
                        $out["materials"]["right"] = $_REQUEST["d"] . "/" . (string) $image->right["url"];
                        $out["materials"]["back"] = $_REQUEST["d"] . "/" . (string) $image->back["url"];
                        $out["materials"]["up"] = $_REQUEST["d"] . "/" . (string) $image->up["url"];
                        $out["materials"]["down"] = $_REQUEST["d"] . "/" . (string) $image->down["url"];
                    }
                }
            }

            $hotspot = @$x->xpath('hotspot');
            if (is_array($hotspot)) {
                $out["hotspots"] = array();
                foreach ($hotspot as $obj) {
                    $onclick = (string) $obj->attributes()->onclick;
                    $name = (string) $obj->attributes()->name;
                    $ath = (string) $obj->attributes()->ath;
                    $atv = (string) $obj->attributes()->atv;
                    $filename = "";

                    if(preg_match("#\((.*)\)#", $onclick, $matches)){

                        if(isset($matches[1])){
                            $filename = $matches[1];
                        }

                    }

                    $out["hotspots"][] = array(
                        "id" => $name,
                        "callback" => "loadComplexMedia",
                        "filename" => $filename,
                        "horizontalAngle" => -$ath - 90,
                        "verticalAngle" => $atv * -1
                    );
                }
            }
        }
    }
}

echo json_encode($out);
?>