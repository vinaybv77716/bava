# Backend Dockerfile
FROM node:20-bullseye

# Install Python + venv + build tools (needed for spacy, opencv, etc.)
RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip build-essential && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code (including RittDocConverter)
COPY . .

# ---- Python env for EPUB/PDF converter ----
# Make sure the folder name matches your project: RittDocConverter
RUN python3 -m venv RittDocConverter/venv && \
    . RittDocConverter/venv/bin/activate && \
    pip install --upgrade pip setuptools wheel && \
    pip install -r RittDocConverter/requirements.txt && \
    pip install -r PDFtoXMLUsingExcelr/requirements.txt   

# -------------------------------------------

# Env + port
ENV PORT=5000
EXPOSE 5000

# Start backend
CMD ["npm", "start"]
