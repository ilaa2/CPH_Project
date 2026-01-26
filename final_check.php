<?php
$url = 'http://127.0.0.1:8000/login';
$headers = get_headers($url);
if ($headers && strpos($headers[0], '200') !== false) {
    echo "STATUS: OK";
} else {
    echo "STATUS: ERROR - " . ($headers[0] ?? 'No response');
}
