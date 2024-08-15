#!/usr/bin/env bash


find . -type f -name "*.py" -not -path "./venv/*" -not -path "./.git/*" -exec black {} + -exec isort --profile black {} + -exec flake8 {} +