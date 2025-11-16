// URL base do JSON Server
const urlCapitais = "http://localhost:3000/capitais";

/*
  Função: carregar3Capitais
  - busca todas as capitais
  - sorteia 3 únicas
  - monta cards no #containerMain
*/
function carregar3Capitais() {
    const container = document.getElementById("containerMain");
    if (!container) return;

    // limpa container
    container.innerHTML = "";

    fetch(urlCapitais)
    .then(res => res.json())
    .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = "<p class='text-danger'>Nenhuma capital encontrada.</p>";
            return;
        }

        // pega 3 ids únicos aleatórios
        const usados = new Set();
        const total = data.length;
        const escolha = [];

        while (escolha.length < 3 && escolha.length < total) {
            const idx = Math.floor(Math.random() * total);
            if (!usados.has(idx)) {
                usados.add(idx);
                escolha.push(data[idx]);
            }
        }

        // monta cards para cada capital escolhida
        escolha.forEach((cap, i) => {
            // campos esperados: nome, estado, regiao, populacao, descricao, pontosTuristicos, imagem, id
            const titulo = cap.nome || "Sem nome";
            const descricao = cap.descricao || "";
            const img = cap.imagem ? `img/${cap.imagem}` : "img/default.jpg";
            const id = cap.id;

            const cardHTML = `
            <article class="bg-light text-dark w-75 ms-3 mb-3 p-3 border border-dark rounded-4 d-flex flex-column align-items-center">
                <a href="detalhes.html?id=${id}" class="text-decoration-none text-dark">
                    <h1 class="text-uppercase">${titulo}</h1>
                    <img class="img-fluid w-100 mw-100 h-auto d-inline-block" src="${img}" alt="${titulo}">
                    <p class="fs-3">${descricao}</p>
                </a>
            </article>
            `;
            container.innerHTML += cardHTML;
        });
    })
    .catch(err => {
        console.error("Erro ao carregar capitais:", err);
        container.innerHTML = "<p class='text-danger'>Erro ao carregar capitais.</p>";
    });
}

