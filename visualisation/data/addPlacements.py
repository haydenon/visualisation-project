# -*- coding: utf-8 -*-
import csv

def get_filter (year,roun):
    def my_filter(x):
        if(x[0]=='Year' or x[2][:4]=='BYES'):
            return False
        return int(x[0]) == year and int(x[1]) == roun
    return my_filter

class Team:
    pass

def get_compare(year,roun,d):
    def team_compare(a, b):
        if(d[a].totag==0):
            return -1
        if(d[b].totag==0):
            return 1
        if d[a].wins != d[b].wins:
            return d[a].wins - d[b].wins
        difgp = (d[a].totfor/float(d[a].totag))*100.0 - (d[b].totfor/float(d[b].totag))*100.0
        if difgp==0:
            print str(year)+","+str(roun)+","+a+","+b
        return -1 if (d[a].totfor/float(d[a].totag))*100.0 < (d[b].totfor/float(d[b].totag))*100.0 else 1
    return team_compare

def get_empty_teams():
    d = {}
    teams = ["Central Pulse","Melbourne Vixens","Queensland Firebirds","West Coast Fever","Northern Mystics","Canterbury Tactix","Waikato Bay of Plenty Magic","Adelaide Thunderbirds", "New South Wales Swifts", "Southern Steel"]
    for t in teams:
        ob = Team()
        ob.wins = 0
        ob.totfor = 0
        ob.totag = 0
        d[t] = ob
    return d

with open('combined_placement.csv', 'wb') as of:
    writer = csv.writer(of, delimiter=',')
    with open('combined.csv', 'rb') as f:
        reader = csv.reader(f, delimiter=',')
        rowdata = []
        for row in reader:
            rowdata.append(row)
        for i in range(2008,2014):
            d = get_empty_teams()
            for r in range(1,15):
                matches = filter(get_filter(i,r), rowdata)
                # if i==2011 and r==1:
                #     for t in matches:
                #         print str(t)
                for match in matches:
                    ht = match[3]
                    at = match[5]
                    draw = match[4][:4] == 'draw'
                    scores = []
                    if not draw:
                        scores = match[4].split('-')
                    else:
                        scores = match[4][5:].split('-')
                    hs = int(scores[0])
                    aws = int(scores[1])
                    if not draw:
                        team = (ht if hs > aws else at)
                        d[team].wins+=2
                    if draw:
                        d[at].wins+=1
                        d[ht].wins+=1
                    d[ht].totfor+= hs
                    d[ht].totag+= aws
                    d[at].totfor+= aws
                    d[at].totag+= hs
                teams = d.keys()

                #sort teams and add placements into new csv
                to = sorted(teams, cmp = get_compare(i,r,d))
                # if i==2008 and r==14:
                #     for t in to:
                #         print d[t].totfor
                #         print t+","+str(d[t].wins)
                for towrite in matches:
                    if towrite[0]=='Year' or towrite[2][:4]=='BYES':
                        continue
                    ht = to.index(towrite[3])
                    at = to.index(towrite[5])
                    towrite.append(ht)
                    towrite.append(at)
                    writer.writerow(towrite)###ROWDATE IS WRONG OR TOWRITE IS WRONG, LOOK AT combined_placement.csv
