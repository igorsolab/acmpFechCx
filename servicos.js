function acompanhamentoServicos(){
    let card = `
    <div style="background-color:#eee;padding:40px 0;margin-top:-50px;margin-bottom:50px">
    <div class="container row d-flex justify-content-between">
        <div class="col-6  d-flex justify-content-center">
            <div class="card mb-3" style="width:190px">
                <div class="card-header bg-transparent">Buscar:</div>
                <div class="card-body">

                    <div class="d-flex flex-column justify-content-center">
                        ${filtroPorLoja('servicos-item')}
                        <button type="submit" onclick="buscarServicos()" id="acao_buscar" class="btn btn-primary mb-3 mt-3">Buscar</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 d-flex justify-content-center align-self-center" id="servicos_avaliados">${servicosAvaliados()}</div>
    </div>
    </div>
    <div id="acompanhamento_servico"></div>
    <div class="mt-5" id="detalhes_comprovante"></div>
    `

    return card
}


function buscarServicos(){
    let tela = $("#acompanhamento_servico")
    let valoresLojas = document.querySelectorAll(".servicos-item:checked");
    let valoresSelecionados = Array.from(valoresLojas).map(e=>e.value);

    let sql = `
    select ac.IDSERV, ac.NUNOTA, ac.TIPOARQUIVO, ac.LABEL, ac.AVALIACAO, t2.NOMEFANTASIA from AD_CADFECHSERVICES ac
    inner join TGFCAB t on t.NUNOTA = ac.NUNOTA
    inner join TSIEMP t2 on t2.CODEMP = t.CODEMP
    `
    if(valoresSelecionados.length === 0){
        sql += `where t2.CODEMP < 100`
    }else if(valoresSelecionados.length>0){
        sql += `where t2.CODEMP IN (${valoresSelecionados.join(",")})`
    }
    sql += `AND AVALIACAO = 'E'`;
    let cardServicos = ""
    let dadosServicos = getDadosSql(sql,true)
    if(dadosServicos.length < 1){
        cardServicos = "<h6 class='mt-5 text-center'>Nao ha nenhum servico cadastrado nessa loja</h6>"
    }else{
        cardServicos = `<div class="container"> <div class="row" style="margin:0 auto">`
        for(let i = 0; i < dadosServicos.length; i++){
            cardServicos+=`
            <div class="col-3 mt-4 card-single">
                <div class="card" >
                    <div class="card-body">
                        <h5 class="card-title d-flex justify-content-between"><div>${dadosServicos[i].NOMEFANTASIA}</div> <div>#${i+1}</div></h5>
                        <h6 class="card-subtitle mb-2 text-muted">NUNOTA: ${dadosServicos[i].NUNOTA}</h6>
                        <p>${dadosServicos[i].LABEL}</p>
                        <div class="card-footer d-flex justify-content-around">
                            <button class="btn btn-secondary" onclick="expandirDocumento('${dadosServicos[i].IDSERV}')"><span title="Visualizar Nota"><i class="bi bi-file-earmark-text-fill"></i></span></button>
                            <button class="btn btn-info" onclick="detalheComprovante('${dadosServicos[i].NUNOTA}','detalhes_comprovante',${i+1})"><span title="Ver detalhes do comprovante"><i class="bi bi-pencil-square"></i></span></button>
                            <button class="btn btn-success" data-card="card${i}" style onclick="salvarDocServico('${dadosServicos[i].IDSERV}','card${i}')"><span title="Aprovar fechamento do caixa"><i class="bi bi-check2"></i></span></button>
                            <button class="btn btn-danger" data-excluido="card${i}" onclick="modalReprovacaoServico('${dadosServicos[i].IDSERV}','card${i}')"><span title="Reprovar fechamento do caixa"><i class="bi bi-trash"></i></span></button>
                            
                        </div>
                    </div>
                </div>
            </div>
            `
        }
        cardServicos+="</div></div>"
        
    }
    tela.empty()
    $("#detalhes_comprovante").empty()
    tela.append(cardServicos)
}

