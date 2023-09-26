function fechamentosReprovados(){

    let divFechamento = `
        <div id="filtroFechamento">
            ${filtroFechamentosReprovados()}
        </div>
        <div id="cardsReprovados">
            ${notasReprovadas()}
        </div>
    `
    return divFechamento
    // notasReprovadas()
}

function filtroFechamentosReprovados(){
    let filtro = `
    <div class="container">
        <div class="col d-flex justify-content-center text-left">
            <div class="card mb-3">
                <div class="card-header bg-transparent">Buscar:</div>
                <div class="card-body">
                    De: <input type="date" style="padding:5px;border-radius:7px" class="mt-1 form-control text-left" id="data_fechamento_ini" />
                    Ate: <input type="date" style="padding:5px;border-radius:7px" class="mt-1 form-control text-left" id="data_fechamento_fin" />
                    ${selectEmpresa()}
                    <button type="submit" onclick="filtraFechamento()" style="width:100%;" class="btn btn-primary mb-3 mt-3">Buscar</button>
                </div>
            </div>
        </div>
    </div>
    `;
    return filtro;
}

function filtraFechamento(){
    let dataSemFormatoIni = $("#data_fechamento_ini").val()
    let dataSemFormatoFim = $("#data_fechamento_fin").val()

    let selectEmpresa = $("#selectNotasReprovadas").val()
    let loja = ""
    let data = ""
    if(selectEmpresa != ""){
        loja = "AND t2.CODEMP = "+selectEmpresa;
    }
    if(dataSemFormatoIni != "" && dataSemFormatoFim != ""){
        data = `AND ac.DHFECH BETWEEN '${formataData(dataSemFormatoIni)} 00:00:00' AND '${formataData(dataSemFormatoFim)} 00:00:00'`
    }

    $("#cardsReprovados").empty()
    $("#cardsReprovados").append(notasReprovadas(loja,data))
}

function formataData(data){
    let dataComFormato = data.split("-")
    return `${dataComFormato[2]}/${dataComFormato[1]}/${dataComFormato[0]}`
}

function selectEmpresa(){
    let sql = `SELECT CODEMP, NOMEFANTASIA FROM TSIEMP WHERE CODEMP < 100`;
    let dadosSelect = getDadosSql(sql,true);
    let select = `
    <select class="form-select mt-3" id="selectNotasReprovadas">
        <option value="" selected>Selecione a empresa</option>`;

        for(let i = 0; i < dadosSelect.length; i ++){

            select +=`<option value="${dadosSelect[i].CODEMP}">${dadosSelect[i].NOMEFANTASIA}</option>`;
        }
    
    select+=`</select>`;
    return select;
}

function notasReprovadas(loja,data){
    if(loja==undefined){
        loja=""
    }
    if(data==undefined){
        data = ""
    }
    let sql = `
        select aa.IDFECH, aa.OBSERVACAO, ac.CONFIRMACAO,t2.NOMEFANTASIA , t.NOMEUSUCPLT , ac.IDCONFCEGA, ac.CODUSU from AD_ACOMPFECHCAIXA aa 
        inner join AD_CADFECHCAIXA ac on ac.IDFECH = aa.IDFECH
        inner join AD_CONFERENCIACEGA ac2 on ac2.IDCONFCEGA = ac.IDCONFCEGA 
        inner join TSIUSU t on aa.CODUSU = t.CODUSU
        inner join TSIEMP t2 on t2.CODEMP = aa.CODEMP 
        where APROVADO = 'N'
        ${loja}
        ${data}
    `;

    console.log(sql)
    let dadosNotasReprovadas = getDadosSql(sql,true)

    let rowReprovado=""
    if(dadosNotasReprovadas.length > 0){
    
        dadosNotasReprovadas.map((e)=>{
            rowReprovado += `
                <tr>
                    <td>
                        <div class="card">
                            <div class="card-header">ID Conferencia Cega: ${e.IDCONFCEGA}</div>
                            <div class="card-body">
                                Empresa: ${e.NOMEFANTASIA}<br/>
                                Cod. Usuario: ${e.CODUSU} - ${e.NOMEUSUCPLT}<br/>
                                Observacao: ${e.OBSERVACAO != null ? e.OBSERVACAO : "Sem observacao"}
                            </div>
                            <div class="card-footer d-flex justify-content-around">
                                <button class="btn btn-secondary" onclick="visualizaImagens(${e.IDFECH},'notasReprovadas')"><span title="Visualizar Nota"><i class="bi bi-file-earmark-text-fill"></i></span></button>
                                <button class="btn btn-success" onclick="salvarDadosFechamento(${e.IDFECH})"><span title="Reprovar fechamento do caixa"><i class="bi bi-check2"></i></span></button>
                            </div>
                        </div>
                    </td>
                </tr>
            `
            })
    }
    else{
        rowReprovado = "<tr><td>Nao ha dados</td></tr>" 
    }


    let inicioNotasReprovadas = `
        <div class="container">
            <div class="card">
                <table 
                    id="tableNotasAvaliadas" 
                        class="table"
                        style="overflow:hidden"
                        data-pagination="true"
                        data-page-size="5">
                        <thead>
                            <tr>
                                <th style="text-align:center" data-field="title">Fechamentos reprovados:</th>
                            </tr>
                        </thead>
                    <tbody>
                        ${rowReprovado}
                    </tbody>
                </table>
            </div>
        </div>
    `

    $(function () {
        $('#tableNotasAvaliadas').bootstrapTable({
            paginationVAlign:"both",
            paginationParts:['pageList'],
        });
    });
    return inicioNotasReprovadas;
}