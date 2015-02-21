all: projections.csv change.csv cops.csv school-leavers.csv immigrants.csv all-supply.csv all-demand.csv emigration-mortality.csv retirements.csv summary.csv




summary.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/summary_sommaire.csv?_ga=1.165888569.606929506.1424547630 -o summary.csv

all-supply.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/job_seekers_chercheurs_emploi.csv?_ga=1.194659754.606929506.1424547630 -o all-supply.csv

all-demand.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/jo_pe.csv?_ga=1.152267198.606929506.1424547630 -o all-demand.csv

school-leavers.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/school_leavers_sortants_scolaires.csv?_ga=1.191195309.606929506.1424547630 -o school-leavers.csv

immigrants.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/immigration.csv?_ga=1.196381099.606929506.1424547630 -o immigrants.csv

emigration-mortality.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/other_replacement_autre_remplacement.csv?_ga=1.119826831.606929506.1424547630 -o emigration-mortality.csv

retirements.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/retirements_retraites.csv?_ga=1.196322731.606929506.1424547630 -o retirements.csv

projections.csv:
	curl http://www.edsc.gc.ca/ouvert-open/cesp-pcee/employment_emploi.csv\?_ga\=1.221254168.1656748940.1424475336 -o projections.csv

change.csv:
	curl -o change.csv http://www.edsc.gc.ca/ouvert-open/cesp-pcee/employment_growth_croissance_emploi.csv\?_ga\=1.19803576.1656748940.1424475336

cops.csv:
	curl -o cops.csv http://www.edsc.gc.ca/ouvert-open/bca-seb/imt-lmi/NOC_occ_grouping_eng.csv\?_ga\=1.11460148.1656748940.1424475336