function expandirDocumento(id){

    let sql = `SELECT DOCUMENTO,TIPOARQUIVO FROM AD_CADFECHSERVICES WHERE IDSERV = ${id}`
    let dadosDocumento = getDadosSql(sql,true)
    
    if(dadosDocumento[0].TIPOARQUIVO == "I"){
        const novaJanela = window.open("", "_blank");
            
        novaJanela.document.write(`<img src="${dadosDocumento[0].DOCUMENTO}" style="width:100%" alt="Descrição da imagem">`);
        
        window.addEventListener("beforeunload", () => {
            novaJanela.close();
        });
    }else if(dadosDocumento[0].TIPOARQUIVO == "P"){
        const novaJanela = window.open("", "_blank");
            
        novaJanela.document.write(`<embed src="${dadosDocumento[0].DOCUMENTO}" width="100%" height="100%" type="application/pdf">`);
        
        window.addEventListener("beforeunload", () => {
            novaJanela.close();
        });
    }

}


function salvarDocServico(id,card){

    let fields = {}
    let entity = 'AD_CADFECHSERVICES'
    let key = {
        "IDSERV":formatDataSankhya(id)
    }
    fields.AVALIACAO = formatDataSankhya("S")
    saveRecord(entity,fields,key)


    var card = document.querySelector(`[data-card="${card}"]`).closest(".card-single");
            
    // Verifique se o card foi encontrado
    if (card) {
        // Remova o card do DOM
        card.remove();
    }
}

function modalReprovacaoServico(id,text){
    let modal = `
    
    <div class="modal" id="modalServicoReprovado" tabindex="-1">
        <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reprovar fechamento</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="fechaModal('modalServicoReprovado')" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Motivo desse fechamento esta sendo reprovado:
                    <textarea class="form-control" id="motivoReprovacaoServico" style="width:100%" placeholder="Motivo"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="fechaModal('modalServicoReprovado')" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" onclick="reprovacaoServico(${id},'${text}')" class="btn btn-primary">Salvar</button>
                </div>
            </div>
        </div>
    </div>
`

    let body= $("body")
    body.append(modal);

    var myModal = new bootstrap.Modal(document.getElementById('modalServicoReprovado'),{
        keyboard:false,
        backdrop:false
    })
    myModal.show()

}

function reprovacaoServico(id,card){

    let observacao = $("#motivoReprovacaoServico").val()
    let fields = {}
    let entity = 'AD_CADFECHSERVICES'
    let key = {
        "IDSERV":formatDataSankhya(id)
    }
    fields.AVALIACAO = formatDataSankhya("N")
    fields.OBSERVACAO = formatDataSankhya(observacao)
    saveRecord(entity,fields,key)


    var card = document.querySelector(`[data-excluido="${card}"]`).closest(".card-single");
            
    console.log(card)
    // Verifique se o card foi encontrado
    if (card) {
        // Remova o card do DOM
        card.remove();
    }

    fechaModal('modalServicoReprovado')
    setTimeout(()=> {
        $('body').css('overflow', 'auto');
    },2000)
}

function servicosAvaliados(){
    let layoutServicesAvaliados = `
        <div class="d-flex flex-column" style="background-color:white;padding:30px;border-radius:10px">
            <h4 class="text-center">Servicos avaliados</h4>
            <div class="d-flex flex-row justify-content-around mt-3">
                <button type="button" class="btn btn-outline-success " style="margin-right:0px 10px;" onclick="servicosAprovados()">Aprovados</button>
                <button type="button" class="btn btn-outline-danger" style="margin:0px 10px; " onclick="servicosReprovados()">Reprovados</button>
                <button type="button" class="btn btn-outline-warning" style="margin-left:0px 10px;" onclick="servicosCorrigidos()">Corrigidos</button>
            </div>
        </div>
    `   

    return layoutServicesAvaliados
}


