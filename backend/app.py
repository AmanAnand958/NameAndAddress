from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
import urllib.parse

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.secret_key = os.environ.get('SECRET_KEY', 'your_secret_key_here')

# MongoDB Configuration
MONGO_URI = os.environ.get('MONGO_URI')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'name_address_db')

if MONGO_URI:
    try:
        if '://' in MONGO_URI and '@' in MONGO_URI:
            scheme, rest = MONGO_URI.split('://', 1)
            userinfo, host = rest.rsplit('@', 1)
            if ':' in userinfo:
                user, password = userinfo.split(':', 1)
                user = urllib.parse.unquote(user)
                password = urllib.parse.unquote(password)
                user = urllib.parse.quote_plus(user)
                password = urllib.parse.quote_plus(password)
                MONGO_URI = f"{scheme}://{user}:{password}@{host}"
    except Exception as e:
        print(f"Note: Could not automatically process MONGO_URI: {e}")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
records_collection = db['records']

# Neo4j Configuration
NEO4J_URI = os.environ.get('NEO4J_URI', 'bolt://localhost:7687')
NEO4J_USER = os.environ.get('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.environ.get('NEO4J_PASSWORD', 'password')

neo4j_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def add_to_neo4j(name, address):
    with neo4j_driver.session() as session:
        session.run("""
            MERGE (p:Person {name: $name})
            MERGE (a:Address {location: $address})
            MERGE (p)-[:LIVES_AT]->(a)
        """, name=name, address=address)

def get_neighbors_from_neo4j(name):
    with neo4j_driver.session() as session:
        result = session.run("""
            MATCH (p:Person {name: $name})-[:LIVES_AT]->(a:Address)
            MATCH (other:Person)-[:LIVES_AT]->(a)
            WHERE other <> p
            RETURN a.location as address, collect(other.name) as neighbors
        """, name=name)
        return [{"address": record["address"], "neighbors": record["neighbors"]} for record in result]

@app.route('/api/add', methods=['POST'])
def add():
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')
    
    if name and address:
        # Check if record exists for this name in Mongo
        existing = records_collection.find_one({'name': name})
        
        # Store in Mongo
        records_collection.insert_one({
            'name': name,
            'address': address
        })
        
        # Store in Neo4j
        try:
            add_to_neo4j(name, address)
        except Exception as e:
            print(f"Neo4j Error: {e}")
            # We continue even if Neo4j fails to avoid breaking the app if local Neo4j isn't running
        
        if existing:
            return jsonify({'message': 'Record exists and updated!'}), 201
        else:
            return jsonify({'message': 'Record added successfully!'}), 201
    else:
        return jsonify({'error': 'Please provide both name and address.'}), 400

@app.route('/api/search')
def search():
    name = request.args.get('name')
    if name:
        # Get addresses from Mongo
        results = records_collection.find({'name': name})
        addresses = [res['address'] for res in results]
        
        if not addresses:
            return jsonify({'message': 'No record found for that name.'}), 404

        # Get neighbors from Neo4j
        try:
            neighbors_data = get_neighbors_from_neo4j(name)
        except Exception as e:
            print(f"Neo4j Error: {e}")
            neighbors_data = []

        return jsonify({
            'name': name,
            'addresses': addresses, # Original format for compatibility
            'detailed_results': neighbors_data # New format with neighbors
        })
            
    return jsonify({'error': 'Name parameter required'}), 400

if __name__ == '__main__':
    app.run(debug=True)