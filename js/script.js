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

	if (chart1 != undefined) {

		chart1.destroy();
		chart1 = undefined;

	}

	if (chart2 != undefined) {

		chart2.destroy();
		chart2 = undefined;

	}

	if (chart3 != undefined) {

		chart3.destroy();
		chart3 = undefined;

	}	

	loadPage();



}

function loadPage(){


	if (hashObj.one == "index") {

		$("#header_menu_toggle").hide();

	} else {

		$("#header_menu_toggle").show();

	}	

	$("#main_menu").removeClass("active");
	$("#header_title").fadeTo(0, 0);

	$("body").addClass("loading");
	$("#body").addClass("loading").fadeTo("fast", 0, function(){


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
				$("body").removeClass("loading");
				$("#header_title").stop().fadeTo(0, 1);

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

function allJobs(){

	$.ajax({
		url: "/all-jobs",
		data: {
		},
		success: function(data) {

			//alert(data);
			console.log(data);

			$.each(data, function(i,o){

				if (o.name == "Ma�tres d'h�tel and Hosts/Hostesses") {

					o.name = "Maitres d'hotel and Hosts/Hostesses";

				}


				console.log(o.name);
				$("#browse").append('<option value="#3/'+btoa(o.name)+"/"+i+'">'+o.name+"</option>");

			});

			tinysort("#browse>option");
		}

	});


};

function processPage(){


	if (hashObj.one == "index") {

		$("#selection").cleanWhitespace();
		$("#selection>li:first").click();
		$("#year_window>select").height($("#search").height());
		$("#browse_window>select").height($("#search").height());

		popular();
		allJobs();

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
		$("#detail_welcome>h1").html(atob(hashObj.two));

		$(".chart").each(function(i,o){



		});

		detail();


	}


};

function apisearch(){

	$.ajax({
		url: "/apisearch?size=20&start=2015&end=2017&type=change&keywordStr="+hashObj.three,
		data: {
		},
		success: function(data) {


			//alert(data);
			console.log(data);

			$("#match_list").empty();

			$.each(data, function(i,o){

				//var newName = o.name;
				//newName.split('/').join('&#47;');

				//alert(newName);

				if (o.name == "Ma�tres d'h�tel and Hosts/Hostesses") {

					o.name = "Maitres d'hotel and Hosts/Hostesses";

				}

				$("#match_list").append('<a href="#3/'+btoa(o.name)+"/"+o.code+'">'+"<div class='match_list_bg'></div><h1 style=''>"+o.name+"</h1><p>~"+numberWithCommas(o.total)+" jobs in the next 3 years</p><i class='fa fa-chevron-circle-right'></i></a>");

				if (i >= 4) {

					return false;

				}
/*
					<a href='#3/"+o.name+"/"+o.code+"'><h1>"+o.name+"</h1></a>");
				$("#popular_list>a:last").append("<h2>~"+o.total+" jobs in the next 3 years</h2>");
*/

			});

			if (data.length == 0) {

				$("#match_list").append("<span id='loading'>No jobs found.</span>");


			}

		}

	});


};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var chart1;
var chart3;
var chart2;

function detail(){




		$.ajax({
			url: "/detail?code="+hashObj.three,
			data: {
			},
			success: function(data) {

				//alert(data);

				var info = data.info;

				var year = 2015;

				var projections = data.projections;

				$("#projection").text(numberWithCommas(parseInt(projections[year-2012])));

				var rate = (projections[year-2012] / projections[year-2012 - 1] - 1) * 100;

				if (rate < 0 ){

				$("#increase").text((rate*-1).toFixed(2)+"%");
				$("#gap").text("decrease");

				} else {

				$("#increase").text(rate.toFixed(2)+"%");
				$("#gap").text("increase");

				}
				chart1 = generate("c1", "Projections", projections);

				var supply = data.supply;
				var demand = data.demand;

				$("#supply").text(numberWithCommas(supply[year-2012]));
				$("#demand").text(numberWithCommas(demand[year-2012]));
				$("#ratio").text((supply[year-2012] / demand[year-2012]).toFixed(2) + " to 1");

				chart2 = generate("c2", "Supply", supply, "Demand", demand);

				var schoolLeavers = data.schoolLeavers;
				$("#schoolLeavers").text(numberWithCommas(schoolLeavers[year-2012]));

				chart3 = generate("c3", "School Leavers", schoolLeavers);



				$.each(info.subtypes, function(i,o){

					//$("#detail_welcome>p").append(o.name);

				});

			}

		});




};

function range(){

	$.ajax({
		url: "/range?size=20&type=change&start="+hashObj.three+"&end="+(parseInt(hashObj.three) + 2),
		data: {
		},
		success: function(data) {

			//alert(data);
			console.log(data);
			$("#match_list").empty();

			$.each(data, function(i,o){

				$("#match_list").append("<a href='#3/"+btoa(o.name)+"/"+o.code+"'><div class='match_list_bg'></div><h1>"+o.name+"</h1><p>~"+numberWithCommas(o.total)+" jobs in the following 3 years</p><i class='fa fa-chevron-circle-right'></i></a>");

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
		url: "/range?start=2015&end=2017&type=change",
		data: {
		},
		success: function(data) {

			//alert(data);
			console.log(data);

			$.each(data, function(i,o){

				$("#popular_list").append("<a href='#3/"+btoa(o.name)+"/"+o.code+"'><h1>"+o.name+"</h1></a>");
				$("#popular_list>a:last").append("<h2>~"+numberWithCommas(o.total)+" jobs in the next 3 years</h2>");


			});

		}

	});


};

function generate(id, label, data, label2, data2){

	data.unshift(label);

	var columns = [];
	columns.push(['x', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']);


	var chart = c3.generate({
	    bindto: "#"+id,
	    transition: { duration: 0 },
	    size: {
  			height: 300
		},
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

	columns.push(data);

	if (data2 != undefined) {

		data2.unshift(label2);
		columns.push(data2);

	}	

	setTimeout(function () {
	    chart.load({
	        columns: columns
	    });
	}, 2000);	

	return chart;

}

$(document).on("click", "#header_menu_toggle", function(){

	//$("#main_menu").toggleClass("active");
	//$(this).toggleClass("active");
	//window.history.back()


});


function bodyCleanup(){

	//$("#main_menu").removeClass("active");
	$("#main_menu, #body").css("padding-top", $("#header").height());
    //FastClick.attach(document.body);
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


$(document).on("click", "#browse_go", function(e){

	e.preventDefault();

	var q = $("#browse").val();
	window.location.href = q;

});

