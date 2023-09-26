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
    <nav class="mb-5" style="background-color: #212529;padding:15px 0px">
        <div class="text-center mb-3 text-white" style=" font-size:2em;">
            <strong>PAINEL DE ACOMPANHAMENTO DA MESA DE FECHAMENTO DE CAIXA DAS LOJAS</strong>
        </div>
        <ul class="nav nav-pills justify-content-center" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button style="color:white;" class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Observar status</button>
            </li>
            <li class="nav-item" role="presentation">
                <button style="color:white;" class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Notas reprovadas</button>
            </li>
        </ul>
    </nav>
    <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">${textHome()}</div>
        <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">${fechamentosReprovados()}</div>
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
                    <input type="month" style="padding:5px;border-radius:7px" class="mt-3 form-control text-left" id="buscar_data" />
                    <button type="submit" onclick="abrirLoading()" id="acao_buscar" style="width:100%;" class="btn btn-primary mb-3 mt-3">Buscar</button>
                </div>
            </div>
        </div>
    </div>
    <div id="tabela-home"></div>
            `
    return card
}

function cardResult(dataFull) {
    let sql = `select * from AD_CADFECHCAIXA order by CODEMP,DHFECH`;
    console.log(dataFull)
    let dadosFechCaixa = getDadosSql(sql, true);
    console.log(dadosFechCaixa)
}


function construindoTabela(modalLoading) {
    let data = $("#buscar_data").val()
    let dataFull = formatData(data)
    if (dataFull.dia == undefined || dataFull.mes == undefined || dataFull.ano == undefined) {
        alert("Data está vazia")
    }
    else {
        let tabela =
            `<div class="col-12">
            <div class="card mb-3">
                <div class="card-header bg-transparent">
                    <h3>Dados do mes atual: </h3>
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

        let sql = "select CODEMP,NOMEFANTASIA from tsiemp t where t.CODEMP < 100"
        let numLojas = getDadosSql(sql)


        for (let z = 0; z < numLojas.length; z++) {

            tabela += `<tr>
                    <th scope="col">${numLojas[z][1]}</th>`

            for (let j = 1; j < dataFull.dia; j++) {

                let color = verificaSeExiste(numLojas[z][0],j, dataFull.mes, dataFull.ano)
                    tabela += ` <td class="${color}" style="cursor:pointer; text-align:center" onclick="fechamentoDeCaixa(${numLojas[z][0]},${j},${dataFull.mes},${dataFull.ano});">
                                    <span title="Loja: ${numLojas[z][1].trim()} na data: ${j < 10 ? "0"+j : j}/${dataFull.mes}/${dataFull.ano}">
                                        <i class="bi bi-file-earmark-fill"></i>
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
    }
}

function fechamentoDeCaixa(codEmp, dia, mes, ano){
    modalFechamento(codEmp,dia,mes,ano)
}

function modalFechamento(codEmp,dia,mes,ano){
    let sql = `
                SELECT  ac.IDCONFCEGA,
                        ac.IDFECH,
                        ac.IDCONFCEGA, 
                        t.NOMEFANTASIA,
                        t2.CODUSU,
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
                        and ac.DHFECH between '${dia<10 ? "0"+dia : dia}/${mes<10 ? "0"+mes : mes}/${ano} 00:00:00' and '${dia<10 ? "0"+dia : dia}/${mes<10 ? "0"+mes : mes}/${ano} 23:59:59'`;

                        console.log(sql)
    let dadosIndividuais = getDadosSql(sql,true)
    let color = ""

    let modal = `
        <div class="modal fade" id="myModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalhes da loja ${dadosIndividuais[0].NOMEFANTASIA}<br>Data: ${dia<10 ? "0"+dia : dia}/${mes<10 ? "0"+mes : mes}/${ano}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('myModal')" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${dadosIndividuais.length == 0 ? "Nao ha registro" : 
                                dadosIndividuais.map((e)=> `
                                <div class="card">
                                    <div class="card-header ${mudarCor(e.IDFECH)}">ID Conferencia Cega: ${e.IDCONFCEGA}</div>
                                    <div class="card-body">
                                        Cod. Usuario: ${e.CODUSU} - ${e.NOMEUSUCPLT}<br/>
                                        Observacao: ${e.OBSERVACAO != null ? e.OBSERVACAO : "Sem observacao"} - ${e.STATUS}
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
                        <button type="button" class="btn btn-secondary" onclick="fechaModal('myModal')" data-bs-dismiss="modal">Close</button
                    </div>
                </div>
            </div>
        </div>`;
    let body = $("body")
    body.append(modal)

    var myModal = new bootstrap.Modal(document.getElementById("myModal"))
    myModal.show(myModal);
}

function modalReprovacaoNota(id){
    console.log(id)

    let modal = `
    
    <div class="modal" id="modalReprovado" tabindex="-1">
        <div class="modal-dialog modal-sm modal-dialog-centered">
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
        let query = `SELECT * FROM AD_CADFECHCAIXA WHERE IDFECH = ${id}`
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

function visualizaImagens(id){
    let sql = `SELECT * FROM AD_CADFECHIMG WHERE IDFECH = ${id}`;
    let imgs = getDadosSql(sql,true)

    let rows = "<div class='row d-flex justify-content-center mb-3'>" 

    for(let i = 1; i < 9; i++){

        if(imgs[0]["IMG0"+i+"_ENV"]=="S"){
            rows += `
            <div class="col-3">
                <div class="card">
                    <div class="card-body" style="height:200px">
                        <a onclick="abrirImagemNovaJanela('${imgs[0]["IMG0"+i]}')" title="Expandir tamanho da imagem" target="_blank">
                            <img style="display:block; width:100%;height:100%;" id="img${i}" src="${imgs[0]["IMG0"+i]}" />
                        </a>
                    </div>
                    <div class="card-footer">
                        <label class="form-label">Descricao do comprovante</label>
                        <h6>${imgs[0]["IMG0"+i+"LABEL"] == null || imgs[0]["IMG0"+i+"LABEL"]== undefined ? "Sem descricao" : imgs[0]["IMG0"+i+"LABEL"]}</h6>
                    </div>
                </div>
            </div>
            `
        }else{
            rows +=""
        }
}

rows+="</div>"

console.log(rows)
let modalImagens = `
<div class="modal fade" id="modalImagens" tabindex="-1">
<div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Comprovantes enviados</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('modalImagens')" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            ${rows}
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="fechaModal('modalImagens')" data-bs-dismiss="modal">Close</button
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
        console.log(dadosAcompFech)
        console.log(dadosAcompFech.length)
        if(dadosAcompFech.length>0){    
            let sql = "SELECT IDACFECH, CODEMP,CODUSU FROM AD_ACOMPFECHCAIXA WHERE IDFECH = "+id;
            let dadosCadFechamento = getDadosSql(sql,true);
            console.log(dadosCadFechamento)

            let fields = {}
            let entity = "AD_ACOMPFECHCAIXA"
            let key = {
                "IDACFECH":formatDataSankhya(dadosCadFechamento[0].IDACFECH)
            }
            fields.IDFECH       = formatDataSankhya(id)
            fields.CODEMP       = formatDataSankhya(dadosCadFechamento[0].CODEMP);
            fields.CODUSU       = formatDataSankhya(dadosCadFechamento[0].CODUSU);
            fields.APROVADO     = formatDataSankhya("S")

            console.log(entity,fields,key)
            saveRecord(entity,fields,key)

        }else{
            let sql = "SELECT IDFECH, CODEMP,CODUSU FROM AD_CADFECHCAIXA WHERE IDFECH = "+id;
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
function fechaModal(nota){
    var myModal = new bootstrap.Modal(document.getElementById(`${nota}`))
    myModal.hide()
    $('#'+nota).remove()
    $('body').removeClass('modal-open')
    $('body').css('padding-right','')
}
function verificaSeExiste(codEmp, dia, mes, ano){

    let sql = ` select aci.IMG01_ENV,aaf.APROVADO, ac.CONFIRMACAO  from AD_CADFECHCAIXA ac
                left join AD_ACOMPFECHCAIXA aaf on aaf.IDFECH = ac.IDFECH
                left join AD_CADFECHIMG aci on aci.IDFECH = ac.IDFECH
                where ac.CODEMP < 100
                AND ac.CODEMP = ${codEmp}
                and ac.DHFECH between '${dia < 10 ? "0"+dia : dia}/${mes < 10 ? "0"+mes : mes}/${ano} 00:00:00' and '${dia < 10 ? "0"+dia : dia}/${mes < 10 ? "0"+mes : mes}/${ano} 23:59:59'
                `;

    let color = "";
    let dadosArray = getDadosSql(sql,true);
    console.log(dadosArray) 

    if(dadosArray.length > 0){
    dadosArray.map((e)=>{
        let imagemEnviada   = e.IMG01_ENV
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
    let sql = ` select aci.IMG01_ENV,aaf.APROVADO, ac.CONFIRMACAO  from AD_CADFECHCAIXA ac
                left join AD_ACOMPFECHCAIXA aaf on aaf.IDFECH = ac.IDFECH
                left join AD_CADFECHIMG aci on aci.IDFECH = ac.IDFECH
                where ac.CODEMP < 100
                and ac.IDFECH = ${id}
    `
    let color = "";
    let dadosArray = getDadosSql(sql,true);
    console.log(dadosArray) 

    if(dadosArray.length > 0){
    dadosArray.map((e)=>{
        let imagemEnviada   = e.IMG01_ENV
        let aprovado        = e.APROVADO;
        let confirmacao     = e.CONFIRMACAO;

        // verde = Aprovado // vermelho = Reprovado // Amarelo = Pendente de avaliação // Azul = Incompleto

            if(aprovado == "N"){
                color = "text-white bg-danger"                
            }
            
            else if(confirmacao == "N" && imagemEnviada != "S"){
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
