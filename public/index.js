//alert("helllooooo");
var searchSelect = document.getElementById("searchSelect");
var displayArea = document.getElementById("searchMethod");

searchSelect.addEventListener("change",function(event){
	if (event.target.value==="Keyword") {
		displayArea.innerHTML = showFormForKeyword();
	}
	else if (event.target.value==="Title"){
		displayArea.innerHTML = showFormForTitle();
	}
	else if(event.target.value==="Department"){
		displayArea.innerHTML = showFormForDepartment();
	}
});

function showFormForKeyword(){
	var form = "<form class='form-horizontal'>";
		form +=	"<div class='form-group'>";
		form += "	<label class='control-label col-xs-2'>Keyword(s)</label>";
		form +=	"		 <div class='col-xs-10'>";
		form += "		 	<input type='text' name='keywordInput' class='form-control' placeholder='e.g budget,2017' /></div></div>";
		form += "		<div class='form-group'>";
		form += "		<div class='col-xs-offset-2 col-xs-10'>";
		form += "		<input type='submit' name='submit' value='Search' class='btn btn-primary' /></div></div></form>";

	return form;
}

function showFormForTitle(){
	var form = "<form class='form-horizontal'>";
		form +=	"<div class='form-group'>";
		form += "	<label class='control-label col-xs-2'>Title</label>";
		form +=	"		 <div class='col-xs-10'>";
		form += "		 	<input type='text' name='titleInput' class='form-control' placeholder='e.g 2017-budget' /></div></div>";
		form += "		<div class='form-group'>";
		form += "		<div class='col-xs-offset-2 col-xs-10'>";
		form += "		<input type='submit' name='submit' value='Search' class='btn btn-primary' /></div></div></form>";

	return form;
}

function showFormForDepartment(){
	var form =	'<form class="form-horizontal">';
		form +=	'	<div class="form-group">';
		form += '		<label class="control-label col-xs-2">Department</label>';
		form += '		<div class="col-xs-10">';
		form += '			<select class="form-control" name="departmentInput">';
		form += '			<option><i>Click to select department</i></option><option>Success</option><option>Learning</option><option>Operations</option>';
		form += '				<option>Finance</option><option>Recruitment</option><option>Sales</option><option>Marketing</option></select></div></div>';
		form += '		<div class="form-group">';
		form += '		<div class="col-xs-offset-2 col-xs-10">';
		form += '		<input type="submit" name="submit" value="Search" class="btn btn-primary" /></div></div></form>';

		return form;
}