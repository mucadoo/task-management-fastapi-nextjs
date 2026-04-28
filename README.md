# Task Manager

API REST de gerenciamento de tarefas com autenticação JWT, frontend em Next.js e pipeline de CI/CD automatizado para AWS.

## Stack Tecnológica

| Camada         | Tecnologia                                      |
|----------------|-------------------------------------------------|
| Backend        | Python 3.12, FastAPI 0.111, SQLAlchemy 2.0      |
| Frontend       | Next.js 16.2, React 19, TypeScript, Tailwind 4  |
| Banco de Dados | PostgreSQL 16                                   |
| Autenticação   | JWT (python-jose + pwdlib/argon2)               |
| Ger. Estado    | Zustand (Global) + React Query (Server State)   |
| Migrations     | Alembic 1.13                                    |
| Containerização| Docker, Docker Compose                          |
| Proxy reverso  | Nginx 1.27                                      |
| CI/CD          | GitHub Actions                                  |
| Infraestrutura | AWS EC2 + Terraform                             |

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

| Método | Rota                         | Descrição                           | Auth? |
|--------|------------------------------|-------------------------------------|-------|
| GET    | /api/health                  | Health check                        | Não   |
| POST   | /api/v1/auth/register        | Cadastro de usuário                 | Não   |
| POST   | /api/v1/auth/login           | Login (retorna JWT)                 | Não   |
| POST   | /api/v1/tasks/               | Criar tarefa                        | Sim   |
| GET    | /api/v1/tasks/               | Listar tarefas (paginado, filtrado) | Sim   |
| GET    | /api/v1/tasks/{id}           | Buscar tarefa por ID                | Sim   |
| PUT    | /api/v1/tasks/{id}           | Atualizar tarefa                    | Sim   |
| DELETE | /api/v1/tasks/{id}           | Deletar tarefa                      | Sim   |
| POST   | /api/v1/tasks/{id}/toggle    | Alternar status (Pendente/Concluída)| Sim   |

### Rodando os Testes (Backend)

```bash
make test
# Ou manualmente:
cd backend && export PYTHONPATH=$PYTHONPATH:. && ./venv/bin/pytest --cov=app tests/ -v
```

### Paginação e Filtros
(Implementado como diferencial)

A listagem de tarefas suporta paginação e filtros via query parameters:
`GET /api/v1/tasks/?page=1&page_size=10&status=completed`

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

4.  **Execute as migrations e opcionalmente o seed:**
    ```bash
    make migrate
    make seed  # Popula o banco com dados iniciais (opcional)
    ```

