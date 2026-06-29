import paramiko
import sys

if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

HOST = "91.99.108.165"
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

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[*] Connected to SSH")

sql = """
INSERT INTO subscription_plans (id, name, price, currency, interval_months, description) VALUES
(1, 'Community & Vet Chat premium', 38.00, 'AED', 1, 'Access point for Auto-Renewal Vet Chat consulting + Discounts'),
(2, 'Pro Plan', 49.00, 'AED', 1, 'Pro subscription with monthly billing'),
(3, 'Premium Plan', 149.00, 'AED', 12, 'Premium subscription with annual billing')
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), description = VALUES(description);
"""

print("[*] Seeding subscription plans...")
out, err = run_sql(client, sql)
if out.strip():
    print(f"[OUT]: {out}")
if err.strip():
    print(f"[ERR]: {err}")

# Verify
print("\n=== CURRENT PLANS IN DB ===")
out, _ = run_sql(client, "SELECT * FROM subscription_plans;")
print(out)

client.close()
print("[DONE]")
