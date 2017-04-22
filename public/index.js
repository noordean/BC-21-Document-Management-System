

//assigning the elements to use to variables for easy access
var searchSelect = document.getElementById("searchSelect");
var displayArea = document.getElementById("searchMethod");

var searchInputTitle = document.getElementById("searchInputTitle");
var searchInputKeyword = document.getElementById("searchInputKeyword");
var searchInputDepartment = document.getElementById("searchInputDepartment");
var searchInputUsername = document.getElementById("searchInputUsername");
var searchDocTitle = document.getElementById("searchDocTitle");
var searchDocDepartment = document.getElementById("searchDocDepartment");
var searchDocKeyword = document.getElementById("searchDocKeyword");
var searchDocUsername = document.getElementById("searchDocUsername");

var searchDisplay = document.getElementById("searchDisplay");


//hide the department.username and keyword form
searchDocDepartment.style.display = "none";		
searchDocKeyword.style.display = "none";
searchDocUsername.style.display = "none";

searchSelect.addEventListener("change",function(event){
	//if the selected search method is "Keyword",then hide other forms
	if (event.target.value === "Keyword") {
		searchDocTitle.style.display = "none";
		searchDocDepartment.style.display = "none";
		searchDocUsername.style.display = "none";
		searchDocKeyword.style.display = "";
	}
	else if (event.target.value==="Title"){

	//if the selected search method is "Title", then hide other forms
		searchDocKeyword.style.display = "none";
		searchDocDepartment.style.display = "none";
		searchDocUsername.style.display = "none";
		searchDocTitle.style.display = "";
	}
	else if(event.target.value === "Department"){

	//if the selected search method is "Department", then hide other forms
		searchDocTitle.style.display = "none";
		searchDocKeyword.style.display = "none";
		searchDocUsername.style.display = "none";
		searchDocDepartment.style.display = "";
	}
	else if(event.target.value === "Username"){

	//if the selected search method "Username", then hide other forms	
		searchDocTitle.style.display = "none";
		searchDocKeyword.style.display = "none";
		searchDocUsername.style.display = "";
		searchDocDepartment.style.display = "none";
	}
});



/*send request to the server depending on the search method selected by the user
 *so that server would be able to recognise which form is sending request, thus knowing 
 *which table field to query
 */
searchDocTitle.addEventListener("submit",function(event){
	fetch("search",{
		method:"post",
		headers:{"Content-Type":"application/json"},
		body:JSON.stringify({"searchTitleValue":searchInputTitle.value})
	}).then(function(res){
		if(res.ok){
			res.json().then(function(json){
				if(json.length>0){
					searchDisplay.innerHTML = showSearchTable(json);
				}
				else{
					searchDisplay.innerHTML="<p id='noResult'>No result found</p>";
				}
			});
		}
	});
	event.preventDefault();
});


searchDocDepartment.addEventListener("submit",function(event){
	fetch("search",{
		method:"post",
		headers:{"Content-Type":"application/json"},
		body:JSON.stringify({"searchDepartmentValue":searchInputDepartment.value})
	}).then(function(res){
		if(res.ok){
			res.json().then(function(json){
				if(json.length>0){
					searchDisplay.innerHTML = showSearchTable(json);
				}
				else{
					searchDisplay.innerHTML="<p id='noResult'>No result found</p>";
				}
			});
		}
	});
	event.preventDefault();
});

searchDocKeyword.addEventListener("submit",function(event){
	fetch("search",{
		method:"post",
		headers:{"Content-Type":"application/json"},
		body:JSON.stringify({"searchKeywordValue":getKeywords(searchInputKeyword.value)})
	}).then(function(res){
		if(res.ok){
			res.json().then(function(json){
				if(json.length>0){
					searchDisplay.innerHTML = showSearchTable(json);
				}
				else{
					searchDisplay.innerHTML="<p id='noResult'>No result found</p>";
				}
			});
		}
	});
	event.preventDefault();
});

searchDocUsername.addEventListener("submit",function(event){
	fetch("search",{
		method:"post",
		headers:{"Content-Type":"application/json"},
		body:JSON.stringify({"searchUsernameValue":searchInputUsername.value})
	}).then(function(res){
		if(res.ok){
			res.json().then(function(json){
				if(json.length>0){
					searchDisplay.innerHTML = showSearchTable(json);
				}
				else{
					searchDisplay.innerHTML="<p id='noResult'>No result found</p>";
				}
			});
		}
	});
	event.preventDefault();
});

//a function that splits the keyword entered into array, then return it 
function getKeywords(keywordStr){
	var keyword = [];
	var keywordsArray = keywordStr.split(",");
		
	for(var i=0;i<keywordsArray.length;i++){
		keyword.push(keywordsArray[i].trim());
	}
	return keyword;
}

/*a function that generates table for search result display,accepting the result returned 
 *from the server as an argument
 */
function showSearchTable(obj){
	var table = "<table class='table table-bordered table-hover'><thead><tr><th>S/N</th><th>Title</th><th>Url</th><th>Department</th><th>User</th><th>Date Created</th></tr></thead><tbody>";
		for(var i=0;i<obj.length;i++){
			table += "<tr>";
			table += "<td>"+(i+1)+"</td>";
			table += "<td>"+obj[i].title+"</td>";
			table += "<td><a target='_blank' href="+obj[i].url+">"+obj[i].url+"</a></td>";	
			table += "<td>"+obj[i].department+"</td>";	
			table += "<td>"+obj[i].user+"</td>";			
			table += "<td>"+ (new Date(obj[i].time)).toLocaleString()+"</td>";
			table += "</tr>";	
		}
		table += "</tbody></table>";

		return table;
}