<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>RECARGA</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="stylesheet" href="./css/style.css"/>
	<!-- Latest compiled and minified CSS -->
	<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
		integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p"
		crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js"
		integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" pdfmake
		crossorigin="anonymous"></script>
	<!-- jQuery library -->
	<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
	<!-- Popper JS -->
	<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/gojs/2.1.48/go.js"></script>

	<!-- Axios -->
	<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
	<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />

	<!-- Tabela Responsiva-->
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs//0.1.36/pdfmake.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/vfs_fonts.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
	<!-- Script de C3 -->
	<link href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css" rel="stylesheet" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js"></script>


	<!-- Links do Bootstrap table -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://unpkg.com/bootstrap-table@1.22.1/dist/bootstrap-table.min.css">


	<!-- Scripts do bootstrap table  -->
	<script src="https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/bootstrap-table@1.22.1/dist/bootstrap-table.min.js"></script>


	<!-- Script de API Teste(PC Pessoal) -->
	<!-- <script language="JavaScript">
		document.write('<scr' + 'ipt src="http://172.16.62.168/acompFechCaixa/acompFechCaixa.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
		document.write('<scr' + 'ipt src="http://172.16.62.168/acompFechCaixa/notasReprovadas.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
		document.write('<scr' + 'ipt src="http://172.16.62.168/acompFechCaixa/sankhya.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
		document.write('<scr' + 'ipt src="http://172.16.62.168/acompFechCaixa/confCega.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
		document.write('<scr' + 'ipt src="http://172.16.62.168/acompFechCaixa/servicos.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
	</script> -->

	<!-- Script de API Teste(Servidor)-->
	<script language="JavaScript">
					hostname = location.hostname;
					document.write('<scr' + 'ipt src="http://'+hostname+'/sankhya/acompFechCaixa/acompFechCaixa.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
					document.write('<scr' + 'ipt src="http://'+hostname+'/sankhya/acompFechCaixa/notasReprovadas.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
					document.write('<scr' + 'ipt src="http://'+hostname+'/sankhya/acompFechCaixa/sankhya.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
					document.write('<scr' + 'ipt src="http://'+hostname+'/sankhya/acompFechCaixa/confCega.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
					document.write('<scr' + 'ipt src="http://'+hostname+'/sankhya/acompFechCaixa/servicos.js?versao=' + Math.random() + '?"><\/scr' + 'ipt>');
	</script> 

	<snk:load />

	<!-- <link rel="stylesheet" href="${BASE_FOLDER}/styles.css" />  -->
</head>

<body>
	<div id="pesquisa"> </div>
	<div id="exibe"></div>
</body>
<script>
	IniciarApp();
</script>
<style>
</style>

</html>