function servicosAprovados(emp){

    let sql = `
    select ac.IDSERV, ac.NUNOTA, ac.TIPOARQUIVO, ac.LABEL, ac.AVALIACAO, t2.NOMEFANTASIA from AD_CADFECHSERVICES ac
    inner join TGFCAB t on t.NUNOTA = ac.NUNOTA
    inner join TSIEMP t2 on t2.CODEMP = t.CODEMP
    WHERE AVALIACAO = 'S'
    `;
    if(emp == undefined || emp == ""){
        sql+=`AND t.CODEMP < 100`
    }else{
        sql+="AND t.CODEMP = "+emp
    }
    let servicosAprovados = ""
    let dadosServicos = getDadosSql(sql,true)

    if(dadosServicos.length < 1){
        servicosAprovados += "<tr><td><h6 class='mt-5 text-center'>Nao ha nenhum servico aprovado</h6></td></tr>"
    }else{
        servicosAprovados = `<div class="container"> <div class="row" style="margin:0 auto">`
        for(let i = 0; i < dadosServicos.length; i++){
            servicosAprovados+=`

            <tr>
                <td>
                    <div class="card">
                        <div class="card-body">
                            <p><strong>#${i+1}</strong></p>
                            <div class="d-flex justify-content-between">
                                <h5 class="card-title">${dadosServicos[i].NOMEFANTASIA}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">NUNOTA: ${dadosServicos[i].NUNOTA}</h6>
                            </div>
                            <h6>Descricao do titulo: <span style="font-weight:400"> ${dadosServicos[i].LABEL}</span></h6>
                        </div>
                        <div class="card-footer d-flex justify-content-around">
                            <button class="btn btn-secondary" onclick="expandirDocumento('${dadosServicos[i].IDSERV}')"><span title="Visualizar Nota"><i class="bi bi-file-earmark-text-fill"></i></span></button>
                            <button class="btn btn-info" onclick="detalheComprovante('${dadosServicos[i].NUNOTA}','detalhes_comprovante',${i+1})"><span title="Ver detalhes do comprovante"><i class="bi bi-pencil-square"></i></span></button>
                        </div>
                    </div>
                </td>
            </tr>
            `
        }
        
        servicosAprovados+="</div></div>"
        
    }
    tabelaServicosAvaliados(servicosAprovados, 'servicosAprovados','Servicos Aprovados: ','servicosAprovadosTable')
}

function servicosReprovados(emp){
    let sql = `
    select ac.IDSERV, ac.NUNOTA, ac.TIPOARQUIVO, ac.LABEL, ac.AVALIACAO, t2.NOMEFANTASIA,ac.OBSERVACAO from AD_CADFECHSERVICES ac
    inner join TGFCAB t on t.NUNOTA = ac.NUNOTA
    inner join TSIEMP t2 on t2.CODEMP = t.CODEMP
    WHERE AVALIACAO = 'N'
    `;

    if(emp == undefined || emp == ""){
        sql+=`AND t.CODEMP < 100`
    }else{
        sql+="AND t.CODEMP = "+emp
    }

    let servicosReprovados = ""
    let dadosServicos = getDadosSql(sql,true)
    if(dadosServicos.length < 1){
        servicosReprovados = "<tr><td><h6 class='mt-5 text-center'>Nao ha nenhum servico reprovado</h6></td></tr>"
    }else{
    
    servicosReprovados = `<div class="container"> <div class="row" style="margin:0 auto">`
        for(let i = 0; i < dadosServicos.length; i++){
            servicosReprovados+=`

            <tr>
                <td>
                    <div class="card">
                        <div class="card-body">
                            <p><strong>#${i+1}</strong></p>
                            <div class="d-flex justify-content-between">
                                <h5 class="card-title">${dadosServicos[i].NOMEFANTASIA}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">NUNOTA: ${dadosServicos[i].NUNOTA}</h6>
                            </div>
                            <h6>Descricao do titulo: <span style="font-weight:400"> ${dadosServicos[i].LABEL}</span></h6>
                            <h6>Motivo da reprovacao: <span style="font-weight:400">${dadosServicos[i].OBSERVACAO}</span></h6>
                        </div>
                        <div class="card-footer d-flex justify-content-around">
                            <button class="btn btn-secondary" onclick="expandirDocumento('${dadosServicos[i].IDSERV}')"><span title="Visualizar Nota"><i class="bi bi-file-earmark-text-fill"></i></span></button>
                            <button class="btn btn-info" onclick="detalheComprovante('${dadosServicos[i].NUNOTA}','detalhes_comprovante',${i+1})"><span title="Ver detalhes do comprovante"><i class="bi bi-pencil-square"></i></span></button>
                            <button class="btn btn-success" data-card="card${i}" style onclick="salvarDocServico('${dadosServicos[i].IDSERV}','card${i}')"><span title="Aprovar fechamento do caixa"><i class="bi bi-check2"></i></span></button>
                        </div>
                    </div>
                </td>
            </tr>
            `
        }
        
        servicosReprovados+="</div></div>"
    }
    tabelaServicosAvaliados(servicosReprovados, 'servicosReprovados','Servicos Reprovados: ','servicosReprovadosTable')
}


