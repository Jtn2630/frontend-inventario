/* ==========================================
   Configuração da API
   ========================================== */

const API_URL = "http://127.0.0.1:5000";


/* ==========================================
   Requisição Básica
   ========================================== */

async function fazerRequisicao(caminho, opcoes = {}) {

    const resposta = await fetch(API_URL + caminho, opcoes);

    let dados = {};

    try {
        dados = await resposta.json();
    } catch {
        dados = {};
    }

    if (!resposta.ok) {

        let mensagem =
            dados.message ||
            dados.detail ||
            "Erro ao acessar a API.";

        throw new Error(mensagem);
    }

    return dados;
}


/* ==========================================
   API
   ========================================== */

async function verificarApi() {

    return await fazerRequisicao("/");
}


async function cadastrarFalecido(dados) {

    return await fazerRequisicao("/deceased", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function atualizarFalecido(id, dados) {

    return await fazerRequisicao("/deceased/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function cadastrarConjuge(dados) {

    return await fazerRequisicao("/spouse", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function atualizarConjuge(id, dados) {

    return await fazerRequisicao("/spouse/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function excluirConjuge(id) {

    return await fazerRequisicao("/spouse/" + id, {
        method: "DELETE"
    });
}


async function cadastrarHerdeiro(dados) {

    return await fazerRequisicao("/heirs", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function atualizarHerdeiro(id, dados) {

    return await fazerRequisicao("/heirs/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function excluirHerdeiro(id) {

    return await fazerRequisicao("/heirs/" + id, {
        method: "DELETE"
    });
}


async function cadastrarBem(dados) {

    return await fazerRequisicao("/assets", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function atualizarBem(id, dados) {

    return await fazerRequisicao("/assets/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function excluirBem(id) {

    return await fazerRequisicao("/assets/" + id, {
        method: "DELETE"
    });
}


async function cadastrarDivida(dados) {

    return await fazerRequisicao("/debts", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function atualizarDivida(id, dados) {

    return await fazerRequisicao("/debts/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dados)
    });
}


async function excluirDivida(id) {

    return await fazerRequisicao("/debts/" + id, {
        method: "DELETE"
    });
}


async function buscarInventario(deceasedId) {

    return await fazerRequisicao(
        "/inventory?deceased_id=" +
        encodeURIComponent(deceasedId)
    );
}


async function estimarITD(valorBase) {

    return await fazerRequisicao("/itd-estimate", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            base_value: valorBase
        })
    });
}