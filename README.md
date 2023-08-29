## Запуск

### Подготовка датабазы
 cd node/server

 mkdir data

 sudo mongod --dbpath=data

### Первый терминал

cd node/server

cd .env.example

Вставить токен бота вместо <token> и токен пользователя вместо <id> в .env

npm i

npm run serve

### Второй терминал

cd node/client

npm i

npm run start
