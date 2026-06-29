import paramiko

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
DB_ROOT = "pet_atlas_db_root_sec_pass_2026"

def rs(client, cmd, timeout=20):
    stdin, stdout, stderr = client.exec_command(f"sudo -S bash -c {repr(cmd)}", timeout=timeout)
    stdin.write(PASS + "\n")
    stdin.flush()
    out = stdout.read().decode()
    err = stderr.read().decode()
    filtered_err = "\n".join(l for l in err.splitlines() if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out + filtered_err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

print("=== BACKEND LOGS (last 30 lines) ===")
print(rs(client, "docker logs pet-atlas-backend --tail 30 2>&1"))

print("\n=== CHECK bookings table ===")
check_cmd = f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e \"SHOW TABLES LIKE 'bookings';\""
print(rs(client, check_cmd))

print("\n=== ALL TABLES ===")
all_tables_cmd = f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e \"SHOW TABLES;\""
print(rs(client, all_tables_cmd))

client.close()
