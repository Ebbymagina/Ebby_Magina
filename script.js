// API Backend URL
const API_URL = 'http://localhost/Ebby/backend/';

// Check login status on page load
window.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadHomeProducts(); // Load products on home page
    if (isLoggedIn()) {
        const role = localStorage.getItem('role');
        if (role === 'admin') goToPage('admin');
        else goToPage('products');
    }
});

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('user_id') !== null;
}

// Check login status and update navbar
function checkLoginStatus() {
    if (isLoggedIn()) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('productsBtn').style.display = 'block';
        document.getElementById('cartBtn').style.display = 'block';
        document.getElementById('ordersBtn').style.display = 'block';
        // If admin, hide Home/Browse/Cart/Orders links (admin uses Admin panel only)
        if (localStorage.getItem('role') === 'admin') {
            const hideIds = ['homeBtn','productsBtn','cartBtn','ordersBtn'];
            hideIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }
        document.getElementById('logoutBtn').style.display = 'block';
        
        // Display welcome message with user name
        const username = localStorage.getItem('username');
        const userRole = localStorage.getItem('role');
       
        
        if (localStorage.getItem('role') === 'admin') {
            document.getElementById('adminBtn').style.display = 'block';
        }
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('registerBtn').style.display = 'block';
        document.getElementById('productsBtn').style.display = 'none';
        document.getElementById('cartBtn').style.display = 'none';
        document.getElementById('ordersBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('adminBtn').style.display = 'none';
    }
}

// Show welcome message
function showWelcomeMessage(message) {
    const homeHeader = document.getElementById('homeHeader');
    if (homeHeader && document.getElementById('index').style.display !== 'none') {
        const h2 = homeHeader.querySelector('h2');
        if (h2) {
            h2.textContent = message;
        }
    }
}

