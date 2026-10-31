import urllib.request
import re

req = urllib.request.Request('https://styfensagala.vercel.app/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Search for image urls or project images
matches = re.findall(r'src=["\']([^"\']+)["\']', html)
for m in matches:
    if any(k in m.lower() for k in ['sawit', 'nyawit', 'project', 'cover']):
        print('Matched:', m)
