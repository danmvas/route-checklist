# route-checklist

Angular + Node.js route checklist

testing under Imediatum

## TO-DO LIST

### Front

- [x] Componentizar
- [x] Abolir o botao calcular rota, calcular automaticamente quando modificar qualquer coisa na lista
- [x] adicionar debounceTime ao digitar geocode
- [x] persistencia usando localStorage
- [x] Ao clicar no marcador, no popup ter uma opção de remover o item
- [ ] Extra: Design responsivo
- [ ] Extra: Reordenar or itens
- [ ] Extra: Chamada para otimizar: <https://project-osrm.org/docs/v5.5.1/api/#trip-service>
- [ ] Extra: Tratamento de erro quando marcador é arrastado pro meio do mapa

### Back

- [x] Postman/Bruno
- Node:
  - [x] fazer um Hello World
  - [x] Le um arquivo, incrementa ele e guarda novamente
- Express:
  - [x] Criar um endpoint GET que retorna JOSN e fazer uma chamada via Postman
  - [x] A cada chamada do GET, retornar um numero incrementado
  - [x] Criar um endpoint POST que seta uma variavel e ao fazer uma chamada GET retorna esta variavel.
  - [ ] Criar uma especie de banco de dados que da pra dar POST para inserir, GET para resgatar, PATCH para atualizar e DELETE para deletar (ver padrão REST)
  - [ ] Interligar o Front com a persistencia do back
  - [ ] Traduzir a persistencia do back em banco MySQL
  - [ ] Atualização em tempo real multicliente via WebSocket
