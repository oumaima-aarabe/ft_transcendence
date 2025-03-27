#!/bin/sh

CERT_DIR="/etc/nginx/certs"
CERT_KEY="$CERT_DIR/nginx.key"
CERT_CRT="$CERT_DIR/nginx.crt"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_KEY" ] || [ ! -f "$CERT_CRT" ]; then
    echo "Generating the SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $CERT_KEY -out $CERT_CRT \
        -subj "/CN=localhost"
    echo "Certificates generated at $CERT_DIR"
else
    echo "SSL certificates already exist."
fi

exec nginx -g "daemon off;"