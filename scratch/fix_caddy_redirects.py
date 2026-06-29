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
        
        # We need to configure Caddy to allow redirection or return clean CORS headers
        # But actually, the issue is that Caddy redirects http://91.99.108.165/api/auth/login to https://91.99.108.165/api/auth/login
        # Why is it redirecting? Let's check the Caddyfile or force allow HTTP in Caddy without redirects
        # Or even better: edit the Caddyfile to not automatically redirect HTTP to HTTPS for IP address!
        
        caddyfile_content = """# Caddyfile configuration for Pet-Atlas Services
{
    # Global options
    email info@pet-atlas.com
    auto_https off
}

# Admin Dashboard & Fallback IP on Port 80
http://91.99.108.165 {
    handle_path /api/* {
        reverse_proxy backend:3000
    }
    handle /socket.io/* {
        reverse_proxy backend:3000
    }
    handle {
        reverse_proxy dashboard:8080
    }
}

# Admin Dashboard Subdomain
http://admin.pet-atlas.com, https://admin.pet-atlas.com {
    handle_path /api/* {
        reverse_proxy backend:3000
    }
    handle {
        reverse_proxy dashboard:8080
    }
}

# Clinic/Merchant Dashboard
http://clinic.pet-atlas.com, https://clinic.pet-atlas.com {
    handle_path /api/* {
        reverse_proxy backend:3000
    }
    handle {
        reverse_proxy clinic-dashboard:8080
    }
}

# Consultant Dashboard
http://consultant.pet-atlas.com, https://consultant.pet-atlas.com {
    handle_path /api/* {
        reverse_proxy backend:3000
    }
    handle {
        reverse_proxy consultant-dashboard:8080
    }
}

# NestJS Backend API & WebSockets
http://api.pet-atlas.com, https://api.pet-atlas.com {
    reverse_proxy backend:3000
}
"""
        
        # SFTP client to write Caddyfile on the server
        sftp = client.open_sftp()
        with sftp.file('/home/myuser/pet-atlas/Caddyfile', 'w') as f:
            f.write(caddyfile_content)
        sftp.close()
        print("[+] Wrote Caddyfile successfully!")
        
        # Reload Caddy
        cmd = f"echo '{PASS}' | sudo -S docker compose -f /home/myuser/pet-atlas/docker-compose.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile"
        stdin, stdout, stderr = client.exec_command(cmd)
        print("Reload STDOUT:", stdout.read().decode('utf-8'))
        print("Reload STDERR:", stderr.read().decode('utf-8'))
        
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
