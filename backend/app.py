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

with open('./models/xgboost_pipeline_fitted.pkl', 'rb') as file:
    location_df = pd.read_pickle(file)
with open('./models/cosine_sim_matrix.npy', 'rb') as file:
    cosine_sim_matrix = np.load(file)

print("location_df:", location_df)
print("cosine_sim_matrix:", cosine_sim_matrix)

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



class RecommendationRequest(BaseModel):
    property_name: str
    top_n: int = 5


# Define the recommendation function
def recommend_properties_with_scores(property_name, cosine_sim_matrix, top_n=5):

    sim_scores = list(enumerate(cosine_sim_matrix[location_df.index.get_loc(property_name)]))

    sorted_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    top_indices = [i[0] for i in sorted_scores[1:top_n+1]]
    top_scores = [i[1] for i in sorted_scores[1:top_n+1]]

    top_properties = location_df.index[top_indices].tolist()

    recommendations_df = pd.DataFrame({
        'PropertyName': top_properties,
        'SimilarityScore': top_scores
    })
    return recommendations_df



@app.get("/")
def home():
    return {"message": "Welcome to the Real Estate Price Prediction API"}


# api for predicting the price
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


# API for getting recommendations
@app.post('/recommend')
async def recommendations(request: RecommendationRequest):
    try:
        print("Received request:", request)
        recommendations = recommend_properties_with_scores(request.property_name, cosine_sim_matrix, request.top_n)

        print("Recommended properties:", recommendations)

        return {"recommended_properties": recommendations.to_dict(orient='records')}
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")
# curl -X POST "http://localhost:7878/recommend" -H "Content-Type: application/json" -d '{"property_name": "Ireo Victory Valley", "top_n": 5}'




# api for getting the details of a property based on location and radius
@app.post('/property')
async def property(location: str, radius: float):
    try:
        # Add logic for property details here
        print("Received location:", location)
        print("Received radius:", radius)
        
        # Convert radius from kilometers to meters
        radius_in_meters = radius * 1000
        print("Radius in meters:", radius_in_meters)

        # Filter the DataFrame to get apartments within the specified radius
        filtered_df = location_df[location_df[location] <= radius_in_meters]
        apartments_within_radius = filtered_df.index.tolist()
        distances = filtered_df[location].tolist()

        print("Apartments within radius:", apartments_within_radius)
        print("Distances:", distances)

        # Combine apartment names with their distances
        apartments_with_distances = [
            {"apartment": apt, "distance": dist} 
            for apt, dist in zip(apartments_within_radius, distances)
        ]

        # Return the property names and distances as a JSON response
        return {"apartments_within_radius": apartments_with_distances}
    
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Property details error: {str(e)}")

# curl -X POST "http://localhost:7878/property?location=Downtown&radius=5.0"


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=7878, log_level="info")