/*
  Função: carregarDetalhes
  - lê id da URL
  - busca /capitais/:id
  - mostra informações no #cidade
  - adiciona botões Editar e Excluir
*/
function carregarDetalhes() {
    const id = getIdFromURL();
    const cidade = document.getElementById("cidade");
    if (!cidade) return;

    if (!id) {
        cidade.innerHTML = "<p class='text-danger'>ID não informado.</p>";
        return;
    }

    fetch(urlCapitais + "/" + id)
    .then(res => {
        if (!res.ok) throw new Error("Capital não encontrada");
        return res.json();
    })
    .then(cap => {
        const nome = cap.nome || "";
        const estado = cap.estado || "";
        const regiao = cap.regiao || "";
        const populacao = cap.populacao || "";
        const descricao = cap.descricao || "";
        const pontos = Array.isArray(cap.pontosTuristicos) ? cap.pontosTuristicos : [];
        const img = cap.imagem ? `img/${cap.imagem}` : "img/default.jpg";

        // montar layout simples
        cidade.innerHTML = `
            <div class="w-100 p-4 bg-primary bg-opacity-50 rounded-4" style="background-size: cover; border: 3px solid black;">
                <div class="d-flex gap-4">
                    <div style="width: 40%;">
                        <img src="${img}" alt="${nome}" class="img-fluid rounded-3 w-100">
                    </div>
                    <div style="width: 60%;" class="text-white">
                        <h1 class="text-uppercase">${nome} - <small>${estado}</small></h1>
                        <p><strong>Região:</strong> ${regiao}</p>
                        <p><strong>População:</strong> ${populacao}</p>
                        <p><strong>Descrição:</strong> ${descricao}</p>
                        <p><strong>Pontos turísticos:</strong></p>
                        <ul id="listaPontos">
                            ${pontos.map(p => `<li>${p}</li>`).join("")}
                        </ul>

                        <div class="mt-4 d-flex gap-2">
                            <a href="cadastroCapital.html?id=${id}" class="btn btn-warning">Editar</a>
                            <button onclick="excluirCapital('${id}')" class="btn btn-danger">Excluir</button>
                        </div>

                        <div id="msgDelete" class="mt-3" style="display:none;"></div>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(err => {
        console.error(err);
        cidade.innerHTML = "<p class='text-danger'>Erro ao carregar detalhes.</p>";
    });
}

/*
  Função: excluirCapital
  - chama DELETE /capitais/:id
  - mostra mensagem de sucesso por 2s e redireciona para index.html
  - padrão escolhido: sem confirm(), mostra mensagem "Excluído com sucesso!" por 2s
*/
function excluirCapital(id) {
    const msg = document.getElementById("msgDelete");
    if (msg) {
        msg.style.display = "none";
        msg.innerHTML = "";
    }

    fetch(urlCapitais + "/" + id, { method: "DELETE" })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao excluir");
        // mostrar mensagem de sucesso por 2s
        if (msg) {
            msg.style.display = "block";
            msg.innerHTML = "<span class='text-success fs-4'>Excluído com sucesso!</span>";
        } else {
            alert("Excluído com sucesso!");
        }
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    })
    .catch(err => {
        console.error("Erro ao excluir:", err);
        if (msg) {
            msg.style.display = "block";
            msg.innerHTML = "<span class='text-danger'>Erro ao excluir.</span>";
        } else {
            alert("Erro ao excluir");
        }
    });
}

/*
  Funções para o formulário de cadastro / edição
  - carregarFormularioSeEdicao: se houver id na URL, busca e preenche o form
  - salvarNoServidor: POST se novo, PUT se edição
*/

// pega id da URL (ou null)
function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// preencher formulário se for edição
function carregarFormularioSeEdicao() {
    const form = document.getElementById("formCapital");
    if (!form) return;

    const id = getIdFromURL();
    if (!id) {
        // formulário para novo registro
        form.addEventListener("submit", salvarNovoOuEditar);
        return;
    }

    // edição: buscar dados e preencher campos
    fetch(urlCapitais + "/" + id)
    .then(res => {
        if (!res.ok) throw new Error("Registro não encontrado");
        return res.json();
    })
    .then(cap => {
        document.getElementById("tituloForm").innerText = "Editar Capital";
        document.getElementById("btnSubmit").innerText = "Salvar Alterações";

        document.getElementById("nome").value = cap.nome || "";
        document.getElementById("estado").value = cap.estado || "";
        document.getElementById("regiao").value = cap.regiao || "";
        document.getElementById("populacao").value = cap.populacao || "";
        document.getElementById("descricao").value = cap.descricao || "";

        const pts = Array.isArray(cap.pontosTuristicos) ? cap.pontosTuristicos : [];
        document.getElementById("pt1").value = pts[0] || "";
        document.getElementById("pt2").value = pts[1] || "";
        document.getElementById("pt3").value = pts[2] || "";

        document.getElementById("imagem").value = cap.imagem || "";

        // vincula submit para editar
        form.addEventListener("submit", salvarNovoOuEditar);
    })
    .catch(err => {
        console.error("Erro ao carregar para edição:", err);
        const msg = document.getElementById("msgSucesso");
        if (msg) {
            msg.style.display = "block";
            msg.innerHTML = "<span class='text-danger'>Erro ao carregar dados para edição.</span>";
        }
    });
}

// função que decide POST ou PUT com base no id na URL
function salvarNovoOuEditar(event) {
    event.preventDefault();

    const id = getIdFromURL();

    const nome = document.getElementById("nome").value;
    const estado = document.getElementById("estado").value;
    const regiao = document.getElementById("regiao").value;
    const populacao = Number(document.getElementById("populacao").value);
    const descricao = document.getElementById("descricao").value;

    const pt1 = document.getElementById("pt1").value;
    const pt2 = document.getElementById("pt2").value;
    const pt3 = document.getElementById("pt3").value;

    const imagem = document.getElementById("imagem").value;

    const obj = {
        nome: nome,
        estado: estado,
        regiao: regiao,
        populacao: populacao,
        descricao: descricao,
        pontosTuristicos: [pt1, pt2, pt3],
        imagem: imagem
    };

    // se id existe -> PUT, senão -> POST
    if (id) {
        // PUT
        fetch(urlCapitais + "/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj)
        })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao atualizar");
            return res.json();
        })
        .then(data => {
            const msg = document.getElementById("msgSucesso");
            if (msg) {
                msg.style.display = "block";
                msg.innerHTML = "<span class='text-success'>Atualizado com sucesso!</span>";
            } else {
                alert("Atualizado com sucesso!");
            }
            // redireciona para detalhes da capital atualizada
            setTimeout(() => {
                window.location.href = "detalhes.html?id=" + id;
            }, 1200);
        })
        .catch(err => {
            console.error("Erro ao atualizar:", err);
            const msg = document.getElementById("msgSucesso");
            if (msg) {
                msg.style.display = "block";
                msg.innerHTML = "<span class='text-danger'>Erro ao atualizar.</span>";
            }
        });
    } else {
        // POST
        fetch(urlCapitais, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj)
        })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao cadastrar");
            return res.json();
        })
        .then(data => {
            const msg = document.getElementById("msgSucesso");
            if (msg) {
                msg.style.display = "block";
                msg.innerHTML = "<span class='text-success'>Cadastrado com sucesso!</span>";
            } else {
                alert("Cadastrado com sucesso!");
            }
            document.getElementById("formCapital").reset();
            // volta para a home após 1.2s
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        })
        .catch(err => {
            console.error("Erro ao cadastrar:", err);
            const msg = document.getElementById("msgSucesso");
            if (msg) {
                msg.style.display = "block";
                msg.innerHTML = "<span class='text-danger'>Erro ao cadastrar.</span>";
            }
        });
    }
}
