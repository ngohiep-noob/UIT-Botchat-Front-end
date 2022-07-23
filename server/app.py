# importing libraries
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config.update(
   FLASK_ENV = 'development'
)
app.config['FLASK_APP'] = "app.py"

@app.route('/')
def hello():
      return jsonify({
      'status': 'success'
      })

@app.route("/upload", methods=['POST'])
def index():
   img = request.form.getlist('img_link')
   id = request.form.get('id')

   # content = request.get_json()
   # content['img1']
   # content['img2']
   # content['img3']
   # content['id']
   print(img)
   print(id)
   return jsonify({
      'status': 'success'
   })
   
@app.route('/send-file/<id>', methods=['GET'])
def serve_file(id):
   print(id)
   return send_file(f'{id}.jpg', mimetype='image/jpg')

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=3000, debug=True)