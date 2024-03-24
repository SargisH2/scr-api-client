from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import requests
import json

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

SERVER_URL = "https://scraping-api-app-b55c363cbea4.herokuapp.com/"
WEBHOOK_URL = "http://127.0.0.1:8080/webhook/" # set port to 8080

class SearchQueryWebHook(BaseModel):
    query: str
    depth: int = 2
    supplier: str = "motorad"
    
@app.get("/")
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})    

# Send data to process
@app.post("/start-process/")
async def start_process(query: SearchQueryWebHook):
    data = {
        "query": query.query,
        "depth": query.depth,
        'supplier': query.supplier,
        "webhook_url": WEBHOOK_URL
    }
    # Make a request to the server to start the long process
    response = requests.post(SERVER_URL+'get-content-autodoc/', json=data)
    return response.json()

# Receive data
webhook_data_store = {}
@app.post("/webhook/")
async def webhook_receiver(request: Request):
    data = await request.json()
    query_id = data['info']['time']
    webhook_data_store[query_id] = data
    return {"message": "Webhook received, data stored."}

@app.get("/data/{query_id}")
async def get_data(query_id: str):
    data = webhook_data_store.get(query_id)
    if data:
        return data
    return {"message": "Data not available yet."}

