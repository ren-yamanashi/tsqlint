-- ❌ 悪い例: SELECT * を使用（no-select-star ルール違反）
SELECT * FROM users;

-- ❌ 悪い例: PascalCase テーブル名（table-naming-convention ルール違反）
CREATE TABLE UserProfiles (
    id INT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(100)
);

-- ❌ 悪い例: camelCase テーブル名
CREATE TABLE orderItems (
    id INT PRIMARY KEY,
    orderId INT,
    productId INT,
    quantity INT
);

-- ❌ 悪い例: 複数のルール違反
SELECT * FROM UserProfiles 
JOIN orderItems ON UserProfiles.id = orderItems.orderId;
