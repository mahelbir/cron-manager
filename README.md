# Cron-Manager

NodeJS script to manage cron jobs asynchronously with a web panel

## Installation

1. Rename 'example.env' to '.env'
2. Edit .env file
    1. HOST: server ip or domain
    2. PORT: port for web panel
    3. SOCKET: port for realtime data
    4. SECRET: a unique encryption key for software
    5. PASSWORD: password for web login
3. Run 4 commands bellow

```sh
npm install
npm i -g pm2
pm2 start npm --name "web" -- run web
pm2 start npm --name "cron" -- run cron
```

### Web Panel: ```http://HOST:PORT```
example: http://172.16.254.1:3000

![Index Page](images/index.png)
![Watch Page](images/watch.png)

## License

The MIT License (MIT). Please see [License File](LISENCE) for more information.