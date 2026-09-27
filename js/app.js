/* ==========================================
   Variáveis Principais
   ========================================== */

let etapaAtual = 0;
let totalEtapas = 9;

let falecidoId = localStorage.getItem("falecidoId");
let inventarioAtual = null;


/* ==========================================
   Inicialização
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    configurarEventos();

    testarConexaoApi();

    mostrarEtapa(0);

    if (falecidoId) {
        carregarInventario();
    }
});


/* ==========================================
   Eventos da Página
   ========================================== */

function configurarEventos() {

    document.getElementById("form-falecido")
        .addEventListener("submit", salvarFalecido);

    document.getElementById("form-conjuge")
        .addEventListener("submit", salvarConjuge);

    document.getElementById("form-herdeiro")
        .addEventListener("submit", salvarHerdeiro);

    document.getElementById("form-bem")
        .addEventListener("submit", salvarBem);

    document.getElementById("form-divida")
        .addEventListener("submit", salvarDivida);

    document.getElementById("btn-anterior")
        .addEventListener("click", etapaAnterior);

    document.getElementById("btn-proximo")
        .addEventListener("click", proximaEtapa);

    document.getElementById("btn-novo")
        .addEventListener("click", novoInventario);

    document.getElementById("btn-menu")
        .addEventListener("click", alternarMenu);

    document.getElementById("btn-excluir-conjuge")
        .addEventListener("click", removerConjuge);

    document.getElementById("bem-condominio")
        .addEventListener("change", alterarCampoCondominio);

    document.getElementById("btn-itd")
        .addEventListener("click", calcularITD);

    document.querySelectorAll(".item-menu").forEach(function (item) {

        item.addEventListener("click", function () {

            let numero = Number(item.dataset.etapa);

            mostrarEtapa(numero);
        });
    });
}


/* ==========================================
   Navegação
   ========================================== */

function mostrarEtapa(numero) {

    if (numero > 0 && !falecidoId) {

        mostrarMensagem(
            "Cadastre primeiro os dados da autoria da herança.",
            "aviso"
        );

        return;
    }

    if (numero < 0) {
        numero = 0;
    }

    if (numero >= totalEtapas) {
        numero = totalEtapas - 1;
    }

    etapaAtual = numero;

    document.querySelectorAll(".etapa").forEach(function (etapa) {
        etapa.classList.remove("ativa");
    });

    document.querySelectorAll(".item-menu").forEach(function (item) {
        item.classList.remove("ativa");
    });

    let etapa = document.querySelector(
        '.etapa[data-etapa="' + numero + '"]'
    );

    let menu = document.querySelector(
        '.item-menu[data-etapa="' + numero + '"]'
    );

    if (etapa) {
        etapa.classList.add("ativa");
    }

    if (menu) {
        menu.classList.add("ativa");
    }

    document.getElementById("btn-anterior").style.visibility =
        numero === 0 ? "hidden" : "visible";

    document.getElementById("btn-proximo").textContent =
        numero === totalEtapas - 1
            ? "Finalizar"
            : "Avançar";

    if (numero >= 4 && inventarioAtual) {
        atualizarTelasDeResumo();
    }

    limparMensagem();
}


function proximaEtapa() {

    if (etapaAtual === totalEtapas - 1) {

        mostrarMensagem(
            "Preenchimento concluído. Confira os dados antes da utilização.",
            "sucesso"
        );

        return;
    }

    mostrarEtapa(etapaAtual + 1);
}


function etapaAnterior() {

    mostrarEtapa(etapaAtual - 1);
}


function alternarMenu() {

    document.body.classList.toggle("menu-fechado");

    let botao = document.getElementById("btn-menu");

    if (document.body.classList.contains("menu-fechado")) {

        botao.textContent = "☰";

    } else {

        botao.textContent = "×";
    }
}


/* ==========================================
   Conexão com a API
   ========================================== */

async function testarConexaoApi() {

    let elemento = document.getElementById("status-api");

    try {

        await verificarApi();

        elemento.textContent = "API conectada";

        elemento.className = "status-api online";

    } catch {

        elemento.textContent = "API não conectada";

        elemento.className = "status-api offline";
    }
}


/* ==========================================
   Mensagens
   ========================================== */

