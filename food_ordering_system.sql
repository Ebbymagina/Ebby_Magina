-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 11, 2026 at 07:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `food_ordering_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `food_id`, `quantity`, `added_at`) VALUES
(3, 2, 14, 1, '2026-02-11 06:57:32');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `image`, `created_at`) VALUES
(1, 'Foods', 'Delicious Tanzanian and local foods', 'images/foods.jpg', '2026-02-10 22:59:34'),
(2, 'Drinks', 'Refreshing drinks and beverages', 'images/drinks.jpg', '2026-02-10 22:59:34');

-- --------------------------------------------------------

--
-- Table structure for table `foods`
--

CREATE TABLE `foods` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `foods`
--

INSERT INTO `foods` (`id`, `name`, `category_id`, `price`, `description`, `image`, `stock`, `created_at`) VALUES
(1, 'Beef Burger', 1, 15000.00, 'Traditional cornmeal served with spicy fish stew and vegetables', 'images/pngegg.png', 30, '2026-02-10 22:59:34'),
(2, 'French Fries', 1, 12000.00, 'Tender grilled meat skewers with seasoning and sauce', 'images/pngegg (1).png', 25, '2026-02-10 22:59:34'),
(3, 'Grilled Chicken Skewers with Fries', 1, 18000.00, 'Grilled meat served with beans and rice', 'images/pngegg (2).png', 20, '2026-02-10 22:59:34'),
(5, 'Pizza', 1, 17000.00, 'Soft flatbread served with cooked beans', 'images/pngegg (4).png', 35, '2026-02-10 22:59:34'),
(7, 'Chicken Sub Sandwich', 1, 9000.00, 'Crispy pastry filled with spiced meat', 'images/pngegg (6).png', 40, '2026-02-10 22:59:34'),
(8, 'Sandwich', 1, 4000.00, 'Sweet fried dough pastries, perfect for breakfast', 'images/pngegg (7).png', 50, '2026-02-10 22:59:34'),
(9, 'Red Bull', 2, 3500.00, 'Cold refreshing cola drink', 'images/pngegg (8).png', 60, '2026-02-10 22:59:34'),
(10, 'Fanta Freshly Squeezed Orange JuiceOrange 500ml', 2, 3000.00, 'Refreshing orange flavored soft drink', 'images/pngegg (9).png', 55, '2026-02-10 22:59:34'),
(11, 'Strawberry Juice', 2, 3500.00, 'Crisp lemon-lime flavored soft drink', 'images/pngegg (10).png', 50, '2026-02-10 22:59:34'),
(12, 'Watermelon Juice', 2, 5000.00, 'Fresh orange juice made daily', 'images/pngegg (11).png', 25, '2026-02-10 22:59:34'),
(13, 'Tamarind Juice', 2, 5500.00, 'Sweet and refreshing mango juice', 'images/pngegg (12).png', 20, '2026-02-10 22:59:34'),
(14, 'Chips', 1, 6000.00, 'Tangy and delicious passion fruit juice', 'pngegg (13).png', 30, '2026-02-10 22:59:34'),
(15, 'Crispy Chicken Tenders', 1, 12000.00, 'Traditional Tanzanian tamarind drink', 'images/pngegg (14).png', 25, '2026-02-10 22:59:34'),
(18, 'Donuts', 1, 5000.00, 'Strong Tanzanian coffee', 'images/pngegg (17).png', NULL, '2026-02-10 22:59:34'),
(19, 'Beef Shawarma Wrap', 1, 10000.00, 'Grilled beef burger with vegetables and sauce', 'images/pngegg (18).png', 32, '2026-02-10 22:59:34'),
(20, 'Shawarma', 1, 18000.00, 'Grilled chicken sandwich with lettuce and tomato', 'images/pngegg (19).png', 28, '2026-02-10 22:59:34');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','delivered','cancelled') DEFAULT 'pending',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `order_date`, `delivery_address`) VALUES
(1, 1, 8000.00, 'cancelled', '2026-02-11 00:06:26', 'Kigamboni'),
(2, 2, 18000.00, 'confirmed', '2026-02-11 00:12:07', 'kigamboni');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `food_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `food_id`, `quantity`, `price`) VALUES
(1, 1, 5, 1, 8000.00),
(2, 2, 3, 1, 18000.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `phone`, `address`, `role`, `created_at`) VALUES
(1, 'Abdala Magina', 'ebbymagina@gmail.com', '$2y$10$W6obNyPvQQ0q5sL6qR/cBONRCBgck7JQArAJUOu982aGn6i3sctC.', '0784613620', 'Keko', 'admin', '2026-02-11 00:05:43'),
(2, 'Jimmy Kikwa', 'jimmykikwa@gmail.com', '$2y$10$7IkSQbGFTetpagKnWBKDEeyZvhHx7TCeshNBkgJzzVF54vN0qyJJa', '0623331620', 'Kigamboni', 'customer', '2026-02-11 00:11:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `food_id` (`food_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `foods`
--
ALTER TABLE `foods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `foods`
--
ALTER TABLE `foods`
  ADD CONSTRAINT `foods_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
