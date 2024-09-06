from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from openai import OpenAI  # Import OpenAI client
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
    # Temporary column for migration (to trigger changes, remove later)
    dummy_column = db.Column(db.String(100), nullable=True)  # Add this line

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

@app.route('/update_child', methods=['POST'])
def update_child():
    data = request.json
    child_id = data.get('child_id')
    new_name = data.get('name')
    new_exclusions = data.get('exclusions')

    if not child_id:
        return jsonify({"error": "Child ID is required"}), 400

    try:
        # Find the child by ID
        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        # Update the child's information
        if new_name:
            child.name = new_name
        if new_exclusions:
            child.exclusions = new_exclusions

        # Commit the changes to the database
        db.session.commit()
        return jsonify({"message": "Child updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating child: {e}")
        return jsonify({"error": "Error updating child. Please try again."}), 500

if __name__ == '__main__':
    app.run(debug=True)