function servicosCorrigidos(emp){
    let sql = `
    select ac.IDSERV, ac.NUNOTA, ac.TIPOARQUIVO, ac.LABEL, ac.AVALIACAO, t2.NOMEFANTASIA,ac.OBSERVACAO from AD_CADFECHSERVICES ac
    inner join TGFCAB t on t.NUNOTA = ac.NUNOTA
    inner join TSIEMP t2 on t2.CODEMP = t.CODEMP
    WHERE AVALIACAO = 'C'
    `;

    if(emp == undefined || emp == ""){
        sql+=`AND t.CODEMP < 100`
    }else{
        sql+="AND t.CODEMP = "+emp
    }

    let servicosCorrigidos = ""
    let dadosServicos = getDadosSql(sql,true)
    if(dadosServicos.length < 1){
        servicosCorrigidos = "<tr><td><h6 class='mt-5 text-center'>Nao ha nenhum servico reprovado</h6></td></tr>"
    }else{
    
    servicosCorrigidos = `<div class="container"> <div class="row" style="margin:0 auto">`
        for(let i = 0; i < dadosServicos.length; i++){
            servicosCorrigidos+=`

            <tr>
                <td>
                    <div class="card">
                        <div class="card-body">
                                <p><strong>#${i+1}</strong></p>
                                <div class="d-flex justify-content-between">
                                    <h5 class="card-title">${dadosServicos[i].NOMEFANTASIA}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">NUNOTA: ${dadosServicos[i].NUNOTA}</h6>
                            </div>
                            <h6>Descricao do titulo: <span style="font-weight:400"> ${dadosServicos[i].LABEL}</span></h6>
                            <h6>Motivo da reprovacao: <span style="font-weight:400">${dadosServicos[i].OBSERVACAO}</span></h6>
                        </div>
                        <div class="card-footer d-flex justify-content-around">
                            <button class="btn btn-secondary" onclick="expandirDocumento('${dadosServicos[i].IDSERV}')"><span title="Visualizar Nota"><i class="bi bi-file-earmark-text-fill"></i></span></button>
                            <button class="btn btn-info" onclick="detalheComprovante('${dadosServicos[i].NUNOTA}','detalhes_comprovante',${i+1})"><span title="Ver detalhes do comprovante"><i class="bi bi-pencil-square"></i></span></button>
                            <button class="btn btn-success" data-card="card${i}" style onclick="salvarDocServico('${dadosServicos[i].IDSERV}','card${i}')"><span title="Aprovar fechamento do caixa"><i class="bi bi-check2"></i></span></button>
                        </div>
                    </div>
                </td>
            </tr>
            `
        }
        
        servicosCorrigidos+="</div></div>"
    }
    tabelaServicosAvaliados(servicosCorrigidos, 'servicosCorrigidos','Servicos Corrigidos: ','servicosCorrigidosTable')
}

function tabelaServicosAvaliados(servicos, nome, title,nomeTable){
    $("#detalhes_comprovante").empty()

    let tela = $("#acompanhamento_servico")

    let tabelaPaginada = `

    <div class="container">
        <div class="col-3 mb-4" style="margin:0 auto;">
            ${selectEmpresa(nome,`onchange="atualizaAvaliados('${nome}')"`)}
        </div>
        <div class="card" style="max-width:500px;margin:0 auto;">
            <table 
                id="${nomeTable}"
                    class="table table-bordered"
                    style="overflow:hidden;border-collapse:separate;"
                    data-pagination="true"
                    data-page-size="3"
                    data-toggle="table">
                    <thead style="font-weight:200;font-size:30px;">
                        <tr class="table-borderless" >
                            <th data-field="title">${title}</th>
                        </tr>
                    </thead>
                <tbody>
                    ${servicos}
                </tbody>
            </table>
        </div>
    </div>
    `
    $(function () {
        $(`#${nomeTable}`).bootstrapTable({
            paginationVAlign:"both",
            paginationParts:['pageList'],
        });
    });
    tela.empty()
    tela.append(tabelaPaginada)
}


function atualizaAvaliados(nome){
    let emp = $(`#${nome}`).val()
    if(nome=="servicosReprovados"){
        servicosReprovados(emp)
    }else if(nome=="servicosAprovados"){
        servicosAprovados(emp)
    }else{
        servicosCorrigidos(emp)
    }
}