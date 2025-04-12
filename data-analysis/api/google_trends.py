from pytrends.request import TrendReq

def fetch_google_trends(event_name):
    pytrends = TrendReq(hl='en-US', tz=360)
    pytrends.build_payload([event_name], cat=0, timeframe='now 7-d', geo='', gprop='')
    data = pytrends.interest_over_time()
    
    if not data.empty:
        return data[event_name].values.tolist()
    return []
