const hostname = location.hostname;
const port = location.port;
const user = getUserLogado();
var jnid = getJNID();

function getJNID() {

    let JSESSIONID = document.cookie.split('; ').find(row => row.startsWith('JSESSIONID=')).split('=')[1];
    JSESSIONID = JSESSIONID.split('.');
    JSESSIONID = JSESSIONID[0];
    return JSESSIONID;

}

// função para capturar codigo do usuario logado
function getUserLogado() {

    let userLogado = document.cookie.split('; ').find(row => row.startsWith('userIDLogado=')).split('=')[1];
    return userLogado;

}


function IniciarApp() {
    scriptHTML();
}


function scriptHTML() {
    let tela = $("#exibe");
    tela.append(navbar())
}

function navbar() {
    let tabs = `
    <style>
        .modal-custom {
            max-width: 80%; /* Ajuste o valor de acordo com o tamanho desejado */
            width: auto;
        }
        
        /* Este estilo é opcional, apenas para centralizar o modal horizontalmente */
        .modal-custom .modal-dialog {
            margin: 0 auto;
        }
        .coluna-diaria-fechamento:hover{
            transform:scale(1.1);
            transition:.8s;
        }
        .card-comprovantes-single:hover{
            box-shadow: 2px 2px 22px 0px rgba(0,0,0,0.75);
            -webkit-box-shadow: 2px 2px 22px 0px rgba(0,0,0,0.75);
            -moz-box-shadow: 2px 2px 22px 0px rgba(0,0,0,0.75);
            transform:scale(1.1);
            transition:.5s;
            z-index:999;
        }
    </style>
    <nav class="mb-5" style="background-color: #212529;padding:15px 0px">
        <div class="text-center mb-3 text-white" style=" font-size:2em;">
            <strong>CONFERENCIA DE FECHAMENTO DE CAIXA</strong>
        </div>
        <ul class="nav nav-pills justify-content-center" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button style="color:white;" class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Observar status</button>
            </li>
            <li class="nav-item" role="presentation">
                <button style="color:white;" class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Notas reprovadas</button>
            </li>
            <li class="nav-item" role="presentation">
                <button style="color:white;" class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Servicos</button>
            </li>
        </ul>
    </nav>
    <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">${textHome()}</div>
        <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">${fechamentosReprovados()}</div>
        <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">${acompanhamentoServicos()}</div>
    </div>
    `;


    return tabs;
}


function textHome() {

    let card = `
    
    <div class="container">
        <div class="col d-flex justify-content-center text-left">
            <div class="card mb-3">
                <div class="card-header bg-transparent">Buscar:</div>
                <div class="card-body">

                    <div class="d-flex flex-column justify-content-center">
                        <input type="month" style="padding:5px;border-radius:7px" class="mt-3 form-control text-left" id="buscar_data" />

                        ${filtroPorLoja('lojas-item')}

                        <button type="submit" onclick="abrirLoading()" id="acao_buscar" style="width:100%;" class="btn btn-primary mb-3 mt-3">Buscar</button>
                    </div>
                </div>
            </div>
        </div>

        
    </div>
    <div id="status_do_dia"></div>
    <div id="tabela-home"></div>
            `
    return card
}

function filtroPorLoja(param){

    let sql = `SELECT CODEMP, NOMEFANTASIA FROM TSIEMP WHERE CODEMP < 100`;
    let dadosSelect = getDadosSql(sql,true);


    let menuComLojas = `<div class="dropdown mt-2">
        <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Selecionar Itens
        </button>
        <div class="dropdown-menu" style="height:500px;overflow-y:scroll" aria-labelledby="dropdownMenuButton">`

            dadosSelect.map(e=>{
                menuComLojas+=`<label class="dropdown-item">
                                    <input type="checkbox" class="checkbox-item ${param}" value="${e.CODEMP}"> ${e.NOMEFANTASIA}
                                </label>`
            })

        menuComLojas+=`</div></div>`


    return menuComLojas
}