// Load home page products (all foods visible to everyone)
function loadHomeProducts() {
    fetch(API_URL + 'products.php?action=get_foods')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('homeProductsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(food => {
                const card = document.createElement('div');
                card.className = 'product-card';
                const quantityHtml = isLoggedIn() ? `
                    <div style="display: flex; gap: 5px;">
                        <input type="number" id="qty_${food.id}" value="1" min="1" style="width: 50px; padding: 8px;">
                        <button onclick="addToCart(${food.id})" style="flex-grow: 1;">Add to Cart</button>
                    </div>
                ` : '';
                
                card.innerHTML = `
                    <img src="${food.image}" alt="${food.name}" onerror="this.src='images/placeholder.jpg'">
                    <div class="product-info">
                        <h3>${food.name}</h3>
                        <p>${food.description || 'No description'}</p>
                        <div class="price">TZS ${parseFloat(food.price).toFixed(0)}</div>
                        ${quantityHtml}
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div class="empty-state"><h3>No foods available</h3></div>';
        }
    })
    .catch(error => console.error('Error:', error));
}

// Go to page
function goToPage(page) {
    // Prevent admins from accessing customer pages directly
    const restrictedForAdmin = ['index','products','cart','orders'];
    if (isLoggedIn() && localStorage.getItem('role') === 'admin' && restrictedForAdmin.includes(page)) {
        goToPage('admin');
        return;
    }

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.style.display = 'none');
    
    // Show selected page
    const selectedPage = document.getElementById(page);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }
    
    // Load page-specific content
    if (page === 'products' && isLoggedIn()) {
        loadCategories();
    } else if (page === 'cart' && isLoggedIn()) {
        loadCart();
    } else if (page === 'orders' && isLoggedIn()) {
        loadOrders();
    } else if (page === 'admin' && isLoggedIn() && localStorage.getItem('role') === 'admin') {
        loadAdminOrders();
    }
}

// =================== AUTH FUNCTIONS ===================

// Register user
function registerUser(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'register');
    formData.append('username', document.getElementById('reg_username').value);
    formData.append('email', document.getElementById('reg_email').value);
    formData.append('password', document.getElementById('reg_password').value);
    formData.append('phone', document.getElementById('reg_phone').value);
    formData.append('address', document.getElementById('reg_address').value);
    
    fetch(API_URL + 'auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const messageDiv = document.getElementById('registerMessage');
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            setTimeout(() => goToPage('login'), 2000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    })
    .catch(error => console.error('Error:', error));
}

// Login user
function loginUser(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('email', document.getElementById('login_email').value);
    formData.append('password', document.getElementById('login_password').value);
    
    fetch(API_URL + 'auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const messageDiv = document.getElementById('loginMessage');
        if (data.success) {
            // Store user info in localStorage
            localStorage.setItem('user_id', data.user_id || '1');
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);
            
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
                checkLoginStatus();
                setTimeout(() => {
                    const role = localStorage.getItem('role');
                    if (role === 'admin') goToPage('admin');
                    else goToPage('products');
                }, 1500);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    })
    .catch(error => console.error('Error:', error));
}

// Logout user
function logout() {
    localStorage.clear();
    checkLoginStatus();
    goToPage('index');
}

// =================== PRODUCTS FUNCTIONS ===================

// Load categories
function loadCategories() {
    fetch(API_URL + 'products.php?action=get_categories')
    .then(response => response.json())
    .then(data => {
        const categoryButtons = document.getElementById('categoryButtons');
        categoryButtons.innerHTML = '<button class="category-btn active" onclick="loadFoods(0)">All Foods</button>';
        
        if (data.success && data.data) {
            data.data.forEach(category => {
                const btn = document.createElement('button');
                btn.className = 'category-btn';
                btn.textContent = category.name;
                btn.onclick = () => loadFoods(category.id);
                categoryButtons.appendChild(btn);
            });
        }
        
        // Load all foods by default
        loadFoods(0);
    })
    .catch(error => console.error('Error:', error));
}

// Load foods
function loadFoods(categoryId) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Find the "All Foods" button and make it active
        document.querySelectorAll('.category-btn')[0].classList.add('active');
    }
    
    const url = categoryId > 0 ? 
        API_URL + 'products.php?action=get_foods&category_id=' + categoryId :
        API_URL + 'products.php?action=get_foods';
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(food => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${food.image}" alt="${food.name}" onerror="this.src='images/placeholder.jpg'">
                    <div class="product-info">
                        <h3>${food.name}</h3>
                        <p>${food.description || 'No description'}</p>
                        <div class="price">TZS ${parseFloat(food.price).toFixed(0)}</div>
                        <div style="display: flex; gap: 5px;">
                            <input type="number" id="qty_${food.id}" value="1" min="1" style="width: 50px; padding: 8px;">
                            <button onclick="addToCart(${food.id})" style="flex-grow: 1;">Add to Cart</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div class="empty-state"><h3>No foods available</h3></div>';
        }
    })
    .catch(error => console.error('Error:', error));
}

// Add to cart
function addToCart(foodId) {
    if (!isLoggedIn()) {
        alert('Please login first!');
        goToPage('login');
        return;
    }
    
    const quantity = parseInt(document.getElementById('qty_' + foodId).value);
    
    const formData = new FormData();
    formData.append('action', 'add_to_cart');
    formData.append('food_id', foodId);
    formData.append('quantity', quantity);
    
    fetch(API_URL + 'products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// =================== CART FUNCTIONS ===================

// Load cart
function loadCart() {
    fetch(API_URL + 'products.php?action=get_cart')
    .then(response => response.json())
    .then(data => {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p>TZS ${parseFloat(item.price).toFixed(0)}</p>
                    </div>
                    <div class="quantity-control">
                        <span>Qty: ${item.quantity}</span>
                        <span>TZS ${(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="btn-danger">Remove</button>
                `;
                cartItems.appendChild(itemDiv);
            });
            
            const summary = document.getElementById('cartSummary');
            summary.style.display = 'block';
            document.getElementById('subtotal').textContent = 'TZS ' + parseFloat(data.total).toFixed(0);
            document.getElementById('totalAmount').textContent = 'TZS ' + parseFloat(data.total).toFixed(0);
        } else {
            cartItems.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3></div>';
            document.getElementById('cartSummary').style.display = 'none';
        }
    })
    .catch(error => console.error('Error:', error));
}

