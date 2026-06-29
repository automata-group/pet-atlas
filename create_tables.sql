-- =======================================================
-- Pet-Atlas Comprehensive Database Setup Script
-- Designed for performance, scalable chat structures,
-- and subscription integration.
-- =======================================================

-- Drop existing to apply structural index/type changes cleanly
DROP DATABASE IF EXISTS pet_atlas;

-- Create Database
CREATE DATABASE IF NOT EXISTS pet_atlas;
USE pet_atlas;

-- =======================================================
-- 1. AUTHENTICATION & ACCESS CONTROL MODULE
-- =======================================================

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'editor', 'operation_manager', 'vet', 'client'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY, -- Strictly maps to WordPress User ID (wp_users.ID)
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role_id INT NOT NULL DEFAULT 5, -- 5 = client
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    dob DATE NULL,
    sex ENUM('Male', 'Female') NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    country VARCHAR(100) NULL,
    mobile_number VARCHAR(20) NULL,
    availability_status ENUM('Online', 'Offline', 'Busy') DEFAULT 'Offline',
    current_token TEXT, -- Optional: cache session token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Client Master Profile
CREATE TABLE IF NOT EXISTS client_profiles (
    user_id BIGINT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    dob DATE,
    sex ENUM('Male', 'Female', 'Other'),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    mobile_number VARCHAR(20),
    payment_details TEXT, -- Encrypted vault / reference ID
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pets Attached to Clients
CREATE TABLE IF NOT EXISTS pets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    photo_url VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    dob DATE,
    sex ENUM('Male', 'Female'),
    breed VARCHAR(100),
    neutered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    FOREIGN KEY (owner_id) REFERENCES client_profiles(user_id)
);

-- =======================================================
-- 2. SUBSCRIPTION & BILLING MODULE
-- =======================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., 'Premium Month'
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(12) DEFAULT 'AED',
    interval_months INT DEFAULT 1,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id INT NOT NULL,
    order_id VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'canceled', 'past_due', 'cancelled', 'expired', 'failed') DEFAULT 'active',
    auto_renewal BOOLEAN DEFAULT TRUE, -- Auto deduction setup
    trial_end TIMESTAMP NULL DEFAULT NULL, -- Free Trial Periods
    current_period_start TIMESTAMP NULL DEFAULT NULL,
    current_period_end TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user_status (user_id, status)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    deduction_status ENUM('succeeded', 'failed', 'pending') DEFAULT 'succeeded',
    gateway_reference VARCHAR(255), -- Reference to Banking Auto-Deductions system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

-- =======================================================
-- 3. SCALABLE COMMUNITY & CHAT MODULE (WhatsApp Style)
-- =======================================================

CREATE TABLE IF NOT EXISTS chat_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(150) NOT NULL,
    group_type ENUM('announcement', 'community', 'vet_consult') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_in_group ENUM('admin', 'member', 'speaker') DEFAULT 'member', -- Announcement: Speaker only interacts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fast Index Message Core
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_type ENUM('text', 'voice', 'video') NOT NULL,
    content TEXT, 
    metadata JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    
    -- Composite primary key required for Partitioning by Time
    PRIMARY KEY (id, created_at),
    -- Foreign keys cannot be used with Partitioning in MySQL. Enforced by App Logic.
    
    INDEX idx_group_conversational (group_id, created_at),
    INDEX idx_sender_aggregate (sender_id, created_at)
) ENGINE=InnoDB
-- Fast Scale partitioning for High-Write workloads like WhatsApp
PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
    PARTITION p_2025 VALUES LESS THAN (UNIX_TIMESTAMP('2026-01-01 00:00:00')),
    PARTITION p_2026 VALUES LESS THAN (UNIX_TIMESTAMP('2027-01-01 00:00:00')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =======================================================
-- 4. DIRECTORY & LISTS MODULE (Item Nodes)
-- =======================================================

CREATE TABLE IF NOT EXISTS listing_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL -- 'clinics', 'vet_listings', 'insurances', 'shops'
);

CREATE TABLE IF NOT EXISTS listing_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    owner_id BIGINT NOT NULL DEFAULT 5,
    title VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255),
    description TEXT,
    avg_stars DECIMAL(3,2) DEFAULT 0.0,
    price_range VARCHAR(50), 
    address TEXT,
    contact_number VARCHAR(100),
    coordinates POINT NOT NULL, -- Spatial Types for fast search
    listing_type ENUM('Clinic', 'Vet', 'Insurance', 'Shop', 'Grooming', 'MobileClinic', 'PetSitter', 'Boarding', 'Event') NOT NULL DEFAULT 'Clinic',
    website_url VARCHAR(255),
    gallery_urls JSON,
    services JSON,
    item_metadata JSON,
    equipments JSON,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    FOREIGN KEY (category_id) REFERENCES listing_categories(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    SPATIAL INDEX idx_spatial_coordinates (coordinates),
    INDEX idx_category_star_rating (category_id, avg_stars DESC),
    INDEX idx_listing_type (listing_type)
);

-- Specialty overrides for Vet Listings
CREATE TABLE IF NOT EXISTS vet_listing_profiles (
    listing_id BIGINT PRIMARY KEY,
    current_work VARCHAR(255),
    places_worked TEXT,
    specialization VARCHAR(150),
    certification TEXT,
    achievements VARCHAR(500),
    FOREIGN KEY (listing_id) REFERENCES listing_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    star_rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listing_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =======================================================
-- 5. AUDIT & LOGGING MODULE (Admin Monitors)
-- =======================================================

CREATE TABLE IF NOT EXISTS vet_timing_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vet_id BIGINT NOT NULL,
    logged_in TIMESTAMP NULL,
    logged_out TIMESTAMP NULL,
    FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =======================================================
-- POPULATE DEFAULT MASTER SEED DATA
-- =======================================================

INSERT IGNORE INTO roles (role_name) VALUES 
('admin'), ('editor'), ('operation_manager'), ('vet'), ('client');

INSERT IGNORE INTO listing_categories (category_name) VALUES 
('Clinics'), ('Vets'), ('Insurance'), ('Mobile Clinics'), ('Groomers'), 
('Pet Sitters'), ('Boarding'), ('Events'), ('Pet Shops');

INSERT IGNORE INTO subscription_plans (name, price, currency, interval_months, description) VALUES 
('Community & Vet Chat premium', 38.00, 'AED', 1, 'Access point for Auto-Renewal Vet Chat consulting + Discounts');
