import paramiko
import sys

# Set standard output encoding to utf-8 if on Windows
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
DB_ROOT = "pet_atlas_db_root_sec_pass_2026"

def run_sql(client, sql):
    # Pipe SQL via stdin into docker exec -i
    cmd = f"docker exec -i pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas"
    full_cmd = f"sudo -S bash -c {repr(cmd)}"
    
    stdin, stdout, stderr = client.exec_command(full_cmd, timeout=30)
    # Write sudo password
    stdin.write(PASS + "\n")
    stdin.flush()
    
    # Write SQL query
    stdin.write(sql + "\n")
    stdin.flush()
    stdin.channel.shutdown_write()
    
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    
    # Filter out sudo prompt
    filtered_err = "\n".join(l for l in err.splitlines() if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out, filtered_err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[*] Connected to SSH")

queries = [
    # 1. system_settings
    """
    CREATE TABLE IF NOT EXISTS system_settings (
      `key` VARCHAR(100) NOT NULL PRIMARY KEY,
      `value` VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # Seed system_settings
    """
    INSERT INTO system_settings (`key`, `value`) VALUES
    ('clinics_enabled', 'true'),
    ('app_name', 'Pet-Atlas'),
    ('app_version', '1.0.0-PROD'),
    ('default_region', 'Middle East (Cairo)'),
    ('enforce_mfa', 'false'),
    ('jwt_secret', 'PA_Admin_9921_!')
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
    """,
    
    # 2. service_sections
    """
    CREATE TABLE IF NOT EXISTS service_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title_en VARCHAR(100) NOT NULL,
      title_ar VARCHAR(100) NOT NULL,
      icon_name VARCHAR(100) NOT NULL,
      base_color VARCHAR(20) DEFAULT '#2196F3',
      listing_type VARCHAR(50) NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # Seed service_sections
    """
    INSERT INTO service_sections (id, title_en, title_ar, icon_name, base_color, listing_type, is_active) VALUES
    (1, 'Clinics', 'عيادات بيطرية', 'local_hospital', '#4CAF50', 'clinic', 1),
    (2, 'Vets', 'أطباء بيطريون', 'medical_services', '#2196F3', 'vet', 1),
    (3, 'Grooming', 'حلاقة وتنظيف', 'pets', '#FF9800', 'grooming', 1),
    (4, 'Training', 'تدريب وسلوكيات', 'sports', '#E91E63', 'training', 1)
    ON DUPLICATE KEY UPDATE title_en = VALUES(title_en);
    """,

    # 3. bookings
    """
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      listing_id BIGINT NOT NULL,
      pet_id BIGINT DEFAULT NULL,
      selected_services JSON NOT NULL,
      total_price DECIMAL(10, 2) DEFAULT '0.00',
      booking_date DATETIME NOT NULL,
      status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
]

for idx, q in enumerate(queries, 1):
    print(f"[*] Running query block {idx}...")
    out, err = run_sql(client, q)
    if out.strip():
        print(f"[OUT]: {out.strip()}")
    if err.strip():
        print(f"[ERR]: {err.strip()}")

# Verify
print("\n[*] Verifying tables in database...")
out, err = run_sql(client, "SHOW TABLES;")
print(f"[OUT]:\n{out}")

client.close()
print("[DONE]")
