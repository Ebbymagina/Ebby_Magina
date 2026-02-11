<?php
session_start();
include 'config.php';

$response = array();

// Check if user is admin
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    $response['success'] = false;
    $response['message'] = 'Unauthorized access!';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Get all orders
if (isset($_GET['action']) && $_GET['action'] == 'get_all_orders') {
    $result = $conn->query("SELECT o.*, u.username, u.email, u.phone 
                           FROM orders o 
                           JOIN users u ON o.user_id = u.id 
                           ORDER BY o.order_date DESC");
    
    $orders = array();
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $orders;
}

// Update order status
elseif (isset($_POST['action']) && $_POST['action'] == 'update_order_status') {
    $order_id = intval($_POST['order_id']);
    $status = $conn->real_escape_string($_POST['status']);
    
    $conn->query("UPDATE orders SET status='$status' WHERE id=$order_id");
    
    $response['success'] = true;
    $response['message'] = 'Order status updated!';
}

// Add food
elseif (isset($_POST['action']) && $_POST['action'] == 'add_food') {
    $name = $conn->real_escape_string($_POST['name']);
    $category_id = intval($_POST['category_id']);
    $price = floatval($_POST['price']);
    $description = $conn->real_escape_string($_POST['description']);
    $stock = intval($_POST['stock']);
    
    $image = 'images/placeholder.jpg'; // Default image
    
    // Handle image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $upload_dir = '../frontend/images/';
        $file_name = time() . '_' . basename($_FILES['image']['name']);
        $upload_file = $upload_dir . $file_name;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_file)) {
            $image = 'images/' . $file_name;
        }
    }
    
    $conn->query("INSERT INTO foods (name, category_id, price, description, image, stock) 
                 VALUES ('$name', $category_id, $price, '$description', '$image', $stock)");
    
    $response['success'] = true;
    $response['message'] = 'Food added successfully!';
}

// Update food stock
elseif (isset($_POST['action']) && $_POST['action'] == 'update_stock') {
    $food_id = intval($_POST['food_id']);
    $stock = intval($_POST['stock']);
    
    $conn->query("UPDATE foods SET stock=$stock WHERE id=$food_id");
    
    $response['success'] = true;
    $response['message'] = 'Stock updated!';
}

// Get all foods
elseif (isset($_GET['action']) && $_GET['action'] == 'get_all_foods') {
    $result = $conn->query("SELECT f.*, c.name as category_name FROM foods f 
                           JOIN categories c ON f.category_id = c.id");
    
    $foods = array();
    while ($row = $result->fetch_assoc()) {
        $foods[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $foods;
}

// Delete food
elseif (isset($_POST['action']) && $_POST['action'] == 'delete_food') {
    $food_id = intval($_POST['food_id']);
    
    $conn->query("DELETE FROM foods WHERE id=$food_id");
    
    $response['success'] = true;
    $response['message'] = 'Food deleted!';
}

// Get all categories
elseif (isset($_GET['action']) && $_GET['action'] == 'get_categories') {
    $result = $conn->query("SELECT * FROM categories");
    
    $categories = array();
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $categories;
}

header('Content-Type: application/json');
echo json_encode($response);
?>
