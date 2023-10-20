async function sendSankhyaRequest(method, url, data) {
    const cookie = jnid ? `JSESSIONID=${jnid}` : '';
    const options = {
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            cookie
        },
        data: data
    };
    console.log('Options: ', options)
    return await axios.request(options).then(function(response) {
        // console.log(response.data);
        if(response.data && response.data.responseBody && response.data.responseBody.rows){
            console.log(response.data.responseBody.rows);
        }
        return response.data;
    }).catch(function(error) {
        return error;
    }); 
}

function formatDataSankhya(data){
    return {
        "$":data
    }
}
async function dbExplorer(sql = '') {
    const data = {
        serviceName: 'DbExplorerSP.executeQuery',
        requestBody: {
            sql: sql
        }
    }

    const url = "http://"+hostname+":"+port+"/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json&mgeSession="+jnid;
    try {
        const result = await sendSankhyaRequest("POST", url, JSON.stringify(data));
        
        if (result.responseBody && result.responseBody.rows) {
            return result.responseBody.rows;
        } else {
            return 'Erro ao executar a query:' + result.statusMessage;
        }
    } catch (err) {
        throw new Error(err);
    }
}

// async function CACSPRecargaServico(){
//     const sql = `SELECT CODEMP, CODVEND FROM TSIUSU WHERE CODUSU =  ${user}`; 
//     const produto = $('#inputRecarga').val();
//     const pagamento = $('#inputTelefone').val();
//     const result = await dbExplorer(sql);
//     const sql2 = `SELECT  VLRVENDA  from TFXPRC  WHERE CODPROD  = ${produto}`;
//     const result2 = await dbExplorer(sql2);
//     const valor = result2[0][0]
//     const codemp = result[0][0];
//     const codvend = result[0][1];
//     const date = new Date();
//     const data = {
//    "serviceName":"CACSP.incluirNota",
//    "requestBody":{
//       "nota":{
//          "cabecalho":{
//             "NUNOTA":{
//             },
//             "CODPARC":{
//                "$":"213358"
//             },
//             "DTNEG":{
//                "$":date.toLocaleDateString()
//             },
//             "CODTIPOPER":{
//                "$":"1209"
//             },
//             "CODTIPVENDA":{
//                "$":"24"
//             },
//             "CODVEND":{
//                "$": codvend
//             },
//             "CODEMP":{
//                "$": codemp
//             },
//             "TIPMOV":{
//                "$":"P"
//             },
// 					  "PERCDESC":{
//                "$": 0
//             }
//          },
//          "itens":{
//             "INFORMARPRECO":"True",
//             "item":[
//                   {
//                    "NUNOTA":{
//                   },
//                   "CODPROD":{
//                      "$": produto
//                   },
//                   "QTDNEG":{
//                      "$":"1"
//                   },
//                   "CODLOCALORIG":{
//                      "$":"0"
//                   },
//                   "CODVOL":{
//                      "$":"UN"
//                   },
//                     "PERCDESC":{
//                         "$": 0
//                     },
//                         "VLRUNIT":{
//                         "$": valor
//                     },
//                         "VLRTOT":{
//                         "$": valor
//                     }
//                }               
//             ]
//          }
//       }
//    }
// }
//    const url = "http://"+hostname+":"+port+"/mgecom/service.sbr?serviceName=CACSP.incluirNota&mgeSession="+jnid+"&outputType=json";
// //    const url = "http://"+hostname+":"+port+"/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json&mgeSession="+jnid;
    


//     try {
//         // await authenticate();
//         const result = await sendSankhyaRequest("POST", url, JSON.stringify(data));
//         // await deAuthenticate();
//         if (result.responseBody !== undefined ) {
//             // let tela = $("#pNunota");
//             // tela.empty();
//           $('#pNunota').append(document.createTextNode(result.responseBody.pk.NUNOTA.$)) 
//           console.log($('#pNunota'))  
//           console.log(result.responseBody.pk.NUNOTA.$)
//             return result.responseBody.pk.NUNOTA.$
//         } else {
//             console.log("Resultado:", result)
//             return console.log('Erro ao executar o update: ' + result.statusMessage);
//         }
//     } catch (err) {
//         // logger.error(err);
//         throw new Error(err);
//     }
// }

// DBEXPLORER XHR
function getDadosSql(sql, resultAsObject){
	if ( resultAsObject == null ) resultAsObject = false;
    var dados;
    var data = JSON.stringify({
    "serviceName": " DbExplorerSP.executeQuery",
    "requestBody": {
        "sql": sql
    }});
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {

          let data2 = JSON.parse(this.response);
		  let fieldsMetaData = data2.responseBody.fieldsMetadata;
		    // console.log("Data02",this.response);
          if ( resultAsObject ) {
			  dados = [];
			  for (let z = 0; z < data2.responseBody.rows.length; z++){
				  var baseObject = new Object();
				  for (let y = 0; y < fieldsMetaData.length; y++){
					baseObject[fieldsMetaData[y].name] = data2.responseBody.rows[z][y];
					baseObject[fieldsMetaData[y].name.toLowerCase()] = data2.responseBody.rows[z][y];
				  }
				  dados.push(baseObject);
			  }
		  } else {
			dados = data2.responseBody.rows;
		  }
        //   console.log("Dados", dados);

      }});

    xhr.open("POST", "http://"+hostname+":"+port+"/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json&mgeSession="+jnid, false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data, true);

    return dados;
}

// incluir/editar Registro no sankhya XHR 
function saveRecord(entity,fields,key){

    let result;
  
    let url = "http://"+hostname+":"+port+"/mge/service.sbr?serviceName=CRUDServiceProvider.saveRecord&outputType=json&mgeSession="+jnid;
    let obj = {
        "serviceName":"CRUDServiceProvider.saveRecord",
        "requestBody":{
           "dataSet":{
                "rootEntity":entity,
                "includePresentationFields":"S",
                "dataRow":{
                    "localFields": fields
                }, "entity":{
                    "fieldset":{
                        "list":"*"
                    }
                }
            }
        }
    }
    if(key != "") {
        obj.requestBody.dataSet.dataRow.key = key
    }
    console.log(obj)
  
    const data = JSON.stringify(obj);
    console.log(JSON.stringify(obj))
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
  
    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
        let data2 = JSON.parse(this.response);
        if(data2.responseBody != undefined){
            result = data2.responseBody.entities.entity;
        }else{
            alert(`Erro ao salvar dados! <br> Erro : <br> ${this.responseText}`);
        }
    }});
  
    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
  
    return result
  }


  function abrirLoading(){

    let modal = `
    <div class="modal fade" id="modalLoading">
        <div class="modal-dialog">
            <div class="modal-content">
                <!-- Modal Header -->
                <div class="modal-header">
                    <h4 class="modal-title">Carregando...</h4>
                </div>

                <!-- Modal body com spinner Bootstrap -->
                <div class="modal-body text-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    `

    $("body").append(modal);

    var modalLoading = new bootstrap.Modal(document.getElementById('modalLoading'), {
        keyboard: false,
        backdrop:false
      })
      modalLoading.show()
      setTimeout(()=>{
        construindoTabela(modalLoading)
      },1000)
  
  }

  function stopLoading(modalLoading){
        console.log("stopLoading")
        modalLoading.hide();
  }