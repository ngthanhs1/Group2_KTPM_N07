from flask import Flask, send_from_directory, redirect
from flask_mail import Mail
from models import db
from routes.auth import auth_bp
from routes.words import words_bp
from routes.topics import topics_bp

app = Flask(__name__, static_folder="../frontend")
app.secret_key = "your_secret_key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ktpm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Cấu hình Flask-Mail ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'thanhlong020589@gmail.com'        # Thay bằng email của bạn
app.config['MAIL_PASSWORD'] = 'kfmu rqxa vvjq fcpz'           # Thay bằng app password (không phải mật khẩu Gmail thông thường)
app.config['MAIL_DEFAULT_SENDER'] = 'thanhlong020589@gmail.com'  # Thay bằng email của bạn

mail = Mail(app)
# --- hết cấu hình mail ---

db.init_app(app)

with app.app_context():
    db.create_all()

# Đăng ký blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(words_bp)
app.register_blueprint(topics_bp)

# Route phục vụ file tĩnh như cũ
@app.route("/")
def root():
    return redirect("/Login/")

@app.route("/Login/")
def yeti_login_index():
    return send_from_directory("../frontend/Login", "indexLogin.html")

@app.route("/Login/<path:filename>")
def yeti_login_static(filename):
    return send_from_directory("../frontend/Login", filename)

@app.route("/Register/")
def yeti_register_index():
    return send_from_directory("../frontend/Register", "indexRegister.html")

@app.route("/Register/<path:filename>")
def yeti_register_static(filename):
    return send_from_directory("../frontend/Register", filename)

@app.route("/Forgot/")
def forgot_index():
    return send_from_directory("../frontend/Forgot", "indexForgot.html")

@app.route("/Forgot/<path:filename>")
def forgot_static(filename):
    return send_from_directory("../frontend/Forgot", filename)

@app.route("/Reset/")
def reset_index():
    return send_from_directory("../frontend/Reset", "indexReset.html")

@app.route("/Reset/<path:filename>")
def reset_static(filename):
    return send_from_directory("../frontend/Reset", filename)

@app.route("/index.html")
def main_index():
    return send_from_directory("../frontend", "index.html")

@app.route("/style.css")
def main_style():
    return send_from_directory("../frontend", "style.css")

@app.route("/script.js")
def main_script():
    return send_from_directory("../frontend", "script.js")

if __name__ == "__main__":
    app.run(debug=True)