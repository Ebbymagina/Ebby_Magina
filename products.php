<?php
session_start();
include 'config.php';

$response = array();

// Get all categories
if (isset($_GET['action']) && $_GET['action'] == 'get_categories') {
    $result = $conn->query("SELECT * FROM categories");
    $categories = array();
    
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    
    // If no categories in DB, provide default categories using images in frontend/images
    if (empty($categories) && isset($USE_FALLBACK) && $USE_FALLBACK) {
        $categories = array(
            array('id' => 1, 'name' => 'Foods', 'description' => 'Tanzanian foods', 'image' => 'images/pngegg.png'),
            array('id' => 2, 'name' => 'Drinks', 'description' => 'Refreshing drinks', 'image' => 'images/pngegg (8).png')
        );
    }

    $response['success'] = true;
    $response['data'] = $categories;
}

// Get foods by category
elseif (isset($_GET['action']) && $_GET['action'] == 'get_foods') {
    $category_id = intval($_GET['category_id'] ?? 0);
    
    if ($category_id > 0) {
        $result = $conn->query("SELECT * FROM foods WHERE category_id=$category_id");
    } else {
        $result = $conn->query("SELECT * FROM foods");
    }
    
    $foods = array();
    while ($row = $result->fetch_assoc()) {
        $foods[] = $row;
    }
    // If DB has no foods yet, return a default sample list using the images provided in frontend/images
    if (empty($foods) && isset($USE_FALLBACK) && $USE_FALLBACK) {
        $foods = array(
            array('id'=>1,'name'=>'Ugali with Fish Stew','category_id'=>1,'price'=>15000,'description'=>'Traditional cornmeal with fish stew','image'=>'images/pngegg.png','stock'=>30),
            array('id'=>2,'name'=>'Mishkaki (Grilled Skewers)','category_id'=>1,'price'=>12000,'description'=>'Grilled meat skewers','image'=>'images/pngegg (1).png','stock'=>25),
            array('id'=>3,'name'=>'Nyama Choma','category_id'=>1,'price'=>18000,'description'=>'Grilled meat with sides','image'=>'images/pngegg (2).png','stock'=>20),
            array('id'=>4,'name'=>'Pilau','category_id'=>1,'price'=>14000,'description'=>'Spiced rice with meat','image'=>'images/pngegg (3).png','stock'=>28),
            array('id'=>5,'name'=>'Chapati with Beans','category_id'=>1,'price'=>8000,'description'=>'Flatbread with beans','image'=>'images/pngegg (4).png','stock'=>35),
            array('id'=>6,'name'=>'Coca Cola 500ml','category_id'=>2,'price'=>3500,'description'=>'Cold refreshing cola','image'=>'images/pngegg (8).png','stock'=>60),
            array('id'=>7,'name'=>'Fanta Orange 500ml','category_id'=>2,'price'=>3000,'description'=>'Orange soft drink','image'=>'images/pngegg (9).png','stock'=>55),
            array('id'=>8,'name'=>'Fresh Orange Juice','category_id'=>2,'price'=>5000,'description'=>'Freshly squeezed orange juice','image'=>'images/pngegg (11).png','stock'=>25)
        );
    }

    $response['success'] = true;
    $response['data'] = $foods;
}

// Add to cart
elseif (isset($_POST['action']) && $_POST['action'] == 'add_to_cart') {
    if (!isset($_SESSION['user_id'])) {
        $response['success'] = false;
        $response['message'] = 'Please login first!';
    } else {
        $user_id = $_SESSION['user_id'];
        $food_id = intval($_POST['food_id']);
        $quantity = intval($_POST['quantity'] ?? 1);
        
        $check = $conn->query("SELECT id FROM cart WHERE user_id=$user_id AND food_id=$food_id");
        
        if ($check->num_rows > 0) {
            $conn->query("UPDATE cart SET quantity = quantity + $quantity WHERE user_id=$user_id AND food_id=$food_id");
        } else {
            $conn->query("INSERT INTO cart (user_id, food_id, quantity) VALUES ($user_id, $food_id, $quantity)");
        }
        
        $response['success'] = true;
        $response['message'] = 'Item added to cart!';
    }
}

