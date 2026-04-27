# Task Manager

API REST de gerenciamento de tarefas com autenticação JWT, frontend em Next.js e pipeline de CI/CD automatizado para AWS.

## Stack Tecnológica

| Camada         | Tecnologia                                      |
|----------------|-------------------------------------------------|
| Backend        | Python 3.12, FastAPI, SQLAlchemy                |
| Frontend       | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Banco de Dados | PostgreSQL 16                                   |
| Autenticação   | JWT (python-jose + passlib/bcrypt)              |
| Migrations     | Alembic                                         |
| Containerização| Docker, Docker Compose                          |
| Proxy reverso  | Nginx 1.27                                      |
| CI/CD          | GitHub Actions                                  |
| Infraestrutura | AWS EC2 (app)                                   |

## Pré-requisitos

- Docker e Docker Compose instalados
- (Para produção) Conta AWS com EC2 provisionada

---

## Parte 1 - Lógica e Fundamentos

### 1. Lógica
Implementação da função que recebe uma lista de números inteiros e retorna a soma dos pares e a média dos ímpares, ignorando valores inválidos.

**Algoritmo:**
```typescript
function analisarNumeros(dados: any[]): { somaPares: number; mediaImpares: number | null } {
  // Filtra apenas números inteiros, ignorando booleanos e outros tipos
  const inteiros = dados.filter(x => typeof x === 'number' && Number.isInteger(x));
  
  // Separa pares e ímpares
  const pares = inteiros.filter(x => x % 2 === 0);
  const impares = inteiros.filter(x => x % 2 !== 0);
  
  // Calcula a soma dos pares
  const somaPares = pares.reduce((acc, curr) => acc + curr, 0);
  
  // Calcula a média dos ímpares (retorna null se não houver ímpares)
  const mediaImpares = impares.length > 0 
    ? impares.reduce((acc, curr) => acc + curr, 0) / impares.length 
    : null;
    
  return { somaPares, mediaImpares };
}
```

**Endpoint de Exemplo (Público):**
`POST /api/analyze-numbers`
Exemplo de entrada: `[1, 2, 3, 4, 5, "a", null]`
Retorno esperado: `{"evenSum": 6, "oddAverage": 3.0}`

---

### 2. Conceitos

**2.1 Diferença entre REST e GraphQL**
**REST** é baseado em recursos acessíveis via endpoints fixos e métodos HTTP (GET, POST, etc.). A estrutura da resposta é definida pelo servidor.
**GraphQL** é uma linguagem de consulta que permite ao cliente requisitar exatamente os dados que precisa em uma única chamada, evitando *over-fetching* e *under-fetching*.

**2.2 O que é uma transação em banco de dados**
Uma transação é uma unidade lógica de trabalho que deve ser executada totalmente ou não ser executada de forma alguma (Atomicidade). Ela garante a integridade dos dados seguindo as propriedades ACID (Atomicidade, Consistência, Isolamento e Durabilidade).

**2.3 Diferença entre autenticação e autorização**
**Autenticação** é o processo de verificar QUEM o usuário é (ex: conferir senha e e-mail).
**Autorização** é o processo de verificar o que o usuário PODE fazer dentro do sistema (ex: permissão para deletar uma tarefa).

**2.4 Quando usar cache e quando evitá-lo**
**Usar:** Para dados que são lidos com frequência, mudam raramente e cujo cálculo ou busca é computacionalmente caro.
**Evitar:** Para dados extremamente sensíveis que exigem consistência em tempo real ou que mudam com altíssima frequência.

---

## Parte 2 - Backend

### Endpoints da API

| Método | Rota                    | Descrição                          | Auth? |
|--------|-------------------------|------------------------------------|-------|
| GET    | /api/health             | Health check                       | Não   |
| POST   | /api/auth/register      | Cadastro de usuário                | Não   |
| POST   | /api/auth/login         | Login (retorna JWT)                | Não   |
| POST   | /api/analyze-numbers    | Lógica (Parte 1)                   | Não   |
| POST   | /api/tasks/             | Criar tarefa                       | Sim   |
| GET    | /api/tasks/             | Listar tarefas (paginado, filtrado)| Sim   |
| GET    | /api/tasks/{id}         | Buscar tarefa por ID               | Sim   |
| PUT    | /api/tasks/{id}         | Atualizar tarefa                   | Sim   |
| DELETE | /api/tasks/{id}         | Deletar tarefa                     | Sim   |

### Rodando os Testes (Backend)

```bash
make test
# Ou manualmente:
cd backend && export PYTHONPATH=$PYTHONPATH:. && ./venv/bin/pytest --cov=app tests/ -v
```

### Paginação e Filtros
(Implementado como diferencial)

A listagem de tarefas suporta paginação e filtros via query parameters:
`GET /api/tasks/?page=1&page_size=10&status=completed`

Exemplo de resposta:
```json
{
  "items": [...],
  "total": 15,
  "page": 1,
  "page_size": 10
}
```

---

## Parte 3 - Frontend

A interface foi construída com **Next.js 16 (App Router)** e **Tailwind CSS 4**.
- **Gerenciamento de Estado:** Utiliza React Hooks (`useState`, `useEffect`, `useCallback`) para controle de tarefas e autenticação.
- **SSR & Client Components:** Renderização no servidor para performance inicial e componentes interativos no cliente.
- **Responsividade:** Layout adaptável para dispositivos móveis e desktop.
- **Feedback:** Loading states e tratamento de erros amigável.

---

## Parte 4 - Integração e Qualidade

### Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/task-management-fastapi-nextjs.git
    cd task-management-fastapi-nextjs
    ```

2.  **Configure as variáveis de ambiente:**
    ```bash
    cp .env.example .env
    ```
    Preencha as variáveis no arquivo `.env`.

3.  **Inicie os containers:**
    ```bash
    make dev
    # ou
    docker compose up --build
    ```

4.  **Execute as migrations:**
    ```bash
    make migrate
    # ou
    docker compose run --rm backend alembic upgrade head
    ```

5.  **Acesse as aplicações:**
    - Frontend: [http://localhost](http://localhost)
    - Health Check Backend: [http://localhost/api/health](http://localhost/api/health)
    - Documentação da API (Swagger): [http://localhost/api/docs](http://localhost/api/docs)

### Variáveis de Ambiente

#### Backend & Database
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `POSTGRES_USER` | Usuário do banco de dados | `user` |
| `POSTGRES_PASSWORD` | Senha do banco de dados | `password` |
| `POSTGRES_DB` | Nome do banco de dados | `taskdb` |
| `DATABASE_URL` | URL de conexão (Docker usa interna) | `postgresql://user:pass@db:5432/taskdb` |
| `JWT_SECRET` | Chave secreta para assinar tokens | `sua-chave-ultra-secreta` |
| `JWT_EXPIRE_MINUTES` | Tempo de expiração do token | `60` |

#### Frontend
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API para o browser | `http://localhost/api` |

#### CI/CD & Produção (GitHub Secrets)
| Variável | Descrição |
|----------|-----------|
| `DOCKER_USERNAME` | Seu usuário no Docker Hub |
| `DOCKER_PASSWORD` | Access Token do Docker Hub |
| `EC2_HOST` | IP público da sua instância EC2 |
| `EC2_USER` | Usuário SSH (geralmente `ubuntu`) |
| `EC2_SSH_KEY` | Conteúdo da sua chave `.pem` |
| `IMAGE_TAG` | Tag da imagem (usado via github.sha) |

### Recursos de Segurança

- **Assuntos de JWT Imutáveis**: UUIDs de usuário são utilizados em vez de e-mails nos tokens, garantindo que atualizações de e-mail não interrompam sessões ativas.
- **Tokens de Atualização sem Estado**: A rotação e a revogação automatizada de tokens são implementadas para maior segurança.
- **Defesa em Profundidade**: A validação de dados é realizada em múltiplos níveis: Banco de Dados (Constraints), API (Pydantic) e Frontend (Zod).

### Decisões Técnicas

- **FastAPI sobre Django REST:** Escolhido pela performance assíncrona superior e tipagem nativa com Pydantic v2. A documentação automática via OpenAPI (Swagger) acelera o desenvolvimento e facilita a integração com o frontend.

- **SQLAlchemy + Alembic:** É o padrão de ouro para manipulação de bancos SQL em Python. O Alembic garante que o esquema do banco seja versionado como código, permitindo rollback e rastreabilidade total das mudanças.

- **Repository Pattern:** Implementado para isolar a lógica de acesso a dados. Isso torna o código mais limpo e facilita a criação de mocks para testes unitários, além de permitir a troca do ORM no futuro com impacto mínimo nos routers.

- **Next.js App Router com SSR:** Utilizamos Server-Side Rendering no carregamento inicial da lista de tarefas para otimizar o tempo de resposta e performance percebida pelo usuário. Componentes Client-side são usados cirurgicamente para interatividade.

- **JWT Stateless:** Optamos por autenticação via JWT sem armazenamento em estado no servidor (Redis/DB). Isso simplifica a escalabilidade horizontal e reduz a complexidade da infraestrutura.

- **JWT Refresh Queue:** Implementação avançada de interceptadores no frontend que captura tokens expirados, enfileira as requisições em background, atualiza o token via Refresh Token e repete as chamadas silenciosamente, garantindo uma UX perfeita.

- **Docker Compose em Produção:** Para este escopo, o uso de Docker Compose em uma EC2 é uma solução de excelente custo-benefício, fácil manutenção e que provê isolamento suficiente entre os serviços (Backend, Frontend, Nginx).

### O que Melhoraria com Mais Tempo

- **Rate Limiting** para proteger endpoints sensíveis contra brute-force.
- **Soft Delete** nas tarefas para permitir recuperação de dados.
- Testes de ponta a ponta (E2E) com **Playwright**.
- Logs estruturados e monitoramento via CloudWatch.
- Camada de Cache com **Redis** para queries frequentes.

### Pontos Fortes e Limitações

**Pontos fortes:**
- Tipagem rigorosa em todo o fluxo (Backend e Frontend).
- CI/CD robusto com validação obrigatória por testes.
- Arquitetura multi-tenant: Isolamento rigoroso de dados na camada de repositório, garantindo que usuários acessem apenas suas próprias tarefas.
- Arquitetura limpa e desacoplada.

**Limitações:**
- Ausência de HTTPS nativo (necessário configurar Certbot/ACM).

---

## Parte 5 - Extra

### Deploy (AWS)

A arquitetura de produção utiliza:
- **EC2 Ubuntu 22.04:** Servidor de aplicação rodando Docker Compose, com PostgreSQL em container.
- **GitHub Actions:** Pipeline automatizado que executa testes, gera imagens Docker, faz o push para o Docker Hub e atualiza a aplicação via SSH.

**Passos para o primeiro deploy:**
1. Provisionar as credenciais da AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) com permissões para criar EC2 e Security Groups.
2. Criar um par de chaves SSH na AWS e salvar o nome da chave.
3. Adicionar os **GitHub Secrets** listados abaixo no repositório.
4. Após o commit e push do código para a branch `main`, o pipeline de CI/CD (GitHub Actions) irá automaticamente:
   - Provisionar a infraestrutura (EC2 e Security Groups) via Terraform.
   - Construir e enviar as imagens Docker.
   - Implantar a aplicação na EC2.
