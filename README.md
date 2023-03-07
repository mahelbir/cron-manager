## Installation

1. Rename 'example.env' to '.env'
2. Edit .env file
3. Run commands
```sh
npm i
npm i -g pm2
pm2 start npm --name "web" -- run web
pm2 start npm --name "cron" -- run cron
```
![Index Page](images/index.png)
![Watch Page](images/watch.png)