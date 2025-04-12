# import praw
# import requests

# CLIENT_ID="P2QQX2C6-JWytC2l-jqtxw",
# SECRET_KEY="59f95JDzDjLYwYYNSNSMgdP7oCe0TQ",
# # ratelimit_seconds=300  # Set ratelimit_seconds to 5 minutes


# # for the app visit https://www.reddit.com/prefs/apps

# auth = requests.auth.HTTPBasicAuth(CLIENT_ID, SECRET_KEY)

# data = {
#     'grant_type': 'password',
#     'username': 'EmergencyHalf1003',
#     'password': 'jumpjet@sa1'
# }

# headers = {'User-Agent': 'MyAPI/0.0.1'}

# res = requests.post('https://www.reddit.com/api/v1/access_token',
#                     auth=auth, data=data, headers=headers)
# TOKEN = res.json()['access_token']

# headers = {**headers, **{"Authorization": f'bearer {TOKEN}'}}
# print(headers)



# import requests
# from requests.auth import HTTPBasicAuth

# CLIENT_ID = "your_client_id"
# CLIENT_SECRET = "your_client_secret"

# auth = HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
# res = requests.get("https://www.reddit.com/api/v1/me", auth=auth, headers={"User-Agent": "TestBot/0.1"})
# print(res.status_code, res.text)


import requests
from requests.auth import HTTPBasicAuth

CLIENT_ID = "P2QQX2C6-JWytC2l-jqtxw"
CLIENT_SECRET = "59f95JDzDjLYwYYNSNSMgdP7oCe0TQ"
USERNAME = "EmergencyHalf1003"
PASSWORD = "jumpjet@sa1"

auth = HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
data = {
    "grant_type": "password",
    "username": USERNAME,
    "password": PASSWORD
}
headers = {"User-Agent": "MyRedditBot/1.0 (by u/EmergencyHalf1003)"}

try:
    res = requests.post("https://www.reddit.com/api/v1/access_token", auth=auth, data=data, headers=headers)
    res.raise_for_status()
    print(res.json())  # Should return an access token if successful
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")

TOKEN = res.json()['access_token']

headers = {**headers, **{"Authorization": f'bearer {TOKEN}'}}
print(headers)

print(requests.get('https://oauth.reddit.com/api/v1/me', headers=headers).json())

