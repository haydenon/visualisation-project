# -*- coding: utf-8 -*-
import csv
import sys
with open('combined_placement.csv', 'wb') as of:
    writer = csv.writer(of, delimiter=',')
    with open('combined.csv', 'rb') as f:
    for i in range(2008,2014):
    	for row in f:
    		if row[0]==i && row[1]<15:


    for row in f:

    for i in range(8,14):
        f = open('20{0:02d}.csv'.format(i))
        reader = csv.reader(f, delimiter=',')
    	for row in reader:
            towrite = []
            towrite.append('20{0:02d}'.format(i))
            towrite.extend(row)
            writer.writerow(towrite)
