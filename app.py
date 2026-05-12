from flask import Flask, render_template
from routes.auth import auth

app = Flask(__name__)
app.secret_key = 'leonardo'

app.register_blueprint(auth, url_prefix='/api')

@app.route('/')
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/registro')
def registro():
    return render_template('registro.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/index')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)