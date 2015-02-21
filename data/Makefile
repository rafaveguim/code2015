all: projections.csv change.csv cops.csv

projections.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/employment_emploi.csv\?_ga\=1.221254168.1656748940.1424475336 -o projections.csv

change.csv:
	curl -o change.csv http://www.edsc.gc.ca/ouvert-open/cesp-pcee/employment_growth_croissance_emploi.csv\?_ga\=1.19803576.1656748940.1424475336

cops.csv:
	curl -o cops.csv http://www.edsc.gc.ca/ouvert-open/bca-seb/imt-lmi/NOC_occ_grouping_eng.csv\?_ga\=1.11460148.1656748940.1424475336


