---
name: tabby-connections
description: This skill should be used when the user asks about "tabby ssh", "tabby serial", "tabby telnet", "ssh profile", "ssh connection", "serial port", "tabby connection manager", "jump host", "port forwarding", or mentions remote connections in Tabby terminal.
version: 0.1.3
---

# Tabby Connections

Configure SSH, serial, and telnet connections in Tabby terminal.

## SSH Connections

Tabby includes a full SSH2 client with integrated connection manager.

### SSH Profile Configuration

```yaml
ssh:
  connections:
    - name: "Production Server"
      host: "server.example.com"
      port: 22
      user: "deploy"
      auth: publicKey
      privateKey: "/path/to/key"
      group: "Production"
      color: "#ff5555"

    - name: "Dev Server"
      host: "dev.example.com"
      port: 22
      user: "developer"
      auth: password
      group: "Development"
```

### SSH Authentication Methods

| Method | Config Key | Description |
|--------|-----------|-------------|
| Password | `auth: password` | Username/password login |
| Public Key | `auth: publicKey` | SSH key authentication |
| Agent | `auth: agent` | SSH agent forwarding |
| Keyboard Interactive | `auth: keyboardInteractive` | Challenge-response |

### Public Key Authentication

```yaml
ssh:
  connections:
    - name: "Key Auth Server"
      host: "server.example.com"
      user: "admin"
      auth: publicKey
      privateKey: "~/.ssh/id_ed25519"
      # privateKey can be absolute path or ~ relative
```

### SSH Agent Forwarding

Tabby supports SSH agent forwarding with:
- **Pageant** (Windows PuTTY agent)
- **Windows OpenSSH Agent** (built-in)
- **ssh-agent** (macOS/Linux)

```yaml
ssh:
  connections:
    - name: "Agent Forward"
      host: "bastion.example.com"
      user: "admin"
      auth: agent
      agentForwarding: true
```

### Jump Host (ProxyJump)

Configure automatic jump host routing:

```yaml
ssh:
  connections:
    - name: "Internal Server"
      host: "internal.private"
      port: 22
      user: "admin"
      jumpHost: "Bastion Server"  # Name of another saved connection
```

### Port Forwarding

```yaml
ssh:
  connections:
    - name: "DB Tunnel"
      host: "server.example.com"
      user: "admin"
      forwardedPorts:
        - type: local
          host: "localhost"
          port: 5432
          targetHost: "db.internal"
          targetPort: 5432
          description: "PostgreSQL tunnel"

        - type: remote
          host: "0.0.0.0"
          port: 8080
          targetHost: "localhost"
          targetPort: 3000
          description: "Expose local dev server"

        - type: dynamic
          host: "localhost"
          port: 1080
          description: "SOCKS5 proxy"
```

### X11 Forwarding

```yaml
ssh:
  connections:
    - name: "X11 Server"
      host: "server.example.com"
      user: "admin"
      x11: true
```

### Login Scripts

Execute commands automatically after connecting:

```yaml
ssh:
  connections:
    - name: "Auto Setup"
      host: "server.example.com"
      user: "admin"
      scripts:
        - expect: "\\$"
          send: "cd /app && source .env"
        - expect: "\\$"
          send: "echo 'Ready!'"
```

## Serial Connections

Tabby includes a serial terminal with readline support.

### Serial Profile Configuration

```yaml
serial:
  connections:
    - name: "Arduino"
      port: "COM3"          # Windows
      # port: "/dev/ttyUSB0"  # Linux
      # port: "/dev/tty.usbserial"  # macOS
      baudRate: 9600
      dataBits: 8
      stopBits: 1
      parity: none
      rtscts: false
      xon: false
      xoff: false
      xany: false

    - name: "Router Console"
      port: "COM4"
      baudRate: 115200
      dataBits: 8
      stopBits: 1
      parity: none
      inputMode: readline    # readline or hex
      outputMode: text       # text or hexdump
      newlineMode: cr        # cr, lf, crlf
```

### Serial Options

| Option | Values | Description |
|--------|--------|-------------|
| `baudRate` | 9600, 19200, 38400, 57600, 115200, etc. | Communication speed |
| `dataBits` | 5, 6, 7, 8 | Data bits per frame |
| `stopBits` | 1, 1.5, 2 | Stop bits |
| `parity` | none, even, odd, mark, space | Parity checking |
| `rtscts` | true/false | Hardware flow control |
| `xon`/`xoff` | true/false | Software flow control |
| `inputMode` | readline, hex | Input mode |
| `outputMode` | text, hexdump | Output display mode |
| `newlineMode` | cr, lf, crlf | Newline conversion |

### Auto-Reconnect

Serial connections support automatic reconnection:

```yaml
serial:
  connections:
    - name: "Device Monitor"
      port: "COM3"
      baudRate: 115200
      autoReconnect: true
```

## Telnet Connections

```yaml
telnet:
  connections:
    - name: "Legacy Device"
      host: "device.local"
      port: 23
```

## Connection Groups

Organize connections into groups for easy access:

```yaml
ssh:
  connections:
    - name: "Web Server 1"
      host: "web1.example.com"
      group: "Production/Web"

    - name: "DB Server 1"
      host: "db1.example.com"
      group: "Production/Database"

    - name: "Dev Web"
      host: "dev-web.example.com"
      group: "Development"
```

Groups support nesting with `/` separator.

## Encrypted Vault

Tabby stores sensitive connection data (passwords, private keys) in an encrypted vault.

- Set vault password in Settings > Vault
- Vault encrypts stored credentials
- Password required on startup to unlock connections

## Zmodem File Transfer

SSH sessions support Zmodem file transfer:

1. Install `lrzsz` on remote server
2. Use `sz filename` to send files from server
3. Use `rz` to receive files on server
4. Tabby handles the transfer automatically

## Connection Manager UI

The Settings UI provides a visual connection manager:
- Add/edit/delete connections
- Test connections
- Import from OpenSSH config (`~/.ssh/config`)
- Import from PuTTY (Windows registry)

## Tips

- Use **color** property on connections to visually distinguish environments
- Group production servers separately from development
- Use jump hosts for accessing internal networks
- Enable agent forwarding for Git operations through bastion hosts
- Store SSH keys in the encrypted vault for security
