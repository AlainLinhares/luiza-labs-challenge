# Usar uma imagem base oficial do Node.js
FROM node:18-alpine

# Definir o diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar os arquivos do projeto para dentro do container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar todo o código-fonte para o container
COPY . .

# Compilar o projeto NestJS
RUN npm run build

# Expôr a porta 3000 para a aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]
