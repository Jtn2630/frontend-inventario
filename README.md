# Frontend — Assistente de Primeiras Declarações

Interface web desenvolvida como MVP (Produto Mínimo Viável) da pós-graduação em Desenvolvimento Full Stack da PUC-Rio, para apoiar o preenchimento das primeiras declarações de inventários e partilhas.

A aplicação organiza o preenchimento em etapas e se comunica com uma API em Python e Flask para cadastrar, consultar e atualizar informações, além de apresentar os resultados dos cálculos patrimoniais.

## Funcionalidades

- Cadastro, seleção e edição dos dados do falecido.
- Cadastro, edição e exclusão de cônjuge, herdeiros, bens e dívidas.
- Exibição da meação e da partilha calculadas pelo backend.
- Auto de orçamento com o resumo patrimonial e sua distribuição.
- Solicitação e exibição da estimativa acadêmica de ITCM.
- Lista de conferência dos documentos utilizados no preenchimento.
- Folha de pagamento com os beneficiários e valores atribuídos no inventário.

A etapa Documentos oferece uma lista de conferência, sem envio de arquivos. A folha de pagamento apresenta a distribuição dos valores, sem realizar transferências financeiras.

## Tecnologias

- **HTML:** estrutura das páginas e formulários.
- **CSS:** aparência e organização visual.
- **JavaScript puro:** navegação, interação e comunicação com a API por `fetch`.

O frontend não utiliza React, Angular ou Vue. Não é necessário instalar Node.js, executar `npm install` ou compilar a aplicação.

## Estrutura

```text
frontend-inventario/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── api.js
│   └── app.js
└── README.md
```

- `index.html`: estrutura da interface e dos formulários.
- `css/style.css`: estilos da aplicação.
- `js/api.js`: endereço do backend e funções de requisição à API.
- `js/app.js`: comportamento da interface e apresentação dos dados.

## Instalação

Tenha um navegador e Git instalados. Clone o repositório:

```powershell
git clone https://github.com/Jtn2630/frontend-inventario.git
cd frontend-inventario
```

O frontend não possui dependências que precisem ser instaladas. Para utilizar os cadastros e cálculos, é necessário iniciar também o backend.

## Execução

### 1. Iniciar o backend

Obtenha o backend no [repositório backend-inventario](https://github.com/Jtn2630/backend-inventario) e siga as instruções de instalação do seu README.

Depois de instalar as dependências, dentro da pasta do backend e com o ambiente virtual ativado, execute:

```powershell
python app.py
```

Mantenha o terminal aberto. A API deve estar disponível em [http://127.0.0.1:5000](http://127.0.0.1:5000).

### 2. Conferir o endereço da API

O arquivo `js/api.js` utiliza a seguinte configuração:

```javascript
const API_URL = "http://127.0.0.1:5000";
```

Com esse endereço, o navegador e o backend devem executar no mesmo computador. Se o endereço ou a porta do backend forem alterados, atualize essa constante.

### 3. Abrir a interface

Abra o arquivo `index.html` diretamente no navegador, por exemplo, com um duplo clique no Explorador de Arquivos.

Cadastre um falecido ou selecione um inventário existente. Em seguida, percorra as etapas de cônjuge e herdeiros, bens, dívidas e demonstrativos.

## Comunicação com o backend

O frontend utiliza uma API REST: envia requisições HTTP e recebe os dados em JSON. O backend valida e armazena as informações em SQLite e executa os cálculos.

| Operação na interface | Comunicação com a API |
| --- | --- |
| Listar inventários | `GET /deceased` |
| Carregar um inventário | `GET /inventory?deceased_id={id}` |
| Cadastrar dados | `POST /deceased`, `/spouse`, `/heirs`, `/assets` ou `/debts` |
| Atualizar dados | `PUT` na rota do registro, com seu identificador |
| Excluir cônjuge, herdeiro, bem ou dívida | `DELETE` na rota do registro, com seu identificador |
| Solicitar estimativa tributária | `POST /itd-estimate` |

A interface utiliza o nome ITCM; a rota de estimativa no backend é identificada como ITD/RJ. A documentação completa pode ser consultada no [Swagger](http://127.0.0.1:5000/openapi/swagger), com o backend em execução.

## Organização dos repositórios

```text
mvp/
├── backend-inventario/   # Repositório Git do backend
└── frontend-inventario/  # Repositório Git do frontend
```

A pasta `mvp` é apenas organizadora, sem repositório Git próprio. Os projetos possuem repositórios e READMEs independentes. A conexão entre eles ocorre pelo endereço HTTP configurado em `js/api.js`.

## Repositórios

- [Frontend](https://github.com/Jtn2630/frontend-inventario)
- [Backend](https://github.com/Jtn2630/backend-inventario)