function mostrarMensagem(texto, tipo) {

    let mensagem =
        document.getElementById("mensagem-geral");

    mensagem.textContent = texto;

    mensagem.className =
        "mensagem " + tipo;
}


function limparMensagem() {

    let mensagem =
        document.getElementById("mensagem-geral");

    mensagem.textContent = "";

    mensagem.className = "mensagem";
}


/* ==========================================
   Funções Auxiliares
   ========================================== */

function valorOuNull(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor.trim() === ""
    ) {
        return null;
    }

    return valor.trim();
}


function numeroOuNull(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return null;
    }

    return Number(valor);
}


function booleanoOuNull(valor) {

    if (valor === "") {
        return null;
    }

    return valor === "true";
}


function confirmarCamposVazios(formulario) {

    let campos = formulario.querySelectorAll(
        "input:not([type='hidden']), select, textarea"
    );

    let existeVazio = false;

    campos.forEach(function (campo) {

        if (
            !campo.disabled &&
            campo.offsetParent !== null &&
            campo.value.trim() === ""
        ) {
            existeVazio = true;
        }
    });

    if (!existeVazio) {
        return true;
    }

    return confirm(
        "O usuário não preencheu todos os campos. Deseja continuar?"
    );
}


function formatarMoeda(valor) {

    let numero = Number(valor || 0);

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function formatarData(data) {

    if (!data) {
        return "-";
    }

    let partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return partes[2] + "/" + partes[1] + "/" + partes[0];
}


function escaparHtml(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return "";
    }

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ==========================================
   Falecido
   ========================================== */

async function salvarFalecido(evento) {

    evento.preventDefault();

    let formulario =
        document.getElementById("form-falecido");

    if (!confirmarCamposVazios(formulario)) {
        return;
    }

    let dados = {

        name:
            valorOuNull(
                document.getElementById("falecido-nome").value
            ),

        date_of_death:
            valorOuNull(
                document.getElementById("falecido-data").value
            ),

        cpf:
            valorOuNull(
                document.getElementById("falecido-cpf").value
            ),

        identity_document:
            valorOuNull(
                document.getElementById("falecido-identidade").value
            ),

        last_address:
            valorOuNull(
                document.getElementById("falecido-endereco").value
            ),

        marital_status:
            valorOuNull(
                document.getElementById("falecido-estado-civil").value
            ),

        property_regime:
            valorOuNull(
                document.getElementById("falecido-regime").value
            ),

        has_will:
            booleanoOuNull(
                document.getElementById("falecido-testamento").value
            )
    };


    try {

        let resposta;

        if (falecidoId) {

            resposta =
                await atualizarFalecido(
                    falecidoId,
                    dados
                );

        } else {

            resposta =
                await cadastrarFalecido(dados);

            falecidoId = resposta.id;

            localStorage.setItem(
                "falecidoId",
                falecidoId
            );
        }

        mostrarMensagem(
            "Dados da autoria da herança salvos com sucesso.",
            "sucesso"
        );

        await carregarInventario();

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Cônjuge
   ========================================== */

async function salvarConjuge(evento) {

    evento.preventDefault();

    if (!falecidoId) {
        return;
    }

    let formulario =
        document.getElementById("form-conjuge");

    if (!confirmarCamposVazios(formulario)) {
        return;
    }

    let conjugeId =
        document.getElementById("conjuge-id").value;

    let dados = {

        deceased_id:
            Number(falecidoId),

        name:
            valorOuNull(
                document.getElementById("conjuge-nome").value
            ),

        cpf:
            valorOuNull(
                document.getElementById("conjuge-cpf").value
            ),

        identity_document:
            valorOuNull(
                document.getElementById("conjuge-identidade").value
            ),

        address:
            valorOuNull(
                document.getElementById("conjuge-endereco").value
            )
    };


    try {

        if (conjugeId) {

            delete dados.deceased_id;

            await atualizarConjuge(
                conjugeId,
                dados
            );

        } else {

            await cadastrarConjuge(dados);
        }

        mostrarMensagem(
            "Cônjuge salvo com sucesso.",
            "sucesso"
        );

        await carregarInventario();

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


async function removerConjuge() {

    let id =
        document.getElementById("conjuge-id").value;

    if (!id) {
        return;
    }

    if (
        !confirm(
            "Deseja excluir o cônjuge cadastrado?"
        )
    ) {
        return;
    }

    try {

        await excluirConjuge(id);

        document
            .getElementById("form-conjuge")
            .reset();

        document
            .getElementById("conjuge-id")
            .value = "";

        await carregarInventario();

        mostrarMensagem(
            "Cônjuge excluído.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Herdeiros
   ========================================== */

async function salvarHerdeiro(evento) {

    evento.preventDefault();

    let formulario =
        document.getElementById("form-herdeiro");

    if (!confirmarCamposVazios(formulario)) {
        return;
    }

    let id =
        document.getElementById("herdeiro-id").value;

    let dados = {

        deceased_id:
            Number(falecidoId),

        name:
            valorOuNull(
                document.getElementById("herdeiro-nome").value
            ),

        cpf:
            valorOuNull(
                document.getElementById("herdeiro-cpf").value
            ),

        identity_document:
            valorOuNull(
                document.getElementById("herdeiro-identidade").value
            ),

        address:
            valorOuNull(
                document.getElementById("herdeiro-endereco").value
            ),

        kinship_degree:
            valorOuNull(
                document.getElementById("herdeiro-parentesco").value
            )
    };


    try {

        if (id) {

            delete dados.deceased_id;

            await atualizarHerdeiro(
                id,
                dados
            );

        } else {

            await cadastrarHerdeiro(dados);
        }

        formulario.reset();

        document
            .getElementById("herdeiro-id")
            .value = "";

        await carregarInventario();

        mostrarMensagem(
            "Herdeiro salvo com sucesso.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function editarHerdeiro(id) {

    let herdeiros =
        inventarioAtual.heirs || [];

    let herdeiro =
        herdeiros.find(function (item) {
            return item.id === id;
        });

    if (!herdeiro) {
        return;
    }

    document.getElementById("herdeiro-id").value =
        herdeiro.id;

    document.getElementById("herdeiro-nome").value =
        herdeiro.name || "";

    document.getElementById("herdeiro-cpf").value =
        herdeiro.cpf || "";

    document.getElementById("herdeiro-identidade").value =
        herdeiro.identity_document || "";

    document.getElementById("herdeiro-endereco").value =
        herdeiro.address || "";

    document.getElementById("herdeiro-parentesco").value =
        herdeiro.kinship_degree || "";
}


async function removerHerdeiro(id) {

    if (
        !confirm(
            "Deseja excluir este herdeiro?"
        )
    ) {
        return;
    }

    try {

        await excluirHerdeiro(id);

        await carregarInventario();

        mostrarMensagem(
            "Herdeiro excluído.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Bens
   ========================================== */

async function salvarBem(evento) {

    evento.preventDefault();

    let formulario =
        document.getElementById("form-bem");

    if (!confirmarCamposVazios(formulario)) {
        return;
    }

    let id =
        document.getElementById("bem-id").value;

    let condominio =
        booleanoOuNull(
            document.getElementById("bem-condominio").value
        );

    let percentual;

    if (condominio === false) {

        percentual = 100;

    } else {

        percentual =
            numeroOuNull(
                document.getElementById("bem-percentual").value
            );
    }


    let dados = {

        deceased_id:
            Number(falecidoId),

        description:
            valorOuNull(
                document.getElementById("bem-descricao").value
            ),

        value:
            numeroOuNull(
                document.getElementById("bem-valor").value
            ),

        is_condominium:
            condominio,

        ownership_percentage:
            percentual
    };


    try {

        if (id) {

            delete dados.deceased_id;

            await atualizarBem(
                id,
                dados
            );

        } else {

            await cadastrarBem(dados);
        }

        formulario.reset();

        document
            .getElementById("bem-id")
            .value = "";

        document
            .getElementById("campo-percentual")
            .style.display = "none";

        await carregarInventario();

        mostrarMensagem(
            "Bem salvo com sucesso.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function alterarCampoCondominio() {

    let valor =
        document.getElementById("bem-condominio").value;

    let campo =
        document.getElementById("campo-percentual");

    if (valor === "true") {

        campo.style.display = "block";

    } else {

        campo.style.display = "none";

        if (valor === "false") {

            document
                .getElementById("bem-percentual")
                .value = "100";
        }
    }
}


function editarBem(id) {

    let bens =
        inventarioAtual.assets || [];

    let bem =
        bens.find(function (item) {
            return item.id === id;
        });

    if (!bem) {
        return;
    }

    document.getElementById("bem-id").value =
        bem.id;

    document.getElementById("bem-descricao").value =
        bem.description || "";

    document.getElementById("bem-valor").value =
        bem.value === null
            ? ""
            : bem.value;


    if (bem.is_condominium === null) {

        document.getElementById("bem-condominio").value =
            "";

    } else {

        document.getElementById("bem-condominio").value =
            String(bem.is_condominium);
    }


    document.getElementById("bem-percentual").value =
        bem.ownership_percentage === null
            ? ""
            : bem.ownership_percentage;

    alterarCampoCondominio();
}


async function removerBem(id) {

    if (
        !confirm(
            "Deseja excluir este bem?"
        )
    ) {
        return;
    }

    try {

        await excluirBem(id);

        await carregarInventario();

        mostrarMensagem(
            "Bem excluído.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Dívidas
   ========================================== */

async function salvarDivida(evento) {

    evento.preventDefault();

    let formulario =
        document.getElementById("form-divida");

    if (!confirmarCamposVazios(formulario)) {
        return;
    }

    let id =
        document.getElementById("divida-id").value;

    let dados = {

        deceased_id:
            Number(falecidoId),

        description:
            valorOuNull(
                document.getElementById("divida-descricao").value
            ),

        creditor:
            valorOuNull(
                document.getElementById("divida-credor").value
            ),

        value:
            numeroOuNull(
                document.getElementById("divida-valor").value
            )
    };


    try {

        if (id) {

            delete dados.deceased_id;

            await atualizarDivida(
                id,
                dados
            );

        } else {

            await cadastrarDivida(dados);
        }

        formulario.reset();

        document
            .getElementById("divida-id")
            .value = "";

        await carregarInventario();

        mostrarMensagem(
            "Dívida salva com sucesso.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


function editarDivida(id) {

    let dividas =
        inventarioAtual.debts || [];

    let divida =
        dividas.find(function (item) {
            return item.id === id;
        });

    if (!divida) {
        return;
    }

    document.getElementById("divida-id").value =
        divida.id;

    document.getElementById("divida-descricao").value =
        divida.description || "";

    document.getElementById("divida-credor").value =
        divida.creditor || "";

    document.getElementById("divida-valor").value =
        divida.value === null
            ? ""
            : divida.value;
}


async function removerDivida(id) {

    if (
        !confirm(
            "Deseja excluir esta dívida?"
        )
    ) {
        return;
    }

    try {

        await excluirDivida(id);

        await carregarInventario();

        mostrarMensagem(
            "Dívida excluída.",
            "sucesso"
        );

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Carregamento do Inventário
   ========================================== */

async function carregarInventario() {

    if (!falecidoId) {
        return;
    }

    try {

        inventarioAtual =
            await buscarInventario(falecidoId);

        if (!inventarioAtual) {
            inventarioAtual = {};
        }


        if (!Array.isArray(inventarioAtual.heirs)) {
            inventarioAtual.heirs = [];
        }

        if (!Array.isArray(inventarioAtual.assets)) {
            inventarioAtual.assets = [];
        }

        if (!Array.isArray(inventarioAtual.debts)) {
            inventarioAtual.debts = [];
        }

        if (!inventarioAtual.summary) {
            inventarioAtual.summary = {};
        }


        preencherFalecido();

        preencherConjuge();

        renderizarHerdeiros();

        renderizarBens();

        renderizarDividas();

        atualizarResumoLateral();

        atualizarTelasDeResumo();

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Preenchimento dos Formulários
   ========================================== */

function preencherFalecido() {

    let falecido =
        inventarioAtual.deceased;

    if (!falecido) {
        return;
    }

    document.getElementById("falecido-nome").value =
        falecido.name || "";

    document.getElementById("falecido-data").value =
        falecido.date_of_death || "";

    document.getElementById("falecido-cpf").value =
        falecido.cpf || "";

    document.getElementById("falecido-identidade").value =
        falecido.identity_document || "";

    document.getElementById("falecido-endereco").value =
        falecido.last_address || "";

    document.getElementById("falecido-estado-civil").value =
        falecido.marital_status || "";

    document.getElementById("falecido-regime").value =
        falecido.property_regime || "";


    if (
        falecido.has_will === null ||
        falecido.has_will === undefined
    ) {

        document.getElementById("falecido-testamento").value =
            "";

    } else {

        document.getElementById("falecido-testamento").value =
            String(falecido.has_will);
    }
}


function preencherConjuge() {

    let conjuge =
        inventarioAtual.spouse;

    if (!conjuge) {

        document
            .getElementById("form-conjuge")
            .reset();

        document
            .getElementById("conjuge-id")
            .value = "";

        return;
    }

    document.getElementById("conjuge-id").value =
        conjuge.id;

    document.getElementById("conjuge-nome").value =
        conjuge.name || "";

    document.getElementById("conjuge-cpf").value =
        conjuge.cpf || "";

    document.getElementById("conjuge-identidade").value =
        conjuge.identity_document || "";

    document.getElementById("conjuge-endereco").value =
        conjuge.address || "";
}


/* ==========================================
   Listas
   ========================================== */

function renderizarHerdeiros() {

    let lista =
        document.getElementById("lista-herdeiros");

    lista.innerHTML = "";

    let herdeiros =
        inventarioAtual.heirs || [];

    herdeiros.forEach(function (herdeiro) {

        lista.innerHTML += `
            <div class="card">

                <h4>
                    ${escaparHtml(
            herdeiro.name || "Sem nome"
        )}
                </h4>

                <p>
                    CPF:
                    ${escaparHtml(
            herdeiro.cpf || "-"
        )}
                </p>

                <p>
                    Parentesco:
                    ${escaparHtml(
            herdeiro.kinship_degree || "-"
        )}
                </p>

                <div class="card-acoes">

                    <button
                        class="btn-editar"
                        onclick="editarHerdeiro(${herdeiro.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="removerHerdeiro(${herdeiro.id})"
                    >
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}


function renderizarBens() {

    let lista =
        document.getElementById("lista-bens");

    lista.innerHTML = "";

    let bens =
        inventarioAtual.assets || [];

    bens.forEach(function (bem) {

        lista.innerHTML += `
            <div class="card">

                <h4>
                    ${escaparHtml(
            bem.description || "Bem sem descrição"
        )}
                </h4>

                <p>
                    Valor:
                    ${formatarMoeda(bem.value)}
                </p>

                <p>
                    Percentual do falecido:
                    ${bem.ownership_percentage ?? "-"}%
                </p>

                <div class="card-acoes">

                    <button
                        class="btn-editar"
                        onclick="editarBem(${bem.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="removerBem(${bem.id})"
                    >
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}


function renderizarDividas() {

    let lista =
        document.getElementById("lista-dividas");

    lista.innerHTML = "";

    let dividas =
        inventarioAtual.debts || [];

    dividas.forEach(function (divida) {

        lista.innerHTML += `
            <div class="card">

                <h4>
                    ${escaparHtml(
            divida.description || "Dívida sem descrição"
        )}
                </h4>

                <p>
                    Credor:
                    ${escaparHtml(
            divida.creditor || "-"
        )}
                </p>

                <p>
                    Valor:
                    ${formatarMoeda(divida.value)}
                </p>

                <div class="card-acoes">

                    <button
                        class="btn-editar"
                        onclick="editarDivida(${divida.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="removerDivida(${divida.id})"
                    >
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}


/* ==========================================
   Resumo Lateral
   ========================================== */

function atualizarResumoLateral() {

    let resumo =
        inventarioAtual.summary || {};

    let herdeiros =
        inventarioAtual.heirs || [];

    let bens =
        inventarioAtual.assets || [];

    let dividas =
        inventarioAtual.debts || [];


    document.getElementById("resumo-nome").textContent =
        inventarioAtual.deceased?.name ||
        "Não informado";


    document.getElementById("resumo-herdeiros").textContent =
        herdeiros.length;


    document.getElementById("resumo-bens").textContent =
        bens.length;


    document.getElementById("resumo-dividas").textContent =
        dividas.length;


    document.getElementById("resumo-liquido").textContent =
        formatarMoeda(
            resumo.net_estate_value
        );
}


/* ==========================================
   Partilha e Auto de Orçamento
   ========================================== */

function atualizarTelasDeResumo() {

    if (!inventarioAtual) {
        return;
    }

    let resumo =
        inventarioAtual.summary || {};


    document
        .querySelectorAll(".valor-bens")
        .forEach(function (elemento) {

            elemento.textContent =
                formatarMoeda(
                    resumo.total_deceased_value
                );
        });


    document
        .querySelectorAll(".valor-dividas")
        .forEach(function (elemento) {

            elemento.textContent =
                formatarMoeda(
                    resumo.total_debt_value
                );
        });


    document
        .querySelectorAll(".valor-liquido")
        .forEach(function (elemento) {

            elemento.textContent =
                formatarMoeda(
                    resumo.net_estate_value
                );
        });


    renderizarPartilha();

    renderizarPagamento();
}


function renderizarPartilha() {

    let corpo =
        document.getElementById(
            "tabela-partilha-corpo"
        );

    corpo.innerHTML = "";

    let valor =
        inventarioAtual.summary
            ?.equal_share_estimate;

    let herdeiros =
        inventarioAtual.heirs || [];


    herdeiros.forEach(function (herdeiro) {

        corpo.innerHTML += `
            <tr>

                <td>
                    ${escaparHtml(
            herdeiro.name || "-"
        )}
                </td>

                <td>
                    ${escaparHtml(
            herdeiro.kinship_degree || "-"
        )}
                </td>

                <td>
                    ${formatarMoeda(valor)}
                </td>

            </tr>
        `;
    });
}


function renderizarPagamento() {

    let corpo =
        document.getElementById(
            "tabela-pagamento-corpo"
        );

    corpo.innerHTML = "";


    if (inventarioAtual.spouse) {

        corpo.innerHTML += `
            <tr>

                <td>
                    ${escaparHtml(
            inventarioAtual.spouse.name || "-"
        )}
                </td>

                <td>
                    Cônjuge / Meeiro
                </td>

                <td>
                    A definir
                </td>

            </tr>
        `;
    }


    let valor =
        inventarioAtual.summary
            ?.equal_share_estimate;

    let herdeiros =
        inventarioAtual.heirs || [];


    herdeiros.forEach(function (herdeiro) {

        corpo.innerHTML += `
            <tr>

                <td>
                    ${escaparHtml(
            herdeiro.name || "-"
        )}
                </td>

                <td>
                    Herdeiro
                </td>

                <td>
                    ${formatarMoeda(valor)}
                </td>

            </tr>
        `;
    });
}


/* ==========================================
   ITCM
   ========================================== */

async function calcularITD() {

    if (!inventarioAtual) {
        return;
    }

    let base =
        Number(
            inventarioAtual.summary
                ?.net_estate_value || 0
        );


    try {

        let resultado =
            await estimarITD(base);


        document.getElementById("itd-base").textContent =
            formatarMoeda(
                resultado.base_value
            );


        document.getElementById("itd-ufir").textContent =
            Number(
                resultado.base_in_ufir || 0
            ).toLocaleString(
                "pt-BR",
                {
                    maximumFractionDigits: 2
                }
            );


        document.getElementById("itd-aliquota").textContent =
            (
                Number(
                    resultado.rate || 0
                ) * 100
            ).toLocaleString("pt-BR") +
            "%";


        document.getElementById("itd-valor").textContent =
            formatarMoeda(
                resultado.estimated_tax
            );


        document.getElementById("resultado-itd").style.display =
            "block";

    } catch (erro) {

        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}


/* ==========================================
   Novo Inventário
   ========================================== */

function novoInventario() {

    let confirmar =
        confirm(
            "Deseja iniciar um novo preenchimento? " +
            "Os dados já salvos no backend não serão apagados."
        );

    if (!confirmar) {
        return;
    }

    localStorage.removeItem(
        "falecidoId"
    );

    falecidoId = null;

    inventarioAtual = null;

    location.reload();
}