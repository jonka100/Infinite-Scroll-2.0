import urllib2
import json
import os

class ExistingLink(Exception): pass

request = urllib2.urlopen("https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=http://www.engadget.com/rss-full.xml&num=-1").read()
newFeed = json.loads(request)

entries = []
jsonFilename = 'testing.json'

try:
	if os.stat(jsonFilename).st_size > 0:
		with open(jsonFilename) as jsonFile:	
			fileData = json.load(jsonFile)
			if fileData['responseData']:
				entries = fileData['responseData']['feed']['entries']
	else:
		print "Empty file"
except OSError:
    print "No file"

newEntries = newFeed['responseData']['feed']['entries']

for newEntry in newEntries:
	print "Check if article exists: " + newEntry['title']
	try:
		for entry in entries:
			if newEntry['link'] == entry['link']:
				raise ExistingLink()
		print "New article found"
		entries.insert(0, newEntry)
	except ExistingLink:
		pass

newFeed['responseData']['feed']['entries'] = entries 
 
with open(jsonFilename, 'w') as jsonFile:
	json.dump(newFeed, jsonFile, indent=4)
