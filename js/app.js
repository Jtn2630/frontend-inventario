/* ==============================================================
   ARQUIVO: js/app.js
   Controle da interface e integração com a API
   ============================================================== */

/* ==============================================================
   VARIÁVEIS GLOBAIS
   ============================================================== */
let etapaAtual = 0;
const totalEtapas = 9;
let falecidoId = null;
let inventarioAtual = null;
let semDividasMarcado = false;

/* ==============================================================
   INICIALIZAÇÃO DA APLICAÇÃO
   ============================================================== */
document.addEventListener("DOMContentLoaded", iniciarAplicacao);

async function iniciarAplicacao() {
    registrarEventos();
    inicializarCamposMoeda();
    mostrarEtapa(0);
    await verificarConexao();
    await atualizarListaInventarios();
}

/* ==============================================================
   REGISTRO DE EVENTOS
   ============================================================== */
function registrarEvento(id, evento, funcao) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.addEventListener(evento, funcao);
    }
}

function registrarEventos() {
    registrarEvento("btn-menu", "click", alternarMenu);
    registrarEvento("btn-anterior", "click", etapaAnterior);
    registrarEvento("btn-proximo", "click", proximaEtapa);
    registrarEvento("btn-novo", "click", novoInventario);
    registrarEvento("btn-carregar-inventario", "click", carregarInventarioSalvo);
    registrarEvento("btn-calcular-meacao", "click", calcularMeacao);
    registrarEvento("btn-calcular-itd", "click", calcularITD);
    registrarEvento("btn-excluir-conjuge", "click", removerConjugeAtual);
    registrarEvento("form-falecido", "submit", salvarFalecido);
    registrarEvento("form-conjuge", "submit", salvarConjuge);
    registrarEvento("form-herdeiro", "submit", salvarHerdeiro);
    registrarEvento("form-bem", "submit", salvarBem);
    registrarEvento("form-divida", "submit", salvarDivida);
    registrarEvento("falecido-regime", "change", alterarCampoParticipacao);
    registrarEvento("bem-condominio", "change", alterarCampoCondominio);
    registrarEvento("conjuge-mesmo-endereco", "change", alterarEnderecoConjuge);
    registrarEvento("herdeiro-mesmo-endereco", "change", alterarEnderecoHerdeiro);
    registrarEvento("divida-sem-dividas", "change", alterarSemDividas);

    document.querySelectorAll(".item-menu").forEach(function (item) {
        item.addEventListener("click", function () {
            mostrarEtapa(Number(item.dataset.etapa));
        });
    });

    registrarMascarasCPF();
    registrarMascarasMoeda();
}

/* ==============================================================
   MÁSCARA DE CPF
   ============================================================== */
function registrarMascarasCPF() {
    ["falecido-cpf", "conjuge-cpf", "herdeiro-cpf"].forEach(function (id) {
        const campo = document.getElementById(id);
        if (!campo) {
            return;
        }
        campo.addEventListener("input", function () {
            campo.value = formatarCPF(campo.value);
        });
    });
}

function somenteNumeros(valor) {
    return String(valor ?? "").replace(/\D/g, "");
}

function formatarCPF(valor) {
    const numeros = somenteNumeros(valor).slice(0, 11);
    if (numeros.length <= 3) {
        return numeros;
    }
    if (numeros.length <= 6) {
        return numeros.slice(0, 3) + "." + numeros.slice(3);
    }
    if (numeros.length <= 9) {
        return numeros.slice(0, 3) + "." + numeros.slice(3, 6) + "." + numeros.slice(6);
    }
    return (
        numeros.slice(0, 3) +
        "." +
        numeros.slice(3, 6) +
        "." +
        numeros.slice(6, 9) +
        "-" +
        numeros.slice(9, 11)
    );
}

function cpfParaApi(valor) {
    const numeros = somenteNumeros(valor);
    return numeros === "" ? null : numeros;
}

/* ==============================================================
   MÁSCARA DE MOEDA
   ============================================================== */
function inicializarCamposMoeda() {
    ["bem-valor", "divida-valor"].forEach(function (id) {
        const campo = document.getElementById(id);
        if (campo && !campo.value) {
            campo.value = "R$ 0,00";
        }
    });
}

function registrarMascarasMoeda() {
    ["bem-valor", "divida-valor"].forEach(function (id) {
        const campo = document.getElementById(id);
        if (!campo) {
            return;
        }

        campo.addEventListener("focus", function () {
            if (!campo.value) {
                campo.value = "R$ 0,00";
            }
            posicionarCursorAntesDaVirgula(campo);
        });

        campo.addEventListener("click", function () {
            posicionarCursorAntesDaVirgula(campo);
        });

        campo.addEventListener("input", function () {
            aplicarMascaraMoeda(campo);
            posicionarCursorAntesDaVirgula(campo);
        });

        campo.addEventListener("blur", function () {
            const valor = converterMoedaParaNumero(campo.value);
            campo.value = formatarMoeda(valor || 0);
        });
    });
}

function posicionarCursorAntesDaVirgula(campo) {
    const posicaoVirgula = campo.value.indexOf(",");
    if (posicaoVirgula < 0) {
        return;
    }
    window.requestAnimationFrame(function () {
        try {
            campo.setSelectionRange(posicaoVirgula, posicaoVirgula);
        } catch {
            return;
        }
    });
}

