from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging
from flask_migrate import Migrate

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for the React app
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///children.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

logging.basicConfig(level=logging.DEBUG)

# Database Models
class Child(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    exclusions = db.Column(db.String(500))

class ChildSnack(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    snack = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500))

    # Relationship to the Child model
    child = db.relationship('Child', backref=db.backref('snacks', lazy=True))

# API Routes

@app.route('/api/children', methods=['GET'])
def get_children():
    try:
        children = Child.query.all()
        children_data = [{"id": child.id, "name": child.name, "exclusions": child.exclusions} for child in children]
        return jsonify(children_data), 200
    except Exception as e:
        logging.error(f"Error fetching children: {e}")
        return jsonify({"error": "Error fetching children. Please try again."}), 500

@app.route('/api/children', methods=['POST'])
def add_child():
    data = request.json
    name = data.get('name')
    exclusions = data.get('exclusions', '')

    if not name:
        return jsonify({"error": "Child name is required"}), 400

    try:
        new_child = Child(name=name, exclusions=exclusions)
        db.session.add(new_child)
        db.session.commit()
        return jsonify({"message": "Child added successfully", "child": {"id": new_child.id, "name": new_child.name, "exclusions": new_child.exclusions}}), 201
    except Exception as e:
        logging.error(f"Error adding child: {e}")
        return jsonify({"error": "Error adding child. Please try again."}), 500

@app.route('/api/children/<int:child_id>', methods=['PUT'])
def update_child(child_id):
    data = request.json
    name = data.get('name')
    exclusions = data.get('exclusions')

    try:
        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        if name:
            child.name = name
        if exclusions is not None:
            child.exclusions = exclusions

        db.session.commit()
        return jsonify({"message": "Child updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating child: {e}")
        return jsonify({"error": "Error updating child. Please try again."}), 500

@app.route('/api/children/<int:child_id>', methods=['DELETE'])
def delete_child(child_id):
    try:
        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        db.session.delete(child)
        db.session.commit()
        return jsonify({"message": "Child deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting child: {e}")
        return jsonify({"error": "Error deleting child. Please try again."}), 500

@app.route('/get_snack', methods=['POST'])
def get_snack():
    selected_children_ids = request.json.get('children', [])
    if not selected_children_ids:
        return jsonify({"error": "No children selected"}), 400

    try:
        children = Child.query.filter(Child.id.in_(selected_children_ids)).all()
        exclusions = [exclusion.strip() for child in children for exclusion in (child.exclusions or '').split(',') if exclusion]

        # Generate Snack using OpenAI's GPT-3.5 Turbo model
        prompt = f"Generate a kid-friendly snack considering these exclusions: {', '.join(exclusions)}."
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        snack_idea = response.choices[0].message.content.strip()

        # Generate Image using OpenAI's DALL-E model
        image_prompt = f"A photo of a kid-friendly snack: {snack_idea}."
        image_response = client.images.generate(
            prompt=image_prompt,
            n=1,
            size="512x512"
        )

        image_url = image_response.data[0].url

        return jsonify({'snack': snack_idea, 'image_url': image_url})
    except openai.OpenAIError as e:
        logging.error(f"OpenAI API Error: {e}")
        return jsonify({"error": f"OpenAI API Error: {str(e)}"}), 500
    except Exception as e:
        logging.error(f"Error generating snack: {e}")
        return jsonify({"error": "Error generating snack. Please try again."}), 500

@app.route('/save_snack', methods=['POST'])
def save_snack():
    data = request.json
    child_id = data.get('child_id')
    snack = data.get('snack')
    image_url = data.get('image_url')

    if not child_id or not snack:
        return jsonify({"error": "Child ID and snack are required"}), 400

    try:
        # Check if the snack already exists
        existing_snack = ChildSnack.query.filter_by(child_id=child_id, snack=snack).first()
        if existing_snack:
            return jsonify({"message": "Snack already saved"}), 200

        # Create a new ChildSnack entry
        child_snack = ChildSnack(child_id=child_id, snack=snack, image_url=image_url)
        db.session.add(child_snack)
        db.session.commit()

        return jsonify({"message": "Snack saved successfully"}), 200
    except Exception as e:
        logging.error(f"Error saving snack: {e}")
        return jsonify({"error": "Error saving snack. Please try again."}), 500

@app.route('/get_snacks/<int:child_id>', methods=['GET'])
def get_snacks(child_id):
    try:
        snacks = ChildSnack.query.filter_by(child_id=child_id).all()
        snacks_data = [{"id": snack.id, "snack": snack.snack, "image_url": snack.image_url} for snack in snacks]
        return jsonify(snacks_data), 200
    except Exception as e:
        logging.error(f"Error fetching snacks: {e}")
        return jsonify({"error": "Error fetching snacks. Please try again."}), 500

@app.route('/delete_snack/<int:snack_id>', methods=['DELETE'])
def delete_snack(snack_id):
    try:
        snack = ChildSnack.query.get(snack_id)
        if not snack:
            return jsonify({"error": "Snack not found"}), 404

        db.session.delete(snack)
        db.session.commit()
        return jsonify({"message": "Snack deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting snack: {e}")
        return jsonify({"error": "Error deleting snack. Please try again."}), 500

if __name__ == '__main__':
    app.run(debug=True)