ALTER TABLE `core_ecm`.`ec_orders` 
ADD COLUMN `shipper_id` int NULL, 
ADD COLUMN `meta_data` longtext NULL AFTER `supplier_id`;

ALTER TABLE users 
MODIFY COLUMN user_type ENUM('USER', 'STAFF', 'ADMIN', 'SHIPPER') 
NOT NULL DEFAULT 'USER';

ALTER TABLE `users` 
ADD COLUMN `code` varchar(255) NULL;



