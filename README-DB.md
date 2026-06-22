Como executar o servidor local (Node.js + SQLite):

1. Instale dependências:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

O servidor rodará em `http://localhost:3000` e fornecerá a API em `/api/books`.

O frontend já tenta usar a API; se o servidor não estiver rodando, ele usa `localStorage` como fallback.
