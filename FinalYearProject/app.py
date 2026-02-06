import io
import base64
import requests
from flask import Flask, render_template, request, jsonify, redirect, url_for
from PIL import Image, ImageEnhance  # Added ImageEnhance for the AI effect

# Try importing rembg safely
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

app = Flask(__name__)

# Sample data using Python dictionaries
users_db = {}
recent_works_db = []
wishlist_db = []

# PEXELS API KEY
PEXELS_API_KEY = "lC4fD0EvqueALGpJasxhKqUB7LniIdFsNkMTRgKb5dCJWYuyBZkZoZkx"

# --- NAVIGATION ROUTES ---

@app.route("/")
def splash():
    return render_template("splash.html")

@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        return redirect(url_for('home'))
    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        fullname = request.form.get("fullname")
        email = request.form.get("email")
        password = request.form.get("password")

        users_db[email] = {
            "username": username,
            "fullname": fullname,
            "password": password
        }
        return redirect(url_for('login'))
    return render_template("signup.html")

# --- EDITOR & TOOL ROUTES ---

@app.route('/bg-remover-editor', methods=['GET', 'POST'])
def bg_remover():
    if request.method == 'GET':
        return render_template('bg-remover-editor.html')

    if not REMBG_AVAILABLE:
        return jsonify({'status': 'error', 'error': 'rembg library is not installed.'})

    image = request.files.get('image')
    if not image:
        return jsonify({'status': 'error', 'error': 'No image uploaded'})

    input_image = Image.open(image)
    output_image = remove(input_image)

    buffer = io.BytesIO()
    output_image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return jsonify({'status': 'success', 'image': encoded})

# --- IMAGE ENHANCER API (THE FIX) ---
@app.route('/api/enhance-image', methods=['POST'])
def api_enhance_image():
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({'status': 'error', 'message': 'No image uploaded'})

    try:
        # Open image
        img = Image.open(image_file)
        
        # Apply "Magic AI" Enhancements
        # 1. Sharpen to clear blur
        img = ImageEnhance.Sharpness(img).enhance(2.5) 
        # 2. Boost Contrast for clarity
        img = ImageEnhance.Contrast(img).enhance(1.2)
        # 3. Slight Color Enhancement
        img = ImageEnhance.Color(img).enhance(1.1)

        # Convert back to base64 for the frontend
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return jsonify({'status': 'success', 'image': encoded})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/recent-works')
def recent_works():
    return render_template('recent_works.html', works=recent_works_db)

@app.route('/wishlist')
def wishlist():
    return render_template('wishlist.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/design-selection')
def design_selection():
    return render_template('design-selection.html')

@app.route('/templates-editor')
def templates_editor():
    return render_template('templates-editor.html')

@app.route('/collage-templates')
def collage_templates():
    return render_template('collage-templates.html')

@app.route('/collage-editor')
def collage_editor():
    return render_template('collage-editor.html')

@app.route('/ai-photo-editor')
def ai_photo_editor():
    return render_template('ai-photo-editor.html')

@app.route('/image-enhancer-editor')
def image_enhancer_editor():
    return render_template('image-enhancer-editor.html')

@app.route('/ai-image-generator-editor')
def ai_image_generator_editor():
    return render_template('ai-image-generator-editor.html')

@app.route('/editor')
def editor():
    return render_template('editor.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

# --- CHAT AI ROUTES ---

@app.route('/api/chat', methods=['POST'])
def chat_api():
    prompt = request.form.get('prompt', '').lower().strip()
    image = request.files.get('image')

    # (Keep your existing chat logic here...)
    reply = "I'm MJ, your AI photo assistant 🤖"
    return jsonify({"reply": reply})

# --- PEXELS SEARCH API ---

@app.route("/api/search-templates")
def search_templates():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([])

    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": PEXELS_API_KEY}
    params = {"query": query, "per_page": 24}

    r = requests.get(url, headers=headers, params=params)
    data = r.json()

    results = []
    for photo in data.get("photos", []):
        results.append({
            "name": photo["photographer"],
            "image": photo["src"]["medium"],
            "file": photo["src"]["original"]
        })

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)