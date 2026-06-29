import paramiko

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
DB_ROOT = "pet_atlas_db_root_sec_pass_2026"

CREATE_SQL = (
    "CREATE TABLE IF NOT EXISTS user_sessions ("
    "id VARCHAR(36) NOT NULL, "
    "user_id BIGINT NOT NULL, "
    "device_info VARCHAR(255) NULL, "
    "ip_address VARCHAR(45) NULL, "
    "last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, "
    "is_active TINYINT(1) NOT NULL DEFAULT 1, "
    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
    "PRIMARY KEY (id), "
    "INDEX idx_user_active (user_id, is_active), "
    "CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
    ");"
)

def run_sudo(client, cmd, timeout=30):
    full = f"sudo -S bash -c {repr(cmd)}"
    stdin, stdout, stderr = client.exec_command(full, timeout=timeout)
    stdin.write(PASS + "\n")
    stdin.flush()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    err = "\n".join(l for l in err.splitlines()
                    if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[*] Connected")

# 1. Verify DB access with correct password
out, err = run_sudo(client, f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} -e 'SHOW DATABASES;'")
print(f"[*] Databases:\n{out}")
if err:
    print(f"[!] Error: {err}")

# 2. Create the table
mysql_cmd = f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e \"{CREATE_SQL}\""
out, err = run_sudo(client, mysql_cmd)
if err:
    print(f"[!] Create error: {err}")
else:
    print("[+] CREATE TABLE executed")

# 3. Verify
out, err = run_sudo(client, f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e 'SHOW TABLES;'")
print(f"[*] Tables:\n{out}")

if "user_sessions" in out:
    print("[OK] user_sessions table created successfully!")
else:
    print("[!] Table still missing - check error above")

# 4. Restart backend
out, err = run_sudo(client, "docker restart pet-atlas-backend")
print(f"[*] Backend restarted: {out}")

client.close()
print("\n[DONE] - Login: http://91.99.108.165:8080  |  admin_atlas / PA_Admin_9921_!")
