from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    topics = db.relationship('Topic', backref='user', lazy=True)
    words = db.relationship('Word', backref='user', lazy=True)

class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    words = db.relationship('Word', backref='topic', lazy=True)

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100), nullable=False)
    definition = db.Column(db.String(255), nullable=True)
    starred = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=False)