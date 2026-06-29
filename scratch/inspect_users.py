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

print("=== DESCRIBE users ===")
cmd = f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e 'DESCRIBE users;'"
print(rs(client, cmd))

print("=== SELECT ALL USERS ===")
cmd = f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e 'SELECT id, username, email FROM users;'"
print(rs(client, cmd))

print("=== SELECT EMPTY/NULL EMAILS ===")
cmd = f"docker exec pet-atlas-db mysql -u root -p{DB_ROOT} pet_atlas -e 'SELECT id, username, email FROM users WHERE email = \"\" OR email IS NULL;'"
print(rs(client, cmd))

client.close()
