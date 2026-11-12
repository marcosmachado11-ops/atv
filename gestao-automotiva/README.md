# Gestão Automotiva

Site simples para gerenciar serviços de uma oficina mecânica ou lava-car: proprietários, veículos e ordens de serviço.

## Funcionalidades

- Login com sessão que expira em 30 minutos
- Painel com resumo (proprietários, veículos, serviços em aberto, faturamento concluído)
- Cadastro e pesquisa de proprietários (o CPF não aparece nas listagens)
- Cadastro de veículos vinculados a um proprietário, com placa única
- Ordens de serviço vinculadas a um veículo, listadas por data, com troca de status (aberto, em_andamento, concluido, cancelado)

## Como usar

Abra o `index.html` no navegador, ou rode um servidor local:

```bash
npx serve .
```

Login de demonstração: `admin@email.com` / `123456`

## Estrutura

```
gestao-automotiva/
├── index.html
├── css/style.css
└── js/app.js
```

## Observação

Esta versão é só frontend: os dados ficam no `localStorage` do navegador e o botão "Restaurar demo" volta aos registros iniciais. Não há backend nem PostgreSQL.

## Publicar no GitHub Pages

Envie a pasta para um repositório, abra Settings > Pages e escolha a branch principal na raiz.
