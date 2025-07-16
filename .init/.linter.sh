#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-interactive-platform-df5ffa2f/tictactoe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

