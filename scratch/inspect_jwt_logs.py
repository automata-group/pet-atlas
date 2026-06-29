import paramiko

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

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

print("=== DECODED JWT PAYLOAD IN LOGS ===")
cmd = "docker logs pet-atlas-backend 2>&1 | grep -i 'Decoded JWT Payload'"
print(rs(client, cmd))

print("=== ALL RECENT LOGS WITH USER SYNC ===")
cmd = "docker logs pet-atlas-backend 2>&1 | grep -i -C 5 'syncUserProfile'"
print(rs(client, cmd))

print("=== GENERAL BACKEND LOGS ===")
cmd = "docker logs pet-atlas-backend --tail 100 2>&1"
print(rs(client, cmd))

client.close()
