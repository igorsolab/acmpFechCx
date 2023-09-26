
function formatandoData(data){
    return data.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3")
}

 // formata dados para sankhya
function formatData(data){

    let dataSplit = data.split("-")
    let mes = dataSplit[1];
    let ano = dataSplit[0];
    let dia = ""
    let betweenData={};
    if(mes=="04" || mes =="06" || mes == "09" || mes == "11"){
        dia = 31;
    }else if(mes =="01" || mes == "03" || mes === "05" || mes === "07" || mes === "08" || mes === "10" ||  mes === "12" ){
       dia = 32;
    }else{
       dia = 29;
    }
    betweenData.mes = mes;
    betweenData.ano = ano;
    betweenData.dia = dia;
    console.log(betweenData)
    return betweenData;
}

// função ao clicar no botao de buscar é acionado
function buscarDadosFechamento(){
    let loja = $("#buscar_loja").val();
    let dataSemFormato = $("#buscar_data").val();
    let data = "";
    let whereLoja = "";
    console.log(loja,dataSemFormato)
    if(dataSemFormato== undefined || dataSemFormato == ""){
        console.log("Data está undefined")
    }else{
        console.log("Data está preenchido")
        let dataArray = dataSemFormato.split('-');
        data = `01/${dataArray[1]}/${dataArray[0]}`
        console.log(data)
    }
    if(loja == undefined || loja == ""){
        console.log("Loja está vazio")
    }else{
        console.log("Loja foi preenchido: "+loja)
        whereLoja="AND ac.CODEMP = "+loja;
    }
    cardBusca(data,whereLoja);
}


// apaga a tela inteira e reconstrói novamente com os dados da busca
function cardBusca(dataFull, loja){
    let cardBusca = `
            <div class="container">
                <div class="col d-flex justify-content-center text-left">
                    <div class="card mb-3">
                        <div class="card-header bg-transparent">Buscar:</div>
                        <div class="card-body">
                            <input id="buscar_loja" class="form-control" type="number" placeholder="Buscar por loja"/>
                            <input type="month" style="padding:5px;border-radius:7px" class="mt-3 text-left" id="buscar_data" />
                            <button type="submit" onclick="buscarDadosFechamento()" id="acao_buscar" style="width:100%;" class="btn btn-primary mb-3 mt-3">Buscar!</button>
                        </div>
                    </div>
                </div>
                ${cardResultBusca(dataFull,loja)}
            </div>
    `
    let home = $("#home")
    home.empty();
    home.append(cardBusca)
}

// função que cria a tabela pesquisado
function cardResultBusca(dataFull,loja){

    let dataFormat = ""
    if(dataFull != ""){
        dataFormat = formatData(dataFull);
    }

    let sql = `
    SELECT ac.IDCONFCEGA , t.NOMEFANTASIA, t2.NOMEUSU, ac.DATACADASTRO, ac.STATUS, ac.VLRSALDO, ac.OBSERVACAO, ac.VLRSALDODINHEIRO 
    FROM AD_CONFERENCIACEGA ac 
    INNER JOIN TSIEMP t ON t.CODEMP = ac.CODEMP 
    INNER JOIN TSIUSU t2 ON t2.CODUSU = ac.CODUSUCADASTRO
    INNER JOIN TSICTA t3 ON t3.CODCTABCOINT = ac.CODCTABCOINT
    WHERE 1=1
    ${dataFormat}
    ${loja}
    `;
    console.log(sql)

    let dadosConfCega = getDadosSql(sql,true);
    return construindoTabela(dadosConfCega);
}
