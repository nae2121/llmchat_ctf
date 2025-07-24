# app.py
from flask import Flask, request, render_template, jsonify
from dotenv import load_dotenv
import os
from chatai import ChatBot

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = Flask(__name__)
bot = ChatBot(API_KEY)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    response = bot.reply(message)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
