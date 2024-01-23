# route-checklist

## Angular + Node.js

Utilização de Angular 17 e Node+Express para fazer um projeto de criação de rotas ao deixar o usuário escolher determinadas localizações que podem ou não fazer parte da rota desejada, podendo modificar a rota escolhida ao arrastar marcadores ou desativar o checkbox. Vários navegadores (clientes) podem estar conectados ao mesmo tempo e ver as modificações em tempo real.

Tecnologias estudadas e utilizadas: Leaflet, OSRM, MySQL, WebSockets.

### COMO RODAR

Em cada pasta (frontend e backend) rodar `npm install` para instalar as dependencias. Depois, separadamente em cada pasta, rodar:

Frontend: `npm start`

Backend: `node src/index.js`

### TO-DO LIST

#### Front

- [x] Componentizar
- [x] Abolir o botao calcular rota, calcular automaticamente quando modificar qualquer coisa na lista
- [x] adicionar debounceTime ao digitar geocode
- [x] persistencia usando localStorage
- [x] Ao clicar no marcador, no popup ter uma opção de remover o item
- [ ] Tratamento de erro quando marcador é arrastado pro meio do mapa
- [ ] Extra: Design responsivo
- [ ] Extra: Reordenar or itens
- [ ] Extra: Chamada para otimizar: <https://project-osrm.org/docs/v5.5.1/api/#trip-service>

#### Back

- [x] Postman/Bruno
- Node:
  - [x] fazer um Hello World
  - [x] Le um arquivo, incrementa ele e guarda novamente
- Express:
  - [x] Criar um endpoint GET que retorna JOSN e fazer uma chamada via Postman
  - [x] A cada chamada do GET, retornar um numero incrementado
  - [x] Criar um endpoint POST que seta uma variavel e ao fazer uma chamada GET retorna esta variavel.
  - [x] Criar uma especie de banco de dados que da pra dar POST para inserir, GET para resgatar, PATCH para atualizar e DELETE para deletar (ver padrão REST)
  - [x] Interligar o Front com a persistencia do back
  - [x] Traduzir a persistencia do back em banco MySQL
  - [x] Atualização em tempo real multicliente via WebSocket
