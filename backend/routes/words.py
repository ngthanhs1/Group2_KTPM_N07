from flask import Blueprint, request, jsonify, session
from models import db, Word
from utils import login_required

words_bp = Blueprint('words', __name__)

@words_bp.route("/api/words", methods=["GET"])
@login_required
def get_words():
    user_id = session["user_id"]
    topic_id = request.args.get("topic_id", type=int)
    query = Word.query.filter_by(user_id=user_id)
    if topic_id:
        query = query.filter_by(topic_id=topic_id)
    words = query.all()
    return jsonify([{
        "id": w.id,
        "word": w.word,
        "definition": w.definition,
        "starred": w.starred,
        "topic_id": w.topic_id
    } for w in words])

@words_bp.route("/api/words", methods=["POST"])
@login_required
def add_word():
    user_id = session["user_id"]
    data = request.json
    word = data.get("word")
    definition = data.get("definition", "")
    starred = data.get("starred", False)
    topic_id = data.get("topic_id")
    if not word or not topic_id:
        return jsonify({"success": False, "message": "Thiếu từ vựng hoặc chủ đề"}), 400
    new_word = Word(word=word, definition=definition, starred=starred, user_id=user_id, topic_id=topic_id)
    db.session.add(new_word)
    db.session.commit()
    return jsonify({"success": True, "id": new_word.id})

@words_bp.route("/api/words/<int:word_id>", methods=["PUT"])
@login_required
def update_word(word_id):
    user_id = session["user_id"]
    word = Word.query.filter_by(id=word_id, user_id=user_id).first()
    if not word:
        return jsonify({"success": False, "message": "Không tìm thấy từ vựng"}), 404
    data = request.json
    word.word = data.get("word", word.word)
    word.definition = data.get("definition", word.definition)
    word.starred = data.get("starred", word.starred)
    db.session.commit()
    return jsonify({"success": True})

@words_bp.route("/api/words/<int:word_id>", methods=["DELETE"])
@login_required
def delete_word(word_id):
    user_id = session["user_id"]
    word = Word.query.filter_by(id=word_id, user_id=user_id).first()
    if not word:
        return jsonify({"success": False, "message": "Không tìm thấy từ vựng"}), 404
    db.session.delete(word)
    db.session.commit()
    return jsonify({"success": True})