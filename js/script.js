$(window).load(function(){

	bodyCleanup();
	initHash();

});


$(window).on("hashchange", function() {

	initHash();

});

jQuery.fn.cleanWhitespace = function() {
    textNodes = this.contents().filter(
        function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); })
        .remove();
    return this;
}

var hashObj = {};
var hash = "";
var xhrPool = [];

function abort() {

	$.each(xhrPool, function(idx, jqXHR) {
		jqXHR.abort();
	});

};

$(document).ajaxSend(function(e, jqXHR, options){
	xhrPool.push(jqXHR);
	ajaxStatus(xhrPool.length);
});

$(document).ajaxComplete(function(e, jqXHR, options) {
	xhrPool = $.grep(xhrPool, function(x){return x!=jqXHR});
	ajaxStatus(xhrPool.length);
});


function ajaxStatus(length){

	if (length == 0){

    	$("#ajaxStatus").hide();

	} else {

	    $("#ajaxStatus").show();

	}

    $("#ajaxStatus").html("Loading ... " + length);

}


function initHash(){

	abort();

	if (window.location.hash == "") {

		window.location.hash = "index/Welcome";

	} else {

		hash = location.hash.replace("#", "");

	}

	hashArray = hash.split("/");
	hashObj.one = hashArray[0];
	hashObj.two = hashArray[1];
	hashObj.three = hashArray[2];
	hashObj.four = hashArray[3];
	hashObj.five = hashArray[4];
	hashObj.six = hashArray[5];

	loadPage();

}

function loadPage(){


	if (hashObj.one == "index") {

		$("#header_menu_toggle").hide();

	} else {

		$("#header_menu_toggle").show();

	}	

	$("#main_menu").removeClass("active");
	//alert("Hel");

	$("#header_title").fadeTo("fast", 0);

	$("#body").fadeTo("fast", 0, function(){


		$("#body_content").html("");
		$(window).scrollTop(0);

		$.ajax({
			url: "/module?page="+hashObj.one+".html",
			data: {
				two: hashObj.two
			},
			success: function(data) {

				$("#body_content").html(data);
				update_title();

				$("#body").stop().fadeTo("fast", 1);
				$("#header_title").stop().fadeTo("fast", 1);

				if ($("#header_title").width() <= 320) {

					//$("#header_title").stop().fadeTo("fast", 1);

				} else {

					//alert("Too long");

				}


				processPage();

			}

		});


	});


};


function update_title(){

	$("#header_title").html(hashObj.two);

	if (hashObj.one == "2") {

		$("#header_title").append(": "+hashObj.three);
	}

};

function processPage(){


	if (hashObj.one == "index") {

		$("#selection").cleanWhitespace();
		$("#selection>li:first").click();
		$("#year_window>select").height($("#search").height());
		$("#browse_window>select").height($("#search").height());

		popular();

	} else if (hashObj.one == "1") {

		$("#dashboard").cleanWhitespace();
		$("#dashboard_skills").cleanWhitespace();
		$("#dashboard_skills>li").cleanWhitespace();


	} else if (hashObj.one == "2") {

		if (hashObj.two == "Graduating Year") {

			range();

		} else if (hashObj.two == "Search Results") {

			apisearch();

		}

	} else if (hashObj.one == "3") {


		$("#header_title").text("Job Group Details");
		$("#detail_welcome>h1").text(hashObj.two);

		$(".chart").each(function(i,o){



		});

		detail();


	}


};

function apisearch(){

	$.ajax({
		url: "/apisearch?keywordStr="+hashObj.three,
		data: {
		},
		success: function(data) {

			//alert(data);
			console.log(data);

			$("#match_list").empty();

			$.each(data, function(i,o){

				$("#match_list").append("<a href='#3/"+o.name+"/"+o.code+"'><div class='match_list_bg'></div><h1>"+o.name+"</h1><p>~"+o.total+" jobs in the next 3 years</p><i class='fa fa-chevron-circle-right'></i></a>");

				if (i >= 4) {

					return false;

				}
/*
					<a href='#3/"+o.name+"/"+o.code+"'><h1>"+o.name+"</h1></a>");
				$("#popular_list>a:last").append("<h2>~"+o.total+" jobs in the next 3 years</h2>");
*/

			});

		}

	});


};


