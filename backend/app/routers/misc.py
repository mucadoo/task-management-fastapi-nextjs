from fastapi import APIRouter
router = APIRouter()
@router.get("/concepts")
def get_concepts():
    return {
        "rest_vs_graphql": {
            "summary": "REST é baseado em recursos e métodos HTTP fixos (GET, POST, etc.), enquanto GraphQL é uma linguagem de consulta que permite ao cliente pedir exatamente os campos que precisa em uma única requisição.",
            "use_case": "Use REST para APIs públicas simples e padronizadas. Use GraphQL para sistemas complexos com muitas relações onde o 'over-fetching' (trazer dados demais) é um problema."
        },
        "database_transaction": {
            "summary": "Uma transação é uma unidade lógica de trabalho que deve ser executada totalmente ou não ser executada de forma alguma, garantindo a integridade dos dados.",
            "acid": "ACID significa Atomicidade (tudo ou nada), Consistência (estado válido), Isolamento (execução paralela sem interferência) e Durabilidade (persistência após commit)."
        },
        "auth_vs_authz": {
            "authentication": "Autenticação é o processo de verificar QUEM você é (ex: login com e-mail e senha).",
            "authorization": "Autorização é o processo de verificar o que você PODE fazer (ex: um usuário comum não pode deletar tarefas de outros).",
            "example": "O JWT prova quem é o usuário (Autenticação), mas o sistema checa suas permissões antes de permitir uma ação (Autorização)."
        },
        "caching": {
            "use_when": "Use cache para dados que são lidos com frequência e mudam raramente, ou para resultados de operações computacionalmente caras.",
            "avoid_when": "Evite cache para dados extremamente sensíveis que precisam de consistência em tempo real ou dados que mudam a cada segundo."
        }
    }
