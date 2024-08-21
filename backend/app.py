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

with open('./models/location_df.pkl', 'rb') as file:  # Updated path
    location_df = pd.read_pickle(file)

cosine_sim_matrix = np.load('./models/cosine_sim_matrix.npy', allow_pickle=True)


# print("location_df:", location_df)
# print("cosine_sim_matrix:", cosine_sim_matrix)

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


class LocationRadiusRequest(BaseModel):
    location: str
    radius: float

class PropertyRequest(BaseModel):
    property_name: str


    

@app.get("/")
def home():
    return {"message": "Welcome to the Real Estate Price Prediction API"}


#####################################################################################
#                                                                                   #
#                                 predict API                                                                           #
#                                                                                   #
#####################################################################################


# api for predicting the price
@app.post('/predict', response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Convert input data to DataFrame
        new_data = pd.DataFrame([request.model_dump()])
        
        # Rename columns to match what the model expects
        new_data = new_data.rename(columns={
            'servant_room': 'servant room',
            'store_room': 'store room'
        })
        
        
        # Make prediction
        prediction = loaded_pipeline.predict(new_data)

        # Since we used log1p transformation on the target variable, we need to use expm1 to get back to the original scale
        final_prediction = np.expm1(prediction)

        # Return the prediction as a JSON response
        return PredictionResponse(predicted_price=f"{final_prediction[0]:.2f} crores")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


#####################################################################################
#                                                                                   #
#                                 property API                                                                           #
#                                                                                   #
#####################################################################################

# api for getting the details of a property based on location and radius
@app.post('/get_apartments_within_radius')
async def get_apartments_within_radius(request: LocationRadiusRequest):
    location = request.location
    radius = request.radius

    radius_in_meters = radius * 1000

    if location in location_df.columns:
        filtered_df = location_df[location_df[location] <= radius_in_meters]
        apartments_within_radius = filtered_df[['PropertyName', 'Link']]
        if not apartments_within_radius.empty:
            apartments_within_radius_list = apartments_within_radius.to_dict(orient='records')
            return {"apartments_within_radius": apartments_within_radius_list}
        else:
            raise HTTPException(status_code=404, detail="No apartments found within the specified radius")
    else:
        raise HTTPException(status_code=400, detail="Invalid Location")



#####################################################################################
#                                                                                   #
#                                 apartments_recommendation                                                                         #
#                                                                                   #
#####################################################################################




def recommend_properties_with_scores(df, property_name, cosine_sim_matrix, top_n=5):
    # Check if property_name exists in the dataframe
    df.set_index('PropertyName', inplace=True) 

    if property_name not in df.index:
        raise ValueError(f"Property '{property_name}' not found in the dataframe.")

    # Get the similarity scores for the property using its name as the index
    sim_scores = list(enumerate(cosine_sim_matrix[df.index.get_loc(property_name)]))
    
    # Sort properties based on the similarity scores
    sorted_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get the indices and scores of the top_n most similar properties
    top_indices = [i[0] for i in sorted_scores[1:top_n+1]]
    
    # Retrieve the names and links of the top properties using the indices
    top_properties = df.index[top_indices].tolist()
    top_links = df['Link'].iloc[top_indices].tolist()
    
    # Create a dataframe with the results
    recommendations_df = pd.DataFrame({
        'PropertyName': top_properties,
        'Link': top_links
    })
    
    return recommendations_df.to_dict(orient='records')


@app.post('/recommend_properties')
async def recommend_properties(request: PropertyRequest):
    property_name = request.property_name

    if property_name not in location_df['PropertyName'].values:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return recommend_properties_with_scores(location_df, property_name, cosine_sim_matrix, top_n=5)


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=7878, log_level="info")