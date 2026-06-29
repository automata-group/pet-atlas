import paramiko
import os
import time

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
COMPOSE_DIR = "/home/myuser/pet-atlas"

FILES_TO_UPLOAD = {
    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\entities\diary-entry.entity.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities/diary-entry.entity.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\entities\pet-reminder.entity.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities/pet-reminder.entity.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\entities\weight-log.entity.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities/weight-log.entity.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\entities\medication-log.entity.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities/medication-log.entity.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\entities\vet-visit.entity.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities/vet-visit.entity.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\entities\vaccine-log.entity.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities/vaccine-log.entity.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\dto\create-pet-management.dto.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/dto/create-pet-management.dto.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\guards\pet-owner.guard.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/guards/pet-owner.guard.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\pet-management.service.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/pet-management.service.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\pet-management.controller.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/pet-management.controller.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\pet-management\pet-management.module.ts": 
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/pet-management.module.ts",

    r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\app.module.ts": 
    "/home/myuser/pet-atlas/backend/src/app.module.ts"
}

def rs_sudo(client, cmd, timeout=300):
    full_cmd = f"sudo -S {cmd}"
    stdin, stdout, stderr = client.exec_command(full_cmd, timeout=timeout)
    stdin.write(PASS + "\n")
    stdin.flush()
    out = stdout.read().decode()
    err = stderr.read().decode()
    filtered_err = "\n".join(l for l in err.splitlines()
                             if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out, filtered_err

print("[*] Connecting to SSH...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[+] Connected")

# Ensure remote directories exist
print("[*] Creating remote directories...")
dirs = [
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/entities",
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/dto",
    "/home/myuser/pet-atlas/backend/src/modules/pet-management/guards"
]
for d in dirs:
    client.exec_command(f"mkdir -p {d}")

# Upload files using SFTP
sftp = client.open_sftp()
for local, remote in FILES_TO_UPLOAD.items():
    print(f"[*] Uploading {os.path.basename(local)} to {remote}...")
    sftp.put(local, remote)
sftp.close()
print("[+] All files uploaded successfully")

# Build backend
print("\n[*] Rebuilding backend Docker image...")
out, err = rs_sudo(client, f"bash -c 'cd {COMPOSE_DIR} && docker compose build backend 2>&1 | tail -30'", timeout=300)
print(f"[*] Build output:\n{out}\n{err}")

# Recreate backend container
print("\n[*] Recreating backend container...")
out, err = rs_sudo(client, f"bash -c 'cd {COMPOSE_DIR} && docker compose up -d --no-deps backend 2>&1'", timeout=60)
print(f"[*] Up result:\n{out}\n{err}")

# Wait for startup
print("[*] Waiting 12s for NestJS startup...")
time.sleep(12)

# Check logs
out, err = rs_sudo(client, "docker logs pet-atlas-backend --tail 50 2>&1")
print(f"[*] Backend logs:\n{out}\n{err}")

client.close()
print("\n[DONE]")
