FROM nginx:alpine

RUN apk add --no-cache openssl

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf
COPY ./tools/generate_certs.sh /usr/local/bin/generate_certs.sh

RUN chmod +x /usr/local/bin/generate_certs.sh

# Run the script when container starts
CMD [ "/bin/sh", "-c", "/usr/local/bin/generate_certs.sh"]