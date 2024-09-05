from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for the React app

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///children.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Securely load the OpenAI API Key from environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')

# Database Model
class Child(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    exclusions = db.Column(db.String(500))  # Comma-separated exclusions

# Create the database tables within an application context
with app.app_context():
    db.create_all()

# API route to get all children
@app.route('/api/children', methods=['GET'])
def get_children():
    children = Child.query.all()
    children_data = [{"id": child.id, "name": child.name, "exclusions": child.exclusions} for child in children]
    return jsonify(children_data)

# API route to add a new child
@app.route('/api/children', methods=['POST'])
def add_child():
    data = request.get_json()
    name = data.get('name')
    exclusions = data.get('exclusions')

    if not name:
        return jsonify({"error": "Name is required"}), 400

    new_child = Child(name=name, exclusions=exclusions)
    db.session.add(new_child)
    db.session.commit()
    return jsonify({"message": "Child added successfully"}), 201

# API route to update a child
@app.route('/api/children/<int:child_id>', methods=['PUT'])
def update_child(child_id):
    data = request.get_json()
    child = Child.query.get(child_id)

    if not child:
        return jsonify({"error": "Child not found"}), 404

    child.name = data.get('name', child.name)
    child.exclusions = data.get('exclusions', child.exclusions)
    db.session.commit()
    return jsonify({"message": "Child updated successfully"}), 200

# API route to delete a child
@app.route('/api/children/<int:child_id>', methods=['DELETE'])
def delete_child(child_id):
    child = Child.query.get(child_id)

    if not child:
        return jsonify({"error": "Child not found"}), 404

    db.session.delete(child)
    db.session.commit()
    return jsonify({"message": "Child deleted successfully"}), 200

# API route to generate a snack idea
@app.route('/get_snack', methods=['POST'])
def get_snack():
    selected_children_ids = request.json.get('children', [])
    if not selected_children_ids:
        return jsonify({"error": "No children selected"}), 400

    children = Child.query.filter(Child.id.in_(selected_children_ids)).all()
    exclusions = [exclusion for child in children for exclusion in (child.exclusions or '').split(',')]

    # Generate Snack using OpenAI API
    try:
        prompt = f"Generate a kid-friendly snack considering these exclusions: {', '.join(exclusions)}."
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=150
        )
        snack_idea = response.choices[0].text.strip()
        return jsonify({'snack': snack_idea})
    except Exception as e:
        print(f"Error generating snack: {e}")
        return jsonify({"error": "Error generating snack. Please try again."}), 500

if __name__ == '__main__':
    app.run(debug=True)
