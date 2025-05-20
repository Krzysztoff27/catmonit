#!/usr/bin/env bash

###############################
#      root rights check
###############################
#Test to ensure that script is executed with root priviliges
if ((EUID != 0)); then
    printf 'Insufficient priviliges! Please run the script with root rights.\n'
    exit
fi

CERT_NAMES=('dashboard' 'api-machines' 'api-web')

declare -A CERT_MAP=(
  [dashboard]="10.10.51.3"
  [api-machines]="10.10.51.3"
  [api-web]="10.10.51.3"
)

CERT_DIR="./traefik/certs"
CA_PEM="${CERT_DIR}/catmonit-CA.pem"
CA_KEY="${CERT_DIR}/catmonit-CA.key"

gen_cert() {
    NAME=$1
    IP=$2

    cat > "${NAME}.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = ${NAME}.local

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${NAME}.local
IP.1 = ${IP}
EOF

    openssl genrsa -out "${NAME}.key" 2048
    openssl req -new -key "${NAME}.key" -out "${NAME}.csr" -config "${NAME}.cnf"
    openssl x509 -req -in "${NAME}.csr" -CA catmonit-CA.pem -CAkey catmonit-CA.key -CAcreateserial \
        -out "${NAME}.crt" -days 825 -sha256 -extensions v3_req -extfile "${NAME}.cnf"
    
    rm -f "${NAME}.cnf" "${NAME}.csr"
}

#Check if certs directory exists and is empty
# Check if CA exists
if [ ! -f "$CA_PEM" ]; then
    printf "No CA present in ${CERT_DIR}. Creating new CA and all certificates..."

    mkdir -p "$CERT_DIR"

    if ! openssl genrsa -out catmonit-CA.key 4096; then
        printf "Failed to generate CA private key."
        exit 1
    fi

    if ! openssl req -x509 -new -nodes -key catmonit-CA.key -sha256 -days 1825 -out catmonit-CA.pem \
        -subj "/C=US/ST=California/L=San Francisco/O=Catmonit/OU=IT/CN=Catmonit Root CA"; then
        printf "Failed to create CA certificate."
        exit 1
    fi

    '''
    for NAME in "${CERT_NAMES[@]}"; do
        printf "Generating certificate for ${NAME}..."
        if ! gen_cert "$NAME"; then
            printf "Failed to generate certificate for ${NAME}."
            exit 1
        fi
        mv "${NAME}.crt" "$CERT_DIR/"
        mv "${NAME}.key" "$CERT_DIR/"
        rm -f "${NAME}.csr"
    done
    '''

    for NAME in "${!CERT_MAP[@]}"; do
        IP="${CERT_MAP[$NAME]}"
        echo "Generating cert for $NAME ($IP)..."
        if ! gen_cert "$NAME" "$IP"; then
            echo "Failed to generate cert for $NAME"
            exit 1
        fi
        mv "${NAME}.crt" "$CERT_DIR/"
        mv "${NAME}.key" "$CERT_DIR/"
        rm -f "${NAME}.csr"
    done

    cp catmonit-CA.pem "$CERT_DIR/"
    mv catmonit-CA.key "$CERT_DIR/"
    rm -f catmonit-CA.srl

    printf "Certificates created successfully."

else
    printf "CA already exists in ${CERT_DIR}. Checking individual certs..."

    cp "$CA_PEM" .
    cp "$CA_KEY" .

    missing_cert=0

    '''
    for NAME in "${CERT_NAMES[@]}"; do
        if [ ! -f "${CERT_DIR}/${NAME}.crt" ] || [ ! -f "${CERT_DIR}/${NAME}.key" ]; then
            printf "Missing certificate for ${NAME}. Regenerating..."
            if ! gen_cert "$NAME"; then
                printf "Failed to generate certificate for ${NAME}."
                exit 1
            fi
            mv "${NAME}.crt" "$CERT_DIR/"
            mv "${NAME}.key" "$CERT_DIR/"
            rm -f "${NAME}.csr"
            missing_cert=1
        fi
    done
    '''

    for NAME in "${!CERT_MAP[@]}"; do
        IP="${CERT_MAP[$NAME]}"
        echo "Generating cert for $NAME ($IP)..."
        if ! gen_cert "$NAME" "$IP"; then
            echo "Failed to generate cert for $NAME"
            exit 1
        fi
         mv "${NAME}.crt" "$CERT_DIR/"
        mv "${NAME}.key" "$CERT_DIR/"
        rm -f "${NAME}.csr"
        missing_cert=1
    done

     rm -f catmonit-CA.key catmonit-CA.srl

    if [ "$missing_cert" -eq 0 ]; then
        printf "All certificates present. Skipping generation."
    else
        printf "Missing certificates regenerated successfully."
    fi
fi

printf "Starting Docker Compose..."
docker compose up -d