function construindoTabela(modalLoading) {
    let data = $("#buscar_data").val()
    let valoresLojas = document.querySelectorAll(".lojas-item:checked");
    let valoresSelecionados = Array.from(valoresLojas).map(e=>e.value);


    let dataFull = formatData(data)
    if (dataFull.dia == undefined || dataFull.mes == undefined || dataFull.ano == undefined) {
        alert("Data está vazia")
        stopLoading(modalLoading);
    }
    else {
        let tabela =
            `<div class="col-12">
            <div class="card mb-3">
                <div class="card-header bg-transparent">
                    <h3>Tabela de fechamentos</h3>
                </div>
                <div class="card-body">
                <table 
                id="table-info-fech" 
                    class="table table-hover"
                    <thead>
                        <tr>
                            <th style="width:300px">Lojas</th>
                        `

        for (let i = 1; i < dataFull.dia; i++) {
            tabela += `<th style="text-align:center" text-center data-field="title">${i}</th>`
        }
        tabela += `</tr>
                    </thead>
                <tbody>`;

        let sql = "";
        if(valoresSelecionados.length === 0){
            sql = `select CODEMP,NOMEFANTASIA from tsiemp t where t.CODEMP < 100`
        }else if(valoresSelecionados.length>0){
            sql = `select CODEMP,NOMEFANTASIA from tsiemp t where t.CODEMP IN (${valoresSelecionados.join(",")})`
        }

        let numLojas = getDadosSql(sql)


        for (let z = 0; z < numLojas.length; z++) {

            tabela += `<tr>
                    <th scope="col">${numLojas[z][1]}</th>`

            for (let j = 1; j < dataFull.dia; j++) {
                let color = verificaSeExiste(numLojas[z][0],j, dataFull.mes, dataFull.ano)
                    tabela += ` <td class="${color}" style="cursor:pointer; text-align:center" onclick="fechamentoDeCaixa(${numLojas[z][0]},${j},${dataFull.mes},${dataFull.ano});">
                                    <span title="Loja: ${numLojas[z][1].trim()} na data: ${j < 10 ? "0"+j : j}/${dataFull.mes}/${dataFull.ano}">
                                        <i class="bi bi-file-earmark-fill coluna-diaria-fechamento" ></i>
                                    </span>
                                </td>`

            }
            tabela += `</tr>`
        }

        tabela += `   
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `
        let tela = $("#exibe");
        tela.empty()
        tela.append(navbar())
        $("#tabela-home").append(tabela)
        stopLoading(modalLoading);

        let status = `
        <p class="text-center">Legenda da tabela</p>
        <div class="container mb-3">
            <div class="d-flex justify-content-center flex-row">
                <div>
                    <div class="bg-secondary" style="margin:0 5px 0 15px;width:30px;height:10px;display:inline-block;"></div><span style="font-size:12px">Nao houve fechamento</span>
                </div>
                <div>
                    <div class="bg-warning" style="margin:0 5px 0 15px;width:30px;height:10px;display:inline-block;"></div><span style="font-size:12px">Fechamento realizado, mas sem documentos</span>
                </div>
                <div>
                    <div class="bg-primary" style="margin:0 5px 0 15px;width:30px;height:10px;display:inline-block;"></div><span style="font-size:12px">Fechamento esperando avaliacao</span>
                </div>
                <div>
                    <div class="bg-danger" style="margin:0 5px 0 15px;width:30px;height:10px;display:inline-block;"></div><span style="font-size:12px">Fechamento reprovado</span>
                </div>
                <div>
                    <div class="bg-success" style="margin:0 5px 0 15px;width:30px;height:10px;display:inline-block;"></div><span style="font-size:12px">Fechamento aprovado</span>
                </div>
            </div>
        </div>
        `;
        $("#status_do_dia").append(status)
    }
}

function fechamentoDeCaixa(codEmp, dia, mes, ano){
    modalFechamento(codEmp,dia,mes,ano)
}

