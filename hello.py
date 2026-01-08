from flask import Flask, request, flash, redirect, url_for, render_template, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key_here'  # Change this to a random secret key

DATABASE = 'records.db'

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with get_db() as db:
        db.execute('''CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL
        )''')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/add', methods=['POST'])
def add():
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')
    if name and address:
        with get_db() as db:
            # Check if name already exists
            existing = db.execute('SELECT * FROM records WHERE name = ?', (name,)).fetchone()
            db.execute('INSERT INTO records (name, address) VALUES (?, ?)', (name, address))
            db.commit()
            
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
        with get_db() as db:
            records = db.execute('SELECT * FROM records WHERE name = ?', (name,)).fetchall()
        
        if records:
            # Return list of addresses
            addresses = [row['address'] for row in records]
            return jsonify({'name': name, 'addresses': addresses})
        else:
            return jsonify({'message': 'No record found for that name.'}), 404
    return jsonify({'error': 'Name parameter required'}), 400

if __name__ == '__main__':
    init_db()
    app.run(debug=True)