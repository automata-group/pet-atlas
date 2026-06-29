import os
import paramiko

IP_ADDRESS = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

def main():
    home = os.path.expanduser("~")
    priv_key_path = os.path.join(home, ".ssh", "pet_atlas_server_key")
    
    k = paramiko.Ed25519Key.from_private_key_file(priv_key_path, password=PASS)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to server {IP_ADDRESS}:{PORT} as '{USER}'...")
        client.connect(IP_ADDRESS, port=PORT, username=USER, pkey=k, timeout=10)
        print("[+] Connected successfully!")
        
        # Python script to run on the server
        remote_py_code = """
import subprocess
import os

sql_query = \"\"\"USE pet_atlas;

-- 1. Modify messages table columns to align with Message entity
ALTER TABLE messages CHANGE COLUMN message_type type ENUM('Text', 'Photo', 'Voice', 'Video', 'Location') DEFAULT 'Text';
ALTER TABLE messages ADD COLUMN photo_url VARCHAR(255) NULL AFTER content;
ALTER TABLE messages ADD COLUMN voice_url VARCHAR(255) NULL AFTER photo_url;
ALTER TABLE messages ADD COLUMN video_url VARCHAR(255) NULL AFTER voice_url;
ALTER TABLE messages ADD COLUMN hash VARCHAR(255) NULL AFTER video_url;

-- 2. Create chat_typing_status table
CREATE TABLE IF NOT EXISTS chat_typing_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_typing TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (group_id, user_id)
);

-- 3. Create chat_message_reads table
CREATE TABLE IF NOT EXISTS chat_message_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (message_id, user_id)
);
\"\"\"

temp_file = "/tmp/migrate_chat_tables.sql"
with open(temp_file, "w") as f:
    f.write(sql_query)

# Execute via sudo sh -c to avoid stdin conflicts
cmd = "echo '55431978531lA@A' | sudo -S sh -c \\"docker exec -i pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 < " + temp_file + "\\" "

proc = subprocess.run(
    cmd,
    shell=True, capture_output=True, text=True
)

# Clean up
if os.path.exists(temp_file):
    os.remove(temp_file)

print("STDOUT:", proc.stdout)
print("STDERR:", proc.stderr)
"""
        
        stdin, stdout, stderr = client.exec_command("python3")
        stdin.write(remote_py_code)
        stdin.close()
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        print("\n=== Remote Script Execution Output ===")
        print(out)
        if err:
            print("\n=== Errors ===")
            print(err)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