function modalFechamento(codEmp,dia,mes,ano){
    let sql = `
                SELECT  ac.IDCONFCEGA,
                        ac.IDFECH,
                        t.NOMEFANTASIA,
                        t2.NOMEUSUCPLT,
                        aaf.IDACFECH, 
                        aaf.APROVADO, 
                        cc.VLRSALDO, 
                        cc.OBSERVACAO, 
                        cc.STATUS
                        FROM AD_CADFECHCAIXA ac
                        INNER JOIN tsiemp t ON t.CODEMP = ac.CODEMP
                        INNER JOIN TSIUSU t2 ON t2.CODUSU = ac.CODUSU
                        LEFT JOIN AD_ACOMPFECHCAIXA aaf ON aaf.IDFECH = ac.IDFECH
                        INNER JOIN AD_CONFERENCIACEGA cc ON cc.IDCONFCEGA = ac.IDCONFCEGA 
                        WHERE t.CODEMP < 100
                        AND ac.CODEMP = ${codEmp}
                        and ac.DHFECH between '${dia<10 ? "0"+dia : dia}/${mes < 10 ? "0"+mes : mes}/${ano} 00:00:00' and '${dia<10 ? "0"+dia : dia}/${mes < 10 ? "0"+mes : mes}/${ano} 23:59:59'
                        AND ac.ATIVO = 'S'
                        `;


    let dadosIndividuais = getDadosSql(sql,true)

    let modal = `
        <div class="modal fade" id="myModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalhes da loja ${dadosIndividuais[0].NOMEFANTASIA}<br>Data: ${dia<10 ? "0"+dia : dia}/${mes < 10 ? "0"+mes : mes}/${ano}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('myModal')" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${dadosIndividuais.length == 0 ? "Nao ha registro" : 
                                dadosIndividuais.map((e)=> `
                                <div class="card">
                                    <div class="card-header ${mudarCor(e.IDFECH)}">${e.NOMEUSUCPLT}</div>
                                    <div class="card-body">
                                        Observacao Conferencia Cega: ${e.OBSERVACAO != null ? e.OBSERVACAO : "Sem observacao"}<br/>
                                        Status Conferencia Cega: ${statusVerifica(e.STATUS)}<br/>
                                        Saldo Fechamento: R$ ${e.VLRSALDO}
                                    </div>
                                    <div class="card-footer d-flex justify-content-around">
                                        <button class="btn btn-secondary" onclick="visualizaImagens('${e.IDFECH}')"><span title="Visualizar Nota"><i class="bi bi-file-earmark-text-fill"></i></span></button>
                                        <div class="d-flex flex-row justify-content-between">
                                            <div style="margin-right:10px">
                                                <button class="btn btn-success" style onclick="salvarDadosFechamento('${e.IDFECH}')"><span title="Aprovar fechamento do caixa"><i class="bi bi-check2"></i></span></button>
                                            </div>
                                            <div>
                                                <button class="btn btn-danger" onclick="modalReprovacaoNota('${e.IDFECH}')"><span title="Reprovar fechamento do caixa"><i class="bi bi-trash"></i></span></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                ` )}
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="fechaModal('myModal')" data-bs-dismiss="modal">Fechar</button
                    </div>
                </div>
            </div>
        </div>`;
    let body = $("body")
    body.append(modal)

    var myModal = new bootstrap.Modal(document.getElementById("myModal"))
    myModal.show(myModal);
}

function statusVerifica(data){
    let status = "";
    if(data==="REPROVADO"){
        status = "Reprovado";
    }else if(data === "NOVO"){
        status = "Novo";
    }else if(data === "FINSEMDIV"){
        status = "Fim sem divergencia"
    }else if(data === "FINCOMDIV"){
        status = "Fim com divergencia"
    }else if(data=== "AG_CONFGER"){
        status = "Aguardando confirmacao do gerente"
    }else{
        status = "Sem STATUS"
    }
    return status
}