function aplicarMascaraMoeda(campo) {
    let texto = String(campo.value ?? "")
        .replace(/R\$/g, "")
        .trim();

    if (texto === "") {
        campo.value = "R$ 0,00";
        return;
    }

    const partes = texto.split(",");
    let parteInteira = partes[0]
        .replace(/\./g, "")
        .replace(/\D/g, "");

    if (parteInteira === "") {
        parteInteira = "0";
    }

    parteInteira = parteInteira.replace(/^0+(?=\d)/, "");

    const inteiroFormatado = Number(parteInteira).toLocaleString("pt-BR");
    campo.value = "R$ " + inteiroFormatado + ",00";
}

function converterMoedaParaNumero(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }

    let texto = String(valor)
        .trim()
        .replace(/R\$/g, "")
        .replace(/\s/g, "");

    if (texto === "") {
        return null;
    }

    texto = texto
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^0-9.-]/g, "");

    const numero = Number(texto);
    return Number.isNaN(numero) ? null : numero;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

/* ==============================================================
   FUNÇÕES AUXILIARES
   ============================================================== */
function valorOuNull(valor) {
    const texto = String(valor ?? "").trim();
    return texto === "" ? null : texto;
}

function numeroOuNull(valor) {
    if (valor === "" || valor === null || valor === undefined) {
        return null;
    }
    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero;
}

function booleanoOuNull(valor) {
    if (valor === "true") {
        return true;
    }
    if (valor === "false") {
        return false;
    }
    return null;
}

function formatarPercentual(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "%";
}

function formatarData(valor) {
    if (!valor) {
        return "-";
    }
    const partes = String(valor).split("-");
    if (partes.length !== 3) {
        return valor;
    }
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function escaparHtml(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
        const mapa = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return mapa[caractere];
    });
}

function nomeRegime(valor) {
    const regimes = {
        comunhao_universal: "Comunhão Universal",
        comunhao_parcial: "Comunhão Parcial",
        separacao_convencional: "Separação Total / Convencional",
        separacao_obrigatoria: "Separação Obrigatória",
        participacao_final_aquestos: "Participação Final nos Aquestos"
    };
    return regimes[valor] || "Não informado";
}

function nomeParentesco(valor) {
    const parentescos = {
        filho: "Filho(a)",
        neto: "Neto(a)",
        pai: "Pai",
        mae: "Mãe",
        avo: "Avô / Avó",
        irmao: "Irmão / Irmã",
        sobrinho: "Sobrinho(a)"
    };
    return parentescos[valor] || valor || "Não informado";
}

function exigirFalecido() {
    if (falecidoId) {
        return true;
    }
    mostrarMensagem("Salve primeiro os dados do falecido.", "erro");
    mostrarEtapa(0);
    return false;
}

function obterEnderecoFalecido() {
    return (
        inventarioAtual?.deceased?.last_address ||
        valorOuNull(document.getElementById("falecido-endereco").value)
    );
}

/* ==============================================================
   CONEXÃO COM A API
   ============================================================== */
async function verificarConexao() {
    const status = document.getElementById("status-api");
    try {
        await verificarApi();
        status.textContent = "API conectada";
        status.className = "status-api conectado";
    } catch (erro) {
        console.error(erro);
        status.textContent = "API não conectada";
        status.className = "status-api desconectado";
    }
}

/* ==============================================================
   NAVEGAÇÃO ENTRE ETAPAS
   ============================================================== */
