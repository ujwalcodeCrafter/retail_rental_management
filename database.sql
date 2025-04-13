-- 1. Shops Table
CREATE TABLE shops (
    shop_id SERIAL PRIMARY KEY,
    shop_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    size_sqft INT,
    rental_rate DECIMAL(10,2)
);

-- 2. Brands Table
CREATE TABLE brands (
    brand_id SERIAL PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    shop_id INT,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- 3. Employees Table
CREATE TABLE employees (
    emp_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(50),
    shop_id INT,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- 4. Rental Agreements Table
CREATE TABLE rental_agreements (
    agreement_id SERIAL PRIMARY KEY,
    shop_id INT,
    start_date DATE,
    end_date DATE,
    monthly_rent DECIMAL(10,2),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- 5. Customer Footfall Table
CREATE TABLE footfall (
    footfall_id SERIAL PRIMARY KEY,
    shop_id INT,
    record_date DATE,
    visitor_count INT,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- 6. Financial Transactions Table
CREATE TABLE transactions (
    trans_id SERIAL PRIMARY KEY,
    shop_id INT,
    amount DECIMAL(10,2),
    trans_date DATE,
    trans_type VARCHAR(50),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- 7. Products Table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    shop_id INT,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock_quantity INT,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- 8. Sales Table
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    product_id INT,
    shop_id INT,
    sale_date DATE,
    quantity_sold INT,
    total_amount DECIMAL(10,2),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

-- Insert Sample Data

-- 1. Shops (10 tuples, fresh IDs starting at 1)
INSERT INTO shops (shop_name, location, size_sqft, rental_rate) VALUES
    ('TechBit', 'Ground Floor', 700, 1800.00),
    ('ClothPeak', 'First Floor', 500, 1500.00),
    ('SportRush', 'Second Floor', 600, 1600.00),
    ('ReadNest', 'Third Floor', 400, 1200.00),
    ('BrewSip', 'Ground Floor', 300, 1000.00),
    ('PlayHut', 'Second Floor', 550, 1400.00),
    ('ShineGem', 'First Floor', 250, 1100.00),
    ('CozyDen', 'Ground Floor', 800, 1900.00),
    ('GlamVibe', 'First Floor', 350, 1300.00),
    ('GameZap', 'Third Floor', 450, 1350.00);

-- 2. Employees (20 tuples: 2 per shop, 1 shopowner + 1 staff, fresh emp_id starting at 1)
INSERT INTO employees (first_name, last_name, role, shop_id, email, password) VALUES
    ('Alice', 'Adams', 'shopowner', 1, 'techbit@shopowner.com', 'password123'),
    ('Bob', 'Barnes', 'staff', 1, 'techbit@staff.com', 'password123'),
    ('Clara', 'Clark', 'shopowner', 2, 'clothpeak@shopowner.com', 'password123'),
    ('Dan', 'Dixon', 'staff', 2, 'clothpeak@staff.com', 'password123'),
    ('Eve', 'Ellis', 'shopowner', 3, 'sportrush@shopowner.com', 'password123'),
    ('Finn', 'Ford', 'staff', 3, 'sportrush@staff.com', 'password123'),
    ('Grace', 'Gibbs', 'shopowner', 4, 'readnest@shopowner.com', 'password123'),
    ('Hank', 'Hayes', 'staff', 4, 'readnest@staff.com', 'password123'),
    ('Ivy', 'Irwin', 'shopowner', 5, 'brewsip@shopowner.com', 'password123'),
    ('Jack', 'Jones', 'staff', 5, 'brewsip@staff.com', 'password123'),
    ('Kara', 'Kemp', 'shopowner', 6, 'playhut@shopowner.com', 'password123'),
    ('Liam', 'Lane', 'staff', 6, 'playhut@staff.com', 'password123'),
    ('Maya', 'Mason', 'shopowner', 7, 'shinegem@shopowner.com', 'password123'),
    ('Nate', 'Nolan', 'staff', 7, 'shinegem@staff.com', 'password123'),
    ('Olga', 'Owens', 'shopowner', 8, 'cozyden@shopowner.com', 'password123'),
    ('Paul', 'Parks', 'staff', 8, 'cozyden@staff.com', 'password123'),
    ('Rose', 'Reid', 'shopowner', 9, 'glamvibe@shopowner.com', 'password123'),
    ('Sam', 'Shaw', 'staff', 9, 'glamvibe@staff.com', 'password123'),
    ('Tina', 'Tate', 'shopowner', 10, 'gamezap@shopowner.com', 'password123'),
    ('Umar', 'Upton', 'staff', 10, 'gamezap@staff.com', 'password123');

-- 3. Brands (10 tuples, one per shop, fresh brand_id starting at 1)
INSERT INTO brands (brand_name, shop_id) VALUES
    ('Samsung', 1),
    ('Zara', 2),
    ('Nike', 3),
    ('Penguin', 4),
    ('Starbucks', 5),
    ('LEGO', 6),
    ('Swarovski', 7),
    ('Pottery Barn', 8),
    ('MAC', 9),
    ('PlayStation', 10);

-- 4. Rental Agreements (10 tuples, one per shop, fresh agreement_id starting at 1)
INSERT INTO rental_agreements (shop_id, start_date, end_date, monthly_rent) VALUES
    (1, '2025-04-01', '2026-03-31', 1800.00),
    (2, '2025-04-01', '2026-03-31', 1500.00),
    (3, '2025-04-01', '2026-03-31', 1600.00),
    (4, '2025-04-01', '2026-03-31', 1200.00),
    (5, '2025-04-01', '2026-03-31', 1000.00),
    (6, '2025-04-01', '2026-03-31', 1400.00),
    (7, '2025-04-01', '2026-03-31', 1100.00),
    (8, '2025-04-01', '2026-03-31', 1900.00),
    (9, '2025-04-01', '2026-03-31', 1300.00),
    (10, '2025-04-01', '2026-03-31', 1350.00);

-- 5. Footfall (10 tuples, spread across shops and dates, fresh footfall_id starting at 1)
INSERT INTO footfall (shop_id, record_date, visitor_count) VALUES
    (1, '2025-04-10', 200),
    (2, '2025-04-10', 150),
    (3, '2025-04-10', 170),
    (4, '2025-04-10', 120),
    (5, '2025-04-10', 250),
    (6, '2025-04-11', 160),
    (7, '2025-04-11', 100),
    (8, '2025-04-11', 180),
    (9, '2025-04-11', 130),
    (10, '2025-04-11', 190);

-- 6. Transactions (10 tuples, mix of rent payments and sales revenue, fresh trans_id starting at 1)
INSERT INTO transactions (shop_id, amount, trans_date, trans_type) VALUES
    (1, 1800.00, '2025-04-01', 'Rent Payment'),
    (2, 1500.00, '2025-04-01', 'Rent Payment'),
    (3, 1600.00, '2025-04-01', 'Rent Payment'),
    (4, 1200.00, '2025-04-01', 'Rent Payment'),
    (5, 1000.00, '2025-04-01', 'Rent Payment'),
    (6, 400.00, '2025-04-02', 'Sales Revenue'),
    (7, 250.00, '2025-04-02', 'Sales Revenue'),
    (8, 600.00, '2025-04-02', 'Sales Revenue'),
    (9, 350.00, '2025-04-02', 'Sales Revenue'),
    (10, 450.00, '2025-04-02', 'Sales Revenue');

-- 7. Products (10 tuples, one per shop, fresh product_id starting at 1)
INSERT INTO products (shop_id, product_name, category, price, stock_quantity) VALUES
    (1, 'Smart Speaker', 'Electronics', 99.99, 40),
    (2, 'Summer Skirt', 'Clothing', 29.99, 50),
    (3, 'Gym Bag', 'Sportswear', 49.99, 30),
    (4, 'Classic Novel', 'Books', 12.99, 100),
    (5, 'Cappuccino', 'Beverages', 4.49, 200),
    (6, 'Puzzle Set', 'Toys', 19.99, 60),
    (7, 'Diamond Ring', 'Jewelry', 199.99, 20),
    (8, 'Wall Art', 'Home Decor', 59.99, 25),
    (9, 'Foundation', 'Cosmetics', 34.99, 70),
    (10, 'Racing Game', 'Gaming', 59.99, 30);

-- 8. Sales (10 tuples, one per product, fresh sale_id starting at 1)
INSERT INTO sales (product_id, shop_id, sale_date, quantity_sold, total_amount) VALUES
    (1, 1, '2025-04-10', 3, 299.97),
    (2, 2, '2025-04-10', 4, 119.96),
    (3, 3, '2025-04-10', 2, 99.98),
    (4, 4, '2025-04-10', 5, 64.95),
    (5, 5, '2025-04-10', 8, 35.92),
    (6, 6, '2025-04-11', 3, 59.97),
    (7, 7, '2025-04-11', 1, 199.99),
    (8, 8, '2025-04-11', 2, 119.98),
    (9, 9, '2025-04-11', 4, 139.96),
    (10, 10, '2025-04-11', 2, 119.98);