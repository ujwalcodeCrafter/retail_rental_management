let token = localStorage.getItem('token');

// Helper to extract shop_id from token
function getShopIdFromToken() {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.shop_id;
    } catch (err) {
        console.error('Invalid token format:', err);
        return null;
    }
}

// Load shops for mall admin
async function loadShops() {
    if (!token) return logout();
    try {
        const response = await fetch('/api/shops', {
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to fetch shops');
        const shops = await response.json();
        
        const shopsList = document.getElementById('shopsList');
        shopsList.innerHTML = shops.length > 0 ? shops.map(shop => `
            <div class="shop-card">
                <h4>${shop.shop_name}</h4>
                <p>Location: ${shop.location}</p>
                <p>Size: ${shop.size_sqft} sqft</p>
                <p>Rental Rate: $${shop.rental_rate}</p>
                <p>Products: ${shop.product_count}</p>
                <button onclick="updateShop(${shop.shop_id}, '${shop.shop_name}', '${shop.location}', ${shop.size_sqft}, ${shop.rental_rate})">Update</button>
                <button onclick="deleteShop(${shop.shop_id})">Delete</button>
            </div>
        `).join('') : '<p>No shops available.</p>';
    } catch (err) {
        console.error('Error loading shops:', err);
        alert('Error loading shops');
        logout();
    }
}

// Add a new shop and associated employees
async function addShop() {
    if (!token) return logout();
    const shopName = document.getElementById('shopName').value;
    const location = document.getElementById('location').value;
    const sizeSqft = document.getElementById('sizeSqft').value;
    const rentalRate = document.getElementById('rentalRate').value;
    const ownerEmail = document.getElementById('ownerEmail').value;
    const ownerPassword = document.getElementById('ownerPassword').value;
    const staffEmail = document.getElementById('staffEmail').value;
    const staffPassword = document.getElementById('staffPassword').value;

    try {
        const shopResponse = await fetch('/api/shops', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                shop_name: shopName, 
                location, 
                size_sqft: sizeSqft, 
                rental_rate: rentalRate 
            })
        });
        
        if (!shopResponse.ok) throw new Error('Failed to add shop');
        const shopData = await shopResponse.json();
        const shopId = shopData.shop_id;

        await fetch('/api/employees', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({
                first_name: 'Shop',
                last_name: 'Owner',
                role: 'shopowner',
                shop_id: shopId,
                email: ownerEmail,
                password: ownerPassword
            })
        });

        await fetch('/api/employees', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({
                first_name: 'Shop',
                last_name: 'Staff',
                role: 'staff',
                shop_id: shopId,
                email: staffEmail,
                password: staffPassword
            })
        });

        alert('Shop and credentials added successfully');
        loadShops();
        document.getElementById('shopName').value = '';
        document.getElementById('location').value = '';
        document.getElementById('sizeSqft').value = '';
        document.getElementById('rentalRate').value = '';
        document.getElementById('ownerEmail').value = '';
        document.getElementById('ownerPassword').value = '';
        document.getElementById('staffEmail').value = '';
        document.getElementById('staffPassword').value = '';
    } catch (err) {
        console.error('Error adding shop:', err);
        alert('Failed to add shop or credentials');
    }
}

// Update an existing shop
async function updateShop(shopId, currentName, currentLocation, currentSize, currentRate) {
    const shopName = prompt('Enter new shop name:', currentName);
    const location = prompt('Enter new location:', currentLocation);
    const sizeSqft = prompt('Enter new size (sqft):', currentSize);
    const rentalRate = prompt('Enter new rental rate ($):', currentRate);

    try {
        const response = await fetch(`/api/shops/${shopId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                shop_name: shopName, 
                location, 
                size_sqft: sizeSqft, 
                rental_rate: rentalRate 
            })
        });
        if (!response.ok) throw new Error('Failed to update shop');
        alert('Shop updated successfully');
        loadShops();
    } catch (err) {
        console.error('Error updating shop:', err);
        alert('Failed to update shop');
    }
}

// Delete a shop and associated data
async function deleteShop(shopId) {
    if (!confirm('Are you sure you want to delete this shop? This will also delete associated employees and products.')) return;
    try {
        const response = await fetch(`/api/shops/${shopId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to delete shop');
        alert('Shop deleted successfully');
        loadShops();
    } catch (err) {
        console.error('Error deleting shop:', err);
        alert('Failed to delete shop');
    }
}

// Load shop details for shop owner
async function loadShopDetails() {
    if (!token) return logout();
    const shopId = getShopIdFromToken();
    if (!shopId) return logout();
    try {
        const response = await fetch(`/api/shops/${shopId}`, {
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to fetch shop details');
        const shop = await response.json();
        
        const shopDetails = document.getElementById('shopDetails');
        shopDetails.innerHTML = `
            <div class="shop-card">
                <h4>${shop.shop_name}</h4>
                <p>Location: ${shop.location}</p>
                <p>Size: ${shop.size_sqft} sqft</p>
                <p>Rental Rate: $${shop.rental_rate}</p>
            </div>
        `;
    } catch (err) {
        console.error('Error loading shop details:', err);
        alert('Error loading shop details');
        logout();
    }
}

// Load products for shop owner
async function loadProducts() {
    if (!token) return logout();
    try {
        const response = await fetch('/api/products', {
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = products.length > 0 ? products.map(product => `
            <div class="product-card">
                <h4>${product.product_name}</h4>
                <p>Category: ${product.category || 'N/A'}</p>
                <p>Price: $${product.price}</p>
                <p>Stock Quantity: ${product.stock_quantity}</p>
                <button onclick="deleteProduct(${product.product_id})">Delete</button>
            </div>
        `).join('') : '<p>No products available.</p>';
    } catch (err) {
        console.error('Error loading products:', err);
        alert('Error loading products');
        logout();
    }
}

// Add a new product
async function addProduct() {
    if (!token) return logout();
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const stockQuantity = document.getElementById('stockQuantity').value;

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                product_name: productName, 
                category,
                price, 
                stock_quantity: stockQuantity 
            })
        });
        if (!response.ok) throw new Error('Failed to add product');
        alert('Product added successfully');
        loadProducts();
        document.getElementById('productName').value = '';
        document.getElementById('category').value = '';
        document.getElementById('price').value = '';
        document.getElementById('stockQuantity').value = '';
    } catch (err) {
        console.error('Error adding product:', err);
        alert('Failed to add product');
    }
}

// Delete a product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to delete product');
        alert('Product deleted successfully');
        loadProducts();
    } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
    }
}

