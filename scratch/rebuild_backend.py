import paramiko
import time

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

LOCAL_FILE = r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\auth\admin.service.ts"
REMOTE_DEST = "/home/myuser/pet-atlas/backend/src/modules/auth/admin.service.ts"
COMPOSE_DIR = "/home/myuser/pet-atlas"

def rs_sudo(client, cmd, timeout=300):
    """Run with sudo -S (password via stdin)"""
    full_cmd = f"sudo -S {cmd}"
    stdin, stdout, stderr = client.exec_command(full_cmd, timeout=timeout)
    stdin.write(PASS + "\n")
    stdin.flush()
    out = stdout.read().decode()
    err = stderr.read().decode()
    # Filter sudo password prompt lines
    filtered_err = "\n".join(l for l in err.splitlines()
                             if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out, filtered_err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[*] Connected")

# File already uploaded - verify it
stdin, stdout, stderr = client.exec_command(f"grep -c 'catch' {REMOTE_DEST}")
cnt = stdout.read().decode().strip()
print(f"[*] Catch clauses in file: {cnt}")

# Build backend with sudo
print("\n[*] Building backend image with sudo (2-3 mins)...")
out, err = rs_sudo(client, f"bash -c 'cd {COMPOSE_DIR} && docker compose build backend 2>&1 | tail -30'", timeout=300)
print(f"[*] Build output:\n{out}\n{err}")

if "error" in (out + err).lower() and "successfully" not in (out + err).lower():
    print("[!] Build had errors. Trying alternative approach...")
    # Try direct docker build
    out2, err2 = rs_sudo(client, f"bash -c 'cd {COMPOSE_DIR}/backend && docker build -t pet-atlas-backend . 2>&1 | tail -20'", timeout=300)
    print(f"[*] Direct build:\n{out2}\n{err2}")

# Recreate backend container
print("\n[*] Recreating backend container...")
out, err = rs_sudo(client, f"bash -c 'cd {COMPOSE_DIR} && docker compose up -d --no-deps backend 2>&1'", timeout=60)
print(f"[*] Up result:\n{out}\n{err}")

# Wait for startup
print("[*] Waiting 12s for NestJS startup...")
time.sleep(12)

# Check logs
out, err = rs_sudo(client, "docker logs pet-atlas-backend --tail 15 2>&1")
print(f"[*] Backend logs:\n{out}\n{err}")

if "successfully started" in out:
    print("\n[OK] Backend is UP!")
else:
    print("\n[!] Backend may have issues - check logs above")

client.close()
print("\n[DONE] Login: http://91.99.108.165:8080  |  admin_atlas / PA_Admin_9921_!")
