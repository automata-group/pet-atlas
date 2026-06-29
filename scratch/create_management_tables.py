import os
import paramiko

IP_ADDRESS = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
DB_ROOT = "pet_atlas_db_root_sec_pass_2026"

def run_sql(client, sql):
    cmd = f"docker exec -i pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas"
    full_cmd = f"sudo -S bash -c {repr(cmd)}"
    
    stdin, stdout, stderr = client.exec_command(full_cmd, timeout=30)
    stdin.write(PASS + "\n")
    stdin.flush()
    
    stdin.write(sql + "\n")
    stdin.flush()
    stdin.channel.shutdown_write()
    
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    
    filtered_err = "\n".join(l for l in err.splitlines() if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out, filtered_err

def main():
    home = os.path.expanduser("~")
    priv_key_path = os.path.join(home, ".ssh", "pet_atlas_server_key")
    
    k = paramiko.Ed25519Key.from_private_key_file(priv_key_path, password=PASS)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to server {IP_ADDRESS}:{PORT} as user '{USER}'...")
        client.connect(IP_ADDRESS, port=PORT, username=USER, pkey=k, timeout=10)
        print("[+] Connected successfully!")
        
        queries = [
            # 1. pet_diary_entries
            """
            CREATE TABLE IF NOT EXISTS pet_diary_entries (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pet_id BIGINT NOT NULL,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              date DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """,
            # 2. pet_reminders
            """
            CREATE TABLE IF NOT EXISTS pet_reminders (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pet_id BIGINT NOT NULL,
              title VARCHAR(255) NOT NULL,
              type ENUM('medication', 'vaccine', 'vet_visit', 'other') NOT NULL,
              date_time DATETIME NOT NULL,
              is_completed TINYINT(1) DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """,
            # 3. pet_weight_logs
            """
            CREATE TABLE IF NOT EXISTS pet_weight_logs (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pet_id BIGINT NOT NULL,
              weight DECIMAL(5, 2) NOT NULL,
              date DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """,
            # 4. pet_medication_logs
            """
            CREATE TABLE IF NOT EXISTS pet_medication_logs (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pet_id BIGINT NOT NULL,
              name VARCHAR(255) NOT NULL,
              dosage VARCHAR(255) NOT NULL,
              frequency VARCHAR(255) NOT NULL,
              start_date DATETIME NOT NULL,
              end_date DATETIME DEFAULT NULL,
              notes TEXT DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """,
            # 5. pet_vet_visits
            """
            CREATE TABLE IF NOT EXISTS pet_vet_visits (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pet_id BIGINT NOT NULL,
              clinic_name VARCHAR(255) NOT NULL,
              vet_name VARCHAR(255) DEFAULT NULL,
              date_time DATETIME NOT NULL,
              reason VARCHAR(255) NOT NULL,
              notes TEXT DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """,
            # 6. pet_vaccine_logs
            """
            CREATE TABLE IF NOT EXISTS pet_vaccine_logs (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pet_id BIGINT NOT NULL,
              name VARCHAR(255) NOT NULL,
              administered_date DATETIME NOT NULL,
              next_due_date DATETIME DEFAULT NULL,
              veterinarian VARCHAR(255) DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
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
        out, err = run_sql(client, "SHOW TABLES IN pet_atlas;")
        print(f"[OUT]:\n{out.strip()}")
        
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()
        print("[DONE]")

if __name__ == "__main__":
    main()
