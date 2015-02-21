all: annual-employment-projections.csv annual-change-of-the-projected-occupational-employment.csv cops-occupational-grouping.csv

annual-employment-projections.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/employment_emploi.csv\?_ga\=1.221254168.1656748940.1424475336 -o annual-employment-projections.csv

annual-change-of-the-projected-occupational-employment.csv:
	curl -o annual-change-of-the-projected-occupational-employment.csv http://www.edsc.gc.ca/ouvert-open/cesp-pcee/employment_growth_croissance_emploi.csv\?_ga\=1.19803576.1656748940.1424475336

cops-occupational-grouping.csv:
	curl -o cops-occupational-grouping.csv http://www.edsc.gc.ca/ouvert-open/bca-seb/imt-lmi/NOC_occ_grouping_eng.csv\?_ga\=1.11460148.1656748940.1424475336
