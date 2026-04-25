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
| Infraestrutura | AWS EC2 (app) + AWS RDS (banco)                 |

## Pré-requisitos

- Docker e Docker Compose instalados
- (Para produção) Conta AWS com EC2 e RDS provisionados

## Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/task-management-fastapi-nextjs.git
    cd task-management-fastapi-nextjs
    ```

2.  **Configure as variáveis de ambiente:**
    ```bash
    cp .env.example .env
    ```
    Preencha as variáveis no arquivo `.env` (veja a seção abaixo).

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

## Variáveis de Ambiente

### Backend & Database
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `POSTGRES_USER` | Usuário do banco de dados | `user` |
| `POSTGRES_PASSWORD` | Senha do banco de dados | `password` |
| `POSTGRES_DB` | Nome do banco de dados | `taskdb` |
| `DATABASE_URL` | URL de conexão (Docker usa interna) | `postgresql://user:pass@db:5432/taskdb` |
| `JWT_SECRET` | Chave secreta para assinar tokens | `sua-chave-ultra-secreta` |
| `JWT_EXPIRE_MINUTES` | Tempo de expiração do token | `60` |

### Frontend
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API para o browser | `http://localhost/api` |

### CI/CD & Produção (GitHub Secrets)
| Variável | Descrição |
|----------|-----------|
| `DOCKER_USERNAME` | Seu usuário no Docker Hub |
| `DOCKER_PASSWORD` | Access Token do Docker Hub |
| `EC2_HOST` | IP público da sua instância EC2 |
| `EC2_USER` | Usuário SSH (geralmente `ubuntu`) |
| `EC2_SSH_KEY` | Conteúdo da sua chave `.pem` |
| `IMAGE_TAG` | Tag da imagem (usado via github.sha) |

## Respostas Conceituais (Parte 1)

### 1. Diferença entre REST e GraphQL
**REST** é baseado em recursos acessíveis via endpoints fixos e métodos HTTP (GET, POST, etc.). A estrutura da resposta é definida pelo servidor.
**GraphQL** é uma linguagem de consulta que permite ao cliente requisitar exatamente os dados que precisa em uma única chamada, evitando *over-fetching* e *under-fetching*.

### 2. O que é uma transação em banco de dados
Uma transação é uma unidade lógica de trabalho que deve ser executada totalmente ou não ser executada de forma alguma (Atomicidade). Ela garante a integridade dos dados seguindo as propriedades ACID (Atomicidade, Consistência, Isolamento e Durabilidade).

### 3. Diferença entre autenticação e autorização
**Autenticação** é o processo de verificar QUEM o usuário é (ex: conferir senha e e-mail).
**Autorização** é o processo de verificar o que o usuário PODE fazer dentro do sistema (ex: permissão para deletar uma tarefa).

### 4. Quando usar cache e quando evitá-lo
**Usar:** Para dados que são lidos com frequência, mudam raramente e cujo cálculo ou busca é computacionalmente caro.
**Evitar:** Para dados extremamente sensíveis que exigem consistência em tempo real ou que mudam com altíssima frequência.

## Endpoints da API

| Método | Rota                    | Descrição                          | Auth? |
|--------|-------------------------|------------------------------------|-------|
| GET    | /api/health             | Health check                       | Não   |
| POST   | /api/auth/register      | Cadastro de usuário                | Não   |
| POST   | /api/auth/login         | Login (retorna JWT)                | Não   |
| POST   | /api/tasks/             | Criar tarefa                       | Sim   |
| GET    | /api/tasks/             | Listar tarefas (paginado, filtrado)| Sim   |
| GET    | /api/tasks/{id}         | Buscar tarefa por ID               | Sim   |
| PUT    | /api/tasks/{id}         | Atualizar tarefa                   | Sim   |
| DELETE | /api/tasks/{id}         | Deletar tarefa                     | Sim   |

## Rodando os Testes

```bash
make test
# Ou manualmente:
cd backend && export PYTHONPATH=$PYTHONPATH:. && ./venv/bin/pytest --cov=app tests/ -v
```

## Paginação e Filtros

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

## Deploy (AWS)

A arquitetura de produção utiliza:
- **RDS PostgreSQL 16:** Banco de dados gerenciado para alta disponibilidade.
- **EC2 Ubuntu 22.04:** Servidor de aplicação rodando Docker Compose.
- **GitHub Actions:** Pipeline automatizado que executa testes, gera imagens Docker, faz o push para o Docker Hub e atualiza a aplicação via SSH.

**Passos para o primeiro deploy:**
1. Provisionar RDS e EC2 na mesma VPC.
2. Configurar Security Groups (EC2: porta 80 aberta; RDS: aceitar conexões apenas do IP da EC2).
3. Adicionar os **GitHub Secrets** listados acima no repositório.

## Decisões Técnicas

- **FastAPI sobre Django REST:** Escolhido pela performance assíncrona superior e tipagem nativa com Pydantic v2. A documentação automática via OpenAPI (Swagger) acelera o desenvolvimento e facilita a integração com o frontend.

- **SQLAlchemy + Alembic:** É o padrão de ouro para manipulação de bancos SQL em Python. O Alembic garante que o esquema do banco seja versionado como código, permitindo rollback e rastreabilidade total das mudanças.

- **Repository Pattern:** Implementado para isolar a lógica de acesso a dados. Isso torna o código mais limpo e facilita a criação de mocks para testes unitários, além de permitir a troca do ORM no futuro com impacto mínimo nos routers.

- **Next.js App Router com SSR:** Utilizamos Server-Side Rendering no carregamento inicial da lista de tarefas para otimizar o tempo de resposta e performance percebida pelo usuário. Componentes Client-side são usados cirurgicamente para interatividade.

- **JWT Stateless:** Optamos por autenticação via JWT sem armazenamento em estado no servidor (Redis/DB). Isso simplifica a escalabilidade horizontal e reduz a complexidade da infraestrutura.

- **Docker Compose em Produção:** Para este escopo, o uso de Docker Compose em uma EC2 é uma solução de excelente custo-benefício, fácil manutenção e que provê isolamento suficiente entre os serviços (Backend, Frontend, Nginx).

## O que Melhoraria com Mais Tempo

- Implementação de **Refresh Tokens** para melhor segurança e experiência do usuário.
- **Rate Limiting** para proteger endpoints sensíveis contra brute-force.
- **Soft Delete** nas tarefas para permitir recuperação de dados.
- Testes de ponta a ponta (E2E) com **Playwright**.
- Logs estruturados e monitoramento via CloudWatch.
- Camada de Cache com **Redis** para queries frequentes.

## Pontos Fortes e Limitações

**Pontos fortes:**
- Tipagem rigorosa em todo o fluxo (Backend e Frontend).
- CI/CD robusto com validação obrigatória por testes.
- Arquitetura limpa e desacoplada.

**Limitações:**
- Ausência de HTTPS nativo (necessário configurar Certbot/ACM).
- Tarefas não são isoladas por usuário (nesta versão, todos veem todas as tarefas).

## Autor

Samuel | mucadoo.dev
