-- ✅ 良い例: 明示的なカラム指定
SELECT id, first_name, last_name, email FROM user_profiles;

-- ✅ 良い例: snake_case テーブル名
CREATE TABLE user_profiles (
    id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100)
);

-- ✅ 良い例: 適切な命名規則
CREATE TABLE order_items (
    id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT
);

-- ✅ 良い例: 適切な命名規則
CREATE TABLE user_sessions (
    id INT PRIMARY KEY,
    user_id INT,
    session_token VARCHAR(255)
);

-- ✅ 良い例: 適切なJOINとカラム指定
SELECT 
    up.id,
    up.first_name,
    up.last_name,
    oi.product_id,
    oi.quantity
FROM user_profiles up
JOIN order_items oi ON up.id = oi.order_id;
