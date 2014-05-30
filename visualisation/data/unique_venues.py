# -*- coding: utf-8 -*-
import csv

with open('final.csv', 'rb') as f:
    reader = csv.reader(f, delimiter=',')
    # venues = []
    for row in reader:
        if len(row) > 9:
            print "bad row"
    # uniq = set(venues)
    # ordered = sorted(list(uniq))
    # for v in ordered:
    #     print v
    # with open(sys.argv[1]+'_copy', 'wb') as of:
    # 	writer = csv.writer(of, delimiter=',')