function modalReprovacaoNota(id){

    let modal = `
    
    <div class="modal" id="modalReprovado" tabindex="-1">
        <div class="modal-dialog modal-sm modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reprovar fechamento</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('modalReprovado')" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Motivo desse fechamento esta sendo reprovado:
                    <textarea class="form-control" id="motivoReprovacao" style="width:100%" placeholder="Motivo"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="fechaModal('modalReprovado')" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" onclick="saveReprovado(${id})" class="btn btn-primary">Salvar</button>
                </div>
            </div>
        </div>
    </div>
    `

    let body= $("body")
    body.append(modal);

    var myModal = new bootstrap.Modal(document.getElementById('modalReprovado'),{
        keyboard:false,
        backdrop:false
    })
    myModal.show()

}
function saveReprovado(id){
    let observacao = $("#motivoReprovacao").val();
    if(observacao == "" || observacao == undefined){
        alert("E necessario colocar uma observacao")
    }else{
    let entity = "AD_ACOMPFECHCAIXA"
    let fields = {}
    let sql = `SELECT IDACFECH, CODEMP, CODUSU FROM AD_ACOMPFECHCAIXA WHERE IDFECH = ${id}`;
    let dadosReprovacao = getDadosSql(sql,true)
        if(dadosReprovacao.length >0){
            fields.CODEMP = formatDataSankhya(dadosReprovacao[0].CODEMP)
            fields.CODUSU = formatDataSankhya(dadosReprovacao[0].CODUSU)
            fields.IDFECH = formatDataSankhya(id)
            fields.APROVADO = formatDataSankhya("N")
            fields.OBSERVACAO = formatDataSankhya(observacao)
            let key = {
                "IDACFECH": formatDataSankhya(dadosReprovacao[0].IDACFECH)
            }
            saveRecord(entity,fields,key)
        }else{
            alert("Fechamento reprovado com sucesso!")
            let query = `SELECT * FROM AD_CADFECHCAIXA WHERE IDFECH = ${id} AND ATIVO = 'S'`
            let novaReprovacao = getDadosSql(query,true)
            fields.CODEMP = formatDataSankhya(novaReprovacao[0].CODEMP)
            fields.CODUSU = formatDataSankhya(novaReprovacao[0].CODUSU)
            fields.IDFECH = formatDataSankhya(id)
            fields.APROVADO = formatDataSankhya("N")
            fields.OBSERVACAO = formatDataSankhya(observacao)
            saveRecord(entity,fields)
        }
    }
}

function detalheComprovante(nunota,nome,num){
    if(nunota){
        let sql = `
        
        SELECT FIN.CODEMP,
        FIN.NUFIN,
        FIN.NUNOTA,
        FIN.VLRDESDOB,
        FIN.CODTIPTIT,
        TIT.DESCRTIPTIT,
        AGRUP.IDAGRUPAMENTOCONFCEGA,
        AGRUP.DESCRICAO DESCRICAOAGRUPCONFCEGA,
        FIN.NUCOMPENS,
        FIN.VLRDESC,
        FIN.VLRJURO,
        FIN.VLRBAIXA,
        FIN.DHBAIXA,
        FIN.CODPARC,
        PAR.NOMEPARC,
        PMAT.CODPARC    CODMATRIZ,
        PMAT.NOMEPARC   NOMEMATRIZ,
        FIN.CODTIPOPER,
        USUCAIXA.NOMEUSU
        FROM TGFFIN FIN 
        LEFT OUTER JOIN TSIUSU USU
        ON (FIN.CODUSU = USU.CODUSU)
        LEFT OUTER JOIN TGFPAR PAR
        ON FIN.CODPARC = PAR.CODPARC
        LEFT OUTER JOIN TGFTIT TIT
        ON (FIN.CODTIPTIT = TIT.CODTIPTIT)
        LEFT OUTER JOIN TGFPAR PMAT
        ON (PAR.CODPARCMATRIZ = PMAT.CODPARC)
        LEFT OUTER JOIN TSIUSU USUCAIXA
        ON (FIN.CODUSU = USUCAIXA.CODUSU)
        LEFT JOIN AD_AGRUPAMENTOCONFCEGA agrup
        ON agrup.IDAGRUPAMENTOCONFCEGA = tit.AD_IDAGRUPAMENTOCONFCEGA
        WHERE FIN.RECDESP = 1
        AND PROVISAO = 'N'
        AND FIN.NUNOTA = ${nunota} `
        let dados = getDadosSql(sql,true)

        let tabelaContainer = $(`#${nome}`);
          // Cria uma nova tabela usando template strings
          const tabelaExistente = $("#tabela");
          if (tabelaExistente.length > 0) {
            tabelaExistente.remove();
          }
        
          var tabelaHTML = `
          <p class="text-center mt-3 mb-3">Detalhes do comprovante <strong>#${num}</strong></p>
          <div style="padding: 15px; border-radius:10px;background-color:#eee">
            <table id="tabela" class="table table-hover" style="width:100%;">
              <thead style="background-color:#eee" >
                <tr>
                  <th>NUFIN</th>
                  <th>NUNOTA</th>
                  <th>Valor</th>
                  <th>Descricao</th>
                  <th>Data e Hora</th>
                  <th>Nome cliente</th>
                  <th>Usuario</th>
                  <th>Vlr. Desconto</th>
                  <th>Vlr. Juros</th>
                </tr>
              </thead>
              <tbody style="background-color: white">`;

              for(let i = 0; i < dados.length;i++){
                let dataFormatada = "";
                if(dados[i].DHBAIXA != undefined || dados[i].DHBAIXA != null ){
                    let dataNoFormat = dados[i].DHBAIXA.split(" ");
                    dataFormatada = `${formatandoData(dataNoFormat[0])} ${dataNoFormat[1]}`
                }
                let valor = (dados[i].VLRDESDOB).toString();                

                tabelaHTML+=`
                <tr style="border-bottom:1px solid #ccc">
                    <td style="text-align:left; padding:0 10px">${dados[i].NUFIN}</td>
                    <td style="text-align:left; padding:0 10px">${dados[i].NUNOTA}</td>
                    <td style="text-align:left; padding:0 10px">R$ ${valor.replace(".",",")}</td>
                    <td style="text-align:left; padding:0 10px">${dados[i].DESCRTIPTIT}</td>
                    <td style="text-align:left; padding:0 10px">${dataFormatada}</td>
                    <td style="text-align:left; padding:0 10px">${dados[i].NOMEPARC}</td>
                    <td style="text-align:left; padding:0 10px">${dados[i].NOMEUSU}</td>
                    <td style="text-align:left; padding:0 10px">${dados[i].VLRBAIXA}</td>
                    <td style="text-align:left; padding:0 10px">${dados[i].VLRDESC}</td>
                </tr>
                `
              }
        
          tabelaHTML+=`
            </tbody>
            </table>
            </div>
          `

          tabelaContainer.empty()
          tabelaContainer.append(tabelaHTML)
          console.log(tabelaContainer)
        
    }else{
        alert("NUNOTA não foi cadastrada")
    }
}