function mostrarEtapa(numero) {
    if (numero < 0) {
        numero = 0;
    }
    if (numero >= totalEtapas) {
        numero = totalEtapas - 1;
    }

    etapaAtual = numero;

    document.querySelectorAll(".etapa").forEach(function (etapa) {
        etapa.classList.toggle(
            "ativa",
            Number(etapa.dataset.etapa) === etapaAtual
        );
    });

    document.querySelectorAll(".item-menu").forEach(function (item) {
        item.classList.toggle(
            "ativa",
            Number(item.dataset.etapa) === etapaAtual
        );
    });

    const anterior = document.getElementById("btn-anterior");
    const proximo = document.getElementById("btn-proximo");

    if (anterior) {
        anterior.style.visibility = etapaAtual === 0 ? "hidden" : "visible";
    }

    if (proximo) {
        proximo.textContent =
            etapaAtual === totalEtapas - 1
                ? "Finalizar"
                : "Avançar";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function proximaEtapa() {
    if (etapaAtual === totalEtapas - 1) {
        finalizarInventario();
        return;
    }
    mostrarEtapa(etapaAtual + 1);
}

function etapaAnterior() {
    mostrarEtapa(etapaAtual - 1);
}

function alternarMenu() {
    document.body.classList.toggle("menu-fechado");

    const botao = document.getElementById("btn-menu");
    if (botao) {
        botao.textContent =
            document.body.classList.contains("menu-fechado")
                ? "›"
                : "‹";
    }
}

/* ==============================================================
   MENSAGENS DA INTERFACE
   ============================================================== */
function mostrarMensagem(texto, tipo = "sucesso") {
    const mensagem = document.getElementById("mensagem-geral");
    if (!mensagem) {
        return;
    }
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo + " visivel";
}

/* ==============================================================
   INVENTÁRIOS SALVOS
   ============================================================== */
async function atualizarListaInventarios() {
    const seletor = document.getElementById("inventario-anterior");

    if (!seletor) {
        return;
    }

    seletor.innerHTML =
        '<option value="">Selecione um inventário</option>';

    try {
        const inventarios = await buscarFalecidos();

        if (!Array.isArray(inventarios)) {
            throw new Error("A API não retornou uma lista.");
        }

        inventarios.forEach(function (falecido) {
            const option = document.createElement("option");
            option.value = String(falecido.id);
            option.textContent =
                (falecido.name || "Inventário sem nome") +
                " - ID " +
                falecido.id;

            seletor.appendChild(option);
        });

        if (falecidoId) {
            seletor.value = String(falecidoId);
        }
    } catch (erro) {
        console.error(erro);
        mostrarMensagem(
            "Erro ao carregar inventários: " + erro.message,
            "erro"
        );
    }
}

async function carregarInventarioSalvo() {
    const seletor = document.getElementById("inventario-anterior");
    const id = seletor.value;

    if (!id) {
        mostrarMensagem(
            "Selecione um inventário salvo.",
            "aviso"
        );
        return;
    }

    falecidoId = Number(id);
    semDividasMarcado = false;

    await carregarInventario();
    mostrarEtapa(0);
}

/* ==============================================================
   FALECIDO
   ============================================================== */
async function salvarFalecido(evento) {
    evento.preventDefault();

    const dados = {
        name: valorOuNull(document.getElementById("falecido-nome").value),
        date_of_death: valorOuNull(document.getElementById("falecido-data").value),
        cpf: cpfParaApi(document.getElementById("falecido-cpf").value),
        identity_document: valorOuNull(document.getElementById("falecido-identidade").value),
        last_address: valorOuNull(document.getElementById("falecido-endereco").value),
        marital_status: valorOuNull(document.getElementById("falecido-estado-civil").value),
        property_regime: valorOuNull(document.getElementById("falecido-regime").value),
        has_will: booleanoOuNull(document.getElementById("falecido-testamento").value)
    };

    try {
        if (falecidoId) {
            await atualizarFalecido(
                falecidoId,
                dados
            );
        } else {
            const resposta =
                await cadastrarFalecido(dados);

            falecidoId = resposta.id;
        }

        await carregarInventario();
        await atualizarListaInventarios();

        mostrarMensagem(
            "Dados do falecido salvos com sucesso."
        );
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

function editarFalecido() {
    mostrarEtapa(0);

    document
        .getElementById("form-falecido")
        .scrollIntoView({
            behavior: "smooth"
        });
}

/* ==============================================================
   CÔNJUGE OU COMPANHEIRO
   ============================================================== */
async function salvarConjuge(evento) {
    evento.preventDefault();

    if (!exigirFalecido()) {
        return;
    }

    const id = document.getElementById("conjuge-id").value;
    const regime = document.getElementById("falecido-regime").value;
    const mesmoEndereco =
        document.getElementById("conjuge-mesmo-endereco").checked;

    const dados = {
        deceased_id: Number(falecidoId),
        name: valorOuNull(document.getElementById("conjuge-nome").value),
        cpf: cpfParaApi(document.getElementById("conjuge-cpf").value),
        identity_document: valorOuNull(document.getElementById("conjuge-identidade").value),
        address: mesmoEndereco
            ? obterEnderecoFalecido()
            : valorOuNull(document.getElementById("conjuge-endereco").value),
        marriage_date: valorOuNull(document.getElementById("conjuge-data-casamento").value),
        participation_percentage:
            regime === "participacao_final_aquestos"
                ? numeroOuNull(document.getElementById("conjuge-participacao").value)
                : null
    };

    try {
        if (id) {
            delete dados.deceased_id;
            await atualizarConjuge(
                id,
                dados
            );
        } else {
            await cadastrarConjuge(
                dados
            );
        }

        await carregarInventario();

        mostrarMensagem(
            "Cônjuge salvo com sucesso."
        );
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

function alterarCampoParticipacao() {
    const campo = document.getElementById("campo-participacao");
    const regime = document.getElementById("falecido-regime").value;

    campo.style.display =
        regime === "participacao_final_aquestos"
            ? "block"
            : "none";
}

function alterarEnderecoConjuge() {
    const checkbox = document.getElementById("conjuge-mesmo-endereco");
    const campo = document.getElementById("conjuge-endereco");

    if (checkbox.checked) {
        campo.value = obterEnderecoFalecido() || "";
        campo.disabled = true;
    } else {
        campo.disabled = false;
    }
}

function editarConjuge() {
    mostrarEtapa(1);

    document
        .getElementById("form-conjuge")
        .scrollIntoView({
            behavior: "smooth"
        });
}

async function removerConjugeAtual() {
    const id = document.getElementById("conjuge-id").value;

    if (!id) {
        mostrarMensagem(
            "Não há cônjuge cadastrado para excluir.",
            "erro"
        );
        return;
    }

    if (!confirm("Deseja excluir o cônjuge cadastrado?")) {
        return;
    }

    try {
        await excluirConjuge(id);
        await carregarInventario();
        mostrarMensagem("Cônjuge excluído.");
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

/* ==============================================================
   HERDEIROS
   ============================================================== */
async function salvarHerdeiro(evento) {
    evento.preventDefault();

    if (!exigirFalecido()) {
        return;
    }

    const formulario = document.getElementById("form-herdeiro");
    const id = document.getElementById("herdeiro-id").value;
    const mesmoEndereco =
        document.getElementById("herdeiro-mesmo-endereco").checked;

    const dados = {
        deceased_id: Number(falecidoId),
        name: valorOuNull(document.getElementById("herdeiro-nome").value),
        cpf: cpfParaApi(document.getElementById("herdeiro-cpf").value),
        identity_document: valorOuNull(document.getElementById("herdeiro-identidade").value),
        address: mesmoEndereco
            ? obterEnderecoFalecido()
            : valorOuNull(document.getElementById("herdeiro-endereco").value),
        kinship_degree: valorOuNull(document.getElementById("herdeiro-parentesco").value)
    };

    try {
        if (id) {
            delete dados.deceased_id;
            await atualizarHerdeiro(
                id,
                dados
            );
        } else {
            await cadastrarHerdeiro(
                dados
            );
        }

        formulario.reset();
        document.getElementById("herdeiro-id").value = "";
        document.getElementById("herdeiro-endereco").disabled = false;

        await carregarInventario();

        mostrarMensagem(
            "Herdeiro salvo com sucesso."
        );
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

function alterarEnderecoHerdeiro() {
    const checkbox = document.getElementById("herdeiro-mesmo-endereco");
    const campo = document.getElementById("herdeiro-endereco");

    if (checkbox.checked) {
        campo.value = obterEnderecoFalecido() || "";
        campo.disabled = true;
    } else {
        campo.disabled = false;
    }
}

function editarHerdeiro(id) {
    const herdeiro =
        inventarioAtual.heirs.find(
            function (item) {
                return item.id === id;
            }
        );

    if (!herdeiro) {
        return;
    }

    document.getElementById("herdeiro-id").value = herdeiro.id;
    document.getElementById("herdeiro-nome").value = herdeiro.name || "";
    document.getElementById("herdeiro-cpf").value =
        formatarCPF(herdeiro.cpf || "");
    document.getElementById("herdeiro-identidade").value =
        herdeiro.identity_document || "";
    document.getElementById("herdeiro-endereco").value =
        herdeiro.address || "";
    document.getElementById("herdeiro-parentesco").value =
        herdeiro.kinship_degree || "";

    const mesmoEndereco =
        Boolean(obterEnderecoFalecido()) &&
        herdeiro.address === obterEnderecoFalecido();

    document.getElementById("herdeiro-mesmo-endereco").checked =
        mesmoEndereco;

    alterarEnderecoHerdeiro();
    mostrarEtapa(1);
}

async function removerHerdeiro(id) {
    if (!confirm("Deseja excluir este herdeiro?")) {
        return;
    }

    try {
        await excluirHerdeiro(id);
        await carregarInventario();
        mostrarMensagem("Herdeiro excluído.");
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

/* ==============================================================
   BENS
   ============================================================== */
async function salvarBem(evento) {
    evento.preventDefault();

    if (!exigirFalecido()) {
        return;
    }

    const formulario = document.getElementById("form-bem");
    const id = document.getElementById("bem-id").value;
    const condominio =
        booleanoOuNull(
            document.getElementById("bem-condominio").value
        );

    const dados = {
        deceased_id: Number(falecidoId),
        description: valorOuNull(document.getElementById("bem-descricao").value),
        value: converterMoedaParaNumero(document.getElementById("bem-valor").value),
        is_condominium: condominio,
        ownership_percentage:
            condominio === true
                ? numeroOuNull(document.getElementById("bem-percentual").value)
                : 100,
        acquisition_date: valorOuNull(document.getElementById("bem-data-aquisicao").value),
        is_private: booleanoOuNull(document.getElementById("bem-particular").value)
    };

    try {
        if (id) {
            delete dados.deceased_id;
            await atualizarBem(
                id,
                dados
            );
        } else {
            await cadastrarBem(
                dados
            );
        }

        formulario.reset();

        document.getElementById("bem-id").value = "";
        document.getElementById("bem-condominio").value = "false";
        document.getElementById("bem-particular").value = "false";
        document.getElementById("bem-valor").value = "R$ 0,00";

        alterarCampoCondominio();

        await carregarInventario();

        mostrarMensagem(
            "Bem salvo com sucesso."
        );
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

function alterarCampoCondominio() {
    const valor = document.getElementById("bem-condominio").value;
    const campo = document.getElementById("campo-percentual");

    campo.style.display =
        valor === "true"
            ? "block"
            : "none";

    if (valor !== "true") {
        document.getElementById("bem-percentual").value =
            valor === "false"
                ? "100"
                : "";
    }
}

function editarBem(id) {
    const bem =
        inventarioAtual.assets.find(
            function (item) {
                return item.id === id;
            }
        );

    if (!bem) {
        return;
    }

    document.getElementById("bem-id").value = bem.id;
    document.getElementById("bem-descricao").value =
        bem.description || "";
    document.getElementById("bem-valor").value =
        formatarMoeda(bem.value);
    document.getElementById("bem-data-aquisicao").value =
        bem.acquisition_date || "";
    document.getElementById("bem-particular").value =
        bem.is_private === null ||
        bem.is_private === undefined
            ? ""
            : String(bem.is_private);
    document.getElementById("bem-condominio").value =
        bem.is_condominium === null ||
        bem.is_condominium === undefined
            ? ""
            : String(bem.is_condominium);
    document.getElementById("bem-percentual").value =
        bem.ownership_percentage ?? "";

    alterarCampoCondominio();
    mostrarEtapa(2);
}

async function removerBem(id) {
    if (!confirm("Deseja excluir este bem?")) {
        return;
    }

    try {
        await excluirBem(id);
        await carregarInventario();
        mostrarMensagem("Bem excluído.");
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

/* ==============================================================
   DÍVIDAS
   ============================================================== */
function alterarSemDividas() {
    const checkbox =
        document.getElementById("divida-sem-dividas");

    const temDividas =
        (inventarioAtual?.debts || []).length > 0;

    if (checkbox.checked && temDividas) {
        checkbox.checked = false;

        mostrarMensagem(
            "Existem dívidas cadastradas. Exclua-as antes de marcar 'Sem dívidas'.",
            "aviso"
        );

        return;
    }

    semDividasMarcado = checkbox.checked;

    [
        "divida-descricao",
        "divida-credor",
        "divida-valor"
    ].forEach(function (id) {
        const campo = document.getElementById(id);

        campo.disabled =
            semDividasMarcado;

        if (semDividasMarcado) {
            campo.value =
                id === "divida-valor"
                    ? "R$ 0,00"
                    : "";
        }
    });

    document.getElementById("btn-salvar-divida").textContent =
        semDividasMarcado
            ? "Confirmar sem dívidas"
            : "Salvar dívida";

    renderizarDividas();
}

async function salvarDivida(evento) {
    evento.preventDefault();

    if (!exigirFalecido()) {
        return;
    }

    if (semDividasMarcado) {
        renderizarDividas();

        mostrarMensagem(
            "Informação de ausência de dívidas registrada."
        );

        return;
    }

    const formulario =
        document.getElementById("form-divida");

    const id =
        document.getElementById("divida-id").value;

    const dados = {
        deceased_id: Number(falecidoId),
        description: valorOuNull(document.getElementById("divida-descricao").value),
        creditor: valorOuNull(document.getElementById("divida-credor").value),
        value: converterMoedaParaNumero(document.getElementById("divida-valor").value)
    };

    try {
        if (id) {
            delete dados.deceased_id;
            await atualizarDivida(
                id,
                dados
            );
        } else {
            await cadastrarDivida(
                dados
            );
        }

        formulario.reset();

        document.getElementById("divida-id").value = "";
        document.getElementById("divida-valor").value = "R$ 0,00";

        semDividasMarcado = false;

        alterarSemDividas();

        await carregarInventario();

        mostrarMensagem(
            "Dívida salva com sucesso."
        );
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

function editarDivida(id) {
    const divida =
        inventarioAtual.debts.find(
            function (item) {
                return item.id === id;
            }
        );

    if (!divida) {
        return;
    }

    semDividasMarcado = false;

    document.getElementById("divida-sem-dividas").checked = false;

    alterarSemDividas();

    document.getElementById("divida-id").value = divida.id;
    document.getElementById("divida-descricao").value =
        divida.description || "";
    document.getElementById("divida-credor").value =
        divida.creditor || "";
    document.getElementById("divida-valor").value =
        formatarMoeda(divida.value);

    mostrarEtapa(3);
}

async function removerDivida(id) {
    if (!confirm("Deseja excluir esta dívida?")) {
        return;
    }

    try {
        await excluirDivida(id);
        await carregarInventario();
        mostrarMensagem("Dívida excluída.");
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

/* ==============================================================
   CARREGAMENTO DO INVENTÁRIO
   ============================================================== */
async function carregarInventario() {
    if (!falecidoId) {
        return;
    }

    try {
        inventarioAtual =
            await buscarInventario(falecidoId);

        inventarioAtual.heirs =
            Array.isArray(inventarioAtual.heirs)
                ? inventarioAtual.heirs
                : [];

        inventarioAtual.assets =
            Array.isArray(inventarioAtual.assets)
                ? inventarioAtual.assets
                : [];

        inventarioAtual.debts =
            Array.isArray(inventarioAtual.debts)
                ? inventarioAtual.debts
                : [];

        inventarioAtual.summary =
            inventarioAtual.summary || {};

        preencherFalecido();
        preencherConjuge();

        renderizarFalecido();
        renderizarConjuge();
        renderizarHerdeiros();
        renderizarBens();
        renderizarDividas();

        atualizarResumoLateral();
        atualizarTelasDeResumo();

        const seletor =
            document.getElementById("inventario-anterior");

        if (seletor) {
            seletor.value =
                String(falecidoId);
        }
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

/* ==============================================================
   PREENCHIMENTO DOS FORMULÁRIOS
   ============================================================== */
function preencherFalecido() {
    const falecido =
        inventarioAtual.deceased;

    document.getElementById("falecido-nome").value =
        falecido.name || "";
    document.getElementById("falecido-data").value =
        falecido.date_of_death || "";
    document.getElementById("falecido-cpf").value =
        formatarCPF(falecido.cpf || "");
    document.getElementById("falecido-identidade").value =
        falecido.identity_document || "";
    document.getElementById("falecido-endereco").value =
        falecido.last_address || "";
    document.getElementById("falecido-estado-civil").value =
        falecido.marital_status || "";
    document.getElementById("falecido-regime").value =
        falecido.property_regime || "";
    document.getElementById("falecido-testamento").value =
        falecido.has_will === null ||
        falecido.has_will === undefined
            ? ""
            : String(falecido.has_will);

    alterarCampoParticipacao();
}

function preencherConjuge() {
    const conjuge =
        inventarioAtual.spouse;

    const formulario =
        document.getElementById("form-conjuge");

    if (!conjuge) {
        formulario.reset();

        document.getElementById("conjuge-id").value = "";
        document.getElementById("conjuge-endereco").disabled = false;

        alterarCampoParticipacao();

        return;
    }

    document.getElementById("conjuge-id").value =
        conjuge.id;
    document.getElementById("conjuge-nome").value =
        conjuge.name || "";
    document.getElementById("conjuge-cpf").value =
        formatarCPF(conjuge.cpf || "");
    document.getElementById("conjuge-identidade").value =
        conjuge.identity_document || "";
    document.getElementById("conjuge-endereco").value =
        conjuge.address || "";
    document.getElementById("conjuge-data-casamento").value =
        conjuge.marriage_date || "";
    document.getElementById("conjuge-participacao").value =
        conjuge.participation_percentage ?? 50;

    const mesmoEndereco =
        Boolean(obterEnderecoFalecido()) &&
        conjuge.address === obterEnderecoFalecido();

    document.getElementById("conjuge-mesmo-endereco").checked =
        mesmoEndereco;

    alterarEnderecoConjuge();
    alterarCampoParticipacao();
}

/* ==============================================================
   CARDS E LISTAS
   ============================================================== */
function renderizarFalecido() {
    const falecido =
        inventarioAtual.deceased;

    const area =
        document.getElementById("card-falecido");

    area.innerHTML = `
        <div class="card">
            <h4>${escaparHtml(falecido.name || "Falecido sem nome")}</h4>
            <p>CPF: ${escaparHtml(formatarCPF(falecido.cpf || "")) || "-"}</p>
            <p>Falecimento: ${escaparHtml(formatarData(falecido.date_of_death))}</p>
            <p>Regime de bens: ${escaparHtml(nomeRegime(falecido.property_regime))}</p>
            <div class="card-acoes">
                <button class="btn-editar" type="button" onclick="editarFalecido()">Editar</button>
            </div>
        </div>
    `;
}

function renderizarConjuge() {
    const conjuge =
        inventarioAtual.spouse;

    const area =
        document.getElementById("card-conjuge");

    area.innerHTML = "";

    if (!conjuge) {
        return;
    }

    area.innerHTML = `
        <div class="card">
            <h4>${escaparHtml(conjuge.name || "Cônjuge sem nome")}</h4>
            <p>CPF: ${escaparHtml(formatarCPF(conjuge.cpf || "")) || "-"}</p>
            <p>Data do casamento / união: ${escaparHtml(formatarData(conjuge.marriage_date))}</p>
            <p>Endereço: ${escaparHtml(conjuge.address || "-")}</p>
            <div class="card-acoes">
                <button class="btn-editar" type="button" onclick="editarConjuge()">Editar</button>
                <button class="btn-excluir" type="button" onclick="removerConjugeAtual()">Excluir</button>
            </div>
        </div>
    `;
}

function renderizarHerdeiros() {
    const lista =
        document.getElementById("lista-herdeiros");

    lista.innerHTML = "";

    inventarioAtual.heirs.forEach(function (herdeiro) {
        lista.innerHTML += `
            <div class="card">
                <h4>${escaparHtml(herdeiro.name || "Herdeiro sem nome")}</h4>
                <p>CPF: ${escaparHtml(formatarCPF(herdeiro.cpf || "")) || "-"}</p>
                <p>Parentesco: ${escaparHtml(nomeParentesco(herdeiro.kinship_degree))}</p>
                <p>Endereço: ${escaparHtml(herdeiro.address || "-")}</p>
                <div class="card-acoes">
                    <button class="btn-editar" type="button" onclick="editarHerdeiro(${herdeiro.id})">Editar</button>
                    <button class="btn-excluir" type="button" onclick="removerHerdeiro(${herdeiro.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

function renderizarBens() {
    const lista =
        document.getElementById("lista-bens");

    lista.innerHTML = "";

    inventarioAtual.assets.forEach(function (bem) {
        const particular =
            bem.is_private === null ||
            bem.is_private === undefined
                ? "Não informado"
                : bem.is_private
                    ? "Sim"
                    : "Não";

        lista.innerHTML += `
            <div class="card">
                <h4>${escaparHtml(bem.description || "Bem sem descrição")}</h4>
                <p>Valor: ${formatarMoeda(bem.value)}</p>
                <p>Data de aquisição: ${escaparHtml(formatarData(bem.acquisition_date))}</p>
                <p>Bem particular: ${particular}</p>
                <p>Percentual do falecido: ${bem.ownership_percentage ?? "-"}%</p>
                <div class="card-acoes">
                    <button class="btn-editar" type="button" onclick="editarBem(${bem.id})">Editar</button>
                    <button class="btn-excluir" type="button" onclick="removerBem(${bem.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

function renderizarDividas() {
    const lista =
        document.getElementById("lista-dividas");

    lista.innerHTML = "";

    if (
        inventarioAtual &&
        inventarioAtual.debts.length === 0 &&
        semDividasMarcado
    ) {
        lista.innerHTML = `
            <div class="card">
                <h4>Sem dívidas</h4>
                <p>Foi informado que não existem dívidas a cadastrar.</p>
            </div>
        `;
        return;
    }

    if (!inventarioAtual) {
        return;
    }

    inventarioAtual.debts.forEach(function (divida) {
        lista.innerHTML += `
            <div class="card">
                <h4>${escaparHtml(divida.description || "Dívida sem descrição")}</h4>
                <p>Credor: ${escaparHtml(divida.creditor || "-")}</p>
                <p>Valor: ${formatarMoeda(divida.value)}</p>
                <div class="card-acoes">
                    <button class="btn-editar" type="button" onclick="editarDivida(${divida.id})">Editar</button>
                    <button class="btn-excluir" type="button" onclick="removerDivida(${divida.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

/* ==============================================================
   RESUMO LATERAL
   ============================================================== */
function atualizarResumoLateral() {
    const resumo =
        inventarioAtual.summary;

    document.getElementById("resumo-nome").textContent =
        inventarioAtual.deceased?.name || "Não informado";
    document.getElementById("resumo-herdeiros").textContent =
        inventarioAtual.heirs.length;
    document.getElementById("resumo-bens").textContent =
        inventarioAtual.assets.length;
    document.getElementById("resumo-dividas").textContent =
        inventarioAtual.debts.length;
    document.getElementById("resumo-meacao").textContent =
        formatarMoeda(resumo.marital_share_value);
    document.getElementById("resumo-liquido").textContent =
        formatarMoeda(resumo.net_estate_value);
}

/* ==============================================================
   MEAÇÃO E PARTILHA
   ============================================================== */
async function calcularMeacao() {
    if (!exigirFalecido()) {
        return;
    }

    await carregarInventario();

    mostrarMensagem(
        "Meação e partilha recalculadas."
    );
}

function atualizarTelasDeResumo() {
    const resumo =
        inventarioAtual.summary;

    document.getElementById("valor-base-meacao").textContent =
        formatarMoeda(resumo.marital_base_value);
    document.getElementById("valor-meacao").textContent =
        formatarMoeda(resumo.marital_share_value);
    document.getElementById("valor-heranca-bruta").textContent =
        formatarMoeda(resumo.estate_before_debts);
    document.getElementById("valor-heranca-liquida").textContent =
        formatarMoeda(resumo.net_estate_value);
    document.getElementById("orcamento-ativo").textContent =
        formatarMoeda(resumo.total_deceased_value);
    document.getElementById("orcamento-passivo").textContent =
        formatarMoeda(resumo.total_debt_value);
    document.getElementById("orcamento-meacao").textContent =
        formatarMoeda(resumo.marital_share_value);
    document.getElementById("orcamento-liquido").textContent =
        formatarMoeda(resumo.net_estate_value);

    renderizarPartilha();
    renderizarAutoOrcamento();
    renderizarPagamento();
}

function obterPartilhas() {
    return Array.isArray(
        inventarioAtual.summary?.shares
    )
        ? inventarioAtual.summary.shares
        : [];
}

function renderizarPartilha() {
    const corpo =
        document.getElementById("tabela-partilha-corpo");

    const partilhas =
        obterPartilhas();

    corpo.innerHTML = "";

    if (partilhas.length === 0) {
        corpo.innerHTML =
            '<tr><td colspan="3">Nenhum quinhão calculado.</td></tr>';

        return;
    }

    partilhas.forEach(function (item) {
        corpo.innerHTML += `
            <tr>
                <td>${escaparHtml(item.name || "-")}</td>
                <td>${escaparHtml(item.quality || "-")}</td>
                <td>${formatarMoeda(item.value)}</td>
            </tr>
        `;
    });
}

/* ==============================================================
   AUTO DE ORÇAMENTO
   ============================================================== */
function renderizarAutoOrcamento() {
    const corpo =
        document.getElementById("tabela-orcamento-corpo");

    const partilhas =
        obterPartilhas();

    const total =
        Number(
            inventarioAtual.summary.net_estate_value || 0
        );

    corpo.innerHTML = "";

    if (partilhas.length === 0) {
        corpo.innerHTML =
            '<tr><td colspan="4">Nenhum quinhão calculado.</td></tr>';

        return;
    }

    partilhas.forEach(function (item) {
        const valor =
            Number(item.value || 0);

        const percentual =
            total > 0
                ? (valor / total) * 100
                : 0;

        corpo.innerHTML += `
            <tr>
                <td>${escaparHtml(item.name || "-")}</td>
                <td>${escaparHtml(item.quality || "-")}</td>
                <td>${formatarPercentual(percentual)}</td>
                <td>${formatarMoeda(item.value)}</td>
            </tr>
        `;
    });
}

/* ==============================================================
   FOLHA DE PAGAMENTO
   ============================================================== */
function renderizarPagamento() {
    const corpo =
        document.getElementById("tabela-pagamento-corpo");

    const resumo =
        inventarioAtual.summary;

    const partilhas =
        obterPartilhas();

    corpo.innerHTML = "";

    if (inventarioAtual.spouse) {
        corpo.innerHTML += `
            <tr>
                <td>${escaparHtml(inventarioAtual.spouse.name || "Cônjuge")}</td>
                <td>Cônjuge / Meeiro</td>
                <td>${formatarMoeda(resumo.spouse_total_value)}</td>
            </tr>
        `;
    }

    partilhas
        .filter(function (item) {
            return (
                item.heir_id !== null &&
                item.heir_id !== undefined
            );
        })
        .forEach(function (item) {
            corpo.innerHTML += `
                <tr>
                    <td>${escaparHtml(item.name || "-")}</td>
                    <td>${escaparHtml(item.quality || "Herdeiro")}</td>
                    <td>${formatarMoeda(item.value)}</td>
                </tr>
            `;
        });

    if (corpo.innerHTML === "") {
        corpo.innerHTML =
            '<tr><td colspan="3">Nenhum pagamento calculado.</td></tr>';
    }
}

/* ==============================================================
   ITCM
   ============================================================== */
async function calcularITD() {
    if (!inventarioAtual) {
        mostrarMensagem(
            "Carregue um inventário antes de calcular o ITCM.",
            "erro"
        );
        return;
    }

    const base =
        Number(
            inventarioAtual.summary?.net_estate_value || 0
        );

    try {
        const resultado =
            await estimarITD(base);

        document.getElementById("itd-base").textContent =
            formatarMoeda(resultado.base_value);

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
            formatarPercentual(
                Number(resultado.rate || 0) * 100
            );

        document.getElementById("itd-valor").textContent =
            formatarMoeda(resultado.estimated_tax);

        document.getElementById("resultado-itd").style.display =
            "block";
    } catch (erro) {
        mostrarMensagem(
            erro.message,
            "erro"
        );
    }
}

/* ==============================================================
   FINALIZAÇÃO DO INVENTÁRIO
   ============================================================== */
function finalizarInventario() {
    if (!exigirFalecido()) {
        return;
    }

    mostrarMensagem(
        "Inventário finalizado. Os dados permanecem salvos e podem ser reabertos pelo menu lateral.",
        "sucesso"
    );
}

/* ==============================================================
   NOVO INVENTÁRIO
   ============================================================== */
function novoInventario() {
    const confirmar =
        confirm(
            "Deseja iniciar um novo inventário? O inventário atual continuará salvo para consulta."
        );

    if (!confirmar) {
        return;
    }

    falecidoId = null;
    inventarioAtual = null;
    semDividasMarcado = false;

    document.querySelectorAll("form").forEach(function (formulario) {
        formulario.reset();
    });

    document.getElementById("conjuge-endereco").disabled = false;
    document.getElementById("herdeiro-endereco").disabled = false;
    document.getElementById("divida-descricao").disabled = false;
    document.getElementById("divida-credor").disabled = false;
    document.getElementById("divida-valor").disabled = false;

    [
        "card-falecido",
        "card-conjuge",
        "lista-herdeiros",
        "lista-bens",
        "lista-dividas",
        "tabela-partilha-corpo",
        "tabela-orcamento-corpo",
        "tabela-pagamento-corpo"
    ].forEach(function (id) {
        document.getElementById(id).innerHTML = "";
    });

    document.getElementById("bem-valor").value = "R$ 0,00";
    document.getElementById("divida-valor").value = "R$ 0,00";
    document.getElementById("resultado-itd").style.display = "none";
    document.getElementById("inventario-anterior").value = "";
    document.getElementById("resumo-nome").textContent = "Não informado";
    document.getElementById("resumo-herdeiros").textContent = "0";
    document.getElementById("resumo-bens").textContent = "0";
    document.getElementById("resumo-dividas").textContent = "0";
    document.getElementById("resumo-meacao").textContent = "R$ 0,00";
    document.getElementById("resumo-liquido").textContent = "R$ 0,00";

    [
        "valor-base-meacao",
        "valor-meacao",
        "valor-heranca-bruta",
        "valor-heranca-liquida",
        "orcamento-ativo",
        "orcamento-passivo",
        "orcamento-meacao",
        "orcamento-liquido",
        "itd-base",
        "itd-valor"
    ].forEach(function (id) {
        document.getElementById(id).textContent = "R$ 0,00";
    });

    document.getElementById("itd-ufir").textContent = "0";
    document.getElementById("itd-aliquota").textContent = "0%";

    alterarCampoParticipacao();
    alterarCampoCondominio();
    mostrarEtapa(0);

    mostrarMensagem(
        "Novo inventário iniciado. O inventário anterior permanece salvo no banco.",
        "sucesso"
    );
}