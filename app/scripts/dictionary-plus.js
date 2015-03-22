$(document).ready(function(){
    chrome.tabs.getSelected(null,function(tab){
        console.log("1");
        chrome.tabs.executeScript(tab.id, {file: 'content_script.js', allFrames: true}, function() {
            chrome.tabs.sendMessage(tab.id, {method:"getSelected"}, function(response) {
                if(response.seltext != ""){
                    document.getElementById("query").value = trim1(response.seltext).toLowerCase();
                    loadData();
                }
            });
        });
    });

    $('#toPrevent').bind("keyup keypress", function(e) {
      var code = e.keyCode || e.which; 
      if (code  == 13) {               
        e.preventDefault();
        return false;
      }
    });

    $("glyphicon glyphicon-chevron-right").click(function (){
        console.log("clicked");
        $(this).toggleClass('glyphicon glyphicon-chevron-down')
    });
    
    // typeahead code
    /*var countries = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.name); },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 5,
      prefetch: {
        url: ur,
        filter: function(list) {
          return $.map(list, function(country) { return { name: country }; });
        }
      }
    });
     
    countries.initialize();
     
    $('#query').typeahead(null, {
      name: 'countries',
      displayKey: 'name',
      source: countries.ttAdapter()
    });

    
    $('.tt-hint').addClass('form-control');*/
    function trim1 (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    Array.max = function( array ){
        return Math.max.apply( Math, array );
    };
     
    Array.min = function( array ){
        return Math.min.apply( Math, array );
    };

    function updateHaystack(input, needle) {
        //return input.replace(new RegExp('(^|\\s|_|"|\')(' + needle + ')(\'|"|_|\\s|$)','ig'), '$1<b>$2</b>$3');
        return input.replace(new RegExp('(^|)(' + needle + ')(|$)','ig'), '$1<b>$2</b>$3');
        //return stage1.replace(new RegExp('(_)(_)','ig'), '$1<b>$2</b>$3');
    }

    function fetchDate(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = yyyy+'-'+mm+'-'+dd;
        return today;
    }
    
    document.getElementById("query").focus();
    document.getElementById("def").addEventListener("click",function(){loadData()});
	//document.forms[0].addEventListener("submit",function(e){e.preventDefault()},false);
	document.getElementById("query").addEventListener("keydown",function(e){
		if(e.keyCode == 13){
			loadData();
		}
	});
    document.getElementById("1").addEventListener("keydown",function(e){
        if(e.keyCode == 39){
            $("#2").click();
        }
    });

    // Global Variables
    var def = document.getElementById("define");
    var ex = document.getElementById("examples");
    var rel = document.getElementById("relate");

    // *** Function list ***
    // ajax call to get the definition
    function defineAjax(query){
        
        $.ajax({
            url: 'http://api.wordnik.com/v4/word.json/'+query+'/definitions?limit=400&includeRelated=true&useCanonical=false&includeTags=false&api_key=a60386de119d29f6e850d0a487a084df75f529be34f1632cf',
            cache: true,
            type: 'GET',
            dataType: 'JSON',
            success: function (definitions) {
                var i=0; 
                var point;
                var length=definitions.length;
                if(length != 0){
                    def.innerHTML = "";                   
                    i=0;
                    var partOfSpeech = definitions[i].partOfSpeech;
                    def.innerHTML = "<p class='hightext'>"+partOfSpeech+"</p><hr/>";
                    while(i<length){                        
                        if(definitions[i].partOfSpeech != partOfSpeech){
                            partOfSpeech = definitions[i].partOfSpeech;
                            var pos = document.createElement("p");
                            pos.className = "hightext";                            
                            pos.innerHTML = partOfSpeech+"<hr/>";
                            def.appendChild(pos);                                                        
                        }
                        var part = document.createElement("p");
                        part.className = "definitions"
                        part.innerHTML = definitions[i].text;
                        def.appendChild(part);
                        i++;
                    }
                }else{
                    def.innerHTML =  "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                                     "<center><i class='fa fa-exclamation-triangle fa-3x' style='color:#aeb1b1'></i> Nothing found</center>"+
                                     "<br/><br/><br/><br/><br/><br/><br/><br/>";
                }
                //examAjax();
            }
        });
    }

    // ajax call to load the examples
    function examAjax(query){
        $.ajax({
            url: 'http://api.wordnik.com/v4/word.json/'+query+'/examples?includeDuplicates=false&useCanonical=false&skip=0&limit=5&api_key=a60386de119d29f6e850d0a487a084df75f529be34f1632cf',            
            cache: true,
            type: 'GET',
            dataType: 'JSON',
            success: function (examples) {
                //var resArray = JSON && JSON.parse(definitions) || $.parseJSON(definitions);
                var alert = "<div class='alert alert-square alert-info'>"+
                            "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>×</button>"+
                            "<strong>Note:</strong> The examples are a result of cached statements over the internet. They may not be relevant all the time!"+
                            "</div>";
                //$("#examples").append(alert);                         
                var i=0;                
                var length=examples['examples'].length; 
                if(length != 0){            
                    ex.innerHTML = alert+"<p class='hightext'>Examples:</p>";
                    while(i<length){
                        var part = document.createElement("p");
                        part.className = "definitions ";
                        part.innerHTML = updateHaystack(examples['examples'][i].text,query);                    
                        ex.appendChild(part);
                        i++;
                    }
                }else{
                    ex.innerHTML =  "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                                     "<center><i class='fa fa-exclamation-triangle fa-3x' style='color:#aeb1b1'></i> Nothing found</center>"+
                                     "<br/><br/><br/><br/><br/><br/><br/><br/>";
                }
            }
        });
    }

    // ajax call to load related words
    function relateAjax(query){
        $.ajax({
            url: 'http://api.wordnik.com/v4/word.json/'+query+'/relatedWords?useCanonical=false&limitPerRelationshipType=10&api_key=a60386de119d29f6e850d0a487a084df75f529be34f1632cf',            
            cache: true,
            type: 'GET',
            dataType: 'JSON',
            success: function (related) {
                //var resArray = JSON && JSON.parse(definitions) || $.parseJSON(definitions);                         
                var i=0;                
                var length=related.length; 
                if(length != 0){            
                    rel.innerHTML = "";
                    while(i<length){
                        var type = document.createElement("div");                        
                        type.innerHTML = "<p class='hightext' data-toggle='collapse' data-target='#demo"+i+"'>"+related[i].relationshipType+"<span class='glyphicon glyphicon-chevron-right pull-right' id='arrow'></span></p><hr/>";
                        rel.appendChild(type);
                        var pan = document.createElement("div");
                        pan.id = "demo"+i;
                        pan.className = "collapse in";
                        for(var j=0; j<related[i].words.length; j++){
                            var part = document.createElement("p");
                            part.className = "definitions";
                            part.innerHTML = related[i].words[j];                    
                            pan.appendChild(part);
                        }
                        rel.appendChild(pan);
                        i++;
                    }
                }else{
                    rel.innerHTML =  "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                                     "<center><i class='fa fa-exclamation-triangle fa-3x' style='color:#aeb1b1'></i> Nothing found</center>"+
                                     "<br/><br/><br/><br/><br/><br/><br/><br/>";
                }
            }
        });
    }

    function audioAjax(query){
        rel.innerHTML="";
        $.ajax({
            url: 'http://api.wordnik.com/v4/word.json/'+query+'/audio?useCanonical=false&limit=1&api_key=a60386de119d29f6e850d0a487a084df75f529be34f1632cf',            
            cache: true,
            type: 'GET',
            dataType: 'JSON',
            success: function (audio) {
                //var resArray = JSON && JSON.parse(definitions) || $.parseJSON(definitions);                         
                var i=0;                
                var length=audio.length; 
                if(length != 0){            
                    rel.innerHTML = "";
                    while(i<length){
                        var type = document.createElement("p");
                        type.innerHTML = related[i].relationshipType;
                        rel.appendChild(type);
                        //alert(related[i].relationshipType);
                        for(var j=0; j<related[i].words.length; j++){
                            var part = document.createElement("blockquote");
                            part.innerHTML = related[i].words[j];                    
                            rel.appendChild(part);
                        }
                        i++;
                    }
                }else{
                    rel.innerHTML =  "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                                     "<center><i class='fa fa-exclamation-trian fa-3x' style='color:#aeb1b1'></i> Nothing found</center>"+
                                     "<br/><br/><br/><br/><br/><br/><br/><br/>";
                }
            }
        });
    }

    function wordAjax(query){        
        $.ajax({
            url: 'http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date='+fetchDate()+'&api_key=a60386de119d29f6e850d0a487a084df75f529be34f1632cf',
            cache: true,
            type: 'GET',
            dataType: 'JSON',
            success: function (definitions) {
                var i=0; 
                var point;
                var length=definitions.length;
                if(length != 0){
                    var word = document.getElementById("word");
                    word.innerHTML="";
                    word.innerHTML = "<span class='small pull-right'>"+fetchDate()+"</span><p class='hightext'><b>"+definitions.word+"</b></p><hr/>";
                    i=0;
                    var partOfSpeech = definitions.definitions[i].partOfSpeech;
                    var part = document.createElement("p");
                    part.innerHTML = "<i>"+partOfSpeech+"</i>";
                    word.appendChild(part);
                    while(i<definitions.definitions.length){                        
                        if(definitions.definitions[i].partOfSpeech != partOfSpeech){
                            partOfSpeech = definitions.definitions[i].partOfSpeech;
                            var pos = document.createElement("p");                         
                            pos.innerHTML = "<i>"+partOfSpeech+"</i>";
                            word.appendChild(pos);                                                        
                        }
                        var deff = document.createElement("p");
                        deff.className = "definitions";
                        deff.innerHTML = definitions.definitions[i].text+"<br/><span class='pull-right small'>-source: <i>"+definitions.definitions[i].source+"</i></span>";
                        word.appendChild(deff);
                        i++;
                    }
                    var ex = document.createElement("p");
                    ex.innerHTML = "<i>examples</i>";
                    word.appendChild(ex);                                    
                    for (var i=0; i<definitions.examples.length; i++){
                        var elab = document.createElement("p");
                        elab.className = "definitions";
                        elab.innerHTML = updateHaystack(definitions.examples[i].text,definitions.word);
                        word.appendChild(elab);
                    }
                    
                    var note = document.createElement("div");
                    note.className = "alert alert-square alert-success"
                    note.innerHTML ="<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>×</button>"+
                                    "<strong>Note:</strong> "+definitions.note;
                    word.appendChild(note);
                }else{
                    word.innerHTML =  "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                                     "<center><i class='fa fa-exclamation-triangle fa-3x' style='color:#aeb1b1'></i> Nothing found</center>"+
                                     "<br/><br/><br/><br/><br/><br/><br/><br/>";
                }
                //examAjax();
            }
        });
    }

    // main loading function
	function loadData(){		
        var whole = document.getElementById("whole");
        whole.className = "row no-margin rowpad";
        var query = document.getElementById("query").value;
        query = query.toLowerCase();
        if(query!=""){
            var loader = "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                         "<center><i class='fa fa-refresh fa-spin fa-3x' style='color:#aeb1b1'></i></center>"+
                         "<br/><br/><br/><br/><br/><br/><br/><br/>";
        }else{
            var loader = "<br/><br/><br/><br/><br/><br/><br/><br/>"+
                         "<center><i class='fa fa-hand-o-up fa-3x' style='color:#aeb1b1'></i> Enter a word to search!</center>"+
                         "<br/><br/><br/><br/><br/><br/><br/><br/>";
        }
        $("#define,#examples,#relate").empty();
        $("#define,#examples,#relate").append(loader);
        $.when(defineAjax(query),examAjax(query),relateAjax(query)).done(function(){
                
        });
        wordAjax();
	}
});