function detail(){

	$.ajax({
		url: "/detail?code="+hashObj.three,
		data: {
		},
		success: function(data) {

			//alert(data);

			var info = data.info;
			console.log(info);

			console.log(data);

			var year = 2015;

			var projections = data.projections;

			$("#projection").text(projections[year-2012]);

			var rate = (projections[year-2012] / projections[year-2012 - 1] - 1) * 100;

			if (rate < 0 ){

			$("#increase").text((rate*-1).toFixed(2)+"%");
			$("#gap").text("decrease");

			} else {

			$("#increase").text(rate.toFixed(2)+"%");
			$("#gap").text("increase");

			}


			generate("c1", "Projections", projections);

			var supply = data.supply;
			var demand = data.demand;

			$("#supply").text(supply[year-2012]);
			$("#demand").text(demand[year-2012]);
			$("#ratio").text((demand[year-2012] / supply[year-2012]).toFixed(2) + " to 1");

			generate("c2", "Supply", supply, "Demand", demand);


			var schoolLeavers = data.schoolLeavers;
			$("#schoolLeavers").text(schoolLeavers[year-2012]);
			generate("c3", "School Leavers", schoolLeavers);


			$.each(info.subtypes, function(i,o){

				//$("#detail_welcome>p").append(o.name);

			});

		}

	});


};

function range(){

	$.ajax({
		url: "/range?start="+hashObj.three+"&end="+(parseInt(hashObj.three) + 3),
		data: {
		},
		success: function(data) {

			//alert(data);
			console.log(data);
			$("#match_list").empty();

			$.each(data, function(i,o){

				$("#match_list").append("<a href='#3/"+o.name+"/"+o.code+"'><div class='match_list_bg'></div><h1>"+o.name+"</h1><p>~"+o.total+" jobs in the next 3 years</p><i class='fa fa-chevron-circle-right'></i></a>");

/*
					<a href='#3/"+o.name+"/"+o.code+"'><h1>"+o.name+"</h1></a>");
				$("#popular_list>a:last").append("<h2>~"+o.total+" jobs in the next 3 years</h2>");
*/

			});

		}

	});


};

function popular(){

	$.ajax({
		url: "/range?start=2015&end=2018",
		data: {
		},
		success: function(data) {

			//alert(data);
			console.log(data);

			$.each(data, function(i,o){

				$("#popular_list").append("<a href='#3/"+o.name+"/"+o.code+"'><h1>"+o.name+"</h1></a>");
				$("#popular_list>a:last").append("<h2>~"+o.total+" jobs in the next 3 years</h2>");


			});

		}

	});


};

function generate(id, label, data, label2, data2){

	data.unshift(label);

	var columns = [];
	columns.push(['x', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']);
	columns.push(data);

	if (data2 != undefined) {

		data2.unshift(label2);
		columns.push(data2);


	}

	var chart = c3.generate({
	    bindto: "#"+id,
	    data: {
	        x: 'x',
	        columns: columns,
	        type: 'spline'
	    },
    	bar: {
	        width: {
	            ratio: 0.5 // this makes bar width 50% of length between ticks
	        }	    
    	}
    
	});	

}

$(document).on("click", "#header_menu_toggle", function(){

	//$("#main_menu").toggleClass("active");
	//$(this).toggleClass("active");
	window.history.back()


});


function bodyCleanup(){

	//$("#main_menu").removeClass("active");
	$("#main_menu, #body").css("padding-top", $("#header").height());
	//$("#body").css("min-height", $(window).height());

}


$(document).on("click", "#selection>li", function(){

	var id = $(this).attr("type");

	$(this).addClass("active");
	$(this).siblings().removeClass("active");

	$("#"+id).show();
	$("#"+id).siblings().hide();

});

$(document).on("click", "#keyword_search", function(e){

	e.preventDefault();

	var q = $("#search").val();

	if (q.length < 3) {

		alert("Please make sure that your query is at least 3 characters long.");
		$("#search").focus();

	} else {

		var href = $(this).attr("href") + "/" + q;
		window.location.href = href;

	}

});

$(document).on("click", "#range_search", function(e){

	e.preventDefault();

	var q = $("#range").val();
	var href = $(this).attr("href") + "/" + q;
	window.location.href = href;

});