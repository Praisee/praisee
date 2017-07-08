server {
        listen 80 default_server;
        listen [::]:80 default_server;

        return 301 http://www.praisee.com$request_uri;
}

server {
        listen 80;
        listen [::]:80;

	server_name www.praisee.com;

        location / {
                proxy_set_header   X-Real-IP        $remote_addr;
                proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
                proxy_set_header   Host             $host;

                proxy_pass http://127.0.0.1:8080/;
        }
}