// Remove from cart
function removeFromCart(cartId) {
    if (confirm('Remove this item from cart?')) {
        const formData = new FormData();
        formData.append('action', 'remove_from_cart');
        formData.append('cart_id', cartId);
        
        fetch(API_URL + 'products.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadCart();
        })
        .catch(error => console.error('Error:', error));
    }
}

// Place order
function placeOrder() {
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    
    if (!deliveryAddress.trim()) {
        alert('Please enter delivery address!');
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'place_order');
    formData.append('delivery_address', deliveryAddress);
    
    fetch(API_URL + 'products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            goToPage('orders');
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// =================== ORDERS FUNCTIONS ===================

// Load orders
function loadOrders() {
    fetch(API_URL + 'products.php?action=get_orders')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('ordersContainer');
        container.innerHTML = '';
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.style.cssText = 'background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
                
                const statusColor = {
                    'pending': '#f39c12',
                    'confirmed': '#3498db',
                    'delivered': '#27ae60',
                    'cancelled': '#e74c3c'
                };
                
                orderDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <h3>Order #${order.id}</h3>
                        <span style="background: ${statusColor[order.status]}; color: white; padding: 5px 10px; border-radius: 4px;">
                            ${order.status.toUpperCase()}
                        </span>
                    </div>
                    <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> TZS ${parseFloat(order.total_price).toFixed(0)}</p>
                    <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
                    <button onclick="viewOrderDetails(${order.id})" class="btn-secondary">View Details</button>
                `;
                container.appendChild(orderDiv);
            });
        } else {
            container.innerHTML = '<div class="empty-state"><h3>No orders found</h3><p>Start ordering now!</p></div>';
        }
    })
    .catch(error => console.error('Error:', error));
}

// View order details
function viewOrderDetails(orderId) {
    fetch(API_URL + 'products.php?action=get_order_details&order_id=' + orderId)
    .then(response => response.json())
    .then(data => {
        let details = `<h3>Order #${orderId} Items</h3><div style="display: grid; gap: 10px; margin-top: 10px;">`;
        
        if (data.success && data.data) {
            data.data.forEach(item => {
                details += `
                    <div style="display: flex; gap: 10px; padding: 10px; border: 1px solid #ecf0f1; border-radius: 4px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/placeholder.jpg'">
                        <div>
                            <strong>${item.name}</strong> <span style="color:#7f8c8d; font-size:12px;">(${item.category_name || 'Unknown'})</span><br>
                            Qty: ${item.quantity} x TZS ${parseFloat(item.price).toFixed(0)} = TZS ${(item.quantity * parseFloat(item.price)).toFixed(0)}
                        </div>
                    </div>
                `;
            });
        }
        
        details += `</div>`;
        alert(details);
    })
    .catch(error => console.error('Error:', error));
}

// =================== ADMIN FUNCTIONS ===================

// Switch admin tab
function switchAdminTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    
    document.getElementById(tab + 'Tab').style.display = 'block';
    event.target.classList.add('active');
    
    if (tab === 'orders') {
        loadAdminOrders();
    } else if (tab === 'foods') {
        loadAdminFoods();
    } else if (tab === 'add-food') {
        loadAdminCategories();
    }
}

