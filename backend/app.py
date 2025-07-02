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
        if board is None or len(board) != 42:
                return jsonify({'error': 'Invalid board data'}), 400

        ROWS, COLS = 6, 7

        def can_place(col):
                return board[col] is None or board[col] == 0

        def place_disc(board_state, col, player_val):
                new_board = board_state[:]
                for row in range(ROWS-1, -1, -1):
                        idx = row * COLS + col
                        if new_board[idx] == 0 or new_board[idx] is None:
                                new_board[idx] = player_val
                                break
                return new_board

        player_val = 2  
        best_move = None
        best_score = -float('inf')

        for col in range(COLS):
                if not can_place(col):
                        continue
                simulated_board = place_disc(board, col, player_val)
                prediction = model.predict_proba([simulated_board])[0][1]
                if prediction > best_score:
                        best_score = prediction
                        best_move = col

        if best_move is None:
                return jsonify({'move': -1})

        return jsonify({'move': best_move})


if __name__ == '__main__':
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=True)
