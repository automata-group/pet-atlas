import paramiko

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
    return out

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

print("=== PLANS IN DB ===")
print(run_sql(client, "SELECT * FROM subscription_plans;"))

client.close()
