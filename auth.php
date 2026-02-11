<?php
session_start();
include 'config.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action == 'register') {
        $username = $conn->real_escape_string($_POST['username']);
        $email = $conn->real_escape_string($_POST['email']);
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $phone = $conn->real_escape_string($_POST['phone']);
        $address = $conn->real_escape_string($_POST['address']);
        
        $check = $conn->query("SELECT id FROM users WHERE email='$email' OR username='$username'");
        
        if ($check->num_rows > 0) {
            $response['success'] = false;
            $response['message'] = 'Email or username already exists!';
        } else {
            $sql = "INSERT INTO users (username, email, password, phone, address, role) 
                    VALUES ('$username', '$email', '$password', '$phone', '$address', 'customer')";
            
            if ($conn->query($sql)) {
                $response['success'] = true;
                $response['message'] = 'Registration successful! Please login.';
            } else {
                $response['success'] = false;
                $response['message'] = 'Error: ' . $conn->error;
            }
        }
    } 
    
    elseif ($action == 'login') {
        $email = $conn->real_escape_string($_POST['email']);
        $password = $_POST['password'];
        
        $result = $conn->query("SELECT * FROM users WHERE email='$email'");
        
        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['email'] = $user['email'];
                
                $response['success'] = true;
                $response['user_id'] = $user['id'];
                $response['username'] = $user['username'];
                $response['role'] = $user['role'];
                $response['message'] = 'Login successful!';
            } else {
                $response['success'] = false;
                $response['message'] = 'Invalid password!';
            }
        } else {
            $response['success'] = false;
            $response['message'] = 'Email not found!';
        }
    }
    
    elseif ($action == 'logout') {
        session_destroy();
        $response['success'] = true;
        $response['message'] = 'Logged out successfully!';
    }
}

header('Content-Type: application/json');
echo json_encode($response);
?>
