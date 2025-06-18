from flask import Blueprint, request, jsonify, session
from models import db, Topic
from utils import login_required

topics_bp = Blueprint('topics', __name__)

@topics_bp.route("/api/topics", methods=["GET"])
@login_required
def get_topics():
    user_id = session["user_id"]
    topics = Topic.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": t.id, "name": t.name} for t in topics])

@topics_bp.route("/api/topics", methods=["POST"])
@login_required
def add_topic():
    user_id = session["user_id"]
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"success": False, "message": "Thiếu tên chủ đề"}), 400
    new_topic = Topic(name=name, user_id=user_id)
    db.session.add(new_topic)
    db.session.commit()
    return jsonify({"success": True, "id": new_topic.id, "name": new_topic.name})

@topics_bp.route("/api/topics/<int:topic_id>", methods=["PUT"])
@login_required
def rename_topic(topic_id):
    user_id = session["user_id"]
    topic = Topic.query.filter_by(id=topic_id, user_id=user_id).first()
    if not topic:
        return jsonify({"success": False, "message": "Không tìm thấy chủ đề"}), 404
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"success": False, "message": "Thiếu tên chủ đề"}), 400
    topic.name = name
    db.session.commit()
    return jsonify({"success": True})

@topics_bp.route("/api/topics/<int:topic_id>", methods=["DELETE"])
@login_required
def delete_topic(topic_id):
    user_id = session["user_id"]
    topic = Topic.query.filter_by(id=topic_id, user_id=user_id).first()
    if not topic:
        return jsonify({"success": False, "message": "Không tìm thấy chủ đề"}), 404
    # Xóa tất cả words thuộc topic này
    from models import Word
    Word.query.filter_by(topic_id=topic_id).delete()
    db.session.delete(topic)
    db.session.commit()
    return jsonify({"success": True})