function hoverButtonClear(num) {
    let x = document.querySelector(".apaga-card-comprovante"+num)
    x.style.color = "red";
    x.style.borderColor = "red";
  }
  function outButtonClear(num){
    let x = document.querySelector(".apaga-card-comprovante"+num)
    x.style.color = "#888";
    x.style.borderColor = "#888";
  }

function visualizaImagens(id){
    let sql = `SELECT * FROM AD_ADCADFECHIMG WHERE IDFECH = ${id} AND ATIVO = 'S'`;
    let imgs = getDadosSql(sql,true)
    console.log(imgs)

    let rows = "<div class='row d-flex justify-content-center mb-3'>" 

    try{
        console.log(imgs[0].IMG_ENV)
        console.log(imgs.length)
        for(let i = 0; i < imgs.length; i++){
            if(imgs[i].IMG_ENV == "S"){
                rows += `
                <div class="col-3 mb-3 mt-3">
                    <div class="card card-comprovantes-single">
                        <div class="card-header d-flex flex-row justify-content-between">
                            <p><strong>#${i+1}</strong></p>
                            <span 
                                onmouseover="hoverButtonClear(${i})" 
                                onmouseout="outButtonClear(${i})" 
                                class="apaga-card-comprovante${i}" 
                                onclick="apagaComprovanteFechamento(${imgs[i].IDIMG},${id})" 
                                style="transition:.5s;width:30px;height:30px;color:#888;border:2px solid #888;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer"
                                title="Excluir comprovante permanentemente">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16" style="width:15px;height:15px;font-weight:bold">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                </svg>
                            </span>
                        </div>
                        <div class="card-body" style="height:200px">
                            <a onclick="abrirImagemNovaJanela('${imgs[i].IMG }')" title="Expandir tamanho da imagem" target="_blank">
                                <img style="display:block; width:100%;height:100%;" id="img${i}" src="${imgs[i].IMG }" />
                            </a>
                        </div>
                        <div class="card-footer">
                            <label class="form-label">Descricao do comprovante:</label>
                            <h6>${imgs[i].IMG_LABEL  == null || imgs[i].IMG_LABEL  == undefined ? "Sem descricao" : imgs[i].IMG_LABEL }</h6>
                            <button onclick="detalheComprovante('${imgs[i].NUNOTA }','tabela-detalhe',${i+1})" class="btn btn-secondary">Mais detalhes</button>
                        </div>
                    </div>
                </div>
                `
            }else{
                rows +=""
            }
    }
    } catch(error){
        alert("Nenhuma imagem cadastrada");
    }
rows+="</div>"
console.log(rows)
let modalImagens = `
<div class="modal fade" id="modalImagens" tabindex="-1">
<div class="modal-dialog modal-custom modal-dialog-scrollable">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Comprovantes enviados</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('modalImagens')" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="col-12">
                ${rows}
            </div>
            <div class="col-12">
                <div id="tabela-detalhe"></div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="fechaModal('modalImagens')" data-bs-dismiss="modal">Fechar</button
        </div>
    </div>
</div>
</div>`;
let body = $("body")
body.append(modalImagens)

var modalImagensBoot = new bootstrap.Modal(document.getElementById("modalImagens"),{
    backdrop:false
})
modalImagensBoot.show();
body.css('overflow', 'auto');

}

