from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import uvicorn
from fastapi import HTTPException

app = FastAPI(
    title="Real Estate Price Prediction API",
    description="API for predicting real estate prices using XGBoost model",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the fitted pipeline
with open('./models/xgboost_pipeline_fitted.pkl', 'rb') as file:
    loaded_pipeline = pickle.load(file)

class PredictionRequest(BaseModel):
    property_type: str
    sector: str
    bedRoom: int
    bathroom: int
    balcony: str
    agePossession: str
    built_up_area: float
    servant_room: int
    store_room: int
    furnishing_type: str
    luxury_category: str
    floor_category: str

class PredictionResponse(BaseModel):
    predicted_price: str

@app.get("/")
def home():
    return {"message": "Welcome to the Real Estate Price Prediction API"}

@app.post('/predict', response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Convert input data to DataFrame
        print("Received request:", request)
        new_data = pd.DataFrame([request.model_dump()])
        
        # Rename columns to match what the model expects
        new_data = new_data.rename(columns={
            'servant_room': 'servant room',
            'store_room': 'store room'
        })
        
        print("Converted to DataFrame:", new_data.to_dict())
        
        # Make prediction
        prediction = loaded_pipeline.predict(new_data)
        print("Raw prediction:", prediction)

        # Since we used log1p transformation on the target variable, we need to use expm1 to get back to the original scale
        final_prediction = np.expm1(prediction)
        print("Final prediction:", final_prediction)

        # Return the prediction as a JSON response
        return PredictionResponse(predicted_price=f"{final_prediction[0]:.2f} crores")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=7878, log_level="info")