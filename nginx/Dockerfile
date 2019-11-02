FROM nginx:1.17.5-alpine

RUN mkdir -p /etc/letsencrypt/live/dave12311.com

COPY nginx.conf /etc/nginx/nginx.conf

COPY certs/fullchain.pem /etc/letsencrypt/live/dave12311.com/fullchain.pem
COPY certs/privkey.pem /etc/letsencrypt/live/dave12311.com/privkey.pem
COPY certs/options-ssl-nginx.conf /etc/letsencrypt/options-ssl-nginx.conf
COPY certs/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem

EXPOSE 80 443
