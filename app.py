from flask import request, jsonify
from flask_restful import Resource
from models import Event

class EventResource(Resource):
    def get(self):
        """Fetch all events from the database."""
        try:
            size = request.args.get('size', default=5, type=int)  # Increased from 1 to 5
            events = Event.query.order_by(Event.created_at.desc()).limit(size).all()
            return jsonify([event.to_dict() for event in events])
        except Exception as e:
            return jsonify({'error': str(e)}), 500 