// Get cart items
elseif (isset($_GET['action']) && $_GET['action'] == 'get_cart') {
    if (!isset($_SESSION['user_id'])) {
        $response['success'] = false;
        $response['message'] = 'Please login first!';
    } else {
        $user_id = $_SESSION['user_id'];
        $result = $conn->query("SELECT c.*, f.name, f.price, f.image FROM cart c 
                               JOIN foods f ON c.food_id = f.id 
                               WHERE c.user_id=$user_id");
        
        $cart_items = array();
        $total = 0;
        
        while ($row = $result->fetch_assoc()) {
            $cart_items[] = $row;
            $total += $row['price'] * $row['quantity'];
        }
        
        $response['success'] = true;
        $response['data'] = $cart_items;
        $response['total'] = $total;
    }
}

// Remove from cart
elseif (isset($_POST['action']) && $_POST['action'] == 'remove_from_cart') {
    if (!isset($_SESSION['user_id'])) {
        $response['success'] = false;
        $response['message'] = 'Please login first!';
    } else {
        $cart_id = intval($_POST['cart_id']);
        $conn->query("DELETE FROM cart WHERE id=$cart_id");
        
        $response['success'] = true;
        $response['message'] = 'Item removed from cart!';
    }
}

// Place order
elseif (isset($_POST['action']) && $_POST['action'] == 'place_order') {
    if (!isset($_SESSION['user_id'])) {
        $response['success'] = false;
        $response['message'] = 'Please login first!';
    } else {
        $user_id = $_SESSION['user_id'];
        $delivery_address = $conn->real_escape_string($_POST['delivery_address']);
        
        // Get cart items (include food name and price)
        $cart_result = $conn->query("SELECT c.*, f.price, f.name FROM cart c 
                        JOIN foods f ON c.food_id = f.id 
                        WHERE c.user_id=$user_id");
        
        if ($cart_result->num_rows == 0) {
            $response['success'] = false;
            $response['message'] = 'Cart is empty!';
        } else {
            $total_price = 0;
            $order_items = array();
            
            while ($item = $cart_result->fetch_assoc()) {
                $total_price += $item['price'] * $item['quantity'];
                $order_items[] = $item;
            }
            
            // Create order
            $conn->query("INSERT INTO orders (user_id, total_price, delivery_address) 
                         VALUES ($user_id, $total_price, '$delivery_address')");
            
            $order_id = $conn->insert_id;
            
            // Add order items
            foreach ($order_items as $item) {
                $conn->query("INSERT INTO order_items (order_id, food_id, quantity, price) 
                            VALUES ($order_id, {$item['food_id']}, {$item['quantity']}, {$item['price']})");
            }
            
            // Clear cart
            $conn->query("DELETE FROM cart WHERE user_id=$user_id");
            
            $response['success'] = true;
            $response['message'] = 'Order placed successfully!';
            $response['order_id'] = $order_id;
        }
    }
}

// Get user orders
elseif (isset($_GET['action']) && $_GET['action'] == 'get_orders') {
    if (!isset($_SESSION['user_id'])) {
        $response['success'] = false;
        $response['message'] = 'Please login first!';
    } else {
        $user_id = $_SESSION['user_id'];
        $result = $conn->query("SELECT * FROM orders WHERE user_id=$user_id ORDER BY order_date DESC");
        
        $orders = array();
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        
        $response['success'] = true;
        $response['data'] = $orders;
    }
}

// Get order details
elseif (isset($_GET['action']) && $_GET['action'] == 'get_order_details') {
    $order_id = intval($_GET['order_id']);
    
    $result = $conn->query("SELECT oi.*, f.name, f.image FROM order_items oi 
                           JOIN foods f ON oi.food_id = f.id 
                           WHERE oi.order_id=$order_id");
    
    $order_items = array();
    while ($row = $result->fetch_assoc()) {
        $order_items[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $order_items;
}

header('Content-Type: application/json');
echo json_encode($response);
?>
