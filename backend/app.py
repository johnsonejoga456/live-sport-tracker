from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Load Sportradar API key from environment variables
SPORTRADAR_API_KEY = os.getenv("SPORTRADAR_API_KEY")
print("API Key:", SPORTRADAR_API_KEY)

@app.route('/scores', methods=['GET'])
def get_scores():
    try:
        # Sportradar API endpoint for live football scores
        url = f"https://api.sportradar.us/soccer-t3/eu/en/schedules/live/results.json?api_key={SPORTRADAR_API_KEY}"
        
        response = requests.get(url)
        data = response.json()
        
        # Check for API errors
        if response.status_code != 200 or "results" not in data:
            return jsonify({"error": "Failed to fetch data"}), 500

        # Process the data for the frontend
        live_scores = []
        for event in data['results']:
            live_scores.append({
                "teamA": event['sport_event']['competitors'][0]['name'],
                "teamB": event['sport_event']['competitors'][1]['name'],
                "scoreA": event['sport_event_status']['home_score'],
                "scoreB": event['sport_event_status']['away_score'],
                "status": event['sport_event_status']['match_status']
            })

        return jsonify({"events": live_scores})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
