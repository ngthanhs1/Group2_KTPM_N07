from flask import Blueprint, request, jsonify, session, url_for, current_app, redirect
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
import secrets

from flask_mail import Message

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

@auth_bp.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("user_id", None)
    return jsonify({"success": True})

@auth_bp.route("/api/check-auth", methods=["GET"])
def api_check_auth():
    user_id = session.get("user_id")
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                "success": True,
                "isAuthenticated": True,
                "user": {
                    "email": user.email,
                    "username": user.username
                }
            })
    return jsonify({"success": True, "isAuthenticated": False})

@auth_bp.route("/api/forgot-password", methods=["POST"])
def api_forgot_password():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Vui lòng nhập email!"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "message": "Email không tồn tại!"}), 404

    # Tạo token và lưu vào DB
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    db.session.commit()

    # Tạo link đặt lại mật khẩu
    reset_link = url_for('auth.reset_password', token=token, _external=True)

    # Lấy mail từ current_app để tránh circular import
    mail = current_app.extensions['mail']
    try:
        msg = Message(
            subject="Đặt lại mật khẩu KTPM",
            recipients=[email],
            body=f"Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào link sau để đặt lại mật khẩu:\n{reset_link}\n\nNếu không phải bạn, hãy bỏ qua email này."
        )
        mail.send(msg)
    except Exception as e:
        print("Lỗi gửi email:", e)
        return jsonify({"success": False, "message": "Không gửi được email. Vui lòng thử lại sau!"}), 500

    return jsonify({"success": True, "message": "Đã gửi link đặt lại mật khẩu tới email của bạn!"})

@auth_bp.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    # Luôn redirect sang giao diện Reset, truyền token qua query string
    return redirect(f"/Reset/?token={token}")

@auth_bp.route("/api/reset-password/<token>", methods=["POST"])
def api_reset_password(token):
    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({"success": False, "message": "Token không hợp lệ hoặc đã hết hạn!"}), 400
    data = request.get_json()
    new_password = data.get("password")
    if not new_password:
        return jsonify({"success": False, "message": "Vui lòng nhập mật khẩu mới!"}), 400
    user.password = generate_password_hash(new_password)
    user.reset_token = None
    db.session.commit()
    return jsonify({"success": True, "message": "Đặt lại mật khẩu thành công!"})

@auth_bp.route("/api/change-password", methods=["POST"])
def change_password():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Bạn chưa đăng nhập!"}), 401
    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("password")
    if not old_password or not new_password or len(new_password) < 6:
        return jsonify({"success": False, "message": "Vui lòng nhập đầy đủ và mật khẩu mới phải từ 6 ký tự!"}), 400
    user = User.query.get(session["user_id"])
    if not user:
        return jsonify({"success": False, "message": "Không tìm thấy tài khoản!"}), 404
    if not check_password_hash(user.password, old_password):
        return jsonify({"success": False, "message": "Mật khẩu hiện tại không đúng!"}), 400
    user.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"success": True, "message": "Đổi mật khẩu thành công!"})