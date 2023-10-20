
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
    (betweenData)
    return betweenData;
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
    let dadosConfCega = getDadosSql(sql,true);
    return construindoTabela(dadosConfCega);
}


function selectEmpresa(nome,onchange){
    let sql = `SELECT CODEMP, NOMEFANTASIA FROM TSIEMP WHERE CODEMP < 100`;
    let dadosSelect = getDadosSql(sql,true);
    let select = `
        <select ${onchange} class="form-select" id="${nome}">
        <option value="" selected>Selecione a empresa</option>`;

        for(let i = 0; i < dadosSelect.length; i ++){

            select +=`<option value="${dadosSelect[i].CODEMP}">${dadosSelect[i].NOMEFANTASIA}</option>`;
        }
    
    select+=`</select>`;
    return select;
}