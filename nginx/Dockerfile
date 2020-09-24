FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY wait-for-it.sh wait-for-it.sh

EXPOSE 80
EXPOSE 443

CMD ["/wait-for-it.sh", "http://upgrade:5454/", "--", "nginx", "-g", "daemon off;"]
