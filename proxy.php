<?php

$url = 'http://pollinglocation.apis.google.com/?q=' . urlencode($_GET['q']);

$session = curl_init($url);
$response = curl_exec($session);
curl_close($session);

?>
