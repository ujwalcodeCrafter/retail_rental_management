require('dotenv').config(); // Load environment variables

const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Database pool using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Secret key from environment
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[0];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM employees WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id: user.emp_id, role: user.role, shop_id: user.shop_id }, SECRET_KEY);
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all shops (malladmin only)
app.get('/api/shops', authenticateToken, async (req, res) => {
    if (req.user.role !== 'malladmin') return res.sendStatus(403);
    try {
        const result = await pool.query(`
            SELECT s.*, COUNT(p.product_id) as product_count 
            FROM shops s 
            LEFT JOIN products p ON s.shop_id = p.shop_id 
            GROUP BY s.shop_id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching shops:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single shop details (shopowner or staff)
app.get('/api/shops/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'shopowner' && req.user.role !== 'staff') return res.sendStatus(403);
    const shop_id = req.params.id;
    if (req.user.shop_id != shop_id) return res.sendStatus(403);
    try {
        const result = await pool.query('SELECT * FROM shops WHERE shop_id = $1', [shop_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Shop not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching shop:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new shop (malladmin only)
app.post('/api/shops', authenticateToken, async (req, res) => {
    if (req.user.role !== 'malladmin') return res.sendStatus(403);
    const { shop_name, location, size_sqft, rental_rate } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO shops (shop_name, location, size_sqft, rental_rate) VALUES ($1, $2, $3, $4) RETURNING *',
            [shop_name, location, size_sqft, rental_rate]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding shop:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update a shop (malladmin only)
app.put('/api/shops/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'malladmin') return res.sendStatus(403);
    const { shop_name, location, size_sqft, rental_rate } = req.body;
    const shop_id = req.params.id;
    try {
        const result = await pool.query(
            'UPDATE shops SET shop_name = $1, location = $2, size_sqft = $3, rental_rate = $4 WHERE shop_id = $5 RETURNING *',
            [shop_name, location, size_sqft, rental_rate, shop_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Shop not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating shop:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a shop and associated data (malladmin only)
app.delete('/api/shops/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'malladmin') return res.sendStatus(403);
    const shop_id = req.params.id;
    try {
        await pool.query('DELETE FROM employees WHERE shop_id = $1', [shop_id]);
        await pool.query('DELETE FROM products WHERE shop_id = $1', [shop_id]);
        await pool.query('DELETE FROM footfall WHERE shop_id = $1', [shop_id]);
        await pool.query('DELETE FROM sales WHERE shop_id = $1', [shop_id]);
        await pool.query('DELETE FROM shops WHERE shop_id = $1', [shop_id]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting shop:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new employee (malladmin only)
app.post('/api/employees', authenticateToken, async (req, res) => {
    if (req.user.role !== 'malladmin') return res.sendStatus(403);
    const { first_name, last_name, role, shop_id, email, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO employees (first_name, last_name, role, shop_id, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, role, shop_id, email, password]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding employee:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get products for shop owner
app.get('/api/products', authenticateToken, async (req, res) => {
    if (req.user.role !== 'shopowner') return res.sendStatus(403);
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE shop_id = $1',
            [req.user.shop_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new product (shopowner only)
app.post('/api/products', authenticateToken, async (req, res) => {
    if (req.user.role !== 'shopowner') return res.sendStatus(403);
    const { product_name, category, price, stock_quantity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (shop_id, product_name, category, price, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.shop_id, product_name, category, price, stock_quantity]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a product (shopowner only)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'shopowner') return res.sendStatus(403);
    const product_id = req.params.id;
    try {
        const result = await pool.query(
            'DELETE FROM products WHERE product_id = $1 AND shop_id = $2 RETURNING *',
            [product_id, req.user.shop_id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get footfall records (staff only)
app.get('/api/footfall', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff') return res.sendStatus(403);
    const shop_id = req.query.shop_id;
    if (req.user.shop_id != shop_id) return res.sendStatus(403);
    try {
        const result = await pool.query(
            'SELECT * FROM footfall WHERE shop_id = $1 ORDER BY record_date DESC',
            [shop_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching footfall:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new footfall record (staff only)
app.post('/api/footfall', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff') return res.sendStatus(403);
    const { shop_id, record_date, visitor_count } = req.body;
    if (req.user.shop_id != shop_id) return res.sendStatus(403);
    try {
        const result = await pool.query(
            'INSERT INTO footfall (shop_id, record_date, visitor_count) VALUES ($1, $2, $3) RETURNING *',
            [shop_id, record_date, visitor_count]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding footfall:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get sales records (staff only)
app.get('/api/sales', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff') return res.sendStatus(403);
    const shop_id = req.query.shop_id;
    if (req.user.shop_id != shop_id) return res.sendStatus(403);
    try {
        const result = await pool.query(
            'SELECT * FROM sales WHERE shop_id = $1 ORDER BY sale_date DESC',
            [shop_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sales:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new sale record (staff only)
app.post('/api/sales', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff') return res.sendStatus(403);
    const { product_id, shop_id, sale_date, quantity_sold, total_amount } = req.body;
    if (req.user.shop_id != shop_id) return res.sendStatus(403);
    try {
        const productCheck = await pool.query(
            'SELECT * FROM products WHERE product_id = $1 AND shop_id = $2',
            [product_id, shop_id]
        );
        if (productCheck.rows.length === 0) return res.status(400).json({ error: 'Invalid product ID' });
        
        const result = await pool.query(
            'INSERT INTO sales (product_id, shop_id, sale_date, quantity_sold, total_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [product_id, shop_id, sale_date, quantity_sold, total_amount]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding sale:', err);
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
