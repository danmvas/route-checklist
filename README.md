# route-checklist

Angular + Node.js route checklist

Training under Imediatum

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
  - [ ] fazer um Hello World
  - [ ] Le um arquivo, incrementa ele e guarda novamente
- Express:
  - [ ] Criar um endpoint GET que retorna JOSN e fazer uma chamada via Postman
  - [ ] A cada chamada do GET, retornar um numero incrementado
  - [ ] Criar um endpoint POST que seta uma variavele e ao fazer uma chamada GET retorna esta variavel.
  - [ ] Criar uma especie de banco de dados que da pra dar POST para inserir, GET para resgatar, PATCH para atualizar e DELETE para deletar (ver padrão REST)
  - [ ] Interligar o Front com a paersistencia do back
  - [ ] Trazudir a persistencia do back em banco MySQL
  - [ ] Atualização em tempo real multicliente via WebSocket