5.  **Acesse as aplicações:**
    - Frontend: [http://localhost](http://localhost)
    - Swagger API: [http://localhost/api/docs](http://localhost/api/docs)
    - Health Check: [http://localhost/api/health](http://localhost/api/health)

### Principais Comandos (Makefile)

| Comando | Descrição |
|---------|-----------|
| `make dev` | Inicia ambiente de desenvolvimento (Docker) |
| `make test` | Executa testes do backend e frontend |
| `make migrate` | Aplica migrações do banco de dados |
| `make seed` | Popula o banco com dados de teste |
| `make down` | Para todos os containers |
| `make logs` | Exibe logs em tempo real |

### Variáveis de Ambiente

#### Backend & Database
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `POSTGRES_USER` | Usuário do banco de dados | `user` |
| `POSTGRES_PASSWORD` | Senha do banco de dados | `password` |
| `POSTGRES_DB` | Nome do banco de dados | `taskdb` |
| `DATABASE_URL` | URL de conexão (Docker usa interna) | `postgresql://user:pass@db:5432/taskdb` |
| `JWT_SECRET` | Chave secreta para assinar tokens | `sua-chave-ultra-secreta` |
| `JWT_EXPIRE_MINUTES` | Tempo de expiração do Access Token | `60` |
| `JWT_REFRESH_EXPIRE_DAYS` | Expiração do Refresh Token (dias) | `7` |

#### Frontend
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API para o browser | `http://localhost/api/v1` |

#### CI/CD & Produção (GitHub Secrets)

| Variável | Descrição | Exemplo / Fonte |
|----------|-----------|-----------------|
| `GITHUB_TOKEN` | Token automático do GitHub | Gerado pelo GitHub Actions |
| `AWS_ACCESS_KEY_ID` | ID da chave de acesso AWS | IAM User com permissões EC2/VPC |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS | IAM User com permissões EC2/VPC |
| `EC2_HOST` | IP público da instância | Output do Terraform |
| `EC2_USER` | Usuário SSH | `ubuntu` |
| `EC2_SSH_KEY` | Conteúdo da chave `.pem` | Chave privada para acesso SSH |
| `DATABASE_URL` | URL do banco em prod | `postgresql://user:pass@db:5432/taskdb` |
| `JWT_SECRET` | Chave secreta (Prod) | String aleatória segura |

### Instruções de Deploy (AWS)

A arquitetura de produção utiliza:
- **EC2 Ubuntu 22.04:** Servidor de aplicação rodando Docker Compose.
- **GitHub Container Registry (GHCR):** Armazenamento das imagens Docker do projeto.
- **GitHub Actions:** Pipeline automatizado que executa testes, gera imagens Docker, faz o push para o GHCR e atualiza a aplicação via SSH.

**Passos para o primeiro deploy:**
1. Provisionar as credenciais da AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) com permissões para gerenciar EC2 e VPC.
2. Adicionar os **GitHub Secrets** listados acima no repositório.
3. Após o push para `main`, o workflow `CI/CD Pipeline` irá:
   - Provisionar infraestrutura via Terraform.
   - Construir e publicar imagens no GHCR.
   - Conectar via SSH à EC2 para atualizar o `docker-compose.prod.yml` e reiniciar os serviços.

### Recursos de Segurança

- **Tokens de Atualização (Refresh Tokens) com Rotação**: Implementação de *Refresh Token Rotation*. Ao solicitar um novo *Access Token*, o *Refresh Token* antigo é revogado e um novo é emitido, mitigando riscos de interceptação.
- **Assuntos de JWT Imutáveis**: O campo `sub` do JWT contém o UUID do usuário, garantindo que mudanças de e-mail ou username não invalidem a sessão ou causem inconsistências.
- **UUIDs como Chave Primária**: Uso de UUID v4 em vez de IDs sequenciais para evitar enumeração de recursos e aumentar a segurança.
- **Segurança com JWT + Argon2**: Uso do algoritmo **Argon2** (vencedor do Password Hashing Competition) via `pwdlib` para hashing de senhas, oferecendo proteção superior contra ataques de GPU e *side-channel*.
- **Defesa em Profundidade**: Validação tripla: Banco de Dados (Constraints), API (Pydantic v2) e Frontend (Zod + React Hook Form).

### Decisões Técnicas

- **Arquitetura Base (Backend):** Uso de **BaseService** e **BaseRepository** genéricos. Essa abstração centraliza lógica repetitiva de CRUD, garante tratamento de erros padronizado (como `get_or_404`) e facilita a implementação de multi-tenancy através de métodos "scoped" que exigem sempre o `owner_id`.
- **Padrão Repository + Service:** Separação clara de responsabilidades. O Repository lida exclusivamente com consultas SQLAlchemy, enquanto o Service gerencia regras de negócio e transações, mantendo os Controllers (Routers) focados apenas na interface HTTP.
- **FastAPI (Pydantic v2):** Escolhido pela performance assíncrona, documentação automática (Swagger/OpenAPI) e validação de tipos rigorosa que reduz bugs em tempo de execução.
- **Gerenciamento de Estado Híbrido (Frontend):** 
  - **React Query:** Gerencia o estado do servidor, cache e sincronização, eliminando a necessidade de `useEffect` complexos para busca de dados.
  - **Zustand:** Gerencia o estado global UI (autenticação, preferências) de forma leve e performática.
- **Migrations com Alembic:** Controle de versão do esquema do banco de dados, permitindo evoluções seguras e reprodutíveis entre ambientes de desenvolvimento, teste e produção.
- **Next.js App Router:** Aproveitamento de *Server Components* para redução do bundle enviado ao cliente e *Client Components* apenas onde a interatividade é necessária.
- **CI/CD com GitHub Actions & Terraform:** Automação completa do ciclo de vida da aplicação, desde a criação da infraestrutura na AWS até o deploy contínuo, garantindo que o ambiente de produção seja sempre um reflexo fiel do código aprovado.

### O que Melhoraria com Mais Tempo

- **Visualização Kanban:** Implementação de um quadro Kanban no frontend para proporcionar uma gestão visual do fluxo de trabalho.
- **Categorização e Projetos:** Criação de uma forma de organizar tarefas por projeto, categoria ou tópicos (tags).
- **Testes de Integração e E2E:** Ampliação da cobertura com testes de integração no backend e testes de ponta a ponta (E2E) com **Playwright**.
- **Infraestrutura e Segurança:** Desacoplamento do banco de dados para um serviço gerenciado, configuração de **SSL/TLS** e uso de domínio customizado.
- **Múltiplos Ambientes:** Estruturação de ambientes distintos (pelo menos um de Desenvolvimento/Dev e outro de Produção) via Terraform, incluindo a configuração de um **Backend Remoto (S3 + DynamoDB)** para garantir o bloqueio de estado (*state locking*) em produção.
- **Observabilidade:** Implementação de **Logs Estruturados** e centralização de logs para melhor monitoramento e depuração.
- **Rate Limiting** para proteger endpoints sensíveis contra ataques de força bruta.
- **Soft Delete** nas tarefas para permitir a recuperação de dados excluídos acidentalmente.
- **Camada de Cache** com **Redis** para otimizar a performance de consultas frequentes.

### Pontos Fortes e Limitações

**Pontos fortes:**
- **Robustez Arquitetural:** Uso de padrões profissionais (Repository/Service, Base Classes) que facilitam a manutenção e escalabilidade.
- **Segurança Avançada:** Implementação de Argon2, Refresh Token Rotation e isolamento de dados por usuário (Multi-tenancy).
- **Tipagem End-to-End:** Uso extensivo de TypeScript no Frontend e Pydantic no Backend, garantindo contratos de API sólidos.
- **DevEx (Developer Experience):** Ambiente Dockerizado, Makefile com comandos atalhos e documentação Swagger completa.
- **Automação Total:** Pipeline de CI/CD que integra testes, linting, provisionamento de infra (Terraform) e deploy.
- **UX Consistente:** Tratamento global de erros, estados de carregamento (Skeleton/Spinners) e feedbacks via Toast.

**Limitações:**
- **Single Point of Failure (DB):** No estágio atual, o banco de dados roda em container na mesma EC2 (melhoraria com RDS).
- **SSL/TLS Externo:** O HTTPS não está configurado nativamente no Nginx do projeto (requer Certbot ou Load Balancer).
- **Ausência de Cache Distribuído:** Consultas repetitivas batem sempre no DB (melhoraria com Redis).
- **Observabilidade Limitada:** Logs são gerenciados pelo Docker; falta centralização em serviços como CloudWatch ou ELK.
- **Ausência de Testes de Integração e E2E:** O projeto conta atualmente apenas com testes unitários, o que representa uma limitação na validação de fluxos completos de ponta a ponta e integrações complexas.

