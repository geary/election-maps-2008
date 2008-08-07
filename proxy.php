<?php

$url = 'http://pollinglocation.apis.google.com/?q=' . urlencode($_GET['q']);

$session = curl_init($url);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($session);

echo $response;

curl_close($session);

?>