function apagaComprovanteFechamento(id,idfech){
    let modal = `
    <div class="modal" id="apaga-comprovante" tabindex="-1">
        <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title">Apagar comprovante</h5>
            <button type="button" onclick="fechaModal('apaga-comprovante')" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Voce realmente deseja apagar esse comprovante?</p>
            </div>
            <div class="modal-footer">
            <button type="button" onclick="fechaModal('apaga-comprovante')" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" onclick="confirmaApagarFechamento(${id},${idfech})" class="btn btn-danger">Apagar</button>
            </div>
        </div>
        </div>
    </div>
    `


    $('body').append(modal)
    var modalImagensBoot = new bootstrap.Modal(document.getElementById("apaga-comprovante"),{
        backdrop:false
    })
    modalImagensBoot.show();

}

function confirmaApagarFechamento(id,idfech){

    let fields = {}
    let entity = "AD_ADCADFECHIMG"
    let key = {
        "IDIMG":formatDataSankhya(id),
        "IDFECH":formatDataSankhya(idfech)
    }
    fields.ATIVO       = formatDataSankhya("N")

    saveRecord(entity,fields,key)

    fechaModal("apaga-comprovante")
}
function abrirImagemNovaJanela(img){
                const novaJanela = window.open("", "_blank");
            
                novaJanela.document.write(`<img src="${img}" style="width:100%" alt="Descrição da imagem">`);
                
                window.addEventListener("beforeunload", () => {
                    novaJanela.close();
                });
}

function salvarDadosFechamento(id){
        let sql = "SELECT IDACFECH FROM AD_ACOMPFECHCAIXA WHERE IDFECH = "+id;
        let dadosAcompFech = getDadosSql(sql)
        if(dadosAcompFech.length>0){    
            let sql = "SELECT IDACFECH, CODEMP,CODUSU FROM AD_ACOMPFECHCAIXA WHERE IDFECH = "+id;
            let dadosCadFechamento = getDadosSql(sql,true);

            let fields = {}
            let entity = "AD_ACOMPFECHCAIXA"
            let key = {
                "IDACFECH":formatDataSankhya(dadosCadFechamento[0].IDACFECH)
            }
            fields.IDFECH       = formatDataSankhya(id)
            fields.CODEMP       = formatDataSankhya(dadosCadFechamento[0].CODEMP);
            fields.CODUSU       = formatDataSankhya(dadosCadFechamento[0].CODUSU);
            fields.APROVADO     = formatDataSankhya("S")

            saveRecord(entity,fields,key)

        }else{
            let sql = "SELECT IDFECH, CODEMP,CODUSU FROM AD_CADFECHCAIXA WHERE IDFECH = "+id+" AND ATIVO = 'S'";
            let dadosCadFechamento = getDadosSql(sql,true);

            let fields = {}
            let entity = "AD_ACOMPFECHCAIXA"

            fields.IDFECH       = formatDataSankhya(id)
            fields.CODEMP       = formatDataSankhya(dadosCadFechamento[0].CODEMP);
            fields.CODUSU       = formatDataSankhya(dadosCadFechamento[0].CODUSU);
            fields.APROVADO     = formatDataSankhya("S")

            saveRecord(entity,fields)
        }
}
function fechaModal(modal){
    console.log("Fechando Modal")
    var myModal = new bootstrap.Modal(document.getElementById(`${modal}`), {
        backdrop: false
    })
    myModal.hide()
    $(`#${modal}`).remove();
    var modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.remove(); // Remove o backdrop manualmente
    }
}

