import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app, origins=["https://HenryW0225.github.io", "https://connect-4-project.onrender.com"])

model = joblib.load('connect4_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
        data = request.get_json()
        board = data.get('board', None)  

        ROWS, COLS = 6, 7

        def place_disc(board, col, player_val):
                new_board = board[:]
                for row in range(ROWS):
                        idx = col * ROWS + row
                        if new_board[idx] == 0 or new_board[idx] is None:
                                new_board[idx] = player_val
                                break
                return new_board

        player_val = -1  
        best_move = None
        best_score = -float('inf')

        for col in range(COLS):
                if board[(col + 1) * ROWS - 1] != 0:
                        continue
                simulated_board = place_disc(board, col, player_val)
                prediction = model.predict_proba([simulated_board])[0][0] - model.predict_proba([simulated_board])[0][2]
                if prediction > best_score:
                        best_score = prediction
                        best_move = col

        if best_move is None:
                return jsonify({'move': -1})

        return jsonify({'move': best_move})


if __name__ == '__main__':
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port)
