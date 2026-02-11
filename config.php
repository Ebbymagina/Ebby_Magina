<?php
// Database connection configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'food_ordering_system';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to UTF-8
$conn->set_charset("utf8");

// Toggle: when true, products.php will return default sample items/images
// if the database tables are empty. Set to false after importing real data.
$USE_FALLBACK = true;
?>
