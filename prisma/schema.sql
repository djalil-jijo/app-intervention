-- ============================================================
-- SQL Schema Definition for IT Operations & ERP System
-- Database Target: PostgreSQL 12+
-- Description: Complete schema for IT Interventions, Assets, Stock & Team
-- ============================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE unit_type AS ENUM ('FILIALE', 'CIC', 'UPC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'URGENT', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Table: Technicians & IT Personnel (طاقم الإعلام الآلي)
CREATE TABLE IF NOT EXISTS technicians (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    speciality VARCHAR(500) DEFAULT 'Généraliste',
    role VARCHAR(100) DEFAULT 'Technicien en Informatique',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: IT Assets Inventory (جرد العتاد المعلوماتي)
CREATE TABLE IF NOT EXISTS it_assets (
    id VARCHAR(36) PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'DESKTOP',
    brand VARCHAR(50),
    model VARCHAR(50),
    serial_number VARCHAR(100),
    unit_type unit_type DEFAULT 'FILIALE',
    unit_name VARCHAR(150) NOT NULL,
    service VARCHAR(100),
    assigned_to VARCHAR(100),
    ip_address VARCHAR(45),
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    purchase_date DATE,
    warranty_end DATE,
    notes TEXT,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: Spare Parts Stock (مخزون قطع الغيار والمستهلكات)
CREATE TABLE IF NOT EXISTS spare_parts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    part_number VARCHAR(100),
    category VARCHAR(100) DEFAULT 'Consommables',
    quantity INT DEFAULT 0,
    min_threshold INT DEFAULT 5,
    unit_price DOUBLE PRECISION DEFAULT 0.0,
    location VARCHAR(100),
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: Stock Movements (حركة المخزون)
CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    spare_part_id VARCHAR(36) NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
    movement_type VARCHAR(10) NOT NULL, -- 'IN' or 'OUT'
    quantity INT NOT NULL,
    reason VARCHAR(200),
    ticket_id VARCHAR(36) REFERENCES intervention_tickets(id) ON DELETE SET NULL,
    performed_by VARCHAR(100),
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: Knowledge Base Articles (قاعدة المعارف والحلول التقنية)
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    tags VARCHAR(200),
    views INT DEFAULT 0,
    author VARCHAR(100) DEFAULT 'Équipe IT',
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table: Intervention Tickets (تذاكر وطلبات التدخل)
CREATE TABLE IF NOT EXISTS intervention_tickets (
    id VARCHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    function_title VARCHAR(100),
    service VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_name VARCHAR(100),
    unit_type unit_type DEFAULT 'FILIALE',
    unit_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'Matériel informatique',
    equipment VARCHAR(150) NOT NULL,
    ip_address VARCHAR(45),
    serial_number VARCHAR(100),
    priority ticket_priority DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    intervention_type VARCHAR(50) DEFAULT 'CURATIVE',
    status ticket_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    asset_id VARCHAR(36) REFERENCES it_assets(id) ON DELETE SET NULL,
    technician_id VARCHAR(36) REFERENCES technicians(id) ON DELETE SET NULL
);

-- 8. Table: Intervention Reports (محاضر التدخل الصادرة)
CREATE TABLE IF NOT EXISTS intervention_reports (
    id VARCHAR(36) PRIMARY KEY,
    report_number VARCHAR(50) UNIQUE NOT NULL,
    ticket_id VARCHAR(36) UNIQUE NOT NULL REFERENCES intervention_tickets(id) ON DELETE CASCADE,
    technician_name VARCHAR(100) NOT NULL,
    diagnosis TEXT NOT NULL,
    actions_taken TEXT NOT NULL,
    parts_replaced TEXT,
    duration_minutes INT DEFAULT 60,
    final_status VARCHAR(100) DEFAULT 'Résolu & Opérationnel',
    completed_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 9. Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON intervention_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON intervention_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_unit_type ON intervention_tickets(unit_type);
CREATE INDEX IF NOT EXISTS idx_tickets_unit_name ON intervention_tickets(unit_name);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON intervention_tickets(status);
CREATE INDEX IF NOT EXISTS idx_assets_tag ON it_assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_status ON it_assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_unit_name ON it_assets(unit_name);

-- Indexes for Foreign Keys
CREATE INDEX IF NOT EXISTS idx_stock_movements_spare_part_id ON stock_movements(spare_part_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ticket_id ON stock_movements(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_asset_id ON intervention_tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_tickets_technician_id ON intervention_tickets(technician_id);

-- 10. Check Constraints (سلامة البيانات)
DO $$ BEGIN
    ALTER TABLE spare_parts ADD CONSTRAINT chk_spare_parts_quantity CHECK (quantity >= 0);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE spare_parts ADD CONSTRAINT chk_spare_parts_unit_price CHECK (unit_price >= 0.0);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_quantity CHECK (quantity > 0);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 11. Triggers for Auto Updating `updated_at` Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_it_assets_modtime ON it_assets;
CREATE TRIGGER update_it_assets_modtime BEFORE UPDATE ON it_assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_spare_parts_modtime ON spare_parts;
CREATE TRIGGER update_spare_parts_modtime BEFORE UPDATE ON spare_parts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_articles_modtime ON knowledge_articles;
CREATE TRIGGER update_knowledge_articles_modtime BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_intervention_tickets_modtime ON intervention_tickets;
CREATE TRIGGER update_intervention_tickets_modtime BEFORE UPDATE ON intervention_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 12. Automated Stock Update Trigger
CREATE OR REPLACE FUNCTION process_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'IN' THEN
        UPDATE spare_parts
        SET quantity = quantity + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.spare_part_id;
    ELSIF NEW.movement_type = 'OUT' THEN
        IF (SELECT quantity FROM spare_parts WHERE id = NEW.spare_part_id) < NEW.quantity THEN
            RAISE EXCEPTION 'الكمية المتوفرة في المخزون غير كافية لإجراء هذه العملية!';
        END IF;
        
        UPDATE spare_parts
        SET quantity = quantity - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.spare_part_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stock_movement_auto_update ON stock_movements;
CREATE TRIGGER trg_stock_movement_auto_update
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE PROCEDURE process_stock_movement();

