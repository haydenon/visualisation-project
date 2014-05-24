# -*- coding: utf-8 -*-
import csv
import sys

with open(sys.argv[1], 'rb') as f:
    reader = csv.reader(f, delimiter=',')
    with open(sys.argv[1]+'_copy', 'wb') as of:
    	writer = csv.writer(of, delimiter=',')
    	for row in reader:
        	towrite = []
        	for i in range(len(row)):
        		if i!=3 or row[i]=='Score' or row[i]=='':
        			towrite.append(row[i])
        		else:
        			st = row[i].split('–')
        			print st
        			towrite.append(st[0]+'-'+st[1])
        	writer.writerow(towrite)
