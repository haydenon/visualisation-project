# -*- coding: utf-8 -*-
import csv
import sys
with open('combined.csv', 'wb') as of:
    writer = csv.writer(of, delimiter=',')
    for i in range(8,14):
        f = open('20{0:02d}.csv'.format(i))
        reader = csv.reader(f, delimiter=',')
    	for row in reader:
            towrite = []
            towrite.append('20{0:02d}'.format(i))
            towrite.extend(row)
            writer.writerow(towrite)