// Load admin orders
function loadAdminOrders() {
    fetch(API_URL + 'admin.php?action=get_all_orders')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';
        
        if (data.success && data.data) {
            data.data.forEach(order => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.username}</td>
                    <td>${order.email}</td>
                    <td>TZS ${parseFloat(order.total_price).toFixed(0)}</td>
                    <td>
                        <select onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>${new Date(order.order_date).toLocaleDateString()}</td>
                    <td><button onclick="viewAdminOrderDetails(${order.id})" class="btn-secondary">View</button></td>
                `;
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

// Update order status
function updateOrderStatus(orderId, status) {
    const formData = new FormData();
    formData.append('action', 'update_order_status');
    formData.append('order_id', orderId);
    formData.append('status', status);
    
    fetch(API_URL + 'admin.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
}

// View admin order details
function viewAdminOrderDetails(orderId) {
    fetch(API_URL + 'products.php?action=get_order_details&order_id=' + orderId)
    .then(response => response.json())
    .then(data => {
        let html = `<h3>Order #${orderId} Items</h3><div style="display: grid; gap: 10px; margin-top: 10px;">`;

        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(item => {
                html += `
                    <div style="display: flex; gap: 10px; padding: 10px; border: 1px solid #ecf0f1; border-radius: 4px; align-items:center;">
                        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/placeholder.jpg'">
                        <div style="flex:1">
                            <div style="font-weight:600;">${item.name}</div>
                            <div style="color:#7f8c8d; font-size:12px;">${item.category_name || ''}</div>
                            <div style="margin-top:6px;">Qty: ${item.quantity} &times; TZS ${parseFloat(item.price).toFixed(0)}</div>
                        </div>
                        <div style="font-weight:700;">TZS ${(item.quantity * parseFloat(item.price)).toFixed(0)}</div>
                    </div>
                `;
            });
        } else {
            html += '<div>No items found for this order.</div>';
        }

        html += `</div>`;

        const modal = document.getElementById('adminOrderModal');
        const content = document.getElementById('adminOrderModalContent');
        if (content && modal) {
            content.innerHTML = html;
            modal.style.display = 'flex';
        } else {
            alert('Order details:\n' + JSON.stringify(data));
        }
    })
    .catch(error => console.error('Error:', error));
}

function closeAdminOrderModal() {
    const modal = document.getElementById('adminOrderModal');
    if (modal) modal.style.display = 'none';
}

// Load admin foods
function loadAdminFoods() {
    fetch(API_URL + 'admin.php?action=get_all_foods')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('foodsTableBody');
        tbody.innerHTML = '';
        
        if (data.success && data.data) {
            data.data.forEach(food => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${food.name}</td>
                    <td>${food.category_name}</td>
                    <td>TZS ${parseFloat(food.price).toFixed(0)}</td>
                    <td>
                        <input type="number" id="stock_${food.id}" value="${food.stock}" style="width: 60px; padding: 5px;">
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="updateFoodStock(${food.id})" class="btn-success">Update</button>
                            <button onclick="deleteFood(${food.id})" class="btn-danger">Delete</button>
                        </div>
                    </td>
                `;
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

// Update food stock
function updateFoodStock(foodId) {
    const stock = parseInt(document.getElementById('stock_' + foodId).value);
    
    const formData = new FormData();
    formData.append('action', 'update_stock');
    formData.append('food_id', foodId);
    formData.append('stock', stock);
    
    fetch(API_URL + 'admin.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Error:', error));
}

// Delete food
function deleteFood(foodId) {
    if (confirm('Are you sure you want to delete this food?')) {
        const formData = new FormData();
        formData.append('action', 'delete_food');
        formData.append('food_id', foodId);
        
        fetch(API_URL + 'admin.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadAdminFoods();
        })
        .catch(error => console.error('Error:', error));
    }
}

// Load admin categories for adding food
function loadAdminCategories() {
    fetch(API_URL + 'admin.php?action=get_categories')
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('foodCategory');
        select.innerHTML = '';
        
        if (data.success && data.data) {
            data.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }
    })
    .catch(error => console.error('Error:', error));
}

// Add food
function addFood(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'add_food');
    formData.append('name', document.getElementById('foodName').value);
    formData.append('category_id', document.getElementById('foodCategory').value);
    formData.append('price', document.getElementById('foodPrice').value);
    formData.append('stock', document.getElementById('foodStock').value);
    formData.append('description', document.getElementById('foodDescription').value);
    
    if (document.getElementById('foodImage').files.length > 0) {
        formData.append('image', document.getElementById('foodImage').files[0]);
    }
    
    fetch(API_URL + 'admin.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const messageDiv = document.getElementById('addFoodMessage');
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            document.querySelector('form').reset();
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding food');
    });
}
