from flask import session, jsonify
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"success": False, "message": "Chưa đăng nhập"}), 401
        return f(*args, **kwargs)
    return decorated_function