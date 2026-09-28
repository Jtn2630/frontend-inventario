/* ==============================================================
   ARQUIVO: js/api.js
   Comunicação do frontend com a API Flask
   ============================================================== */

/* ==============================================================
   CONFIGURAÇÃO DA API
   ============================================================== */
const API_URL = "http://127.0.0.1:5000";

/* ==============================================================
   REQUISIÇÃO BÁSICA
   ============================================================== */
async function fazerRequisicao(caminho, opcoes = {}) {
    const resposta = await fetch(API_URL + caminho, opcoes);
    let dados = {};
    try {
        dados = await resposta.json();
    } catch {
        dados = {};
    }
    if (!resposta.ok) {
        const mensagem = dados.message || dados.detail || "Erro ao acessar a API.";
        throw new Error(mensagem);
    }
    return dados;
}

/* ==============================================================
   VERIFICAÇÃO DA API
   ============================================================== */
async function verificarApi() {
    return await fazerRequisicao("/");
}

/* ==============================================================
   FALECIDOS
   ============================================================== */
async function buscarFalecidos() {
    return await fazerRequisicao("/deceased");
}

async function cadastrarFalecido(dados) {
    return await fazerRequisicao("/deceased", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function atualizarFalecido(id, dados) {
    return await fazerRequisicao("/deceased/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

/* ==============================================================
   CÔNJUGE OU COMPANHEIRO
   ============================================================== */
async function cadastrarConjuge(dados) {
    return await fazerRequisicao("/spouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function atualizarConjuge(id, dados) {
    return await fazerRequisicao("/spouse/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function excluirConjuge(id) {
    return await fazerRequisicao("/spouse/" + id, {
        method: "DELETE"
    });
}

/* ==============================================================
   HERDEIROS
   ============================================================== */
async function cadastrarHerdeiro(dados) {
    return await fazerRequisicao("/heirs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function atualizarHerdeiro(id, dados) {
    return await fazerRequisicao("/heirs/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function excluirHerdeiro(id) {
    return await fazerRequisicao("/heirs/" + id, {
        method: "DELETE"
    });
}

/* ==============================================================
   BENS
   ============================================================== */
async function cadastrarBem(dados) {
    return await fazerRequisicao("/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function atualizarBem(id, dados) {
    return await fazerRequisicao("/assets/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function excluirBem(id) {
    return await fazerRequisicao("/assets/" + id, {
        method: "DELETE"
    });
}

/* ==============================================================
   DÍVIDAS
   ============================================================== */
async function cadastrarDivida(dados) {
    return await fazerRequisicao("/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function atualizarDivida(id, dados) {
    return await fazerRequisicao("/debts/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

async function excluirDivida(id) {
    return await fazerRequisicao("/debts/" + id, {
        method: "DELETE"
    });
}

/* ==============================================================
   INVENTÁRIO
   ============================================================== */
async function buscarInventario(deceasedId) {
    return await fazerRequisicao(
        "/inventory?deceased_id=" + encodeURIComponent(deceasedId)
    );
}

/* ==============================================================
   ESTIMATIVA DO ITCM
   ============================================================== */
async function estimarITD(valorBase) {
    return await fazerRequisicao("/itd-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            base_value: valorBase
        })
    });
}