function verificaSeExiste(codEmp, dia, mes, ano){

    let sql = ` select aci.IMG_ENV,aaf.APROVADO, ac.CONFIRMACAO  from AD_CADFECHCAIXA ac
                left join AD_ACOMPFECHCAIXA aaf on aaf.IDFECH = ac.IDFECH
                left join AD_ADCADFECHIMG aci on aci.IDFECH = ac.IDFECH
                WHERE ac.CODEMP = ${codEmp}
                and ac.DHFECH between '${dia < 10 ? "0"+dia : dia}/${mes}/${ano} 00:00:00' and '${dia < 10 ? "0"+dia : dia}/${mes}/${ano} 23:59:59'
                AND ac.ATIVO = 'S'
                AND aci.ATIVO = 'S'`;


    let color = "";
    let dadosArray = getDadosSql(sql,true);

    
    if(dadosArray.length > 0){
    dadosArray.map((e)=>{
        let imagemEnviada   = e.IMG_ENV
        let aprovado        = e.APROVADO;
        let confirmacao     = e.CONFIRMACAO;
            if(aprovado == "N"){
                color = "text-white bg-danger"                
            }else if(confirmacao == "N" && imagemEnviada != "S"){
                color = "bg-warning";
            }else if(confirmacao == "S" && imagemEnviada != "S"){
                color = "bg-warning";
            }else if(confirmacao == "S" && imagemEnviada == "S" && aprovado == "S"){
                color = "text-white bg-success"
            }else if(confirmacao == "S" && imagemEnviada == "S" && aprovado == "N"){
                color = "text-white bg-danger"
            }else if(confirmacao == "S" && imagemEnviada == "S" && aprovado == null || aprovado == undefined){
                color = "text-white bg-primary"
            }
        })
    }else{
        color="text-white bg-secondary"
    }

    return color;
}

function mudarCor(id){
    console.log(id)
    let sql = ` select aci.IMG_ENV,aaf.APROVADO, ac.CONFIRMACAO  from AD_CADFECHCAIXA ac
                left join AD_ACOMPFECHCAIXA aaf on aaf.IDFECH = ac.IDFECH
                left join AD_ADCADFECHIMG aci on aci.IDFECH = ac.IDFECH
                where ac.CODEMP < 100
                and ac.IDFECH = ${id}
                AND ac.ATIVO = 'S'
    `
    let color = "";
    let dadosArray = getDadosSql(sql,true);

    if(dadosArray.length > 0){
    dadosArray.map((e)=>{
        let imagemEnviada   = e.IMG_ENV
        let aprovado        = e.APROVADO;
        let confirmacao     = e.CONFIRMACAO;

        // verde = Aprovado // vermelho = Reprovado // Amarelo = Pendente de avaliação // Azul = Incompleto

            if(aprovado == "N"){
                color = "text-white bg-danger"                
            }else if(confirmacao == "N" && imagemEnviada != "S"){
                color = "bg-warning";
            }
            else if(confirmacao == "S" && imagemEnviada != "S"){
                color = "bg-warning";
            }else if(confirmacao == "S" && imagemEnviada == "S" && aprovado == "S"){
                color = "text-white bg-success"
            }else if(confirmacao == "S" && imagemEnviada == "S" && aprovado == "N"){
                color = "text-white bg-danger"
            }else if(confirmacao == "S" && imagemEnviada == "S" && aprovado == null || aprovado == undefined){
                color = "text-white bg-primary"
            }
        })
    }else{
        color="text-white bg-secondary"
    }

    return color;
}
