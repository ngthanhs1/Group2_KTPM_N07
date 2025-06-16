from flask import Blueprint, request, jsonify, session
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/api/register", methods=["POST"])
def api_register():
    data = request.json
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    if not email or not username or not password:
        return jsonify({"success": False, "message": "Vui lòng nhập đầy đủ thông tin!"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email đã tồn tại!"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username đã tồn tại!"}), 400
    hashed_pw = generate_password_hash(password)
    user = User(email=email, username=username, password=hashed_pw)
    db.session.add(user)
    db.session.commit()

    # --- Lưu thêm vào accounts.json ---
    account_data = {
        "email": email,
        "username": username,
        "password": hashed_pw
    }
    json_path = os.path.join(os.path.dirname(__file__), '..', 'accounts.json')
    json_path = os.path.abspath(json_path)
    try:
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                accounts = json.load(f)
        else:
            accounts = []
    except Exception:
        accounts = []
    accounts.append(account_data)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(accounts, f, ensure_ascii=False, indent=2)
    # --- hết phần lưu ---

    return jsonify({"success": True, "message": "Đăng ký thành công!"})

@auth_bp.route("/api/login", methods=["POST"])
def api_login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        session["user_id"] = user.id
        return jsonify({"success": True, "message": "Đăng nhập thành công!"})
    else:
        return jsonify({"success": False, "message": "Email hoặc mật khẩu không đúng!"}), 401

@auth_bp.route("/api/logout")
def api_logout():
    session.pop("user_id", None)
    return jsonify({"success": True})