// Load footfall records for staff
async function loadFootfall() {
    if (!token) return logout();
    const shopId = getShopIdFromToken();
    if (!shopId) return logout();
    try {
        const response = await fetch(`/api/footfall?shop_id=${shopId}`, {
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to fetch footfall records');
        const footfall = await response.json();
        
        const footfallRecords = document.getElementById('footfallRecords');
        footfallRecords.innerHTML = footfall.length > 0 ? footfall.map(record => `
            <div class="record-card">
                <p>Date: ${record.record_date}</p>
                <p>Visitor Count: ${record.visitor_count}</p>
            </div>
        `).join('') : '<p>No footfall records available.</p>';
    } catch (err) {
        console.error('Error loading footfall records:', err);
        alert('Error loading footfall records');
        logout();
    }
}

// Add a new footfall record
async function addFootfall() {
    if (!token) return logout();
    const recordDate = document.getElementById('recordDate').value;
    const visitorCount = document.getElementById('visitorCount').value;
    const shopId = getShopIdFromToken();
    if (!shopId) return logout();

    try {
        const response = await fetch('/api/footfall', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                shop_id: shopId,
                record_date: recordDate,
                visitor_count: visitorCount
            })
        });
        if (!response.ok) throw new Error('Failed to add footfall record');
        alert('Footfall record added successfully');
        loadFootfall();
        document.getElementById('recordDate').value = '';
        document.getElementById('visitorCount').value = '';
    } catch (err) {
        console.error('Error adding footfall record:', err);
        alert('Failed to add footfall record');
    }
}

// Load sales records for staff
async function loadSales() {
    if (!token) return logout();
    const shopId = getShopIdFromToken();
    if (!shopId) return logout();
    try {
        const response = await fetch(`/api/sales?shop_id=${shopId}`, {
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error('Failed to fetch sales records');
        const sales = await response.json();
        
        const salesRecords = document.getElementById('salesRecords');
        salesRecords.innerHTML = sales.length > 0 ? sales.map(sale => `
            <div class="record-card">
                <p>Product ID: ${sale.product_id}</p>
                <p>Date: ${sale.sale_date}</p>
                <p>Quantity Sold: ${sale.quantity_sold}</p>
                <p>Total Amount: $${sale.total_amount}</p>
            </div>
        `).join('') : '<p>No sales records available.</p>';
    } catch (err) {
        console.error('Error loading sales records:', err);
        alert('Error loading sales records');
        logout();
    }
}

// Add a new sale record
async function addSale() {
    if (!token) return logout();
    const productId = document.getElementById('productId').value;
    const saleDate = document.getElementById('saleDate').value;
    const quantitySold = document.getElementById('quantitySold').value;
    const totalAmount = document.getElementById('totalAmount').value;
    const shopId = getShopIdFromToken();
    if (!shopId) return logout();

    try {
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                product_id: productId,
                shop_id: shopId,
                sale_date: saleDate,
                quantity_sold: quantitySold,
                total_amount: totalAmount
            })
        });
        if (!response.ok) throw new Error('Failed to add sale record');
        alert('Sale record added successfully');
        loadSales();
        document.getElementById('productId').value = '';
        document.getElementById('saleDate').value = '';
        document.getElementById('quantitySold').value = '';
        document.getElementById('totalAmount').value = '';
    } catch (err) {
        console.error('Error adding sale record:', err);
        alert('Failed to add sale record');
    }
}

// Handle login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            if (payload.role === 'malladmin') {
                window.location.href = '/malladmin.html';
            } else if (payload.role === 'shopowner') {
                window.location.href = '/shopowner.html';
            } else if (payload.role === 'staff') {
                window.location.href = '/staff.html';
            } else {
                alert('Unknown role: ' + payload.role);
                localStorage.removeItem('token');
            }
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (err) {
        console.error('Error during login:', err);
        alert('Error connecting to server');
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}