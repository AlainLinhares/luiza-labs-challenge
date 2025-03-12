
# Desafio Técnico - LuizaLabs - Vertical Logística

## Descrição

Este é o projeto de solução para o desafio técnico da LuizaLabs, desenvolvido com o objetivo de processar e integrar um sistema legado de pedidos com uma nova API REST.

O sistema recebe um arquivo via API REST, processa-o, e retorna os dados em formato JSON. A aplicação foi construída usando Node.js, NestJS e Typescript, com testes unitários implementados com Jest. Para persistência de dados, foi escolhida a lógica de armazenamento em arquivos. Além disso, a aplicação também pode ser executada em um container Docker.

## Tecnologias Utilizadas

- **Node.js**: Escolhido pela sua popularidade, desempenho e robustez para desenvolver aplicações escaláveis e de alta performance.
- **NestJS**: Framework para construir APIs eficientes e escaláveis usando Node.js, com uma arquitetura modular e voltada para o uso de TypeScript.
- **TypeScript**: Oferece tipagem estática e melhor suporte a IDEs, aumentando a produtividade e a segurança do código.
- **Jest**: Utilizado para a criação de testes unitários e integração. Garantindo que o código esteja funcionando conforme o esperado.
- **Docker**: Facilita a containerização da aplicação, permitindo que ela seja executada em qualquer ambiente de forma consistente.
- **Swagger**: Usado para documentação automática da API REST.

## Funcionalidades

A aplicação oferece os seguintes endpoints:

1. **POST /orders/upload**: Para fazer o upload de um arquivo de pedidos.
2. **GET /orders/list**: Para listar os pedidos com filtros opcionais (ID do pedido, intervalo de datas).

A entrada de dados será feita via upload de arquivo, enquanto a saída será fornecida no formato JSON.

## Como Rodar a Aplicação

### Requisitos

- Node.js (versão 18 ou superior)
- Docker (opcional, para execução em container)

### Rodando Localmente

1. Clone este repositório:

    ```bash
    git clone https://github.com/your-username/luiza-labs-challenge.git
    cd luiza-labs-challenge
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Para rodar a aplicação no ambiente de desenvolvimento:

    ```bash
    npm run start:dev
    ```

A aplicação estará disponível em `http://localhost:3000`.

### Rodando os Testes Unitários

Para rodar os testes unitários, use o comando:

```bash
npm run test
```

### Rodando a Aplicação Usando Docker
-   Construa a imagem Docker:
    
    ```bash
    docker build -t luiza-labs-challenge .
    ```
    
-   Execute a aplicação no Docker:
    ```bash
    docker run -p 3000:3000 luiza-labs-challenge
    ```
A aplicação estará disponível em `http://localhost:3000`.

### Arquitetura do Sistema
A arquitetura do sistema foi baseada em um padrão modular, onde cada funcionalidade principal é encapsulada em módulos separados:

-   **Controller**: Responsável por receber as requisições HTTP e passar as informações para os serviços.
-   **Services**: Contém a lógica de negócios da aplicação, como o processamento de arquivos e a filtragem de pedidos.
-   **Models**: Definem as estruturas de dados utilizadas na aplicação.
-   **DTOs**: São usados para definir as formas de entrada e saída de dados.

A escolha de usar o armazenamento em arquivos foi feita pela simplicidade e escalabilidade inicial, considerando que o projeto envolve apenas um sistema simples de manipulação de pedidos. Essa solução pode ser suficiente em um cenário onde o volume de dados não seja alto.

### Alternativa de Armazenamento com Banco de Dados

Se o projeto necessitasse de um maior volume de dados e consultas mais complexas, a utilização de um banco de dados relacional (como PostgreSQL) ou NoSQL (como MongoDB) seria uma boa alternativa. Isso permitiria consultas mais rápidas e flexíveis, além de uma persistência de dados mais robusta e escalável.

### Alternativa de Armazenamento com Kafka

Caso a necessidade fosse de processar pedidos em tempo real e garantir alta disponibilidade, o uso de um sistema de mensageria como o Kafka poderia ser utilizado. Com o Kafka, os pedidos poderiam ser processados de forma assíncrona e escalável, permitindo maior flexibilidade no processamento de dados em larga escala.

### Exemplo de Uso

##### Fazer Upload de Arquivo

Para enviar o arquivo de pedidos, envie uma requisição `POST` para `http://localhost:3000/orders/upload` com o arquivo anexado no corpo da requisição.

**Exemplo usando `curl`:** curl --request POST \
  --url http://localhost:3000/orders/upload \
  --header 'content-type: multipart/form-data' \
  --form 'file=@caminho/do/arquivo.txt'

A regra de negócio envolvida nessa etapa consiste em ler um arquivo txt (por exemplo o **data_1.txt** ou **data_2.txt** conforme foi enviado no email) e com isso, as informações processadas e normalizadas são convertidas em uma estrutura json e armazenada na pasta data, o nome do arquivo criado ou que será criada é **orders.json**

Também é importante destacar que o json que é retorna pela API foi adaptado para mostrar as informações que foram processadas com sucesso e também as linhas que tiveram algum erro e não puderam ser processadas. Conforme exemplo abaixo:

    {
        "statusCode": 400,
         "message": "Erro ao processar o arquivo."
          "successfulOrders": [
           {
		      "userId": "88",
		      "userName": "Terra Daniel DDS",
		      "orderId": "836",
		      "prodId": 3,
		      "value": 1899.02,
		      "date": "2021-09-09"
		    }
		  ],
	      "errors": [
		    "Linha 18: \"0000000065                                 Jovan Deckow00000006230000000000     1068.1320210530\" - Erro: Formato de linha inválido",
		    "Linha 43: \"0000000085                                Laverna Nolan00000008130000000000     1195.9620210411\" - Erro: Formato de linha inválido"
		  ]
	  }
 
##### Listar Pedidos com Filtros
Para listar os pedidos com filtros, envie uma requisição `GET` para `http://localhost:3000/orders/list` com os parâmetros de filtro.

**Exemplo usando `curl`:** curl --request GET \
  --url 'http://localhost:3000/orders/list?orderId=1632&startDate=2021-01-01&endDate=2021-12-31'


A regra de negócio envolvida nessa etapa consiste em ler as informações do arquivo **orders.json** e aplicar o filtro da pesquisa

## Considerações Finais

Este projeto foi desenvolvido com foco na simplicidade e facilidade de manutenção, utilizando boas práticas de desenvolvimento de software. O código foi projetado de forma modular, seguindo princípios como SOLID e criando testes unitários e de integração para garantir a qualidade do software.

Para qualquer dúvida ou melhoria no projeto, sinta-se à vontade para abrir uma issue ou enviar um pull request!
