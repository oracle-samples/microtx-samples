FROM python:3.13-slim
WORKDIR /app

RUN apt-get update && \
    apt-get install -y gcc curl && \
    rm -rf /var/lib/apt/lists/*

COPY conductor_python-1.2.4-py3-none-any.whl .    

# Prefer pip-based UV install for guaranteed compatibility:
RUN pip install --upgrade pip && \
    pip install uv langgraph && \
    pip install ./conductor_python-1.2.4-py3-none-any.whl


COPY . .

# Confirm uv installs to /usr/local/bin and is executable
# RUN which uv && uv --help

# Default command
CMD ["uv", "run", "loan_processing_agent.py"]