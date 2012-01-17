#!/usr/bin/python
'''
Web page to speech.
jsyang.ca@gmail.com
Jan. 14, 2012
'''
import urllib
import os
from HTMLParser import HTMLParser
import sys

textToSpeak=""
isInsideCodeTag=False

class MyHTMLParser(HTMLParser):
  
  def handle_starttag(self, tag, attrs):
    if tag.lower() in ("script","style"):
      global isInsideCodeTag
      isInsideCodeTag=True
  
  def handle_endtag(self, tag):
    if tag.lower() in ("script","style"):
      global isInsideCodeTag
      isInsideCodeTag=False
      
  def handle_data(self, data):
    if not isInsideCodeTag:
      global textToSpeak
      textToSpeak+=data

opener=urllib.FancyURLopener({})
page=opener.open(sys.argv[1])
#page=opener.open("http://jsyang.ca")

parser = MyHTMLParser()
parser.feed(page.read())
print "\n"+textToSpeak
os.system("say \""+textToSpeak.decode("latin-1").encode("utf-8")+"\"")