import io
import os
import base64
import requests
import boto3
import uuid
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from PIL import Image, ImageEnhance
from werkzeug.utils import secure_filename
from botocore.exceptions import ClientError

# Try importing rembg safely
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

app = Flask(__name__)
app.secret_key = 'mjr_art_secret_key' # Change this for production

# --- AWS CONFIGURATION ---
REGION = 'us-east-1'
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:897722679886:aws_topic'

dynamodb = boto3.resource('dynamodb', region_name=REGION)
sns = boto3.client('sns', region_name=REGION)

# DynamoDB Tables
users_table = dynamodb.Table('Users')
admin_users_table = dynamodb.Table('AdminUsers')
# Note: Ensure these tables exist in your AWS Console

PEXELS_API_KEY = "lC4fD0EvqueALGpJasxhKqUB7LniIdFsNkMTRgKb5dCJWYuyBZkZoZkx"

def send_notification(subject, message):
    try:
        sns.publish(TopicArn=SNS_TOPIC_ARN, Subject=subject, Message=message)
    except ClientError as e:
        print(f"SNS Error: {e}")

# --- NAVIGATION & AUTH ---

@app.route("/")
def splash():
    return render_template("splash.html")

@app.route("/home")
def home():
    username = session.get('username')
    return render_template("index.html", username=username)

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email") # Using email as PK or username
        password = request.form.get("password")

        # Check DynamoDB if user exists
        response = users_table.get_item(Key={'username': email})
        if 'Item' in response:
            flash("User already exists!")
            return redirect(url_for('signup'))

        # Add to AWS
        users_table.put_item(Item={
            'username': email, 
            'fullname': request.form.get("fullname"),
            'password': password
        })
        
        send_notification("New MJR Art Signup", f"User {email} has joined MJR Art.")
        return redirect(url_for('login'))
    return render_template("signup.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        
        response = users_table.get_item(Key={'username': email})
        if 'Item' in response and response['Item']['password'] == password:
            session['username'] = email
            send_notification("MJR Art Login", f"User {email} logged in.")
            return redirect(url_for('home'))
        
        flash("Invalid credentials!")
    return render_template("login.html")

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('splash'))

# --- ADMIN SECTION (SETTINGS) ---

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    # Admin Login Logic
    if 'admin' not in session:
        if request.method == 'POST':
            admin_user = request.form.get('username')
            admin_pass = request.form.get('password')
            
            res = admin_users_table.get_item(Key={'username': admin_user})
            if 'Item' in res and res['Item']['password'] == admin_pass:
                session['admin'] = admin_user
                return redirect(url_for('settings'))
            else:
                return "Access Denied: Incorrect Admin Credentials"
        return render_template('admin_login.html') # Prompt for admin password

    # If already logged in as admin, show user table
    users = users_table.scan().get('Items', [])
    return render_template('settings.html', users=users)

# --- EDITOR TOOLS ---

@app.route('/bg-remover-editor', methods=['GET', 'POST'])
def bg_remover():
    if 'username' not in session: return redirect(url_for('login'))
    if request.method == 'GET': return render_template('bg-remover-editor.html')

    if not REMBG_AVAILABLE:
        return jsonify({'status': 'error', 'error': 'Server missing rembg'})

    image = request.files.get('image')
    input_image = Image.open(image)
    output_image = remove(input_image)

    buffer = io.BytesIO()
    output_image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    send_notification("Tool Used", f"{session['username']} used Background Remover")
    return jsonify({'status': 'success', 'image': encoded})

@app.route('/api/enhance-image', methods=['POST'])
def api_enhance_image():
    image_file = request.files.get('image')
    try:
        img = Image.open(image_file)
        img = ImageEnhance.Sharpness(img).enhance(2.5) 
        img = ImageEnhance.Contrast(img).enhance(1.2)
        
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return jsonify({'status': 'success', 'image': encoded})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# --- PAGE ROUTING ---

@app.route('/design-selection')
def design_selection():
    return render_template('design-selection.html')

@app.route('/templates-editor')
def templates_editor():
    return render_template('templates-editor.html')

@app.route('/collage-editor')
def collage_editor():
    return render_template('collage-editor.html')

@app.route('/ai-photo-editor')
def ai_photo_editor():
    return render_template('ai-photo-editor.html')

@app.route('/image-enhancer-editor')
def image_enhancer_editor():
    return render_template('image-enhancer-editor.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    prompt = request.form.get('prompt', '').lower()
    # Simple Logic for Chat Assistant
    if "crop" in prompt:
        reply = "To crop: 1. Upload image. 2. Select 'Crop Tool'. 3. Drag corners and hit 'Apply'."
    elif "enhance" in prompt:
        reply = "Use our 'AI Enhancer' folder to automatically fix lighting and sharpness!"
    else:
        reply = "I'm MJ, your AI assistant. Try asking about 'crop', 'background', or 'enhance'!"
    return jsonify({"reply": reply})

@app.route("/api/search-templates")
def search_templates():
    query = request.args.get("q", "").strip()
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": PEXELS_API_KEY}
    params = {"query": query, "per_page": 10}
    r = requests.get(url, headers=headers, params=params)
    return jsonify(r.json().get("photos", []))

if __name__ == '__main__':
    # Use 0.0.0.0 for AWS deployment
    app.run(host='0.0.0.0', port=5000, debug=True)