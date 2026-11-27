
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. ELEMENTOS DO DOM
    // =====================================

    const content = document.getElementById("content");

    const openButton = document.getElementById("openTransaction");
    const closeButton = document.getElementById("closeTransaction");

    const panel = document.getElementById("transacoes");

    const form = document.getElementById("transactionForm");

    const history = document.getElementById("transactionHistory");

    const message = document.getElementById("formMessage");

    const dateInput = document.getElementById("data");


    // =====================================
    // 2. ARMAZENAMENTO
    // =====================================

    const STORAGE_KEY = "investHubTransactions";

    let transactions = [];

    try {
        const savedTransactions = localStorage.getItem(STORAGE_KEY);

        transactions = savedTransactions
            ? JSON.parse(savedTransactions)
            : [];

        if (!Array.isArray(transactions)) {
            transactions = [];
        }

    } catch (error) {
        console.error("Erro ao carregar transacções:", error);
        transactions = [];
    }


    // =====================================
    // 3. ABRIR E FECHAR O PAINEL
    // =====================================

    function openPanel() {

        panel.hidden = false;

        content.classList.add("is-panel-open");

        openButton.setAttribute("aria-expanded", "true");

        openButton.textContent = "Nova Transação aberta";

        document.getElementById("tipo").focus();

        panel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }


    function closePanel() {

        panel.hidden = true;

        content.classList.remove("is-panel-open");

        openButton.setAttribute("aria-expanded", "false");

        openButton.textContent = "+ Nova Transação";

        openButton.focus();

    }


    openButton.addEventListener("click", () => {

        if (panel.hidden) {
            openPanel();
        } else {
            closePanel();
        }

    });


    closeButton.addEventListener("click", closePanel);


    // Abrir o painel quando se clicar em Transações no menu

    document.querySelectorAll('.main-nav a[href="#transacoes"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                event.preventDefault();

                if (panel.hidden) {
                    openPanel();
                }

                panel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });


    // =====================================
    // 4. DATA ACTUAL
    // =====================================

    const today = new Date();

    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.value = localDate;
    dateInput.max = localDate;


    // =====================================
    // 5. FORMATAÇÃO DE VALORES
    // =====================================

    const currencyFormatter = new Intl.NumberFormat("pt-AO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });


    function formatMoney(value) {

        return currencyFormatter.format(value) + " Kz";

    }


    function formatDate(date) {

        const [year, month, day] = date.split("-");

        return `${day}/${month}/${year}`;

    }


    // =====================================
    // 6. GUARDAR NO LOCAL STORAGE
    // =====================================

    function saveTransactions() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(transactions)
            );

            return true;

        } catch (error) {

            console.error("Erro ao guardar transacções:", error);

            return false;

        }

    }


    // =====================================
    // 7. MOSTRAR MENSAGENS
    // =====================================

    function showMessage(text, type) {

        message.textContent = text;

        message.className = "form-message " + type;

    }


    // =====================================
    // 8. RENDERIZAR HISTÓRICO
    // =====================================

    function renderTransactions() {

        history.replaceChildren();

        if (transactions.length === 0) {

            const row = document.createElement("tr");

            const cell = document.createElement("td");

            cell.colSpan = 8;

            cell.className = "empty-history";

            cell.textContent =
                "Ainda não existem transacções registadas.";

            row.appendChild(cell);

            history.appendChild(row);

            return;

        }


        // Mostrar as mais recentes primeiro

        const orderedTransactions = [...transactions].reverse();


        orderedTransactions.forEach(transaction => {

            const row = document.createElement("tr");

            const values = [
                transaction.operacao,
                transaction.tipo,
                transaction.corretora,
                transaction.quantidade,
                formatMoney(transaction.preco),
                formatMoney(transaction.taxas),
                formatDate(transaction.data),
                formatMoney(transaction.total)
            ];


            values.forEach((value, index) => {

                const cell = document.createElement("td");

                cell.textContent = value;

                if (index === 3 || index === 4 ||
                    index === 5 || index === 7) {

                    cell.classList.add("num");

                }

                if (index === 0) {

                    cell.classList.add("operation");

                }

                row.appendChild(cell);

            });

            history.appendChild(row);

        });

    }


    // =====================================
    // 9. REGISTAR NOVA TRANSACÇÃO
    // =====================================

    form.addEventListener("submit", event => {

        event.preventDefault();

        const operacao = document.getElementById("operacao").value;

        const tipo = document.getElementById("tipo").value;

        const corretora = document.getElementById("corretora").value;

        const quantidade = Number(
            document.getElementById("quantidade").value
        );

        const preco = Number(
            document.getElementById("preco").value
        );

        const taxas = Number(
            document.getElementById("taxas").value || 0
        );

        const data = dateInput.value;


        // Validação

        if (!operacao || !tipo || !corretora || !data) {

            showMessage(
                "Preencha todos os campos obrigatórios.",
                "error"
            );

            return;

        }


        if (
            !Number.isFinite(quantidade) ||
            !Number.isFinite(preco) ||
            !Number.isFinite(taxas) ||
            quantidade <= 0 ||
            preco <= 0 ||
            taxas < 0
        ) {

            showMessage(
                "Verifique os valores introduzidos.",
                "error"
            );

            return;

        }


        if (data > localDate) {

            showMessage(
                "A data não pode ser futura.",
                "error"
            );

            return;

        }


        // Cálculo do valor da operação

        const valorBruto = quantidade * preco;

        let total;

        if (operacao === "Venda") {

            total = valorBruto - taxas;

        } else {

            total = valorBruto + taxas;

        }


        if (!Number.isFinite(total) || total < 0) {

            showMessage(
                "O valor total da transacção é inválido.",
                "error"
            );

            return;

        }


        // Criar registo

        const transaction = {

            id: Date.now() + Math.random(),

            operacao,
            tipo,
            corretora,

            quantidade,
            preco,
            taxas,

            data,

            total

        };


        // Adicionar à lista

        transactions.push(transaction);


        // Guardar

        if (!saveTransactions()) {

            transactions.pop();

            showMessage(
                "Não foi possível guardar a transacção.",
                "error"
            );

            return;

        }


        // Actualizar histórico

        renderTransactions();


        // Limpar formulário

        form.reset();

        dateInput.value = localDate;


        showMessage(
            "Transacção registada com sucesso!",
            "success"
        );

    });


    // =====================================
    // 10. LIMPAR MENSAGEM AO REINICIAR
    // =====================================

    form.addEventListener("reset", () => {

        message.textContent = "";

        message.className = "form-message";

        setTimeout(() => {

            dateInput.value = localDate;

        }, 0);

    });


    // =====================================
    // 11. CARREGAR DADOS INICIAIS
    // =====================================

    renderTransactions();

});
